import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import { ChevronRight, ChevronDown, User, Calendar } from "lucide-react";

type Stage = "Application" | "Round 1" | "Round 2";

interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: Stage;
}

const INITIAL_CANDIDATES: Candidate[] = [
  { id: "1", name: "Jordan Lee", email: "jordan@osu.edu", stage: "Application" },
  { id: "2", name: "Taylor Kim", email: "taylor@osu.edu", stage: "Application" },
  { id: "3", name: "Morgan Patel", email: "morgan@osu.edu", stage: "Round 1" },
  { id: "4", name: "Riley Chen", email: "riley@osu.edu", stage: "Application" },
  { id: "5", name: "Casey Davis", email: "casey@osu.edu", stage: "Round 2" },
];

const STAGES: Stage[] = ["Application", "Round 1", "Round 2"];

const WEBHOOK_MESSAGES: Record<string, string> = {
  "Application": "Applied -> Confirmation",
  "Round 1": "Invited -> Scheduling Link",
  "Round 2": "Invited -> Final Round Scheduling",
};

const CandidateCard = ({ candidate, stage, onAdvance }: { candidate: Candidate; stage: Stage; onAdvance: (c: Candidate) => void }) => (
  <div className="border border-border rounded-lg p-4 bg-card glow-border">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <User size={14} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{candidate.name}</p>
        <p className="text-xs text-muted-foreground">{candidate.email}</p>
      </div>
    </div>
    {(stage === "Round 1" || stage === "Round 2") && (
      <div className="flex items-center gap-1.5 mb-3 text-xs text-primary">
        <Calendar size={12} />
        <span>Interview scheduling sent</span>
      </div>
    )}
    {STAGES.indexOf(stage) < STAGES.length - 1 && (
      <button onClick={() => onAdvance(candidate)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        Advance to {STAGES[STAGES.indexOf(stage) + 1]}
        <ChevronRight size={14} />
      </button>
    )}
  </div>
);

const AdminRecruiting = () => {
  const { user, isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [openStage, setOpenStage] = useState<Stage | null>("Application");

  if (!isAuthenticated || user?.role !== "Admin") return <Navigate to="/login" replace />;

  const advance = (candidate: Candidate) => {
    const idx = STAGES.indexOf(candidate.stage);
    if (idx >= STAGES.length - 1) return;
    const nextStage = STAGES[idx + 1];
    setCandidates((prev) => prev.map((c) => (c.id === candidate.id ? { ...c, stage: nextStage } : c)));
    toast({ title: "Candidate Advanced", description: `Simulated SendGrid Webhook Fired: ${WEBHOOK_MESSAGES[nextStage]}` });
    localStorage.setItem("pevc_scheduling", nextStage);
  };

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Recruiting Pipeline</h1>
          <p className="text-muted-foreground mb-10">Manage applicants across recruitment stages.</p>

          {/* Desktop Kanban */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {STAGES.map((stage) => (
              <div key={stage} className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">{stage}</h2>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {candidates.filter((c) => c.stage === stage).length}
                  </span>
                </div>
                {candidates.filter((c) => c.stage === stage).map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} stage={stage} onAdvance={advance} />
                ))}
                {candidates.filter((c) => c.stage === stage).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No candidates</p>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden space-y-3">
            {STAGES.map((stage) => {
              const stageCount = candidates.filter((c) => c.stage === stage).length;
              const isOpen = openStage === stage;
              return (
                <div key={stage} className="border border-border rounded-lg overflow-hidden bg-card">
                  <button
                    onClick={() => setOpenStage(isOpen ? null : stage)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">{stage}</h2>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{stageCount}</span>
                    </div>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {candidates.filter((c) => c.stage === stage).map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} stage={stage} onAdvance={advance} />
                      ))}
                      {stageCount === 0 && <p className="text-xs text-muted-foreground italic">No candidates</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default AdminRecruiting;
