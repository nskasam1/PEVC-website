import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import {
  Upload, Pencil, Trash2, X, Loader2, CheckCircle,
  XCircle, AlertCircle, Plus, Download,
} from "lucide-react";
import {
  getMembers, updateMember, deleteMember,
  importMembersFromCsv, parseMemberCsv,
} from "@/lib/api/members";
import {
  getDuesByMemberId, createDuesRecord, markDuesPaid,
  markDuesUnpaid, deleteDuesRecord, syncMemberDuesStatus,
} from "@/lib/api/dues";
import type { Member, DuesRecord } from "@/lib/database.types";
import { format } from "date-fns";

// ─── Modal wrapper ─────────────────────────────────────────────
const Modal = ({
  open, onClose, title, children, wide,
}: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; wide?: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`bg-card border border-border rounded-lg w-full ${wide ? "max-w-2xl" : "max-w-md"} p-6 max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Dues panel ────────────────────────────────────────────────
const DuesPanel = ({
  member, onClose,
}: {
  member: Member; onClose: () => void;
}) => {
  const [records, setRecords] = useState<DuesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDuesByMemberId(member.id);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, [member.id]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!amount) return;
    setAdding(true);
    try {
      await createDuesRecord({
        memberId: member.id,
        amount: parseFloat(amount),
        dueDate: dueDate || undefined,
        notes: notes || undefined,
      });
      await syncMemberDuesStatus(member.id);
      toast({ title: "Dues record added" });
      setAmount(""); setDueDate(""); setNotes("");
      await load();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const togglePaid = async (r: DuesRecord) => {
    try {
      if (r.paid) {
        await markDuesUnpaid(r.id);
      } else {
        await markDuesPaid(r.id);
      }
      await syncMemberDuesStatus(member.id);
      await load();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDuesRecord(id);
      await syncMemberDuesStatus(member.id);
      await load();
      toast({ title: "Record deleted" });
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    }
  };

  return (
    <Modal open onClose={onClose} title={`Dues — ${member.name}`} wide>
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="space-y-5">
          {/* Records table */}
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No dues records yet.</p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">Amount</th>
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">Due Date</th>
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">Status</th>
                    <th className="text-left text-xs text-muted-foreground px-3 py-2">Notes</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="px-3 py-2 text-foreground font-medium">${r.amount}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {r.due_date ? format(new Date(r.due_date), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => togglePaid(r)}
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${
                            r.paid
                              ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          }`}
                        >
                          {r.paid
                            ? <><CheckCircle size={10} /> Paid</>
                            : <><XCircle size={10} /> Unpaid</>
                          }
                        </button>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{r.notes ?? "—"}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => handleDelete(r.id)}
                          className="text-muted-foreground hover:text-destructive">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add new record */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Add Dues Record</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount ($)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                <input
                  type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-card border border-border rounded px-2 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <input
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none mb-3"
            />
            <button
              onClick={handleAdd}
              disabled={!amount || adding}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 flex items-center gap-2"
            >
              {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Add Record
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ─── Edit member modal ─────────────────────────────────────────
const EditMemberModal = ({
  member, onClose, onSave,
}: {
  member: Member; onClose: () => void;
  onSave: (updates: Partial<Member>) => Promise<void>;
}) => {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [clubRole, setClubRole] = useState(member.club_role ?? "");
  const [duesStatus, setDuesStatus] = useState<Member["dues_status"]>(member.dues_status);
  const [duesAmount, setDuesAmount] = useState(String(member.dues_amount));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ name, email, club_role: clubRole, dues_status: duesStatus, dues_amount: parseFloat(duesAmount) || 0 });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit Member">
      <div className="space-y-4">
        {[
          { label: "Name", value: name, onChange: setName, placeholder: "Full Name" },
          { label: "Email", value: email, onChange: setEmail, placeholder: "email@example.com" },
          { label: "Club Role", value: clubRole, onChange: setClubRole, placeholder: "Analyst" },
        ].map(({ label, value, onChange, placeholder }) => (
          <div key={label}>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
              className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none" />
          </div>
        ))}
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Dues Status</label>
          <select value={duesStatus} onChange={(e) => setDuesStatus(e.target.value as Member["dues_status"])}
            className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Dues Amount ($)</label>
          <input type="number" min="0" step="0.01" value={duesAmount} onChange={(e) => setDuesAmount(e.target.value)}
            className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none" />
        </div>
        <button onClick={save} disabled={saving}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2">
          {saving && <Loader2 size={13} className="animate-spin" />} Save Changes
        </button>
      </div>
    </Modal>
  );
};

