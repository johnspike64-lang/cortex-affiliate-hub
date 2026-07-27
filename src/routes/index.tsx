import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Users, TrendingUp, Percent, Activity } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState, StatCard } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        content: "Painel de vendas, afiliados, comissões e financeiro do Cortex Engine.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <PortalLayout
      title="Dashboard"
      description="Visão geral do programa de afiliados."
      actions={<Button>Nova venda</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento no mês" value="R$ 0,00" hint="Aguardando dados" icon={DollarSign} />
        <StatCard label="Vendas aprovadas" value="0" hint="Aguardando dados" icon={TrendingUp} />
        <StatCard label="Afiliados ativos" value="0" hint="Aguardando dados" icon={Users} />
        <StatCard label="Comissões a pagar" value="R$ 0,00" hint="Aguardando dados" icon={Percent} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução de vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Activity}
              title="Sem histórico de vendas"
              description="Os gráficos são preenchidos automaticamente assim que o banco de dados estiver conectado."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Users}
              title="Nenhum afiliado ainda"
              description="Cadastre afiliados para ver o ranking por faturamento."
            />
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
