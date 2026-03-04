import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    if (data) setServices(data);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => {
    setIsNew(true);
    setEditing({ id: "", name: "", icon: "🤲", description: "", detailed_description: "", sort_order: services.length + 1, is_active: true, created_at: "", updated_at: "" });
  };

  const save = async () => {
    if (!editing) return;
    if (isNew) {
      const { name, icon, description, detailed_description, sort_order, is_active } = editing;
      await supabase.from("services").insert({ name, icon, description, detailed_description, sort_order, is_active });
    } else {
      const { id, name, icon, description, detailed_description, sort_order, is_active } = editing;
      await supabase.from("services").update({ name, icon, description, detailed_description, sort_order, is_active }).eq("id", id);
    }
    setEditing(null);
    setIsNew(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Deletar este serviço?")) return;
    await supabase.from("services").delete().eq("id", id);
    load();
  };

  if (editing) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border max-w-xl">
        <h3 className="font-display text-lg font-semibold mb-4">{isNew ? "Novo Serviço" : "Editar Serviço"}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-[60px_1fr] gap-3">
            <div>
              <Label className="font-body text-xs">Ícone</Label>
              <Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="text-center text-xl" />
            </div>
            <div>
              <Label className="font-body text-xs">Nome</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="font-body text-xs">Descrição breve (card)</Label>
            <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
          </div>
          <div>
            <Label className="font-body text-xs">Descrição detalhada (hover/modal)</Label>
            <Textarea value={editing.detailed_description || ""} onChange={(e) => setEditing({ ...editing, detailed_description: e.target.value })} rows={3} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label className="font-body text-xs">Ordem</Label>
              <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              <Label className="font-body text-xs">Ativo</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} className="gap-1"><Save size={16} /> Salvar</Button>
            <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false); }} className="gap-1"><X size={16} /> Cancelar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Serviços ({services.length})</h3>
        <Button onClick={startNew} size="sm" className="gap-1"><Plus size={16} /> Novo</Button>
      </div>
      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-center gap-3 bg-card rounded-lg p-3 border border-border">
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-sm truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.description}</p>
            </div>
            {!s.is_active && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Inativo</span>}
            <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setIsNew(false); }}><Pencil size={16} /></Button>
            <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 size={16} className="text-destructive" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