// ─── CSV import modal ──────────────────────────────────────────
const CsvImportModal = ({
  onClose, onImported,
}: {
  onClose: () => void; onImported: () => void;
}) => {
  const [csv, setCsv] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: Array<{ email: string; error: string }> } | null>(null);

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setCsv(String(e.target?.result ?? ""));
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const rows = parseMemberCsv(csv);
    if (rows.length === 0) {
      toast({ title: "No valid rows found in CSV", variant: "destructive" });
      return;
    }
    setImporting(true);
    try {
      const res = await importMembersFromCsv(rows);
      setResult(res);
      onImported();
    } catch (e) {
      toast({ title: "Import failed", description: String(e), variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Import Members from CSV" wide>
      <div className="space-y-4">
        <div className="bg-secondary/30 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1 font-semibold">Expected CSV format:</p>
          <code className="text-xs text-foreground">name,email,role,dues_amount</code>
        </div>

        <label className="flex flex-col items-center gap-2 border border-dashed border-border rounded-md p-6 cursor-pointer hover:border-primary transition-colors">
          <Upload size={20} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Upload CSV file or paste below</span>
          <input type="file" accept=".csv,text/csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileRead(f); }} />
        </label>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={6}
          className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none resize-none"
          placeholder={"name,email,role,dues_amount\nJane Doe,jane@osu.edu,Analyst,50"}
        />

        {result && (
          <div className={`rounded-md p-3 ${result.errors.length > 0 ? "bg-destructive/10" : "bg-green-500/10"}`}>
            <p className="text-sm font-semibold mb-1">
              {result.imported > 0
                ? <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> {result.imported} member(s) imported</span>
                : <span className="text-muted-foreground">0 members imported</span>
              }
            </p>
            {result.errors.length > 0 && (
              <ul className="space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-destructive flex items-start gap-1">
                    <AlertCircle size={11} className="mt-0.5 shrink-0" />
                    <span><strong>{e.email}</strong>: {e.error}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleImport} disabled={!csv.trim() || importing}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2">
            {importing ? <><Loader2 size={13} className="animate-spin" /> Importing...</> : "Import Members"}
          </button>
          <button onClick={onClose}
            className="border border-border px-4 py-2.5 rounded-md text-sm text-foreground hover:bg-secondary transition-colors">
            {result ? "Done" : "Cancel"}
          </button>
        </div>

        <a
          href="data:text/csv;charset=utf-8,name%2Cemail%2Crole%2Cdues_amount%0AJane%20Doe%2Cjane%40osu.edu%2CAnalyst%2C50"
          download="members_template.csv"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Download size={12} /> Download CSV template
        </a>
      </div>
    </Modal>
  );
};

// ─── Main page ─────────────────────────────────────────────────
const AdminMembers = () => {
  const { user, isAuthenticated } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [duesMember, setDuesMember] = useState<Member | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");

  if (!isAuthenticated || user?.role !== "Admin") return <Navigate to="/login" replace />;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (e) {
      toast({ title: "Error loading members", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id: string, updates: Partial<Member>) => {
    await updateMember(id, updates);
    toast({ title: "Member updated" });
    await load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteMember(id);
      toast({ title: "Member deleted" });
      await load();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Member Roster</h1>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Upload size={14} /> Import CSV
            </button>
          </div>
          <p className="text-muted-foreground mb-8">Manage club members, dues, and roster.</p>

          {/* Search */}
          <div className="mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full max-w-sm bg-transparent scarlet-input px-0 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading members...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {members.length === 0
                ? <><Upload size={32} className="mx-auto mb-3 opacity-40" /><p className="text-sm">No members yet. Import a CSV roster to get started.</p></>
                : <p className="text-sm">No members match "{search}"</p>
              }
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {["Name", "Email", "Role", "Dues Status", "Amount", "Join Date", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 hidden sm:table-cell first:table-cell last:table-cell">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{m.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{m.club_role ?? "—"}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          m.dues_status === "paid" ? "bg-green-500/10 text-green-400" :
                          m.dues_status === "waived" ? "bg-secondary text-muted-foreground" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {m.dues_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        ${m.dues_amount}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {format(new Date(m.join_date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDuesMember(m)}
                          className="text-xs text-primary hover:underline mr-3"
                        >
                          Dues
                        </button>
                        <button onClick={() => setEditMember(m)} className="text-muted-foreground hover:text-primary mr-3">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(m.id, m.name)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
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

      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSave={(updates) => handleSave(editMember.id, updates)}
        />
      )}

      {duesMember && (
        <DuesPanel member={duesMember} onClose={() => { setDuesMember(null); load(); }} />
      )}

      {showImport && (
        <CsvImportModal
          onClose={() => setShowImport(false)}
          onImported={load}
        />
      )}
    </PageWrapper>
  );
};

export default AdminMembers;
