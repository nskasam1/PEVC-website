import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageWrapper from "@/components/PageWrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Loader2,
  FileText,
  X,
  Upload,
  Clock,
  Lock,
  ExternalLink,
  Download,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getApplications,
  saveApplication,
  getEssayPrompts,
  saveResumeFile,
  getRecruitingConfig,
  getApplicantStage,
  formatDeadline,
} from "@/lib/applicationStorage";
import { Application, RecruitingConfig, Stage } from "@/types/application";

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const kycSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\+?[\d\s\-().]{7,15}$/, "Enter a valid phone number"),
  school: z.string().min(2, "School name is required"),
  major: z.string().min(2, "Major is required"),
  gradYear: z.string().regex(/^20\d{2}$/, "Enter a valid 4-digit graduation year"),
  linkedinUrl: z
    .string()
    .url("Enter a valid LinkedIn URL")
    .startsWith("https://", "Must start with https://"),
});

const resumeSchema = z.object({
  resumeFileId: z.string().min(1, "Please upload your resume"),
});

const essaySchema = z.object({
  essay1: z.string().min(100, "Essay must be at least 100 characters").max(2000, "Essay must be under 2000 characters"),
  essay2: z.string().min(100, "Essay must be at least 100 characters").max(2000, "Essay must be under 2000 characters"),
});

const applicationSchema = kycSchema.merge(resumeSchema).merge(essaySchema);
type ApplicationFormValues = z.infer<typeof applicationSchema>;

const KYC_FIELDS = ["firstName", "lastName", "email", "phone", "school", "major", "gradYear", "linkedinUrl"] as const;
const RESUME_FIELDS = ["resumeFileId"] as const;
const ESSAY_FIELDS = ["essay1", "essay2"] as const;
const STEP_LABELS = ["KYC", "Resume", "Essays", "Review"];

// ── Application Tracker ───────────────────────────────────────────────────────

const PIPELINE: { key: Stage | "Decision"; label: string; sublabel: string }[] = [
  { key: "Application", label: "R0 — Application", sublabel: "KYC, Resume & Essays" },
  { key: "Round 1", label: "R1 — 1st Round Interview", sublabel: "Case presentation & interview" },
  { key: "Round 2", label: "R2 — 2nd Round Interview", sublabel: "Final round" },
  { key: "Decision", label: "Decision", sublabel: "Final outcome" },
];

const STAGE_ORDER: (Stage | "Decision")[] = ["Application", "Round 1", "Round 2", "Decision"];

function stageIndex(stage: string): number {
  return STAGE_ORDER.indexOf(stage as Stage | "Decision");
}

