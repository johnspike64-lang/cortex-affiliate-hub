import { createFileRoute } from "@tanstack/react-router";
import { Package, Plus } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Cortex Engine" },
      {
        name: "description",
        content: "Cadastro de produtos, preços e regras de comissionamento do Cortex Engine.",
      },
      { property: "og:title", content: "Produtos — Cortex Engine" },
      {
        property: "og:description",
        content: "Produtos, preços e percentuais de comissão do programa de afiliados.",
      },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  return (
    <PortalLayout
      title="Produtos"
      description="Preços e regras de comissionamento."
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo produto
        </Button>
      }
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Buscar produto" className="max-w-sm" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
          <EmptyState
            icon={Package}
            title="Nenhum produto cadastrado"
            description="Cadastre produtos com preço e percentual de comissão para habilitar o cálculo automático."
          />
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
