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
      <div className="min-h-screen pt-16">
        <section className="container mx-auto px-6 py-24 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Pitch Us
          </motion.h1>
          <p className="text-muted-foreground mb-16">
            We're always looking for exceptional founders. Tell us about your company.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-border rounded-lg p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Send className="text-primary" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pitch Received</h2>
              <p className="text-muted-foreground">We'll review your submission and get back to you soon.</p>
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
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold block mb-2">
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    required
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    className="w-full bg-transparent scarlet-input py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold block mb-2">
                  Brief Blurb
                </label>
                <textarea
                  name="blurb"
                  required
                  value={form.blurb}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-transparent scarlet-input py-3 text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                  placeholder="Tell us about your company in a few sentences..."
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold text-sm transition-transform hover:scale-[1.02] flex items-center gap-2"
              >
                Submit Pitch <Send size={16} />
              </button>
            </motion.form>
          )}
        </section>
      </div>
    </PageWrapper>
  );
};

export default PitchUs;
