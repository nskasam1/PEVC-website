import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle, Loader2, Calendar, Download, ExternalLink,
  Upload, FileText, AlertCircle,
} from "lucide-react";
import {
  getOrCreateApplicant, getApplicantByProfileId,
  getApplicationByApplicantId, submitApplication, uploadResume,
} from "@/lib/api/applicants";
import {
  getRoundConfig, getAvailableSlots, bookSlot,
  getBookedSlotForApplicant,
} from "@/lib/api/recruiting";
import type {
  Applicant, Application, RoundConfig,
  InterviewSlot, EssayQuestion, ResourceLink,
} from "@/lib/database.types";
import { format } from "date-fns";

// ─── Step indicator ────────────────────────────────────────────
const Steps = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2 mb-10">
    {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
      <div key={s} className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          current >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}>
          {current > s ? <CheckCircle size={14} /> : s}
        </div>
        {s < total && <div className={`w-16 h-0.5 transition-colors ${current > s ? "bg-primary" : "bg-border"}`} />}
      </div>
    ))}
  </div>
);

// ─── R0: KYC + Essays ─────────────────────────────────────────
interface R0FormValues {
  name: string; email: string; phone: string; school: string;
  major: string; year: string; gpa: string; linkedinUrl: string;
  essayAnswers: Record<string, string>;
  resumeFile: File | null;
}

