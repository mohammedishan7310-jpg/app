import { useEffect, useState } from "react";
import { api, API } from "../lib/api";
import { ImageOff } from "lucide-react";

const CATS = ["all", "events", "sports", "classrooms", "infrastructure"];

export default function Gallery() {
    const [items, setItems] = useState([]);
    const [cat, setCat] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/gallery${cat !== "all" ? `?category=${cat}` : ""}`)
            .then(r => setItems(r.data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [cat]);

    return (
        <div className="bg-cream" data-testid="gallery-page">
            <section className="border-b border-[#E2E8F0] bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Campus Gallery</span>
                    <h1 className="mt-3 font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl">Life at Azad — in pictures.</h1>
                    <p className="mt-5 text-ash max-w-2xl text-lg">Glimpses from our classrooms, sports fields, festivals and the everyday joy of school life.</p>
                </div>
            </section>

            <section className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filter */}
                    <div className="flex flex-wrap gap-2 mb-10" data-testid="gallery-filters">
                        {CATS.map(c => (
                            <button
                                key={c}
                                onClick={() => setCat(c)}
                                data-testid={`filter-${c}`}
                                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${cat === c ? "bg-ink text-white" : "bg-white text-ink border border-[#E2E8F0] hover:border-ink"}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-[#F3F4F6] animate-pulse" />)}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20" data-testid="gallery-empty">
                            <div className="h-16 w-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto">
                                <ImageOff className="h-7 w-7 text-ash" />
                            </div>
                            <h3 className="mt-5 font-display font-bold text-xl text-ink">No images yet</h3>
                            <p className="mt-2 text-ash">Our admin team will upload campus photos shortly.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="gallery-grid">
                            {items.map((it, idx) => (
                                <div key={it.id} className={`group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white ${idx % 7 === 0 ? "md:col-span-2 md:row-span-2" : ""}`} data-testid={`gallery-item-${it.id}`}>
                                    <div className={`${idx % 7 === 0 ? "aspect-square md:aspect-auto md:h-full" : "aspect-square"} overflow-hidden`}>
                                        <img src={`${API}/files/${it.storage_path}`} alt={it.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-saffron">{it.category}</span>
                                            <div className="text-white text-sm font-medium">{it.title}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
