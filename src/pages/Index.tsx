import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import WhatsAppTestimonials from "@/components/WhatsAppTestimonials";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import PlatformRating from "@/components/PlatformRating";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <WhatsAppTestimonials />
      <TestimonialsSection />
      <ContactSection />
      <PlatformRating />
      <Footer />
    </div>
  );
};

export default Index;
