import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Use suas credenciais de afiliado ou administrador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@empresa.com" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <Button className="w-full" disabled>
              Entrar
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              A autenticação será ativada junto com o banco de dados.
            </p>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/">Voltar ao painel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
