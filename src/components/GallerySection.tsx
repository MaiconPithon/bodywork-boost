import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Sparkles } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

// Static fallback images
import jordanMassage from "@/assets/jordan-massage.jpeg";
import jordanCupping from "@/assets/jordan-cupping.jpeg";
import galleryBeach from "@/assets/gallery-beach.jpg";
import galleryIndoor from "@/assets/gallery-indoor.jpg";
import galleryCupping2 from "@/assets/gallery-cupping2.jpg";
import galleryTools from "@/assets/gallery-tools.jpg";
import galleryBeach2 from "@/assets/gallery-beach2.jpg";
import galleryNeedling from "@/assets/gallery-needling.jpg";
import galleryQuickmassage from "@/assets/gallery-quickmassage.jpg";
import galleryReflexology from "@/assets/gallery-reflexology.jpg";
import galleryMassageSession from "@/assets/gallery-massage-session.jpg";
import galleryEquipment from "@/assets/gallery-equipment.jpg";
import galleryMassoterapeuta from "@/assets/gallery-massoterapeuta.jpg";
import galleryTowels from "@/assets/gallery-towels.jpg";

type GalleryItem = Tables<"gallery">;

const fallbackPhotos = [
  { src: galleryReflexology, alt: "Sessão de reflexologia" },
  { src: galleryMassageSession, alt: "Jordan realizando massagem terapêutica" },
  { src: galleryMassoterapeuta, alt: "Jordan Almeida - Massoterapeuta" },
  { src: galleryBeach, alt: "Massagem ao ar livre na praia" },
  { src: galleryIndoor, alt: "Massagem terapêutica em domicílio" },
  { src: galleryCupping2, alt: "Sessão de ventosaterapia" },
  { src: galleryNeedling, alt: "Sessão de dry needling" },
  { src: galleryQuickmassage, alt: "Quick massage em evento" },
  { src: galleryBeach2, alt: "Atendimento na praia" },
  { src: galleryEquipment, alt: "Equipamentos profissionais" },
  { src: galleryTools, alt: "Ferramentas de trabalho" },
  { src: jordanMassage, alt: "Jordan realizando massagem" },
  { src: jordanCupping, alt: "Ventosaterapia" },
];

export default function GallerySection() {
  const [dbPhotos, setDbPhotos] = useState<GalleryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const isFriday = new Date().getDay() === 5;

  useEffect(() => {
    supabase.from("gallery").select("*").order("sort_order").then(({ data }) => {
      if (data) setDbPhotos(data);
      setLoaded(true);
    });
  }, []);

  const photos = dbPhotos.length > 0
    ? dbPhotos.map((p) => ({ src: p.image_url, alt: p.alt_text || "Foto" }))
    : fallbackPhotos;

  return (
    <section id="galeria" className="relative py-20 overflow-hidden">
      {/* Towel background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${galleryTowels})` }}
      />
      <div className="absolute inset-0 bg-background/70" />

      <div className="container px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mb-4">Galeria</h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">Conheça o trabalho de perto</p>
        </motion.div>
        {isFriday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles size={20} className="text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Energia do Final de Semana</h3>
              <Sparkles size={20} className="text-primary" />
            </div>
            <p className="text-muted-foreground text-sm font-body">Sexta-feira é dia de renovar as energias! Confira os destaques da semana.</p>
          </motion.div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="overflow-hidden rounded-xl shadow-card group cursor-pointer"
              onClick={() => setSelectedImage(photo)}
            >
              <img src={photo.src} alt={photo.alt} className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X size={28} />
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full max-h-[85vh] object-contain rounded-lg"
              />
              <p className="text-white/70 text-center mt-3 font-body text-sm">{selectedImage.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
