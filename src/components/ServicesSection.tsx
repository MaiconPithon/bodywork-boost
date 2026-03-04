import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const fallbackServices: Omit<Service, "id" | "created_at" | "updated_at">[] = [
  { name: "Massagem Relaxante", icon: "💆🏿", description: "Alívio do estresse e tensões musculares", detailed_description: "Técnica suave que promove relaxamento profundo, alivia tensões musculares e reduz o estresse. Utiliza movimentos longos e ritmados para estimular a circulação sanguínea e promover bem-estar geral.", sort_order: 1, is_active: true },
  { name: "Drenagem Linfática", icon: "🌊", description: "Redução de inchaço e retenção de líquidos", detailed_description: "Técnica manual que estimula o sistema linfático, auxiliando na eliminação de toxinas e redução de edemas. Ideal para pós-operatório, gestantes e combate à celulite.", sort_order: 2, is_active: true },
  { name: "Reflexologia Podal", icon: "🦶🏿", description: "Equilíbrio corporal através dos pés", detailed_description: "Terapia que aplica pressão em pontos específicos dos pés, correspondentes a órgãos e sistemas do corpo. Promove equilíbrio energético, alívio de dores e melhora da saúde geral.", sort_order: 3, is_active: true },
  { name: "Liberação Miofascial", icon: "🔧", description: "Liberação de aderências e restrições fasciais", detailed_description: "Técnica que trabalha a fáscia muscular, liberando aderências e restrições que causam dor e limitação de movimento. Essencial para atletas e pessoas com dores crônicas.", sort_order: 4, is_active: true },
  { name: "Massagem Terapêutica", icon: "🤲🏿", description: "Tratamento de dores e lesões musculares", detailed_description: "Abordagem clínica focada no tratamento de patologias musculoesqueléticas. Combina técnicas profundas para aliviar dores crônicas, contraturas e pontos-gatilho.", sort_order: 5, is_active: true },
  { name: "Dry Needling", icon: "📌", description: "Agulhamento seco para pontos-gatilho", detailed_description: "Técnica minimamente invasiva que utiliza agulhas finas para desativar pontos-gatilho miofasciais. Altamente eficaz para dores musculares localizadas e tensões crônicas.", sort_order: 6, is_active: true },
  { name: "Ventosaterapia", icon: "⭕", description: "Sucção terapêutica para circulação e dores", detailed_description: "Terapia milenar que utiliza ventosas para criar sucção na pele, promovendo aumento da circulação local, alívio de dores musculares e liberação de toxinas acumuladas.", sort_order: 7, is_active: true },
  { name: "Massagem Modeladora", icon: "✨", description: "Modelagem corporal e redução de medidas", detailed_description: "Técnica vigorosa com movimentos firmes e rápidos que auxiliam na quebra de gordura localizada, melhora do contorno corporal e combate à celulite.", sort_order: 8, is_active: true },
  { name: "Quick Massage", icon: "⚡", description: "Massagem rápida para alívio imediato", detailed_description: "Sessão expressa de 15 a 30 minutos, ideal para eventos corporativos e pausas no trabalho. Foca em pescoço, ombros e costas para alívio rápido de tensões.", sort_order: 9, is_active: true },
  { name: "Pedras Quentes", icon: "🪨", description: "Terapia com pedras vulcânicas aquecidas", detailed_description: "Utiliza pedras basálticas aquecidas posicionadas em pontos estratégicos do corpo. O calor penetra profundamente nos músculos, promovendo relaxamento intenso e alívio de dores.", sort_order: 10, is_active: true },
  { name: "Bambuterapia", icon: "🎋", description: "Massagem com bambus de diferentes tamanhos", detailed_description: "Técnica que utiliza bambus aquecidos de diversos tamanhos para realizar manobras de deslizamento e amassamento. Promove drenagem, modelagem corporal e relaxamento profundo.", sort_order: 11, is_active: true },
];

function ServiceCard({ service, index }: { service: Omit<Service, "id" | "created_at" | "updated_at"> & { id?: string }; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const whatsappUrl = `https://wa.me/5571988886715?text=${encodeURIComponent(`Olá Jordan, vi seu blog e gostaria de saber mais sobre o serviço de ${service.name}.`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="perspective-1000"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full min-h-[240px] transition-transform duration-500 cursor-pointer ${flipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center justify-center text-center gap-3"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-5xl block">{service.icon}</span>
          <h3 className="font-display text-lg font-semibold text-primary">{service.name}</h3>
          <p className="text-muted-foreground text-xs font-body leading-relaxed">{service.description}</p>
          {!service.is_active && (
            <span className="text-xs bg-destructive/10 text-destructive px-3 py-1 rounded-full font-semibold">Indisponível</span>
          )}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-card rounded-xl p-6 shadow-card-hover border-2 border-primary/40 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <h4 className="font-display text-sm font-bold text-primary mb-2">{service.name}</h4>
            <p className="text-foreground text-sm font-body leading-relaxed">
              {service.detailed_description || service.description}
            </p>
          </div>
          {service.is_active ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-full text-sm font-semibold font-body hover:bg-[#20bd5a] hover:scale-105 transition-all mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle size={16} />
              Agendar via WhatsApp
            </a>
          ) : (
            <span className="inline-flex items-center justify-center gap-2 bg-muted text-muted-foreground px-4 py-2.5 rounded-full text-sm font-semibold font-body mt-4 cursor-not-allowed">
              Indisponível no momento
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase.from("services").select("*").order("sort_order");
        if (error) {
          console.error("Error fetching services:", error);
        }
        if (data && data.length > 0) {
          setServices(data);
        }
      } catch (err) {
        console.error("Unexpected error fetching services:", err);
      } finally {
        setLoaded(true);
      }
    };
    fetchServices();
  }, []);

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <section id="servicos" className="py-20 bg-background">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mb-4">Serviços</h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">Técnicas especializadas para o seu bem-estar e saúde</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayServices.map((service, i) => (
            <ServiceCard key={'id' in service ? (service as Service).id : i} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
