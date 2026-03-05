import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, LayoutGrid, Image, MessageSquare, Clock, Users, MessageCircle, Star } from "lucide-react";
import AdminServices from "@/components/admin/AdminServices";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminMessage from "@/components/admin/AdminMessage";
import AdminSchedule from "@/components/admin/AdminSchedule";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminWhatsAppTestimonials from "@/components/admin/AdminWhatsAppTestimonials";
import AdminReviews from "@/components/admin/AdminReviews";
import loginBg from "@/assets/login-bg.jpg";

export default function Admin() {
  const { user, isAdmin, isSuperAdmin, loading, signOut } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground font-body">Carregando...</p>
    </div>
  );
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  // Admin users always start on "services" tab
  const defaultTab = "services";

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="fixed inset-0 bg-background/85 backdrop-blur-sm" />

      <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50 relative">
        <div className="container px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Painel Admin</h1>
            <p className="text-xs text-muted-foreground font-body">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary font-body">Ver site</a>
            <button onClick={signOut} className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 font-body">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 relative z-10">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="services" className="gap-1"><LayoutGrid size={16} /> Serviços</TabsTrigger>
            <TabsTrigger value="gallery" className="gap-1"><Image size={16} /> Galeria</TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-1"><MessageCircle size={16} /> Elogios</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1"><Star size={16} /> Avaliações</TabsTrigger>
            <TabsTrigger value="message" className="gap-1"><MessageSquare size={16} /> Mensagem</TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1"><Clock size={16} /> Horários</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="users" className="gap-1"><Users size={16} /> Usuários</TabsTrigger>}
          </TabsList>

          <TabsContent value="services"><AdminServices /></TabsContent>
          <TabsContent value="gallery"><AdminGallery /></TabsContent>
          <TabsContent value="testimonials"><AdminWhatsAppTestimonials /></TabsContent>
          <TabsContent value="reviews"><AdminReviews /></TabsContent>
          <TabsContent value="message"><AdminMessage /></TabsContent>
          <TabsContent value="schedule"><AdminSchedule /></TabsContent>
          {isSuperAdmin && <TabsContent value="users"><AdminUsers /></TabsContent>}
        </Tabs>
      </main>
    </div>
  );
}
