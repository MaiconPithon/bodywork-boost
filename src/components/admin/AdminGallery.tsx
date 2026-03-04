import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type GalleryItem = Tables<"gallery">;

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("gallery").select("*").order("sort_order");
    if (data) setItems(data);
  };

  useEffect(() => { load(); }, []);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
    if (uploadError) { alert("Erro no upload: " + uploadError.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
    await supabase.from("gallery").insert({
      image_url: urlData.publicUrl,
      alt_text: altText || "Foto de atendimento",
      video_url: videoUrl || null,
      sort_order: items.length,
    });
    setAltText("");
    setVideoUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    load();
  };

  const remove = async (item: GalleryItem) => {
    if (!confirm("Remover esta foto?")) return;
    // Extract path from URL
    const urlParts = item.image_url.split("/gallery/");
    if (urlParts[1]) {
      await supabase.storage.from("gallery").remove([urlParts[1]]);
    }
    await supabase.from("gallery").delete().eq("id", item.id);
    load();
  };

  return (
    <div>
      <h3 className="font-display text-lg font-semibold mb-4">Galeria</h3>

      <div className="bg-card rounded-xl p-4 border border-border mb-6 space-y-3 max-w-md">
        <Label className="font-body text-sm font-semibold">Adicionar Foto</Label>
        <input ref={fileRef} type="file" accept="image/*" className="block w-full text-sm font-body" />
        <Input placeholder="Descrição da imagem (alt)" value={altText} onChange={(e) => setAltText(e.target.value)} />
        <Input placeholder="Link de vídeo (opcional)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        <Button onClick={upload} disabled={uploading} className="gap-1">
          <Upload size={16} /> {uploading ? "Enviando..." : "Enviar"}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.id} className="relative group rounded-lg overflow-hidden border border-border">
            <img src={item.image_url} alt={item.alt_text || ""} className="w-full h-32 object-cover" />
            <button
              onClick={() => remove(item)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
