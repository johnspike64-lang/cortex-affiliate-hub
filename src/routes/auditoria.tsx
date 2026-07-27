import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoria — Cortex Engine" },
      {
        name: "description",
        content: "Trilha de auditoria com histórico de ações, usuários e alterações no portal.",
      },
      { property: "og:title", content: "Auditoria — Cortex Engine" },
      {
        property: "og:description",
        content: "Histórico completo de ações e alterações realizadas no portal de afiliados.",
      },
    ],
  }),
  component: Auditoria,
});

function Auditoria() {
  return (
    <PortalLayout title="Auditoria" description="Histórico de ações e alterações.">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead className="text-right">Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
          <EmptyState
            icon={ShieldCheck}
            title="Nenhum registro"
            description="Cada criação, edição ou exclusão será registrada aqui automaticamente."
          />
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
