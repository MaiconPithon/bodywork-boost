import { motion } from "framer-motion";
import { MapPin, Mail, Clock, Instagram, MessageCircle, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleItem { days: string; hours: string; }

const defaultSchedule: ScheduleItem[] = [
  { days: "Segunda a Quinta", hours: "06:00 às 21:00" },
  { days: "Sexta-feira", hours: "06:00 às 18:00" },
  { days: "Sábado, Domingo e Feriados", hours: "Com prévio agendamento" },
];

function getIsCurrentlyOpen(schedule: ScheduleItem[], manualOpen: boolean): boolean {
  if (!manualOpen) return false;
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...6=Sat
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;

  // Mon-Thu: 06:00-21:00, Fri: 06:00-18:00, Sat/Sun: closed (agendamento)
  if (day >= 1 && day <= 4) {
    return currentTime >= 360 && currentTime < 1260; // 06:00-21:00
  } else if (day === 5) {
    return currentTime >= 360 && currentTime < 1080; // 06:00-18:00
  }
  return false; // weekends
}

export default function ContactSection() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule);
  const [manualOpen, setManualOpen] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("settings").select("key, value").in("key", ["schedule", "is_open"]);
      let sched = defaultSchedule;
      let manual = true;
      if (data) {
        const s = data.find((d) => d.key === "schedule");
        const o = data.find((d) => d.key === "is_open");
        if (s) { sched = JSON.parse(s.value); setSchedule(sched); }
        if (o) { manual = o.value === "true"; setManualOpen(manual); }
      }
      setIsOpen(getIsCurrentlyOpen(sched, manual));
    };
    load();

    // Update every minute
    const interval = setInterval(() => {
      setIsOpen(prev => getIsCurrentlyOpen(schedule, manualOpen));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="contato" className="py-20 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />
      <div className="container px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold font-display text-primary-foreground mb-4">Contato & Horários</h2>
          <p className="text-primary-foreground/70 font-body max-w-md mx-auto">Entre em contato e agende sua sessão</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
            <div className="flex items-start gap-3 text-primary-foreground/90">
              <MapPin size={20} className="mt-0.5 shrink-0" />
              <p className="font-body text-sm">Salvador - BA<br />Atendimento em Domicílio</p>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Phone size={20} className="shrink-0" />
              <a href="tel:+5571988886715" className="font-body text-sm hover:underline">(71) 98888-6715</a>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Mail size={20} className="shrink-0" />
              <a href="mailto:jordanalmeida1393@gmail.com" className="font-body text-sm hover:underline">jordanalmeida1393@gmail.com</a>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Instagram size={20} className="shrink-0" />
              <a href="https://instagram.com/jordan_massoterapeuta" target="_blank" rel="noopener noreferrer" className="font-body text-sm hover:underline">@jordan_massoterapeuta</a>
            </div>
            <a href="https://wa.me/5571988886715?text=Olá Jordan, gostaria de agendar uma sessão!" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 cta-gradient text-whatsapp-foreground px-6 py-3 rounded-full font-body font-semibold hover:scale-105 transition-transform mt-4">
              <MessageCircle size={20} /> Fale no WhatsApp
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
            <div className="flex items-center gap-2 text-primary-foreground mb-5">
              <Clock size={20} />
              <h3 className="font-display text-xl font-semibold">Horários</h3>
              {!isOpen && <span className="ml-auto text-xs bg-destructive/90 text-destructive-foreground px-2 py-0.5 rounded-full font-semibold">Fechado</span>}
              {isOpen && <span className="ml-auto text-xs bg-whatsapp/80 text-whatsapp-foreground px-2 py-0.5 rounded-full font-semibold">Aberto</span>}
            </div>
            <div className="space-y-4">
              {schedule.map((item) => (
                <div key={item.days} className="flex justify-between items-center text-primary-foreground/90 font-body text-sm border-b border-primary-foreground/10 pb-3 last:border-0">
                  <span>{item.days}</span>
                  <span className="font-semibold">{item.hours}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
