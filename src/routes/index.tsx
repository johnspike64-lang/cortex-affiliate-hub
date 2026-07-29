import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, TrendingUp, Percent, Activity, Wallet, FileText, CheckCircle2, Clock } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState, StatCard } from "@/components/portal/Panels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { brl, listAfiliados, listComissoes, listVendas } from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Portal de Afiliados Cortex Engine" },
      {
        name: "description",
        content:
          "Acompanhe vendas, afiliados, comissões e financeiro do programa de afiliados Cortex Engine em um único painel.",
      },
      { property: "og:title", content: "Dashboard — Portal de Afiliados Cortex Engine" },
      {
        property: "og:description",
        content: "Acompanhe vendas, afiliados, comissões e financeiro do programa de afiliados Cortex Engine em um único painel.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const vendas = useQuery({ queryKey: ["vendas"], queryFn: listVendas });
  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados });
  const comissoes = useQuery({ queryKey: ["comissoes"], queryFn: listComissoes });

  const loading = vendas.isPending || afiliados.isPending || comissoes.isPending;

  if (loading) {
    return (
      <PortalLayout title="Dashboard" description="Visão geral do programa de afiliados.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </PortalLayout>
    );
  }

  // --- ADMIN DATA ---
  const now = new Date();
  const aprovadas = (vendas.data ?? []).filter((v) => v.status === "aprovada");
  const doMes = aprovadas.filter((v) => {
    const d = new Date(v.data_venda ?? v.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const faturamento = doMes.reduce((s, v) => s + Number(v.valor ?? 0), 0);
  const ativos = (afiliados.data ?? []).filter((a) => a.status === "ativo").length;
  const aPagar = (comissoes.data ?? [])
    .filter((c) => c.status !== "paga" && c.status !== "cancelada")
    .reduce((s, c) => s + Number(c.valor ?? 0), 0);

  const porAfiliado = new Map<string, number>();
  for (const v of aprovadas) {
    const nome = v.afiliados?.nome ?? "Sem afiliado";
    porAfiliado.set(nome, (porAfiliado.get(nome) ?? 0) + Number(v.valor ?? 0));
  }
  const top = [...porAfiliado.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const porMes = new Map<string, number>();
  for (const v of aprovadas) {
    const d = new Date(v.data_venda ?? v.created_at);
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    porMes.set(key, (porMes.get(key) ?? 0) + Number(v.valor ?? 0));
  }
  const meses = [...porMes.entries()].slice(-6);
  const maxMes = Math.max(1, ...meses.map(([, v]) => v));

  // --- AFFILIATE DATA ---
  const minhasVendas = vendas.data ?? [];
  const minhasAprovadas = minhasVendas.filter((v) => v.status === "aprovada");
  
  const minhasComissoes = comissoes.data ?? [];
  const comissoesPendentes = minhasComissoes
    .filter((c) => c.status !== "paga" && c.status !== "cancelada")
    .reduce((s, c) => s + Number(c.valor ?? 0), 0);
  const comissoesPagas = minhasComissoes
    .filter((c) => c.status === "paga")
    .reduce((s, c) => s + Number(c.valor ?? 0), 0);
  const totalComissoes = minhasComissoes
    .filter((c) => c.status !== "cancelada")
    .reduce((s, c) => s + Number(c.valor ?? 0), 0);

  const comissoesPorMes = new Map<string, number>();
  for (const c of minhasComissoes) {
    if (c.status === "cancelada") continue;
    const d = new Date(c.created_at);
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    comissoesPorMes.set(key, (comissoesPorMes.get(key) ?? 0) + Number(c.valor ?? 0));
  }
  const mesesComissoes = [...comissoesPorMes.entries()].slice(-6);
  const maxMesComissoes = Math.max(1, ...mesesComissoes.map(([, v]) => v));

  const recentes = minhasVendas.slice(0, 5);

  if (!isAdmin) {
    return (
      <PortalLayout title="Área do Afiliado" description="Acompanhe seu desempenho e comissões.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total em comissões"
            value={brl(totalComissoes)}
            hint="Pagas e pendentes"
            icon={Wallet}
          />
          <StatCard
            label="Comissões recebidas"
            value={brl(comissoesPagas)}
            hint="Valores já transferidos"
            icon={CheckCircle2}
          />
          <StatCard
            label="Comissões pendentes"
            value={brl(comissoesPendentes)}
            hint="Aguardando liberação"
            icon={Clock}
          />
          <StatCard
            label="Minhas vendas"
            value={String(minhasAprovadas.length)}
            hint={`${minhasVendas.length} no total`}
            icon={TrendingUp}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Histórico de comissões</CardTitle>
            </CardHeader>
            <CardContent>
              {mesesComissoes.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="Sem histórico de comissões"
                  description="Suas comissões mensais aparecerão aqui assim que forem geradas."
                />
              ) : (
                <div className="flex h-56 items-end gap-4">
                  {mesesComissoes.map(([mes, valor]) => (
                    <div key={mes} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">{brl(valor)}</span>
                      <div
                        className="w-full rounded-t-md"
                        style={{
                          height: `${(valor / maxMesComissoes) * 160}px`,
                          backgroundImage: "var(--gradient-primary)",
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{mes}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Nenhuma venda registrada"
                  description="Suas vendas e leads aparecerão listados aqui."
                />
              ) : (
                <ul className="space-y-3">
                  {recentes.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{v.cliente_nome ?? "Cliente"}</span>
                        <span className="text-xs text-muted-foreground">{v.produtos?.nome ?? "Produto"}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold block">{brl(v.valor)}</span>
                        <span className={`text-[10px] uppercase font-bold ${
                          v.status === 'aprovada' ? 'text-green-500' :
                          v.status === 'aguardando_pagamento' ? 'text-yellow-500' :
                          'text-muted-foreground'
                        }`}>{v.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  // --- ADMIN VIEW ---
  return (
    <PortalLayout title="Dashboard" description="Visão geral do programa de afiliados.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faturamento no mês"
          value={brl(faturamento)}
          hint={`${doMes.length} vendas aprovadas`}
          icon={DollarSign}
        />
        <StatCard
          label="Vendas aprovadas"
          value={String(aprovadas.length)}
          hint={`${(vendas.data ?? []).length} no total`}
          icon={TrendingUp}
        />
        <StatCard
          label="Afiliados ativos"
          value={String(ativos)}
          hint={`${(afiliados.data ?? []).length} cadastrados`}
          icon={Users}
        />
        <StatCard
          label="Comissões a pagar"
          value={brl(aPagar)}
          hint="Pendentes e aprovadas"
          icon={Percent}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução de vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {meses.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Sem histórico de vendas"
                description="Registre vendas aprovadas para ver a evolução mensal."
              />
            ) : (
              <div className="flex h-56 items-end gap-4">
                {meses.map(([mes, valor]) => (
                  <div key={mes} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{brl(valor)}</span>
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${(valor / maxMes) * 160}px`,
                        backgroundImage: "var(--gradient-primary)",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{mes}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            {top.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum afiliado ainda"
                description="Cadastre afiliados para ver o ranking por faturamento."
              />
            ) : (
              <ul className="space-y-3">
                {top.map(([nome, valor], i) => (
                  <li key={nome} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs">
                        {i + 1}
                      </span>
                      {nome}
                    </span>
                    <span className="font-medium">{brl(valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
