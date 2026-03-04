import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const inputClass =
    "w-full border border-border rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground";

export default function PlatformRating() {
    const [hovered, setHovered] = useState(0);
    const [selected, setSelected] = useState(0);
    const [name, setName] = useState("");
    const [comentario, setComentario] = useState("");
    const [nameError, setNameError] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);
    const [avg, setAvg] = useState<number | null>(null);
    const [total, setTotal] = useState(0);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        const { data } = await supabase.from("reviews").select("estrelas");
        if (data && data.length > 0) {
            setTotal(data.length);
            const sum = data.reduce((acc, r) => acc + (r.estrelas as number), 0);
            setAvg(parseFloat((sum / data.length).toFixed(1)));
        }
    };

    const handleStarClick = (star: number) => {
        setSelected(star);
        setShowForm(true);
        setSubmitError("");
    };

    const handleSubmit = async () => {
        if (!selected) return;
        if (!name.trim()) { setNameError(true); return; }
        setNameError(false);
        setSubmitError("");
        setLoading(true);

        const { error } = await supabase.from("reviews").insert({
            nome_cliente: name.trim(),
            estrelas: selected,
            comentario: comentario.trim() || null,
            is_approved: false,
        } as any);

        setLoading(false);

        if (error) {
            // If the column doesn't exist yet, tell the user to have the admin run the migration
            if (error.code === "42703" || error.message?.includes("column")) {
                setSubmitError("Erro de configuração: execute o SQL de migração no Supabase. (" + error.message + ")");
            } else {
                setSubmitError("Erro ao enviar: " + error.message);
            }
            return;
        }

        setSubmitted(true);
        fetchStats();
    };

    return (
        <section className="py-14 bg-background">
            <div className="container px-4 max-w-md mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl px-6 py-7 shadow-[0_4px_32px_-8px_rgba(59,130,246,0.18)] border border-border w-full"
                >
                    <p className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-1">
                        Compartilhe sua experiência
                    </p>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                        Avalie nossos serviços
                    </h3>

                    {/* Stars */}
                    <div className="flex justify-center gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => !submitted && handleStarClick(star)}
                                disabled={submitted}
                                className="transition-transform hover:scale-125 disabled:cursor-default"
                                aria-label={`${star} estrelas`}
                            >
                                <Star
                                    size={32}
                                    className="transition-colors duration-150"
                                    fill={(hovered || selected) >= star ? "#f59e0b" : "none"}
                                    stroke={(hovered || selected) >= star ? "#f59e0b" : "#d1d5db"}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Stats pill */}
                    {avg !== null && (
                        <p className="text-xs text-muted-foreground font-body mb-4 bg-secondary rounded-full px-4 py-1 inline-block">
                            ★ {avg} de 5 &nbsp;·&nbsp; {total} {total === 1 ? "avaliação" : "avaliações"}
                        </p>
                    )}

                    {/* Form */}
                    <AnimatePresence>
                        {showForm && !submitted && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-2 text-left mt-2"
                            >
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Seu nome *"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setNameError(false); }}
                                        className={`${inputClass} ${nameError ? "border-destructive ring-1 ring-destructive" : ""}`}
                                    />
                                    {nameError && (
                                        <p className="text-xs text-destructive font-body mt-1">Nome é obrigatório.</p>
                                    )}
                                </div>
                                <textarea
                                    placeholder="Seu comentário (opcional)"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                />
                                {submitError && (
                                    <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                                        <AlertCircle size={15} className="text-destructive shrink-0 mt-0.5" />
                                        <p className="text-xs text-destructive font-body">{submitError}</p>
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold font-body hover:bg-primary/90 transition-colors disabled:opacity-60 mt-1"
                                >
                                    {loading ? "Enviando..." : "Enviar avaliação"}
                                </button>
                                <p className="text-xs text-muted-foreground font-body text-center pt-1">
                                    Sua avaliação será revisada antes de ser publicada.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {submitted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-1 mt-2"
                        >
                            <span className="text-3xl">🌟</span>
                            <p className="text-sm text-primary font-body font-semibold">
                                Obrigado pela avaliação!
                            </p>
                            <p className="text-xs text-muted-foreground font-body">
                                Ela será publicada após aprovação.
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
