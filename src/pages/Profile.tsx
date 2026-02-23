import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { Upload, FileText, User } from "lucide-react";

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [headshot, setHeadshot] = useState<string | null>(null);
  const [resume, setResume] = useState<string | null>(null);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground mb-10">
            Role: <span className="text-primary font-semibold">{user.role}</span>
          </p>

          <div className="space-y-8">
            {/* Headshot Upload */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Headshot</label>
              <label className="flex items-center gap-3 border border-dashed border-border rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
                {headshot ? (
                  <div className="flex items-center gap-2">
                    <User size={20} className="text-primary" />
                    <span className="text-sm text-foreground">{headshot}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Upload size={20} />
                    <span className="text-sm">Upload headshot image</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeadshot(e.target.files?.[0]?.name || null)} />
              </label>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Resume</label>
              <label className="flex items-center gap-3 border border-dashed border-border rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
                {resume ? (
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    <span className="text-sm text-foreground">{resume}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Upload size={20} />
                    <span className="text-sm">Upload resume (PDF)</span>
                  </div>
                )}
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setResume(e.target.files?.[0]?.name || null)} />
              </label>
            </div>

            {/* Major */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Major</label>
              <input
                type="text"
                defaultValue={user.major || ""}
                onBlur={(e) => updateProfile({ major: e.target.value })}
                className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                placeholder="e.g. Finance"
              />
            </div>

            {/* Grad Year */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Graduation Year</label>
              <input
                type="text"
                defaultValue={user.gradYear || ""}
                onBlur={(e) => updateProfile({ gradYear: e.target.value })}
                className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                placeholder="e.g. 2026"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">LinkedIn URL</label>
              <input
                type="url"
                defaultValue={user.linkedinUrl || ""}
                onBlur={(e) => updateProfile({ linkedinUrl: e.target.value })}
                className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Profile;
