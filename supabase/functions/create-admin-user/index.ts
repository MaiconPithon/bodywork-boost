import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Não autorizado" }), {
                status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const callerToken = authHeader.replace("Bearer ", "");
        const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(callerToken);
        if (callerError || !caller) {
            return new Response(JSON.stringify({ error: "Token inválido" }), {
                status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { data: roles } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", caller.id);
        const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
        if (!isSuperAdmin) {
            return new Response(JSON.stringify({ error: "Apenas super admins podem gerenciar usuários" }), {
                status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { email, password, action } = await req.json();
        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Email e senha são obrigatórios" }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Update password for existing user
        if (action === "update_password") {
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = existingUsers?.users?.find((u) => u.email === email);
            if (!existingUser) {
                return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
                    status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
            if (updateError) {
                return new Response(JSON.stringify({ error: updateError.message }), {
                    status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            return new Response(JSON.stringify({ success: true }), {
                status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (createError) {
            return new Response(JSON.stringify({ error: createError.message }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Auto-assign admin role
        const userId = newUser.user.id;
        const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

        return new Response(JSON.stringify({ user_id: userId, email: newUser.user.email, role_assigned: !roleError }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