const ApplicationTracker = ({
  application,
  currentStage,
  config,
}: {
  application: Application;
  currentStage: Stage;
  config: RecruitingConfig;
}) => {
  const currentIdx = stageIndex(currentStage);

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">Application Tracker</h2>
        <p className="text-muted-foreground text-sm">
          Hi {application.firstName}, here's your real-time application status.
        </p>
      </div>

      {PIPELINE.map((node, idx) => {
        const isDecision = node.key === "Decision";
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isLocked = idx > currentIdx;

        const stageConfig = !isDecision ? config.stages[node.key as Stage] : null;
        const deadline = stageConfig?.deadline ? formatDeadline(stageConfig.deadline) : null;
        const hearBack = stageConfig?.hearBackBy ? formatDeadline(stageConfig.hearBackBy) : null;
        const calendlyUrl = stageConfig?.calendlyUrl;
        const caseMaterials = stageConfig?.caseMaterials ?? [];
        const resources = stageConfig?.resources ?? [];
        const hasInterviewContent = (node.key === "Round 1" || node.key === "Round 2") && isActive;

        return (
          <div key={node.key} className="flex gap-4">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                  isDone
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <CheckCircle size={16} />
                ) : isLocked ? (
                  <Lock size={14} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
              {idx < PIPELINE.length - 1 && (
                <div className={`w-0.5 flex-1 mt-1 min-h-[24px] ${isDone ? "bg-primary" : "bg-border"}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 flex-1 ${isLocked ? "opacity-40" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"}`}>
                  {node.label}
                </p>
                {isDone && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
                {isActive && !isDecision && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{node.sublabel}</p>

              {/* Dates */}
              {!isDecision && (deadline || hearBack) && (
                <div className="flex flex-wrap gap-4 mb-3">
                  {deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>Deadline: <span className="text-foreground">{deadline}</span></span>
                    </div>
                  )}
                  {hearBack && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>Hear back by: <span className="text-foreground">{hearBack}</span></span>
                    </div>
                  )}
                </div>
              )}

              {/* R0 — show submitted date */}
              {node.key === "Application" && (
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(application.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}

              {/* R1/R2 active — show scheduling + materials */}
              {hasInterviewContent && (
                <div className="mt-4 space-y-4">
                  {/* Case Materials */}
                  {caseMaterials.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Case Materials</p>
                      <div className="space-y-2">
                        {caseMaterials.map((m) => (
                          <a
                            key={m.id}
                            href={m.base64Data}
                            download={m.name}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Download size={13} />
                            {m.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {resources.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Prep Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {resources.map((r) => (
                          <a
                            key={r.id}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs border border-border rounded-md px-3 py-1.5 text-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            {r.label}
                            <ExternalLink size={11} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  {calendlyUrl ? (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Schedule Your Interview</p>
                      <iframe
                        src={calendlyUrl}
                        className="w-full rounded-lg border border-border"
                        style={{ height: 600 }}
                        title="Schedule interview"
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed border-border rounded-md p-4 text-xs text-muted-foreground italic">
                      Scheduling link coming soon — check back shortly.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Apply = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");
  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [currentStage, setCurrentStage] = useState<Stage>("Application");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prompts = getEssayPrompts();
  const config = getRecruitingConfig();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email ?? "",
      phone: "",
      school: "",
      major: user?.major ?? "",
      gradYear: user?.gradYear ?? "",
      linkedinUrl: user?.linkedinUrl ?? "",
      resumeFileId: "",
      essay1: "",
      essay2: "",
    },
  });

  // Check if already applied
  useEffect(() => {
    if (!user) return;
    const apps = getApplications();
    const prior = apps.find((a) => a.email.toLowerCase() === user.email.toLowerCase());
    if (prior) {
      setExistingApp(prior);
      setCurrentStage(getApplicantStage(prior.id) as Stage);
    }
  }, [user]);

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pevc_draft");
      if (raw) {
        form.reset(JSON.parse(raw));
        toast.info("Draft restored.");
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save draft
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const sub = form.watch((values) => {
      setSaving(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        try { localStorage.setItem("pevc_draft", JSON.stringify(values)); } catch { /* ignore */ }
        setSaving(false);
      }, 1500);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const essay1Value = form.watch("essay1");
  const essay2Value = form.watch("essay2");

  const goNext = async () => {
    let valid = false;
    if (step === 1) valid = await form.trigger(KYC_FIELDS as unknown as (keyof ApplicationFormValues)[]);
    if (step === 2) valid = await form.trigger(RESUME_FIELDS as unknown as (keyof ApplicationFormValues)[]);
    if (step === 3) valid = await form.trigger(ESSAY_FIELDS as unknown as (keyof ApplicationFormValues)[]);
    if (valid) setStep((s) => s + 1);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const email = form.getValues("email") || user?.email || "unknown";
      const stored = await saveResumeFile(file, email);
      setResumeFile(file);
      setResumeFileName(stored.name);
      form.setValue("resumeFileId", stored.id, { shouldValidate: true });
      toast.success("Resume uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setResumeUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeFileName("");
    form.setValue("resumeFileId", "", { shouldValidate: true });
  };

  const onSubmit = async (values: ApplicationFormValues) => {
    const app: Application = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      stage: "Application",
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      school: values.school,
      major: values.major,
      gradYear: values.gradYear,
      linkedinUrl: values.linkedinUrl,
      resumeFileId: values.resumeFileId,
      resumeFileName,
      essay1Prompt: prompts.essay1,
      essay1: values.essay1,
      essay2Prompt: prompts.essay2,
      essay2: values.essay2,
    };
    const saved = saveApplication(app);
    if (saved) {
      localStorage.removeItem("pevc_draft");
      setExistingApp(app);
      setCurrentStage("Application");
      setSubmitted(true);
      toast.success("Application submitted!");
    }
  };

  // ── Show tracker if already applied (or just submitted) ──

  if (existingApp) {
    return (
      <PageWrapper>
        <section className="min-h-screen pt-28 pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <ApplicationTracker
              application={existingApp}
              currentStage={currentStage}
              config={config}
            />
          </div>
        </section>
      </PageWrapper>
    );
  }

  // ── Application Form ──

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Apply to PEVC</h1>
          <p className="text-muted-foreground mb-8">Complete all steps to submit your application.</p>

          {/* Progress Tracker */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > s ? <CheckCircle size={14} /> : s}
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{STEP_LABELS[s - 1]}</span>
                </div>
                {s < 4 && (
                  <div className={`w-12 sm:w-20 h-0.5 mb-4 transition-colors ${step > s ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 mb-6 h-5">
            {saving && (
              <>
                <Loader2 size={14} className="animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Auto-saving draft...</span>
              </>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* ── Step 1: KYC ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">First Name</FormLabel>
                        <FormControl><Input placeholder="Jane" className="scarlet-input" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Last Name</FormLabel>
                        <FormControl><Input placeholder="Doe" className="scarlet-input" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                        <FormControl><Input type="email" placeholder="jane@university.edu" className="scarlet-input" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Phone</FormLabel>
                        <FormControl><Input type="tel" placeholder="+1 (555) 000-0000" className="scarlet-input" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="school" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">School / University</FormLabel>
                      <FormControl><Input placeholder="Ohio State University" className="scarlet-input" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="major" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Major</FormLabel>
                        <FormControl><Input placeholder="Finance" className="scarlet-input" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="gradYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Graduation Year</FormLabel>
                        <FormControl><Input inputMode="numeric" placeholder="2026" className="scarlet-input" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">LinkedIn URL</FormLabel>
                      <FormControl><Input type="url" placeholder="https://linkedin.com/in/janedoe" className="scarlet-input" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="button" onClick={goNext} className="w-full sm:w-auto">Next →</Button>
                </div>
              )}

              {/* ── Step 2: Resume ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <FormField control={form.control} name="resumeFileId" render={() => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Resume (PDF, max 5 MB)</FormLabel>
                      <FormControl>
                        <div>
                          {resumeFile ? (
                            <div className="flex items-center justify-between border border-primary/40 rounded-md px-4 py-3 bg-card">
                              <div className="flex items-center gap-3">
                                <FileText size={18} className="text-primary" />
                                <div>
                                  <p className="text-sm text-foreground font-medium">{resumeFileName}</p>
                                  <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button type="button" onClick={clearResume} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/60 rounded-md p-8 cursor-pointer transition-colors bg-card/50 group">
                              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={resumeUploading} />
                              {resumeUploading ? (
                                <Loader2 size={24} className="animate-spin text-primary mb-2" />
                              ) : (
                                <Upload size={24} className="text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                              )}
                              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                {resumeUploading ? "Uploading..." : "Click to upload your resume"}
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">PDF only · Max 5 MB</span>
                            </label>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>← Back</Button>
                    <Button type="button" onClick={goNext}>Next →</Button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Essays ── */}
              {step === 3 && (
                <div className="space-y-6">
                  <FormField control={form.control} name="essay1" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Essay 1</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">{prompts.essay1}</p>
                      <FormControl>
                        <Textarea rows={7} className="resize-none" placeholder="Share your response..." {...field} />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormMessage />
                        <span className={`text-xs ml-auto ${essay1Value.length > 2000 ? "text-destructive" : "text-muted-foreground"}`}>
                          {essay1Value.length}/2000
                        </span>
                      </div>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="essay2" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Essay 2</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">{prompts.essay2}</p>
                      <FormControl>
                        <Textarea rows={7} className="resize-none" placeholder="Walk us through your analysis..." {...field} />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormMessage />
                        <span className={`text-xs ml-auto ${essay2Value.length > 2000 ? "text-destructive" : "text-muted-foreground"}`}>
                          {essay2Value.length}/2000
                        </span>
                      </div>
                    </FormItem>
                  )} />

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>← Back</Button>
                    <Button type="button" onClick={goNext}>Review →</Button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Review ── */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-6 bg-card space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Personal Info</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-foreground">
                        <span className="text-muted-foreground">Name</span>
                        <span>{form.getValues("firstName")} {form.getValues("lastName")}</span>
                        <span className="text-muted-foreground">Email</span>
                        <span>{form.getValues("email")}</span>
                        <span className="text-muted-foreground">Phone</span>
                        <span>{form.getValues("phone")}</span>
                        <span className="text-muted-foreground">School</span>
                        <span>{form.getValues("school")}</span>
                        <span className="text-muted-foreground">Major</span>
                        <span>{form.getValues("major")}</span>
                        <span className="text-muted-foreground">Grad Year</span>
                        <span>{form.getValues("gradYear")}</span>
                        <span className="text-muted-foreground">LinkedIn</span>
                        <a href={form.getValues("linkedinUrl")} target="_blank" rel="noopener noreferrer" className="text-primary truncate hover:underline">
                          {form.getValues("linkedinUrl")}
                        </a>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Resume</p>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <FileText size={14} className="text-primary" />
                        <span>{resumeFileName || "No file uploaded"}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Essays</p>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground italic mb-1">{prompts.essay1}</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{form.getValues("essay1")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground italic mb-1">{prompts.essay2}</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{form.getValues("essay2")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>← Back</Button>
                    <Button type="submit" className="flex-1 sm:flex-none sm:min-w-[180px]" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? (
                        <><Loader2 size={14} className="animate-spin mr-2" />Submitting...</>
                      ) : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}

            </form>
          </Form>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Apply;
