import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
    { to: "/", label: "Home" },
    { to: "/admissions", label: "Admissions" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Contact" },
];

export default function Header() {
    const [open, setOpen] = useState(false);
    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-cream/80 border-b border-[#E2E8F0]" data-testid="site-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5" data-testid="brand-link">
  <div className="h-9 w-9 overflow-hidden rounded-full">
    <img
      src="https://i.ibb.co/HfX5ykV2/Picsart-26-05-11-18-25-06-985.jpg"
      alt="logo"
      className="h-9 w-9 rounded-full object-cover"
    />
  </div>

  <div className="leading-tight">
    <div className="font-display font-bold text-ink text-base">
      Azad
    </div>

    <div className="text-[11px] uppercase tracking-[0.18em] text-ash">
      Sr. Sec. School
    </div>
  </div>
</Link>
                <nav className="hidden md:flex items-center gap-8">
                    {links.map(l => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === "/"}
                            data-testid={`nav-${l.label.toLowerCase()}`}
                            className={({ isActive }) =>
                                `text-[15px] font-medium transition-colors ${isActive ? "text-saffron" : "text-ink hover:text-saffron"}`
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link to="/admissions" data-testid="apply-cta" className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-saffron rounded-full hover:bg-saffronDark transition-colors">
                        Apply Now
                    </Link>
                </div>

                <button onClick={() => setOpen(!open)} className="md:hidden p-2" data-testid="mobile-menu-toggle" aria-label="menu">
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t border-[#E2E8F0] bg-cream">
                    <div className="px-4 py-4 flex flex-col gap-1">
                        {links.map(l => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.to === "/"}
                                onClick={() => setOpen(false)}
                                data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `px-3 py-3 rounded-lg text-base font-medium ${isActive ? "bg-ink text-cream" : "text-ink hover:bg-[#F3F4F6]"}`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                        <Link to="/admissions" onClick={() => setOpen(false)} data-testid="mobile-apply-cta" className="mt-2 inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white bg-saffron rounded-full">
                            Apply Now
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
