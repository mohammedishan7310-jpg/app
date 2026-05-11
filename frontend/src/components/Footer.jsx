import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-ink text-cream/90 mt-20" data-testid="site-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-saffron flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-ink" strokeWidth={2.2} />
                        </div>
                        <div className="leading-tight">
                            <div className="font-display font-bold text-white text-base">Azad Sr. Sec. School</div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-saffron">Est. 1985</div>
                        </div>
                    </div>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/70">
                        A vibrant learning community committed to academic excellence, character building and helping every student discover their potential.
                    </p>
                </div>
                <div>
                    <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-saffron transition-colors">Home</Link></li>
                        <li><Link to="/admissions" className="hover:text-saffron transition-colors">Admissions</Link></li>
                        <li><Link to="/gallery" className="hover:text-saffron transition-colors">Gallery</Link></li>
                        <li><Link to="/contact" className="hover:text-saffron transition-colors">Contact</Link></li>
                        <li><Link to="/admin/login" className="hover:text-saffron transition-colors">Admin Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Contact</h4>
                    <ul className="space-y-3 text-sm text-cream/80">
                        <li className="flex gap-2.5"><MapPin className="h-4 w-4 mt-0.5 text-saffron flex-shrink-0" />Sector 12, Civil Lines, New Delhi - 110054</li>
                        <li className="flex gap-2.5"><Phone className="h-4 w-4 mt-0.5 text-saffron flex-shrink-0" />+91 11 2398 5544</li>
                        <li className="flex gap-2.5"><Mail className="h-4 w-4 mt-0.5 text-saffron flex-shrink-0" />info@azadschool.edu</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-cream/60 flex flex-col sm:flex-row justify-between gap-2">
                    <span>© {new Date().getFullYear()} Azad Senior Secondary School. All rights reserved.</span>
                    <span>Affiliated to RBSE | Recognized by Ministry of Education</span>
                </div>
            </div>
        </footer>
    );
}
