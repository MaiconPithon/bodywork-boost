import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, MessageCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Testimonial = Tables<"whatsapp_testimonials">;

export default function AdminWhatsAppTestimonials() {
    const [items, setItems] = useState<Testimonial[]>([]);
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        const { data } = await supabase
            .from("whatsapp_testimonials")
            .select("*")
            .order("sort_order");
        if (data) setItems(data);
    };

    useEffect(() => { load(); }, []);

    const upload = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) { setMessage("Selecione uma imagem primeiro."); return; }
        setUploading(true);
        setMessage("");

        const ext = file.name.split(".").pop();
        const path = `testimonial_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("testimonials")
            .upload(path, file, { upsert: false });

        if (uploadError) {
            setMessage("Erro no upload: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage
            .from("testimonials")
            .getPublicUrl(path);

        const { error: insertError } = await supabase
            .from("whatsapp_testimonials")
            .insert({
                image_url: urlData.publicUrl,
                caption: caption.trim() || null,
                sort_order: items.length,
            });

        if (insertError) {
            setMessage("Erro ao salvar: " + insertError.message);
        } else {
            setMessage("Elogio adicionado com sucesso!");
            setCaption("");
            if (fileRef.current) fileRef.current.value = "";
            load();
        }
        setUploading(false);
    };

    const remove = async (item: Testimonial) => {
        if (!confirm("Remover este elogio?")) return;
        const urlParts = item.image_url.split("/testimonials/");
        if (urlParts[1]) {
            await supabase.storage.from("testimonials").remove([urlParts[1]]);
        }
        await supabase.from("whatsapp_testimonials").delete().eq("id", item.id);
        load();
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={20} className="text-[#25D366]" />
                <h3 className="font-display text-lg font-semibold">Elogios de WhatsApp</h3>
            </div>

            {/* Upload form */}
            <div className="bg-card rounded-xl p-4 border border-border mb-6 space-y-3 max-w-md">
                <Label className="font-body text-sm font-semibold">Adicionar Print de Elogio</Label>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm font-body text-muted-foreground"
                />
                <Input
                    placeholder="Legenda curta (ex: Cliente da massagem relaxante)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={120}
                />
                <Button onClick={upload} disabled={uploading} className="gap-1">
                    <Upload size={16} /> {uploading ? "Enviando..." : "Enviar Elogio"}
                </Button>
                {message && (
                    <p className={`text-sm font-body ${message.startsWith("Erro") ? "text-destructive" : "text-green-600"}`}>
                        {message.startsWith("Erro") ? message : `\u2713 ${message}`}
                    </p>
                )}
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <p className="text-muted-foreground font-body text-sm">Nenhum elogio cadastrado ainda.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {items.map((item) => (
                        <div key={item.id} className="relative group rounded-xl overflow-hidden border border-border bg-card shadow-card">
                            <img
                                src={item.image_url}
                                alt={item.caption || "Elogio"}
                                className="w-full h-36 object-cover"
                            />
                            {item.caption && (
                                <p className="px-2 py-1 text-xs font-body text-muted-foreground line-clamp-2">
                                    {item.caption}
                                </p>
                            )}
                            <button
                                onClick={() => remove(item)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remover"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
