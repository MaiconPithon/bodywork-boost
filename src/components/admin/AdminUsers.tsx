import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

export default function AdminUsers() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setMessage("");

    // Call Edge Function to create user via Admin API (no email confirmation required)
    const { data, error } = await supabase.functions.invoke("create-admin-user", {
      body: { email, password },
    });

    if (error || data?.error) {
      const msg = data?.error || error?.message || "Erro desconhecido";
      setMessage("Erro: " + msg);
      setLoading(false);
      return;
    }

    if (data?.user_id) {
      // Add admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user_id, role: "admin" as const });
      if (roleError) {
        setMessage("Usuário criado mas erro ao atribuir role: " + roleError.message);
      } else {
        setMessage(`\u2713 Admin ${email} criado! Pode logar imediatamente.`);
        setEmail("");
        setPassword("");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg">
      <h3 className="font-display text-lg font-semibold mb-4">Gerenciar Usuários</h3>
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <Label className="font-body text-sm font-semibold">Criar Novo Admin</Label>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Senha (mínimo 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={createAdmin} disabled={loading} className="gap-1">
          <UserPlus size={16} /> {loading ? "Criando..." : "Criar Admin"}
        </Button>
        {message && (
          <p className={`text-sm font-body ${message.startsWith("\u2713") ? "text-green-600" : "text-destructive"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
