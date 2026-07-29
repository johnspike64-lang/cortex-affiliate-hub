import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Portal de Afiliados Cortex Engine" },
      {
        name: "description",
        content: "Acesse o portal de afiliados Cortex Engine com seu e-mail e senha.",
      },
      { property: "og:title", content: "Entrar — Portal de Afiliados Cortex Engine" },
      {
        property: "og:description",
        content: "Área de acesso de afiliados e administradores do Cortex Engine.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/", replace: true });
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome, full_name: nome },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Conta criada!");
      navigate({ to: "/", replace: true });
    } else {
      toast.success("Conta criada. Confirme o e-mail para acessar.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            CX
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Cortex Engine</p>
            <p className="text-xs text-muted-foreground">Portal de Afiliados</p>
          </div>
        </div>

        <Card style={{ boxShadow: "var(--shadow-elegant)" }}>
          <CardHeader>
            <CardTitle>Acesso</CardTitle>
            <CardDescription>Entre ou crie sua conta de afiliado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entrar">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="cadastrar">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="entrar">
                <form className="space-y-4" onSubmit={entrar}>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="voce@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={busy}>
                    {busy ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="cadastrar">
                <form className="space-y-4" onSubmit={cadastrar}>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      required
                      autoComplete="name"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-cad">E-mail</Label>
                    <Input
                      id="email-cad"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="voce@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha-cad">Senha</Label>
                    <Input
                      id="senha-cad"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={busy}>
                    {busy ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Button asChild variant="ghost" className="mt-4 w-full">
              <Link to="/">Voltar ao painel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
