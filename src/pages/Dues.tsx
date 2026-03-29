import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getMemberByProfileId } from "@/lib/api/members";
import { getDuesByMemberId } from "@/lib/api/dues";
import type { Member, DuesRecord } from "@/lib/database.types";
import { format } from "date-fns";

const Dues = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [records, setRecords] = useState<DuesRecord[]>([]);

  if (!authLoading && !isAuthenticated) return <Navigate to="/login" replace />;

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const m = await getMemberByProfileId(user.id);
      setMember(m);
      if (m) {
        const dues = await getDuesByMemberId(m.id);
        setRecords(dues);
      }
    } catch (e) {
      toast({ title: "Error loading dues", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  const unpaidTotal = records.filter((r) => !r.paid).reduce((sum, r) => sum + r.amount, 0);
  const paidTotal = records.filter((r) => r.paid).reduce((sum, r) => sum + r.amount, 0);

  if (authLoading || loading) {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </section>
      </PageWrapper>
    );
  }

  if (!member) {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Member Record</h2>
            <p className="text-muted-foreground text-sm">
              You don't have an active membership record. Contact an admin if this is an error.
            </p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dues</h1>
          <p className="text-muted-foreground mb-10">Your dues history and payment status.</p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
              <div className={`flex items-center gap-1.5 ${
                member.dues_status === "paid" ? "text-green-400" :
                member.dues_status === "waived" ? "text-muted-foreground" :
                "text-destructive"
              }`}>
                {member.dues_status === "paid"
                  ? <CheckCircle size={16} />
                  : member.dues_status === "waived"
                  ? <AlertCircle size={16} />
                  : <XCircle size={16} />
                }
                <span className="text-sm font-semibold capitalize">{member.dues_status}</span>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Unpaid</p>
              <p className="text-lg font-bold text-foreground">${unpaidTotal.toFixed(2)}</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Paid Total</p>
              <p className="text-lg font-bold text-green-400">${paidTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Records */}
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No dues records yet.</p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Due Date</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Paid On</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">${r.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {r.due_date ? format(new Date(r.due_date), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.paid ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"
                        }`}>
                          {r.paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {r.paid_at ? format(new Date(r.paid_at), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {r.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Dues;
