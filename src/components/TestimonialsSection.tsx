import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Review = Pick<Tables<"reviews">, "id" | "nome_cliente" | "estrelas" | "comentario">;

function StarRow({ count }: { count: number }) {
    return (
        <div className="flex justify-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={16}
                    fill={s <= count ? "#f59e0b" : "none"}
                    stroke={s <= count ? "#f59e0b" : "#d1d5db"}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}

export default function TestimonialsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        supabase
            .from("reviews")
            .select("id, nome_cliente, estrelas, comentario")
            .eq("is_approved", true)
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                if (data && data.length > 0) setReviews(data);
            });
    }, []);

    if (reviews.length === 0) return null;

    const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length);
    const next = () => setCurrent((c) => (c + 1) % reviews.length);

    const visibleCount = Math.min(reviews.length, 3);
    const visibleIndices = Array.from({ length: visibleCount }, (_, i) =>
        (current + i) % reviews.length
    );

    const ReviewCard = ({ r }: { r: Review }) => (
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_-6px_rgba(59,130,246,0.12)] border border-border p-6 flex flex-col items-center text-center relative">
            <Quote size={20} className="text-primary/30 absolute top-4 left-4" />
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 font-display text-lg font-bold text-primary">
                {(r.nome_cliente || "A")[0].toUpperCase()}
            </div>
            <p className="font-display text-sm font-semibold text-foreground mb-1">
                {r.nome_cliente || "Cliente"}
            </p>
            <StarRow count={r.estrelas} />
            {r.comentario && (
                <p className="text-sm font-body text-muted-foreground leading-relaxed italic">
                    &ldquo;{r.comentario}&rdquo;
                </p>
            )}
        </div>
    );

    return (
        <section id="depoimentos" className="py-20 bg-background">
            <div className="container px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">
                        Depoimentos
                    </h2>
                    <p className="text-muted-foreground font-body max-w-md mx-auto">
                        O que nossos clientes dizem sobre os atendimentos
                    </p>
                </motion.div>

                {/* Desktop: up to 3 cards side by side */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        {visibleIndices.map((idx) => (
                            <motion.div
                                key={reviews[idx].id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ReviewCard r={reviews[idx]} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Mobile: single card */}
                <div className="sm:hidden max-w-sm mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={reviews[current].id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.25 }}
                        >
                            <ReviewCard r={reviews[current]} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation (show when > 3 reviews) */}
                {reviews.length > 3 && (
                    <div className="flex justify-center gap-3 mt-6">
                        <button
                            onClick={prev}
                            className="w-9 h-9 rounded-full border border-border bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1.5">
                            {reviews.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-1.5 rounded-full transition-all ${i === current ? "bg-primary w-4" : "bg-border w-1.5"
                                        }`}
                                    aria-label={`Avaliacao ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            className="w-9 h-9 rounded-full border border-border bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
                            aria-label="Proximo"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
