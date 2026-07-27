import { createFileRoute } from "@tanstack/react-router";
import { Users, Plus } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/afiliados")({
  head: () => ({
    meta: [
      { title: "Afiliados — Cortex Engine" },
      {
        name: "description",
        content: "Cadastro, status, níveis e desempenho dos afiliados do programa Cortex Engine.",
      },
      { property: "og:title", content: "Afiliados — Cortex Engine" },
      {
        property: "og:description",
        content: "Gestão completa de afiliados: cadastro, status, níveis e desempenho.",
      },
    ],
  }),
  component: Afiliados,
});

function Afiliados() {
  return (
    <PortalLayout
      title="Afiliados"
      description="Cadastro, níveis e desempenho da rede."
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo afiliado
        </Button>
      }
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Filtrar por nome, e-mail ou documento" className="max-w-sm" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead className="text-right">Comissão acumulada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
          <EmptyState
            icon={Users}
            title="Nenhum afiliado cadastrado"
            description="A lista será alimentada pelo banco de dados assim que o backend estiver ativo."
          />
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
