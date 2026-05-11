import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Award, BookOpen, Trophy, Users, Sparkles, ChevronRight } from "lucide-react";
import { api } from "../lib/api";

const HERO = "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";
const ABOUT = "https://images.unsplash.com/photo-1698993026848-f67c1eb7f989?crop=entropy&cs=srgb&fm=jpg&q=85&w=900";
const SCIENCE = "https://images.unsplash.com/photo-1742137587486-fdef8cdd25bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=900";
const SPORTS = "https://images.unsplash.com/photo-1771909712619-54b241d2f8ff?crop=entropy&cs=srgb&fm=jpg&q=85&w=900";
const ARTS = "https://images.unsplash.com/photo-1551731409-43eb3e517a1a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900";

export default function Home() {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        api.get("/announcements").then(r => setAnnouncements(r.data.slice(0, 3))).catch(() => {});
    }, []);

    return (
        <div data-testid="home-page">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src={HERO} alt="Students" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/65 to-ink/30" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pt-32 md:pb-40">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 text-saffron text-xs font-bold uppercase tracking-[0.2em]" data-testid="hero-badge">
                            <Sparkles className="h-3.5 w-3.5" /> Admissions 2026-27 Now Open
                        </span>
                        <h1 className="mt-5 font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                            Where curious minds<br />
                            <span className="text-saffron">become bold leaders.</span>
                        </h1>
                        <p className="mt-6 text-lg text-cream/85 max-w-2xl leading-relaxed">
                            For four decades, Azad Senior Secondary School has nurtured generations of learners through rigorous academics, vibrant arts, athletic excellence and timeless values.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link to="/admissions" data-testid="hero-apply-btn" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-ink bg-saffron rounded-full hover:bg-white transition-colors">
                                Apply for Admission <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <Link to="/gallery" data-testid="hero-gallery-btn" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-transparent border border-white/40 rounded-full hover:bg-white/10 transition-colors">
                                Explore Campus
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="relative bg-cream border-t border-[#E2E8F0]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { k: "40+", v: "Years of legacy" },
                            { k: "2,400", v: "Students enrolled" },
                            { k: "120+", v: "Expert teachers" },
                            { k: "98%", v: "Board pass rate" },
                        ].map(s => (
                            <div key={s.v} className="border-l-2 border-saffron pl-4">
                                <div className="font-display text-3xl md:text-4xl font-bold text-ink">{s.k}</div>
                                <div className="text-xs uppercase tracking-wider text-ash mt-1">{s.v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="order-2 md:order-1">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">About Us</span>
                        <h2 className="mt-3 font-display font-bold text-ink text-3xl md:text-4xl lg:text-5xl tracking-tight">
                            A school built on curiosity, character and community.
                        </h2>
                        <p className="mt-5 text-ash leading-relaxed">
                            Founded in 1985, Azad Senior Secondary School is a co-educational RBSE-affiliated institution serving classes Nursery to XII. We blend a rigorous academic curriculum with art, sport, debate and service so students graduate as well-rounded individuals.
                        </p>
                        <ul className="mt-7 space-y-3">
                            {[
                                "RBSE curriculum with Science, Commerce & Humanities streams",
                                "Smart classrooms, science labs and a 30,000-volume library",
                                "Houses, clubs and extracurriculars to nurture every interest",
                            ].map(t => (
                                <li key={t} className="flex gap-3 text-sm text-ink">
                                    <ChevronRight className="h-5 w-5 text-saffron flex-shrink-0" />
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                        <Link to="/admissions" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-saffron transition-colors" data-testid="about-cta">
                            Begin your journey with us <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="order-1 md:order-2 relative">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden">
                            <img src={ABOUT} alt="Classroom" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-saffron text-ink p-5 rounded-2xl max-w-[220px] shadow-xl hidden md:block">
                            <Award className="h-7 w-7 mb-2" />
                            <div className="font-display font-bold text-lg leading-tight">Best RBSE School (Delhi NCR) — 2024</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROGRAMS */}
            <section className="py-20 md:py-28 bg-white border-y border-[#E2E8F0]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Our Programs</span>
                            <h2 className="mt-3 font-display font-bold text-ink text-3xl md:text-4xl lg:text-5xl tracking-tight max-w-2xl">
                                Learning beyond the textbook.
                            </h2>
                        </div>
                        <p className="text-ash max-w-md">From science and humanities to sports and the arts — we offer a breadth of programs that match your child's spark.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { img: SCIENCE, t: "Science & Innovation", d: "Hands-on labs in Physics, Chemistry, Biology and Computer Science with annual research projects.", icon: BookOpen },
                            { img: SPORTS, t: "Sports & Athletics", d: "Cricket, basketball, athletics, yoga and chess — our houses compete year-round in inter-school events.", icon: Trophy },
                            { img: ARTS, t: "Arts & Culture", d: "Music, dance, theatre and visual arts — students perform on stage every term and lead student-run clubs.", icon: Users },
                        ].map((p) => (
                            <div key={p.t} className="group bg-cream border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300" data-testid={`program-${p.t.split(" ")[0].toLowerCase()}`}>
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src={p.img} alt={p.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-saffron">
                                        <p.icon className="h-4 w-4" />
                                        <span className="text-xs uppercase font-bold tracking-wider">Program</span>
                                    </div>
                                    <h3 className="font-display font-bold text-xl mt-2 text-ink">{p.t}</h3>
                                    <p className="mt-2 text-sm text-ash leading-relaxed">{p.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ANNOUNCEMENTS */}
            <section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Latest News</span>
                            <h2 className="mt-3 font-display font-bold text-ink text-3xl md:text-4xl lg:text-5xl tracking-tight">Announcements & events</h2>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6" data-testid="announcements-grid">
                        {announcements.length === 0 && (
                            <p className="text-ash col-span-3">No announcements yet.</p>
                        )}
                        {announcements.map(a => (
                            <article key={a.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-ink transition-colors" data-testid={`announcement-${a.id}`}>
                                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] bg-saffron/10 text-saffronDark px-2.5 py-1 rounded-full">{a.category}</span>
                                <h3 className="font-display font-bold text-lg mt-4 text-ink leading-tight">{a.title}</h3>
                                <p className="mt-2 text-sm text-ash leading-relaxed">{a.body}</p>
                                <div className="text-xs text-ash mt-4">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-ink rounded-3xl px-8 py-16 md:p-16 relative overflow-hidden grain-bg">
                        <div className="relative max-w-2xl">
                            <h2 className="font-display font-bold text-white text-3xl md:text-5xl tracking-tight">Ready to join the Azad family?</h2>
                            <p className="mt-4 text-cream/80 text-lg">Admissions for 2026-27 are now open. Limited seats available across classes.</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to="/admissions" data-testid="cta-apply-btn" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-ink bg-saffron rounded-full hover:bg-white transition-colors">
                                    Start Application <ArrowUpRight className="h-4 w-4" />
                                </Link>
                                <Link to="/contact" data-testid="cta-contact-btn" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors">
                                    Schedule a campus visit
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
