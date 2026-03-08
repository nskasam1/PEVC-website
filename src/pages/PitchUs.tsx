import { useState } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { Send } from "lucide-react";

const PitchUs = () => {
  const [form, setForm] = useState({
    name: "", company: "", linkedin: "", deckUrl: "", blurb: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen pt-16 bg-background">
        <section className="container mx-auto px-6 py-24 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Pitch Us
          </motion.h1>
          <p className="text-muted-foreground mb-16 font-dm">
            We're always looking for exceptional founders. Tell us about your company.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="editorial-card border border-border/50 p-12 text-center bg-card"
            >
              {/* Top accent line already handled by editorial-card */}
              <div className="w-10 h-10 border border-primary/40 flex items-center justify-center mx-auto mb-6 bg-primary/5">
                <Send className="text-primary" size={16} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pitch Received</h2>
              <p className="text-muted-foreground text-sm font-dm">We'll review your submission and get back to you soon.</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {[
                { name: "name", label: "Your Name", type: "text" },
                { name: "company", label: "Company Name", type: "text" },
                { name: "linkedin", label: "LinkedIn URL", type: "url" },
                { name: "deckUrl", label: "Pitch Deck URL", type: "url" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-semibold block mb-2">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    required
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    className="w-full bg-transparent scarlet-input py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-dm"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-semibold block mb-2">
                  Brief Blurb
                </label>
                <textarea
                  name="blurb"
                  required
                  value={form.blurb}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-transparent scarlet-input py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none font-dm"
                  placeholder="Tell us about your company in a few sentences..."
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-primary-foreground px-8 py-3 font-semibold text-xs tracking-[0.2em] uppercase transition-transform hover:scale-[1.02] flex items-center gap-2"
              >
                Submit Pitch <Send size={13} />
              </button>
            </motion.form>
          )}
        </section>
      </div>
    </PageWrapper>
  );
};

export default PitchUs;
