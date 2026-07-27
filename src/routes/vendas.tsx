import { createFileRoute } from "@tanstack/react-router";
import { Plus, TrendingUp } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const etapas = [
  { nome: "Lead", cor: "bg-secondary" },
  { nome: "Negociação", cor: "bg-secondary" },
  { nome: "Aguardando pagamento", cor: "bg-secondary" },
  { nome: "Aprovada", cor: "bg-secondary" },
  { nome: "Reembolsada", cor: "bg-secondary" },
];

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Pipeline de vendas — Cortex Engine" },
      {
        name: "description",
        content:
          "Pipeline de vendas do programa de afiliados: leads, negociação, pagamento, aprovação e reembolso.",
      },
      { property: "og:title", content: "Pipeline de vendas — Cortex Engine" },
      {
        property: "og:description",
        content: "Acompanhe cada venda do lead até a aprovação e o pagamento da comissão.",
      },
    ],
  }),
  component: Vendas,
});

function Vendas() {
  return (
    <PortalLayout
      title="Pipeline de vendas"
      description="Do lead ao pagamento da comissão."
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrar venda
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {etapas.map((etapa) => (
          <Card key={etapa.nome} className="min-h-56">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm">{etapa.nome}</CardTitle>
              <Badge variant="secondary">0</Badge>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Sem vendas nesta etapa
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <EmptyState
          icon={TrendingUp}
          title="Pipeline vazio"
          description="As vendas aparecem aqui automaticamente quando forem registradas no banco de dados."
        />
      </div>
    </PortalLayout>
  );
}
