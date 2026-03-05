import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";

export default function Login() {
  const { signIn, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const [redirectError, setRedirectError] = useState(false);
  const waitingForRole = useRef(false);

  // Watch for isAdmin to become true after login
  useEffect(() => {
    if (waitingForRole.current && user && isAdmin) {
      waitingForRole.current = false;
      setLoading(false);
      navigate("/admin");
    }
  }, [user, isAdmin, navigate]);

  // Timeout fallback - if role check takes too long
  useEffect(() => {
    if (!waitingForRole.current) return;
    const timer = setTimeout(() => {
      if (waitingForRole.current) {
        waitingForRole.current = false;
        setLoading(false);
        setRedirectError(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRedirectError(false);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      setError("Email ou senha incorretos.");
    } else {
      // Wait for role check via useEffect above
      waitingForRole.current = true;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Informe seu email.");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setForgotMessage("Link de recuperação enviado para seu email!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />

      <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-lg p-8 w-full max-w-md relative z-10">
        <h1 className="font-display text-2xl font-bold text-foreground text-center mb-2">Área Administrativa</h1>
        <p className="text-muted-foreground text-center font-body text-sm mb-8">
          {forgotMode ? "Recupere sua senha" : "Faça login para gerenciar o site"}
        </p>

        {forgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background text-foreground"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            {error && <p className="text-destructive text-sm font-body">{error}</p>}
            {forgotMessage && <p className="text-green-600 text-sm font-body">{forgotMessage}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
            <button
              type="button"
              onClick={() => { setForgotMode(false); setError(""); setForgotMessage(""); }}
              className="flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-primary transition-colors w-full justify-center"
            >
              <ArrowLeft size={14} /> Voltar ao login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background text-foreground"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background text-foreground"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {error && <p className="text-destructive text-sm font-body">{error}</p>}
            {redirectError && (
              <div className="bg-accent/50 border border-border rounded-lg p-3 text-sm font-body text-foreground">
                Acesso autorizado, mas falha no redirecionamento.{" "}
                <a href="/admin" className="text-primary underline font-semibold">Clique aqui para entrar.</a>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <button
              type="button"
              onClick={() => { setForgotMode(true); setError(""); }}
              className="block text-center text-sm text-muted-foreground font-body w-full hover:text-primary transition-colors"
            >
              Esqueceu a senha?
            </button>
          </form>
        )}

        <a href="/" className="block text-center text-sm text-muted-foreground font-body mt-6 hover:text-primary transition-colors">
          ← Voltar ao site
        </a>
      </div>
    </div>
  );
}
