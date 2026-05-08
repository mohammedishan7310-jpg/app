import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "../lib/api";

const initial = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
    const [form, setForm] = useState(initial);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.subject || !form.message) {
            toast.error("Please fill all required fields"); return;
        }
        setSubmitting(true);
        try {
            await api.post("/contacts", form);
            setDone(true);
            toast.success("Message sent");
            setForm(initial);
        } catch (er) {
            toast.error(formatApiErrorDetail(er.response?.data?.detail) || "Failed to send");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-cream" data-testid="contact-page">
            <section className="border-b border-[#E2E8F0] bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Get in touch</span>
                    <h1 className="mt-3 font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl">We'd love to hear from you.</h1>
                    <p className="mt-5 text-ash max-w-2xl text-lg">Schedule a campus visit, ask about admissions, or just say hello. Our team responds within one working day.</p>
                </div>
            </section>

            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10">
                    {/* Contact info */}
                    <div className="lg:col-span-2 space-y-6">
                        {[
                            { icon: MapPin, t: "Campus Address", v: "Sector 12, Civil Lines\nNew Delhi - 110054, India" },
                            { icon: Phone, t: "Phone", v: "+91 11 2398 5544\n+91 98765 43210" },
                            { icon: Mail, t: "Email", v: "info@azadschool.edu\nadmissions@azadschool.edu" },
                            { icon: Clock, t: "School Hours", v: "Mon - Fri: 8:00 AM - 3:30 PM\nSat: 8:00 AM - 12:30 PM" },
                        ].map(({ icon: Icon, t, v }) => (
                            <div key={t} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-saffron/10 flex-shrink-0 flex items-center justify-center">
                                    <Icon className="h-5 w-5 text-saffronDark" />
                                </div>
                                <div>
                                    <h4 className="font-display font-semibold text-ink">{t}</h4>
                                    <p className="mt-1 text-sm text-ash whitespace-pre-line leading-relaxed">{v}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        {done ? (
                            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center" data-testid="contact-success">
                                <div className="h-16 w-16 rounded-full bg-saffron/15 flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="h-8 w-8 text-saffronDark" />
                                </div>
                                <h2 className="mt-6 font-display font-bold text-2xl text-ink">Message received!</h2>
                                <p className="mt-2 text-ash">Thank you. We'll get back to you within one working day.</p>
                                <button onClick={() => setDone(false)} data-testid="contact-new-btn" className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-ink rounded-full hover:bg-ink2">
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-10 space-y-5" data-testid="contact-form">
                                <h2 className="font-display font-bold text-2xl text-ink">Send us a message</h2>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <Field label="Your name" required>
                                        <input data-testid="contact-input-name" value={form.name} onChange={upd("name")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                                    </Field>
                                    <Field label="Email" required>
                                        <input data-testid="contact-input-email" type="email" value={form.email} onChange={upd("email")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                                    </Field>
                                </div>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <Field label="Phone (optional)">
                                        <input data-testid="contact-input-phone" value={form.phone} onChange={upd("phone")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                                    </Field>
                                    <Field label="Subject" required>
                                        <input data-testid="contact-input-subject" value={form.subject} onChange={upd("subject")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                                    </Field>
                                </div>
                                <Field label="Message" required>
                                    <textarea data-testid="contact-input-message" rows={5} value={form.message} onChange={upd("message")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                                </Field>
                                <button type="submit" disabled={submitting} data-testid="contact-submit-btn" className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-saffron rounded-full hover:bg-saffronDark disabled:opacity-60">
                                    {submitting ? "Sending..." : <>Send message <Send className="h-4 w-4" /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Map */}
            <section className="pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] bg-white">
                        <iframe
                            data-testid="contact-map"
                            title="School location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.0762616103146!2d77.21672901508275!3d28.683964482402573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd47e29be7af%3A0x52273d3d1fd5d9e8!2sCivil%20Lines%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000"
                            width="100%"
                            height="420"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function Field({ label, required, children }) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-ink mb-1.5">{label}{required && <span className="text-saffron"> *</span>}</span>
            {children}
        </label>
    );
}
