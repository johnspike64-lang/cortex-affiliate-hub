import { createFileRoute } from "@tanstack/react-router";
import { Percent } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState, StatCard } from "@/components/portal/Panels";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/comissoes")({
  head: () => ({
    meta: [
      { title: "Comissões — Cortex Engine" },
      {
        name: "description",
        content: "Cálculo automático de comissões por venda, afiliado e status de pagamento.",
      },
      { property: "og:title", content: "Comissões — Cortex Engine" },
      {
        property: "og:description",
        content: "Comissões pendentes, aprovadas e pagas do programa de afiliados.",
      },
    ],
  }),
  component: Comissoes,
});

function Comissoes() {
  return (
    <PortalLayout title="Comissões" description="Cálculo automático por venda e afiliado.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pendentes" value="R$ 0,00" icon={Percent} />
        <StatCard label="Aprovadas" value="R$ 0,00" icon={Percent} />
        <StatCard label="Pagas" value="R$ 0,00" icon={Percent} />
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-6">
          <Tabs defaultValue="pendentes">
            <TabsList>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              <TabsTrigger value="aprovadas">Aprovadas</TabsTrigger>
              <TabsTrigger value="pagas">Pagas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Venda</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>%</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>

          <EmptyState
            icon={Percent}
            title="Nenhuma comissão gerada"
            description="As comissões são calculadas automaticamente a partir das vendas aprovadas."
          />
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
