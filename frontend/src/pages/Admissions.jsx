import { useState } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "../lib/api";

const initial = {
    student_name: "", date_of_birth: "", gender: "", class_applying: "",
    parent_name: "", parent_phone: "", parent_email: "",
    address: "", previous_school: "", message: "",
};

const classes = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export default function Admissions() {
    const [form, setForm] = useState(initial);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const validateStep1 = () => {
        if (!form.student_name || !form.date_of_birth || !form.gender || !form.class_applying) {
            toast.error("Please fill all student details");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!form.parent_name || !form.parent_phone || !form.parent_email) {
            toast.error("Please fill all parent details");
            return false;
        }
        return true;
    };

    const submit = async () => {
        if (!form.address) { toast.error("Please provide address"); return; }
        setSubmitting(true);
        try {
            await api.post("/admissions", form);
            setSubmitted(true);
            toast.success("Application submitted successfully");
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center" data-testid="admission-success">
                <div className="h-16 w-16 rounded-full bg-saffron/15 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-saffronDark" />
                </div>
                <h1 className="mt-6 font-display font-bold text-3xl md:text-4xl text-ink">Application received!</h1>
                <p className="mt-3 text-ash">Thank you for applying to Azad Sr. Sec. School. Our admissions team will reach out within 3-5 working days at <strong>{form.parent_email}</strong>.</p>
                <button onClick={() => { setForm(initial); setStep(1); setSubmitted(false); }} data-testid="admission-new-btn" className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-ink rounded-full hover:bg-ink2 transition-colors">
                    Submit another application
                </button>
            </div>
        );
    }

    return (
        <div className="bg-cream" data-testid="admissions-page">
            <section className="border-b border-[#E2E8F0] bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Admissions 2026-27</span>
                    <h1 className="mt-3 font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl">Begin your journey at Azad.</h1>
                    <p className="mt-5 text-ash max-w-2xl text-lg">Complete the application form below. Our admissions office will contact you to schedule an interaction.</p>
                </div>
            </section>

            <section className="py-16 md:py-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 mb-10">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex-1">
                                <div className={`h-1.5 rounded-full ${step >= s ? "bg-saffron" : "bg-[#E2E8F0]"}`} />
                                <div className={`mt-2 text-xs font-medium ${step >= s ? "text-ink" : "text-ash"}`}>
                                    Step {s}: {s === 1 ? "Student" : s === 2 ? "Parent" : "Address & Submit"}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-10">
                        {step === 1 && (
                            <div className="space-y-5" data-testid="admission-step-1">
                                <Field label="Student's Full Name" required>
                                    <input data-testid="input-student-name" value={form.student_name} onChange={upd("student_name")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all" placeholder="e.g. Aarav Sharma" />
                                </Field>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <Field label="Date of Birth" required>
                                        <input data-testid="input-dob" type="date" value={form.date_of_birth} onChange={upd("date_of_birth")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                                    </Field>
                                    <Field label="Gender" required>
                                        <select data-testid="input-gender" value={form.gender} onChange={upd("gender")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none">
                                            <option value="">Select</option>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </Field>
                                </div>
                                <Field label="Class Applying For" required>
                                    <select data-testid="input-class" value={form.class_applying} onChange={upd("class_applying")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none">
                                        <option value="">Select class</option>
                                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                                    </select>
                                </Field>
                                <Field label="Previous School (if any)">
                                    <input data-testid="input-prev-school" value={form.previous_school} onChange={upd("previous_school")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" placeholder="Previous school name" />
                                </Field>
                                <div className="flex justify-end pt-4">
                                    <button onClick={() => validateStep1() && setStep(2)} data-testid="step-1-next" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-ink rounded-full hover:bg-ink2 transition-colors">
                                        Next <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5" data-testid="admission-step-2">
                                <Field label="Parent / Guardian Name" required>
                                    <input data-testid="input-parent-name" value={form.parent_name} onChange={upd("parent_name")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" />
                                </Field>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <Field label="Phone" required>
                                        <input data-testid="input-parent-phone" value={form.parent_phone} onChange={upd("parent_phone")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" placeholder="+91 ..." />
                                    </Field>
                                    <Field label="Email" required>
                                        <input data-testid="input-parent-email" type="email" value={form.parent_email} onChange={upd("parent_email")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" placeholder="parent@example.com" />
                                    </Field>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button onClick={() => setStep(1)} data-testid="step-2-back" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-ink border border-[#CBD5E1] rounded-full hover:bg-[#F3F4F6]">
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </button>
                                    <button onClick={() => validateStep2() && setStep(3)} data-testid="step-2-next" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-ink rounded-full hover:bg-ink2">
                                        Next <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5" data-testid="admission-step-3">
                                <Field label="Residential Address" required>
                                    <textarea data-testid="input-address" rows={3} value={form.address} onChange={upd("address")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" placeholder="House no, street, city, state, pincode" />
                                </Field>
                                <Field label="Anything else we should know? (optional)">
                                    <textarea data-testid="input-message" rows={4} value={form.message} onChange={upd("message")} className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] bg-cream focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none" placeholder="Special interests, requirements, etc." />
                                </Field>
                                <div className="flex justify-between pt-4">
                                    <button onClick={() => setStep(2)} data-testid="step-3-back" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-ink border border-[#CBD5E1] rounded-full hover:bg-[#F3F4F6]">
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </button>
                                    <button onClick={submit} disabled={submitting} data-testid="admission-submit-btn" className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-saffron rounded-full hover:bg-saffronDark disabled:opacity-60">
                                        {submitting ? "Submitting..." : "Submit Application"} <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
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
