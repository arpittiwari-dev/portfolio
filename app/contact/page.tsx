"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import { ArrowUpRight, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getSiteContent } from "@/lib/siteContent";
import { defaultSiteContent } from "@/lib/types";

const EMAILJS_CONFIGURED =
  !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID !== "your_service_id";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

const inputCls = "w-full bg-surface border border-white/[0.07] rounded-xl px-4 py-3 text-text-1 font-body text-sm placeholder:text-text-3 focus:outline-none focus:border-accent/40 transition-colors duration-150";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [siteContent, setSiteContent] = useState(defaultSiteContent);

  useEffect(() => { setSiteContent(getSiteContent()); }, []);

  const CONTACT_EMAIL = siteContent.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "tarpit771@gmail.com";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openMailto = () => {
    const s = encodeURIComponent(`Portfolio inquiry from ${form.name}`);
    const b = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
    window.open(`mailto:${CONTACT_EMAIL}?subject=${s}&body=${b}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    if (!EMAILJS_CONFIGURED) { openMailto(); setStatus("sent"); setForm({ name: "", email: "", message: "" }); return; }
    try {
      const ejs = await import("@emailjs/browser");
      await ejs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: form.name, from_email: form.email, message: form.message, to_name: "Arpit Tiwari" },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setErrorMsg("Couldn't send automatically — opening your email client instead.");
      setStatus("error");
      setTimeout(() => openMailto(), 1200);
    }
  };

  return (
    <>
      <section className="pt-24 md:pt-32 pb-10 md:pb-14 px-5 md:px-8">
        <div className="max-w-6xl mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <p className="text-accent text-[10px] font-body font-bold tracking-[0.2em] uppercase mb-4">Contact</p>
            <h1 className="font-display font-bold text-text-1 leading-tight mb-4"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}>
              Let&apos;s build something
              <br />
              <span className="text-text-3">great together.</span>
            </h1>
            <p className="text-text-2 font-body text-lg leading-relaxed">
              Open to freelance projects, internships, and full-time opportunities.
              I&apos;ll get back within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-14 md:pb-24 px-5 md:px-8 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto pt-10 md:pt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
            {/* Info */}
            <div className="space-y-8">
              <Reveal>
                <div className="space-y-6">
                  {[
                    { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
                    { label: "Location", value: "Surat, Gujarat, India", href: null },
                    { label: "LinkedIn", value: "linkedin.com/in/arpittiwari-ui", href: "https://www.linkedin.com/in/arpittiwari-ui" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-text-3 text-[10px] font-body font-bold tracking-[0.18em] uppercase mb-1.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-text-1 font-body font-medium hover:text-accent transition-colors flex items-center gap-1.5 group">
                          {item.value}
                          <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-text-1 font-body font-medium">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="p-4 rounded-xl border border-accent/15 bg-accent/[0.04] flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent glow-pulse mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-accent text-sm font-body font-semibold mb-0.5">Available for work</p>
                    <p className="text-text-2 text-sm font-body leading-relaxed">
                      {siteContent.contactAvailabilityText}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <Reveal delay={0.1}>
              {status === "sent" ? (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <CheckCircle size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-text-1 text-xl mb-1.5">Message sent!</h3>
                    <p className="text-text-2 font-body text-sm">I&apos;ll get back to you within 24 hours.</p>
                  </div>
                  <Button onClick={() => setStatus("idle")} variant="ghost">Send another</Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { name: "name",  label: "Name",  type: "text",  placeholder: "Your name" },
                    { name: "email", label: "Email", type: "email", placeholder: "your@email.com" },
                  ].map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <label htmlFor={f.name} className="text-text-3 text-xs font-body uppercase tracking-wide block">{f.label}</label>
                      <input id={f.name} name={f.name} type={f.type}
                        value={form[f.name as keyof typeof form]}
                        onChange={handleChange} placeholder={f.placeholder} required
                        className={inputCls} />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-text-3 text-xs font-body uppercase tracking-wide block">Message</label>
                    <textarea id="message" name="message" value={form.message}
                      onChange={handleChange} placeholder="Tell me about your project..."
                      required rows={5} className={`${inputCls} resize-none`} />
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-body bg-yellow-400/10 px-3 py-2.5 rounded-lg">
                      <AlertCircle size={13} /> {errorMsg}
                    </div>
                  )}

                  <Button type="submit" size="lg" disabled={status === "sending"} className="w-full justify-center">
                    {status === "sending" ? "Sending…" : "Send Message"}
                    <Send size={13} />
                  </Button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