const R0Form = ({
  questions, initialEmail, initialName, onSubmit, loading,
}: {
  questions: EssayQuestion[];
  initialEmail: string;
  initialName: string;
  onSubmit: (v: R0FormValues) => void;
  loading: boolean;
}) => {
  const [step, setStep] = useState<"kyc" | "essays">("kyc");
  const [form, setForm] = useState<R0FormValues>({
    name: initialName, email: initialEmail, phone: "", school: "",
    major: "", year: "", gpa: "", linkedinUrl: "", essayAnswers: {}, resumeFile: null,
  });

  const set = (k: keyof R0FormValues, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const kyc_valid =
    form.name && form.email && form.phone && form.school &&
    form.major && form.year && form.gpa;

  const essays_valid = questions.every((q) => (form.essayAnswers[q.id] ?? "").trim().length > 0);

  return (
    <div>
      <Steps current={step === "kyc" ? 1 : 2} total={2} />

      {step === "kyc" && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
          {[
            { label: "Full Name", key: "name" as const, type: "text", placeholder: "Jane Doe" },
            { label: "Email", key: "email" as const, type: "email", placeholder: "jane@university.edu" },
            { label: "Phone", key: "phone" as const, type: "tel", placeholder: "+1 (555) 000-0000" },
            { label: "School", key: "school" as const, type: "text", placeholder: "The Ohio State University" },
            { label: "Major", key: "major" as const, type: "text", placeholder: "Finance" },
            { label: "Graduation Year", key: "year" as const, type: "text", placeholder: "2026" },
            { label: "GPA", key: "gpa" as const, type: "text", placeholder: "3.8" },
            { label: "LinkedIn URL", key: "linkedinUrl" as const, type: "url", placeholder: "https://linkedin.com/in/yourname" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">{label}</label>
              <input
                type={type}
                value={String(form[key] ?? "")}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          ))}

          {/* Resume upload */}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Resume (PDF)</label>
            <label className="flex items-center gap-3 border border-dashed border-border rounded-md p-4 cursor-pointer hover:border-primary transition-colors">
              {form.resumeFile ? (
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <span className="text-sm text-foreground">{form.resumeFile.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Upload size={18} />
                  <span className="text-sm">Upload resume (PDF, max 10 MB)</span>
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => set("resumeFile", e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <button
            onClick={() => setStep("essays")}
            disabled={!kyc_valid}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next → Essay Questions
          </button>
        </div>
      )}

      {step === "essays" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Essay Questions</h2>
          {questions.map((q, idx) => (
            <div key={q.id}>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                {idx + 1}. {q.text}
              </label>
              <textarea
                value={form.essayAnswers[q.id] ?? ""}
                onChange={(e) =>
                  set("essayAnswers", { ...form.essayAnswers, [q.id]: e.target.value })
                }
                rows={6}
                className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                placeholder="Your answer..."
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("kyc")}
              className="border border-border px-6 py-2.5 rounded-md text-sm text-foreground hover:bg-secondary transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => onSubmit(form)}
              disabled={!essays_valid || loading}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Submit Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── R1/R2: Interview scheduling + resources ──────────────────
const InterviewView = ({
  round, config, applicantId,
}: {
  round: "r1" | "r2";
  config: RoundConfig;
  applicantId: string;
}) => {
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [bookedSlot, setBookedSlot] = useState<InterviewSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const resourceLinks = (config.resource_links as unknown as ResourceLink[]) ?? [];

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const [available, booked] = await Promise.all([
        getAvailableSlots(round),
        getBookedSlotForApplicant(applicantId),
      ]);
      setSlots(available);
      setBookedSlot(booked);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  }, [round, applicantId]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const handleBook = async (slot: InterviewSlot) => {
    setBooking(true);
    try {
      await bookSlot(slot.id, applicantId);
      toast({ title: "Interview Scheduled", description: `Your slot is confirmed for ${format(new Date(slot.slot_datetime), "PPp")}` });
      await loadSlots();
    } catch (e) {
      toast({ title: "Booking Failed", description: String(e), variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  const roundLabel = round === "r1" ? "First Round" : "Second Round";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">{roundLabel} Interview</h2>
        <p className="text-sm text-muted-foreground">You've advanced to {roundLabel}. See details below.</p>
      </div>

      {/* Booked slot */}
      {bookedSlot && (
        <div className="border border-primary/40 bg-primary/5 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-primary" />
            <span className="font-semibold text-foreground text-sm">Interview Scheduled</span>
          </div>
          <p className="text-sm text-foreground">
            {format(new Date(bookedSlot.slot_datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      )}

      {/* Case file */}
      {config.case_file_url && (
        <div className="border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-3">Case File</h3>
          <a
            href={config.case_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Download size={16} />
            Download Case File
          </a>
        </div>
      )}

      {/* Prep resources */}
      {resourceLinks.length > 0 && (
        <div className="border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-3">Prep Resources</h3>
          <ul className="space-y-2">
            {resourceLinks.map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink size={14} />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Slot picker */}
      {!bookedSlot && (
        <div className="border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
              Schedule Your Interview
            </h3>
          </div>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading available slots...
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available slots yet. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={booking}
                  onClick={() => handleBook(slot)}
                  className="border border-border rounded-md py-3 px-2 text-xs text-foreground hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40 text-center"
                >
                  {format(new Date(slot.slot_datetime), "EEE MMM d")}
                  <br />
                  {format(new Date(slot.slot_datetime), "h:mm a")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Apply page ──────────────────────────────────────────
const Apply = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [r0Config, setR0Config] = useState<RoundConfig | null>(null);
  const [r1Config, setR1Config] = useState<RoundConfig | null>(null);
  const [r2Config, setR2Config] = useState<RoundConfig | null>(null);

  // Load everything on mount
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const [r0, r1, r2] = await Promise.all([
          getRoundConfig("r0"),
          getRoundConfig("r1"),
          getRoundConfig("r2"),
        ]);
        setR0Config(r0);
        setR1Config(r1);
        setR2Config(r2);

        const existing = await getApplicantByProfileId(user.id);
        if (existing) {
          setApplicant(existing);
          const app = await getApplicationByApplicantId(existing.id);
          setApplication(app);
        }
      } catch (e) {
        toast({ title: "Error loading application", description: String(e), variant: "destructive" });
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleSubmitR0 = async (formValues: Parameters<typeof R0Form>[0]["onSubmit"] extends (v: infer V) => void ? V : never) => {
    if (!user || !r0Config) return;
    setSubmitting(true);
    try {
      // Get or create applicant record
      const ap = await getOrCreateApplicant(user.id, formValues.name, formValues.email);
      setApplicant(ap);

      // Upload resume if provided
      let resumeUrl: string | null = null;
      if (formValues.resumeFile) {
        resumeUrl = await uploadResume(ap.id, formValues.resumeFile);
      }

      // Build essay answers
      const questions = (r0Config.essay_questions as unknown as EssayQuestion[]) ?? [];
      const essayAnswers = questions.map((q) => ({
        question_id: q.id,
        question_text: q.text,
        answer: formValues.essayAnswers[q.id] ?? "",
      }));

      const app = await submitApplication({
        applicantId: ap.id,
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        school: formValues.school,
        major: formValues.major,
        year: formValues.year,
        gpa: formValues.gpa,
        linkedinUrl: formValues.linkedinUrl,
        resumeUrl,
        essayAnswers,
      });

      setApplication(app);
      setSubmitted(true);
      toast({ title: "Application submitted!", description: "We'll review it and get back to you." });
    } catch (e) {
      toast({ title: "Submission failed", description: String(e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </section>
      </PageWrapper>
    );
  }

  // Submission success screen
  if (submitted || (application && applicant?.status === "pending" && applicant.current_round === "r0")) {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <CheckCircle size={52} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted</h2>
            <p className="text-muted-foreground text-sm">
              We're reviewing your application and will follow up via email.
            </p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // Accepted
  if (applicant?.status === "accepted") {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <CheckCircle size={52} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Congratulations!</h2>
            <p className="text-muted-foreground text-sm">You've been accepted to PEVC. Welcome aboard!</p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // Rejected
  if (applicant?.status === "rejected") {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle size={52} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Application Update</h2>
            <p className="text-muted-foreground text-sm">
              Thank you for your interest in PEVC. We won't be moving forward at this time.
            </p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // R1 or R2 interview view
  if (applicant && (applicant.current_round === "r1" || applicant.current_round === "r2")) {
    const round = applicant.current_round;
    const config = round === "r1" ? r1Config : r2Config;
    if (!config) {
      return (
        <PageWrapper>
          <section className="min-h-screen flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary" />
          </section>
        </PageWrapper>
      );
    }
    return (
      <PageWrapper>
        <section className="min-h-screen pt-28 pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <InterviewView round={round} config={config} applicantId={applicant.id} />
          </div>
        </section>
      </PageWrapper>
    );
  }

  // R0: check if open
  if (!r0Config?.is_open) {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle size={52} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Applications Closed</h2>
            <p className="text-muted-foreground text-sm">
              Applications are currently closed. Check back later.
            </p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // R0 application form
  const questions = (r0Config?.essay_questions as unknown as EssayQuestion[]) ?? [];

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Apply to PEVC</h1>
          <p className="text-muted-foreground mb-10">Complete all steps to submit your application.</p>
          <R0Form
            questions={questions}
            initialEmail={user?.email ?? ""}
            initialName={user?.name ?? ""}
            onSubmit={handleSubmitR0}
            loading={submitting}
          />
        </div>
      </section>
    </PageWrapper>
  );
};

export default Apply;
