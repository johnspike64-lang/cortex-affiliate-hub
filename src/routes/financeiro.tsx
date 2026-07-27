import { createFileRoute } from "@tanstack/react-router";
import { Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState, StatCard } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Cortex Engine" },
      {
        name: "description",
        content: "Saldos, solicitações de saque e pagamentos aos afiliados do Cortex Engine.",
      },
      { property: "og:title", content: "Financeiro — Cortex Engine" },
      {
        property: "og:description",
        content: "Controle de saldo, saques e repasses do programa de afiliados.",
      },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  return (
    <PortalLayout
      title="Financeiro"
      description="Saldos, saques e repasses."
      actions={<Button variant="secondary">Exportar CSV</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Saldo disponível" value="R$ 0,00" icon={Wallet} />
        <StatCard label="Entradas do mês" value="R$ 0,00" icon={ArrowUpRight} />
        <StatCard label="Saques solicitados" value="R$ 0,00" icon={ArrowDownRight} />
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Afiliado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
          <EmptyState
            icon={Wallet}
            title="Sem movimentações"
            description="Saques e repasses aparecem aqui após a integração com o banco de dados."
          />
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
