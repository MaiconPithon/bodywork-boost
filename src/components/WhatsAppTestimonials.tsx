import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Testimonial = Tables<"whatsapp_testimonials">;

export default function WhatsAppTestimonials() {
    const [items, setItems] = useState<Testimonial[]>([]);
    const [selected, setSelected] = useState<Testimonial | null>(null);

    useEffect(() => {
        supabase
            .from("whatsapp_testimonials")
            .select("*")
            .order("sort_order")
            .then(({ data }) => {
                if (data && data.length > 0) setItems(data);
            });
    }, []);

    if (items.length === 0) return null;

    return (
        <section id="elogios" className="py-20 bg-secondary/30">
            <div className="container px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <MessageCircle size={24} className="text-[#25D366]" />
                        <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
                            Elogios de Clientes
                        </h2>
                    </div>
                    <p className="text-muted-foreground font-body max-w-md mx-auto">
                        Mensagens reais de clientes satisfeitos pelo WhatsApp
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="group cursor-pointer rounded-2xl overflow-hidden border border-border shadow-card bg-card hover:shadow-card-hover transition-shadow duration-300"
                            onClick={() => setSelected(item)}
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={item.image_url}
                                    alt={item.caption || "Elogio de cliente"}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                {/* WhatsApp badge */}
                                <div className="absolute top-2 left-2 bg-[#25D366] rounded-full p-1">
                                    <MessageCircle size={12} className="text-white" />
                                </div>
                            </div>
                            {item.caption && (
                                <p className="px-3 py-2 text-xs font-body text-muted-foreground line-clamp-2">
                                    {item.caption}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="relative max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
                                aria-label="Fechar"
                            >
                                <X size={28} />
                            </button>
                            <div className="bg-card rounded-2xl overflow-hidden shadow-xl">
                                <img
                                    src={selected.image_url}
                                    alt={selected.caption || "Elogio"}
                                    className="w-full object-contain max-h-[70vh]"
                                />
                                {selected.caption && (
                                    <p className="px-4 py-3 text-sm font-body text-foreground text-center">
                                        {selected.caption}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
