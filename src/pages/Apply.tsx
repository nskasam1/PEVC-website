import { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import { CheckCircle, Loader2, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Apply = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [essay1, setEssay1] = useState("");
  const [essay2, setEssay2] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Auto-save simulation
  useEffect(() => {
    if (!essay1 && !essay2 && !videoUrl) return;
    setSaving(true);
    const t = setTimeout(() => setSaving(false), 1200);
    return () => clearTimeout(t);
  }, [essay1, essay2, videoUrl]);

  // Mock scheduling state (set by admin advancing to Round 1/2)
  const mockScheduling = user?.role === "Applicant" ? localStorage.getItem("pevc_scheduling") : null;

  if (submitted) {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <CheckCircle size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted</h2>
            <p className="text-muted-foreground text-sm">We'll review your application and follow up shortly.</p>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Apply to PEVC</h1>
          <p className="text-muted-foreground mb-8">Complete all steps to submit your application.</p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {s}
                </div>
                {s < 2 && <div className={`w-16 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
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

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Why are you interested in PEVC?
                </label>
                <textarea
                  value={essay1}
                  onChange={(e) => setEssay1(e.target.value)}
                  rows={5}
                  className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Share your motivation..."
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Describe a deal or company you find interesting
                </label>
                <textarea
                  value={essay2}
                  onChange={(e) => setEssay2(e.target.value)}
                  rows={5}
                  className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Walk us through your analysis..."
                />
              </div>
              <button
                onClick={() => setStep(2)}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Video Introduction URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="border border-border px-6 py-2.5 rounded-md text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setSubmitted(true)}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </div>
          )}

          {/* Mock Calendly scheduling block */}
          {mockScheduling && (
            <div className="mt-12 border border-primary/30 rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={20} className="text-primary" />
                <h3 className="font-semibold text-foreground">Schedule Your Interview</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                You've been advanced to <span className="text-primary font-semibold">{mockScheduling}</span>. Select a time below.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["Mon 10am", "Tue 2pm", "Wed 11am", "Thu 3pm", "Fri 9am", "Fri 1pm"].map((slot) => (
                  <button key={slot} className="border border-border rounded-md py-2 text-xs text-foreground hover:border-primary hover:bg-primary/5 transition-colors">
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Apply;
