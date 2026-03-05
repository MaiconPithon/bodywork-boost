import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, RefreshCw, Loader2, AlertCircle } from "lucide-react";

interface Testimonial {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export default function AdminWhatsAppTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data, error: e } = await supabase
      .from("whatsapp_testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (e) setError(e.message);
    else setItems(data || []);
  };

  useEffect(() => { load(); }, []);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("testimonials")
      .upload(path, file);

    if (uploadErr) {
      setError("Erro no upload: " + uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("testimonials")
      .getPublicUrl(path);

    const { error: insertErr } = await supabase
      .from("whatsapp_testimonials")
      .insert({ image_url: urlData.publicUrl, caption: caption || null });

    if (insertErr) {
      setError("Erro ao salvar: " + insertErr.message);
    } else {
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    }
    setUploading(false);
  };

  const remove = async (item: Testimonial) => {
    if (!confirm("Excluir este elogio?")) return;
    setDeletingId(item.id);
    setError("");

    // Extract filename from URL
    const parts = item.image_url.split("/testimonials/");
    const filename = parts[parts.length - 1];
    if (filename) {
      await supabase.storage.from("testimonials").remove([filename]);
    }

    const { error: delErr } = await supabase
      .from("whatsapp_testimonials")
      .delete()
      .eq("id", item.id);

    if (delErr) {
      setError("Erro ao excluir: " + delErr.message);
    } else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
    setDeletingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Elogios de WhatsApp</h3>
        <button onClick={load} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-body">
          <RefreshCw size={12} /> Atualizar
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-sm font-body text-destructive">{error}</p>
        </div>
      )}

      {/* Upload form */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-3 mb-6">
        <p className="font-body text-sm font-semibold">Enviar novo print</p>
        <input ref={fileRef} type="file" accept="image/*" className="text-sm font-body" />
        <Input
          placeholder="Legenda (opcional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <Button onClick={upload} disabled={uploading} className="gap-1">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Enviando..." : "Enviar"}
        </Button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-muted-foreground font-body text-sm">Nenhum elogio enviado ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative group bg-card rounded-xl border border-border overflow-hidden">
              <img
                src={item.image_url}
                alt={item.caption || "Elogio WhatsApp"}
                className="w-full h-48 object-cover"
              />
              {item.caption && (
                <p className="p-2 text-xs font-body text-muted-foreground truncate">{item.caption}</p>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={() => remove(item)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
