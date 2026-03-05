import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, Loader2, AlertCircle, Key } from "lucide-react";

interface AdminUser {
  user_id: string;
  role: string;
  email?: string;
}

export default function AdminUsers() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Password change state
  const [changeEmail, setChangeEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changeMsg, setChangeMsg] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    const { data } = await supabase.from("user_roles").select("user_id, role");
    if (data) {
      setAdmins(data.map((r) => ({ user_id: r.user_id, role: r.role })));
    }
    setLoadingAdmins(false);
  };

  useEffect(() => { loadAdmins(); }, []);

  const createAdmin = async () => {
    if (!email || !password) {
      setMessage("Erro: Preencha email e senha.");
      return;
    }
    if (password.length < 6) {
      setMessage("Erro: Senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: { email, password },
      });

      if (error) {
        if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
          setMessage("Erro: Falha de conexão. Verifique sua internet e tente novamente.");
        } else {
          setMessage("Erro: " + (error.message || "Falha ao conectar com o servidor."));
        }
        setLoading(false);
        return;
      }

      if (data?.error) {
        const errMsg = data.error.toLowerCase();
        if (errMsg.includes("already") || errMsg.includes("already been registered") || errMsg.includes("duplicate") || errMsg.includes("já existe") || errMsg.includes("already registered")) {
          setMessage("Erro: Este email já está cadastrado no sistema.");
        } else if (errMsg.includes("não autorizado") || errMsg.includes("token inválido")) {
          setMessage("Erro: Sessão expirada. Faça logout e login novamente.");
        } else if (errMsg.includes("apenas super admins")) {
          setMessage("Erro: Apenas Super Admins podem criar usuários.");
        } else if (errMsg.includes("invalid email") || errMsg.includes("email inválido")) {
          setMessage("Erro: Email inválido. Verifique o formato.");
        } else {
          setMessage("Erro: " + data.error);
        }
        setLoading(false);
        return;
      }

      if (data?.user_id) {
        setMessage(`✓ Admin ${email} criado com sucesso!`);
        setEmail("");
        setPassword("");
        await loadAdmins();
      }
    } catch (err) {
      setMessage("Erro: Falha de conexão com o servidor. Tente novamente.");
    }
    setLoading(false);
  };

  const changePassword = async () => {
    if (!changeEmail || !newPassword) {
      setChangeMsg("Erro: Preencha email e nova senha.");
      return;
    }
    if (newPassword.length < 6) {
      setChangeMsg("Erro: Senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setChangingPw(true);
    setChangeMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: { email: changeEmail, password: newPassword, action: "update_password" },
      });

      if (error) {
        setChangeMsg("Erro: " + (error.message?.includes("Failed to fetch") ? "Falha de conexão." : error.message || "Erro desconhecido"));
      } else if (data?.error) {
        const errMsg = data.error.toLowerCase();
        if (errMsg.includes("não encontrado") || errMsg.includes("not found")) {
          setChangeMsg("Erro: Usuário não encontrado com este email.");
        } else {
          setChangeMsg("Erro: " + data.error);
        }
      } else {
        setChangeMsg("✓ Senha alterada com sucesso!");
        setChangeEmail("");
        setNewPassword("");
      }
    } catch (err) {
      setChangeMsg("Erro: Falha de conexão com o servidor.");
    }
    setChangingPw(false);
  };

  const removeAdmin = async (userId: string) => {
    if (!confirm("Remover este admin?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (error) {
      setMessage("Erro ao remover: " + error.message);
    } else {
      await loadAdmins();
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h3 className="font-display text-lg font-semibold">Gerenciar Usuários</h3>

      {/* Create admin */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <Label className="font-body text-sm font-semibold">Criar Novo Admin</Label>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Senha (mínimo 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={createAdmin} disabled={loading} className="gap-1">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {loading ? "Criando..." : "Criar Admin"}
        </Button>
        {message && (
          <p className={`text-sm font-body ${message.startsWith("✓") ? "text-green-600" : "text-destructive"}`}>
            {message}
          </p>
        )}
      </div>

      {/* Change password */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <Label className="font-body text-sm font-semibold flex items-center gap-1">
          <Key size={14} /> Alterar Senha de Admin
        </Label>
        <Input type="email" placeholder="Email do admin" value={changeEmail} onChange={(e) => setChangeEmail(e.target.value)} />
        <Input type="password" placeholder="Nova senha (mínimo 6 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button onClick={changePassword} disabled={changingPw} variant="outline" className="gap-1">
          {changingPw ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
          {changingPw ? "Alterando..." : "Alterar Senha"}
        </Button>
        {changeMsg && (
          <p className={`text-sm font-body ${changeMsg.startsWith("✓") ? "text-green-600" : "text-destructive"}`}>
            {changeMsg}
          </p>
        )}
      </div>

      {/* Admin list */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <Label className="font-body text-sm font-semibold">Admins Cadastrados</Label>
        {loadingAdmins ? (
          <p className="text-sm text-muted-foreground font-body">Carregando...</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body">Nenhum admin encontrado.</p>
        ) : (
          <div className="space-y-2">
            {admins.map((a) => (
              <div key={a.user_id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border">
                <div>
                  <p className="text-sm font-body font-medium text-foreground truncate">{a.user_id.slice(0, 8)}...</p>
                  <span className={`text-xs font-body px-2 py-0.5 rounded-full ${
                    a.role === "super_admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {a.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                </div>
                {a.role !== "super_admin" && (
                  <Button size="sm" variant="ghost" onClick={() => removeAdmin(a.user_id)} className="text-destructive hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
