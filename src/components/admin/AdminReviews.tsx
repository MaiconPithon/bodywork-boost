import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Check, EyeOff, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Review = Tables<"reviews">;

function StarDisplay({ count }: { count: number }) {
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={14}
                    fill={s <= count ? "#f59e0b" : "none"}
                    stroke={s <= count ? "#f59e0b" : "#d1d5db"}
                    strokeWidth={1.5}
                />
            ))}
        </span>
    );
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

    const load = async () => {
        setLoading(true);
        setError("");
        const { data, error: fetchError } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });

        if (fetchError) {
            setError(fetchError.message);
        } else if (data) {
            setReviews(data);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const setApproval = async (id: string, approved: boolean) => {
        const { error: updateError } = await supabase
            .from("reviews")
            .update({ is_approved: approved })
            .eq("id", id);

        if (updateError) {
            setError("Erro ao atualizar: " + updateError.message);
            return;
        }
        setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, is_approved: approved } : r))
        );
    };

    const filtered = reviews.filter((r) => {
        if (filter === "pending") return !r.is_approved;
        if (filter === "approved") return r.is_approved;
        return true;
    });

    const pending = reviews.filter((r) => !r.is_approved).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    Avaliações
                    {pending > 0 && (
                        <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 font-body">
                            {pending} pendente{pending > 1 ? "s" : ""}
                        </span>
                    )}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-body"
                    >
                        <RefreshCw size={12} /> Atualizar
                    </button>
                    <div className="flex gap-1">
                        {(["all", "pending", "approved"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`text-xs font-body px-3 py-1 rounded-full border transition-colors ${filter === f
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-border hover:border-primary"
                                    }`}
                            >
                                {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : "Aprovadas"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-body text-destructive font-semibold">Erro ao carregar avaliações</p>
                        <p className="text-xs text-destructive/80 font-body mt-0.5">{error}</p>
                        {(error.includes("column") || error.includes("relation")) && (
                            <p className="text-xs text-destructive/80 font-body mt-1 font-semibold">
                                Execute o SQL de migração no Supabase SQL Editor:
                                <code className="block mt-1 font-mono bg-destructive/10 px-2 py-1 rounded text-xs">
                                    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comentario text, ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;
                                </code>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {loading ? (
                <p className="text-muted-foreground font-body text-sm">Carregando avaliações...</p>
            ) : filtered.length === 0 ? (
                <p className="text-muted-foreground font-body text-sm">Nenhuma avaliação encontrada.</p>
            ) : (
                <div className="space-y-3">
                    {filtered.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-card rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start gap-3 ${review.is_approved ? "border-green-200" : "border-amber-200"
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-display text-sm font-semibold text-foreground">
                                        {review.nome_cliente || "Anônimo"}
                                    </span>
                                    <StarDisplay count={review.estrelas} />
                                    <span
                                        className={`text-xs font-body px-2 py-0.5 rounded-full ml-auto ${review.is_approved
                                                ? "bg-green-100 text-green-700"
                                                : "bg-amber-100 text-amber-700"
                                            }`}
                                    >
                                        {review.is_approved ? "Aprovado" : "Pendente"}
                                    </span>
                                </div>
                                {review.comentario && (
                                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                                        &ldquo;{review.comentario}&rdquo;
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground/60 font-body mt-1">
                                    {new Date(review.created_at).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {!review.is_approved ? (
                                    <Button
                                        size="sm"
                                        onClick={() => setApproval(review.id, true)}
                                        className="gap-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                                    >
                                        <Check size={13} /> Tornar Visível
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setApproval(review.id, false)}
                                        className="gap-1 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                                    >
                                        <EyeOff size={13} /> Ocultar
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
