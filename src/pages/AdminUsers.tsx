import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import { Pencil, X, Loader2, RotateCcw, Search } from "lucide-react";
import { getAllProfiles, updateProfileAdmin } from "@/lib/api/profiles";
import type { Profile } from "@/lib/database.types";

const ROLE_OPTIONS: Profile["role"][] = ["applicant", "member", "admin"];

const ROLE_COLORS: Record<Profile["role"], string> = {
  admin:     "bg-primary/10 text-primary",
  member:    "bg-blue-500/10 text-blue-400",
  applicant: "bg-secondary text-muted-foreground",
};

// ─── Edit modal ────────────────────────────────────────────────
const EditModal = ({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile;
  onClose: () => void;
  onSaved: (updated: Profile) => void;
}) => {
  const { user: currentUser } = useAuth();
  const [name, setName]           = useState(profile.name ?? "");
  const [role, setRole]           = useState<Profile["role"]>(profile.role);
  const [major, setMajor]         = useState(profile.major ?? "");
  const [gradYear, setGradYear]   = useState(profile.grad_year ?? "");
  const [linkedin, setLinkedin]   = useState(profile.linkedin_url ?? "");
  const [saving, setSaving]       = useState(false);

  const isSelf = currentUser?.id === profile.id;

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfileAdmin(profile.id, {
        name:         name.trim() || undefined,
        role,
        major:        major.trim() || undefined,
        grad_year:    gradYear.trim() || undefined,
        linkedin_url: linkedin.trim() || undefined,
      });
      toast({ title: "Profile updated", description: `${updated.name ?? updated.email} saved.` });
      onSaved(updated);
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Edit User</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">
              Role {isSelf && <span className="text-primary">(your account)</span>}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-md text-xs font-semibold border transition-colors capitalize ${
                    role === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {isSelf && role !== "admin" && (
              <p className="text-xs text-destructive mt-1">
                Warning: removing your own admin role will lock you out of this page.
              </p>
            )}
          </div>

          {/* Major */}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Major</label>
            <input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Finance"
              className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none"
            />
          </div>

          {/* Grad Year */}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Graduation Year</label>
            <input
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              placeholder="e.g. 2026"
              className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">LinkedIn URL</label>
            <input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────
const AdminUsers = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState<Profile | null>(null);
  const [roleFilter, setRoleFilter] = useState<Profile["role"] | "all">("all");

  if (!isAuthenticated || currentUser?.role !== "Admin") return <Navigate to="/login" replace />;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfiles(await getAllProfiles());
    } catch (e) {
      toast({ title: "Error loading users", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (updated: Profile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  };

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts: Record<string, number> = { all: profiles.length };
  ROLE_OPTIONS.forEach((r) => { counts[r] = profiles.filter((p) => p.role === r).length; });

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md transition-colors"
            >
              <RotateCcw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <p className="text-muted-foreground mb-8">
            View and edit user profiles, roles, and info.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {(["all", ...ROLE_OPTIONS] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`border rounded-lg p-3 text-left transition-colors ${
                  roleFilter === r
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 capitalize">{r}</p>
                <p className="text-2xl font-bold text-foreground">{counts[r] ?? 0}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-transparent scarlet-input pl-5 pr-0 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No users found.</p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {["Name", "Email", "Role", "Major", "Grad Year", "LinkedIn", ""].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 hidden sm:table-cell first:table-cell last:table-cell"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-foreground font-medium">
                        {p.name ?? <span className="text-muted-foreground italic">—</span>}
                        {p.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-primary">(you)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {p.email}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[p.role]}`}>
                          {p.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {p.major ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {p.grad_year ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {p.linkedin_url ? (
                          <a
                            href={p.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Profile →
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditing(p)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {editing && (
        <EditModal
          profile={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </PageWrapper>
  );
};

export default AdminUsers;
