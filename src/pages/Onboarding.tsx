import { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { PartyPopper, ArrowRight, Check } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [tshirt, setTshirt] = useState("M");
  const [dietary, setDietary] = useState("");
  const [phone, setPhone] = useState("");
  const [slackJoined, setSlackJoined] = useState(false);
  const [emailSetup, setEmailSetup] = useState(false);

  return (
    <PageWrapper>
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-10 justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <PartyPopper size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome to PEVC!</h1>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Congratulations on being accepted. Let's get you set up with everything you need.
              </p>
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground text-center">Your Details</h2>
              <p className="text-muted-foreground text-center text-sm">Confirm a few things so we can prepare for you.</p>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">T-Shirt Size</label>
                <select value={tshirt} onChange={(e) => setTshirt(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Dietary Restrictions</label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="e.g. Vegetarian, None"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="(614) 555-0123"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="border border-border px-6 py-2.5 rounded-md text-sm text-foreground hover:bg-secondary transition-colors">
                  ← Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Access */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground text-center">Set Up Access</h2>
              <p className="text-muted-foreground text-center text-sm">Connect to our tools and communication channels.</p>

              <div className="space-y-3">
                <button
                  onClick={() => setSlackJoined(true)}
                  disabled={slackJoined}
                  className={`w-full flex items-center justify-between border rounded-lg p-4 text-sm font-semibold transition-colors ${
                    slackJoined
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary"
                  }`}
                >
                  <span>{slackJoined ? "✓ Slack Workspace Joined" : "Join Slack Workspace"}</span>
                  {!slackJoined && <ArrowRight size={16} />}
                </button>

                <button
                  onClick={() => setEmailSetup(true)}
                  disabled={emailSetup}
                  className={`w-full flex items-center justify-between border rounded-lg p-4 text-sm font-semibold transition-colors ${
                    emailSetup
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary"
                  }`}
                >
                  <span>{emailSetup ? "✓ PEVC Email Configured" : "Setup PEVC Email"}</span>
                  {!emailSetup && <ArrowRight size={16} />}
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(2)} className="border border-border px-6 py-2.5 rounded-md text-sm text-foreground hover:bg-secondary transition-colors">
                  ← Back
                </button>
                <button
                  disabled={!slackJoined || !emailSetup}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Onboarding;
