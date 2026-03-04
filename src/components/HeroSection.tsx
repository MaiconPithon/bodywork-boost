import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import jordanAvatar from "@/assets/jordan-avatar.jpeg";

const autoMessages: Record<string, string[]> = {
  monday: ["Segunda-feira é dia de renovar as energias! 💆‍♂️", "Comece a semana cuidando do seu corpo e mente!"],
  tuesday: ["Terça-feira: seu corpo merece atenção especial! ✨", "Libere as tensões e sinta-se renovado(a)!"],
  wednesday: ["Metade da semana! Hora de recarregar as energias! 🌿", "Uma massagem no meio da semana faz toda a diferença!"],
  thursday: ["Quinta-feira: prepare seu corpo para o final de semana! 💪", "Cuide-se hoje para aproveitar amanhã!"],
  friday: ["Sexta-feira! Energia renovada para o final de semana! 🎉", "Termine a semana no modo relaxamento total!"],
  saturday: ["Sábado de descanso! Massagem é saúde! 😊", "Aproveite o final de semana com bem-estar!"],
  sunday: ["Domingo de autocuidado e relaxamento! 🧘", "Prepare-se para a semana com corpo e mente em equilíbrio!"],
};
const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function HeroSection() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadMessage = async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "message_of_day").single();
      if (data?.value && data.value.trim()) {
        setMessage(data.value);
      } else {
        const now = new Date();
        const day = days[now.getDay()];
        const hour = now.getHours();
        setMessage(autoMessages[day][hour < 12 ? 0 : 1]);
      }
    };
    loadMessage();
  }, []);

  const scrollToServices = () => {
    document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />
      <div className="container relative z-10 flex flex-col items-center text-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-8">
          <img src={jordanAvatar} alt="Jordan Almeida - Massoterapeuta" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary-foreground/30 object-cover mx-auto" style={{ boxShadow: "var(--shadow-hero)" }} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-primary-foreground mb-4">
          Jordan Almeida
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} className="text-lg md:text-xl text-primary-foreground/80 font-body tracking-widest uppercase mb-8">
          Massoterapeuta Profissional
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="max-w-lg mx-auto mb-10 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-primary-foreground/20">
          <p className="text-primary-foreground font-body text-base md:text-lg italic animate-pulse-soft">
            {message || "Massagem é Saúde! 💆‍♂️"}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex flex-col sm:flex-row gap-4">
          <a href="https://wa.me/5571988886715?text=Olá Jordan, gostaria de agendar uma sessão!" target="_blank" rel="noopener noreferrer"
            className="cta-gradient text-whatsapp-foreground px-8 py-4 rounded-full font-body font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-transform duration-300"
            style={{ boxShadow: "0 8px 24px -6px hsl(142 70% 35% / 0.4)" }}>
            <MessageCircle size={22} /> Agendar no WhatsApp
          </a>
        </motion.div>
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} onClick={scrollToServices}
          className="absolute bottom-8 text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Ver serviços">
          <ChevronDown size={36} className="animate-bounce" />
        </motion.button>
      </div>
    </section>
  );
}
