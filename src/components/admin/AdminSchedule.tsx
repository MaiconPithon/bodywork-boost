import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface ScheduleItem {
  days: string;
  hours: string;
}

export default function AdminSchedule() {
  const [isOpen, setIsOpen] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from("settings").select("key, value").in("key", ["is_open", "schedule"]);
      if (data) {
        const openSetting = data.find((s) => s.key === "is_open");
        const scheduleSetting = data.find((s) => s.key === "schedule");
        if (openSetting) setIsOpen(openSetting.value === "true");
        if (scheduleSetting) setSchedule(JSON.parse(scheduleSetting.value));
      }
    };
    loadSettings();
  }, []);

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").update({ value: isOpen ? "true" : "false" }).eq("key", "is_open");
    await supabase.from("settings").update({ value: JSON.stringify(schedule) }).eq("key", "schedule");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg">
      <h3 className="font-display text-lg font-semibold mb-4">Horários de Funcionamento</h3>
      
      <div className="bg-card rounded-xl p-4 border border-border space-y-5">
        <div className="flex items-center gap-3">
          <Switch checked={isOpen} onCheckedChange={setIsOpen} />
          <Label className="font-body font-semibold">{isOpen ? "🟢 Aberto" : "🔴 Agenda Indisponível"}</Label>
        </div>

        <div className="space-y-3">
          {schedule.map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Input value={item.days} onChange={(e) => updateScheduleItem(i, "days", e.target.value)} placeholder="Dias" />
              <Input value={item.hours} onChange={(e) => updateScheduleItem(i, "hours", e.target.value)} placeholder="Horário" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="gap-1"><Save size={16} /> {saving ? "Salvando..." : "Salvar"}</Button>
          {saved && <span className="text-sm text-green-600 font-body">✓ Salvo!</span>}
        </div>
      </div>
    </div>
  );
}
