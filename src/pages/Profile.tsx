import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { Upload, FileText, User, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setMajor(user.major ?? "");
      setGradYear(user.gradYear ?? "");
      setLinkedinUrl(user.linkedinUrl ?? "");
    }
  }, [user]);

  // Wait for both auth and profile to finish loading before redirecting
  if (authLoading || (isAuthenticated && !user)) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("resumes").getPublicUrl(path);
      await updateProfile({ avatar: data.publicUrl });
      toast({ title: "Avatar updated" });
    } catch (e) {
      toast({ title: "Upload failed", description: String(e), variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBlurSave = async (field: keyof typeof user, value: string) => {
    if (value === (user[field] ?? "")) return;
    try {
      await updateProfile({ [field]: value });
      setSaved((s) => ({ ...s, [field]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [field]: false })), 2000);
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" });
    }
  };

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6 bg-background">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground mb-10">
            Role: <span className="text-primary font-semibold">{user.role}</span>
          </p>

          <div className="space-y-8">
            {/* Avatar Upload */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Headshot</label>
              <label className="flex items-center gap-3 border border-dashed border-border rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
                {uploadingAvatar ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={20} className="animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </div>
                ) : user.avatar ? (
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-sm text-muted-foreground">Click to change</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User size={20} />
                    <span className="text-sm">Upload headshot image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={(e) => handleBlurSave("name", e.target.value)}
                  className="flex-1 bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Your full name"
                />
                {saved.name && <CheckCircle size={14} className="text-green-400 shrink-0" />}
              </div>
            </div>

            {/* Major */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Major</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  onBlur={(e) => handleBlurSave("major", e.target.value)}
                  className="flex-1 bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="e.g. Finance"
                />
                {saved.major && <CheckCircle size={14} className="text-green-400 shrink-0" />}
              </div>
            </div>

            {/* Grad Year */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Graduation Year</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  onBlur={(e) => handleBlurSave("gradYear", e.target.value)}
                  className="flex-1 bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="e.g. 2026"
                />
                {saved.gradYear && <CheckCircle size={14} className="text-green-400 shrink-0" />}
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">LinkedIn URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  onBlur={(e) => handleBlurSave("linkedinUrl", e.target.value)}
                  className="flex-1 bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="https://linkedin.com/in/yourname"
                />
                {saved.linkedinUrl && <CheckCircle size={14} className="text-green-400 shrink-0" />}
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
              <p className="py-3 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Profile;
