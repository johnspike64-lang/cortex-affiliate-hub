import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Download } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  brl,
  dataBR,
  downloadCSV,
  listComissoes,
  listProdutos,
  listVendas,
} from "@/lib/portal/api";

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
  const vendas = useQuery({ queryKey: ["vendas"], queryFn: listVendas });
  const comissoes = useQuery({ queryKey: ["comissoes"], queryFn: listComissoes });
  const produtos = useQuery({ queryKey: ["produtos"], queryFn: listProdutos });

  const listaVendas = vendas.data ?? [];
  const listaComissoes = comissoes.data ?? [];

  const porAfiliado = new Map<string, { vendas: number; receita: number }>();
  for (const v of listaVendas.filter((x) => x.status === "aprovada")) {
    const nome = v.afiliados?.nome ?? "Sem afiliado";
    const atual = porAfiliado.get(nome) ?? { vendas: 0, receita: 0 };
    porAfiliado.set(nome, {
      vendas: atual.vendas + 1,
      receita: atual.receita + Number(v.valor ?? 0),
    });
  }

  const porProduto = new Map<string, { qtd: number; receita: number }>();
  for (const v of listaVendas.filter((x) => x.status === "aprovada")) {
    const nome = v.produtos?.nome ?? "Sem produto";
    const atual = porProduto.get(nome) ?? { qtd: 0, receita: 0 };
    porProduto.set(nome, { qtd: atual.qtd + 1, receita: atual.receita + Number(v.valor ?? 0) });
  }

  const relatorios = [
    {
      titulo: "Vendas por período",
      descricao: "Faturamento consolidado por venda registrada.",
      total: listaVendas.length,
      rows: () =>
        listaVendas.map((v) => ({
          data: dataBR(v.data_venda ?? v.created_at),
          cliente: v.cliente_nome ?? "",
          produto: v.produtos?.nome ?? "",
          afiliado: v.afiliados?.nome ?? "",
          status: v.status,
          valor: Number(v.valor ?? 0),
        })),
      arquivo: "vendas.csv",
    },
    {
      titulo: "Desempenho por afiliado",
      descricao: "Ranking de vendas aprovadas e receita gerada.",
      total: porAfiliado.size,
      rows: () =>
        [...porAfiliado.entries()].map(([afiliado, v]) => ({
          afiliado,
          vendas: v.vendas,
          receita: v.receita,
        })),
      arquivo: "desempenho-afiliados.csv",
    },
    {
      titulo: "Comissões",
      descricao: "Total gerado por afiliado e status de pagamento.",
      total: listaComissoes.length,
      rows: () =>
        listaComissoes.map((c) => ({
          data: dataBR(c.created_at),
          afiliado: c.afiliados?.nome ?? "",
          base: Number(c.base ?? 0),
          comissao: Number(c.percentual ?? 0),
          valor: Number(c.valor ?? 0),
          status: c.status,
        })),
      arquivo: "comissoes.csv",
    },
    {
      titulo: "Produtos mais vendidos",
      descricao: "Volume e receita por produto.",
      total: porProduto.size,
      rows: () =>
        [...porProduto.entries()].map(([produto, v]) => ({
          produto,
          vendas: v.qtd,
          receita: v.receita,
        })),
      arquivo: "produtos.csv",
    },
  ];

  const semDados = listaVendas.length === 0 && listaComissoes.length === 0 && (produtos.data ?? []).length === 0;

  return (
    <PortalLayout title="Relatórios" description="Análises e exportações do programa.">
      <div className="grid gap-4 sm:grid-cols-2">
        {relatorios.map((rel) => (
          <Card key={rel.titulo}>
            <CardHeader>
              <CardTitle className="text-base">{rel.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{rel.descricao}</p>
                <p className="mt-1 text-xs text-muted-foreground">{rel.total} registro(s)</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={rel.total === 0}
                onClick={() => downloadCSV(rel.arquivo, rel.rows())}
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita aprovada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold">
              {brl(
                listaVendas
                  .filter((v) => v.status === "aprovada")
                  .reduce((s, v) => s + Number(v.valor ?? 0), 0),
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comissões geradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold">
              {brl(listaComissoes.reduce((s, c) => s + Number(c.valor ?? 0), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {semDados && (
        <div className="mt-6">
          <EmptyState
            icon={FileBarChart}
            title="Sem dados para exportar"
            description="Cadastre produtos e registre vendas para liberar as exportações."
          />
        </div>
      )}
    </PortalLayout>
  );
}
