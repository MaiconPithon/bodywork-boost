import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function AdminMessage() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "message_of_day").single().then(({ data }) => {
      if (data) setMessage(data.value);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").update({ value: message }).eq("key", "message_of_day");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg">
      <h3 className="font-display text-lg font-semibold mb-4">Mensagem do Dia</h3>
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <Label className="font-body text-sm">Frase motivacional exibida na Home</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Ex: Massagem é Saúde! 💆‍♂️" />
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="gap-1"><Save size={16} /> {saving ? "Salvando..." : "Salvar"}</Button>
          {saved && <span className="text-sm text-green-600 font-body">✓ Salvo!</span>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-body mt-3">
        Deixe em branco para usar a mensagem automática baseada no dia da semana.
      </p>
    </div>
  );
}
