import { Instagram, MessageCircle, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-foreground py-10">
      <div className="container px-4 text-center">
        <p className="font-display text-xl font-bold text-background mb-2">Jordan Almeida</p>
        <p className="font-body text-sm text-background/60 mb-6 italic">Massagem é Saúde</p>
        <div className="flex justify-center gap-5 mb-6">
          <a href="https://instagram.com/jordan_massoterapeuta" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors">
            <Instagram size={22} />
          </a>
          <a href="https://wa.me/5571988886715" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors">
            <MessageCircle size={22} />
          </a>
          <a href="mailto:jordanalmeida1393@gmail.com" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors">
            <Mail size={22} />
          </a>
        </div>
        <p className="font-body text-xs text-background/40 mb-4">
          © {new Date().getFullYear()} Jordan Almeida Massoterapeuta. Todos os direitos reservados.
        </p>
        <Link to="/login" className="inline-flex items-center gap-1 text-background/30 hover:text-background/50 transition-colors font-body text-xs">
          <Lock size={12} /> Área Administrativa
        </Link>
        <p className="font-body text-[11px] text-background/25 mt-4 tracking-wide">
          Desenvolvido por Michael Pithon
        </p>
      </div>
    </footer>
  );
}
