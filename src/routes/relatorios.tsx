import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart, Download } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const relatorios = [
  { titulo: "Vendas por período", descricao: "Faturamento consolidado por dia, semana ou mês." },
  { titulo: "Desempenho por afiliado", descricao: "Ranking de conversão e receita gerada." },
  { titulo: "Comissões pagas", descricao: "Total repassado por afiliado e por produto." },
  { titulo: "Produtos mais vendidos", descricao: "Volume e receita por produto." },
];

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Cortex Engine" },
      {
        name: "description",
        content: "Relatórios de vendas, afiliados, comissões e produtos com exportação em CSV.",
      },
      { property: "og:title", content: "Relatórios — Cortex Engine" },
      {
        property: "og:description",
        content: "Relatórios exportáveis de desempenho do programa de afiliados.",
      },
    ],
  }),
  component: Relatorios,
});

function Relatorios() {
  return (
    <PortalLayout title="Relatórios" description="Análises e exportações do programa.">
      <div className="grid gap-4 sm:grid-cols-2">
        {relatorios.map((rel) => (
          <Card key={rel.titulo}>
            <CardHeader>
              <CardTitle className="text-base">{rel.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{rel.descricao}</p>
              <Button variant="secondary" size="sm" disabled>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <EmptyState
          icon={FileBarChart}
          title="Exportações indisponíveis"
          description="As exportações são liberadas quando houver dados no banco."
        />
      </div>
    </PortalLayout>
  );
}
