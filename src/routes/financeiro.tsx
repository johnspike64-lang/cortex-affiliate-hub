import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState, StatCard } from "@/components/portal/Panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, dataBR, downloadCSV, listMovimentacoes, listSaldos, listAfiliados } from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

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
  const { role, user } = useAuth();
  const isAdmin = role === "admin";

  const movimentacoes = useQuery({ queryKey: ["movimentacoes"], queryFn: listMovimentacoes });
  const saldos = useQuery({ queryKey: ["saldos"], queryFn: listSaldos });
  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados, enabled: !isAdmin });

  const meuAfiliado = afiliados.data?.find((a) => a.email === user?.email) || afiliados.data?.[0];
  const meuAfiliadoId = meuAfiliado?.id;

  const todasMovs = movimentacoes.data ?? [];
  const movs = isAdmin
    ? todasMovs
    : (meuAfiliadoId ? todasMovs.filter((m) => m.afiliado_id === meuAfiliadoId) : []);

  const saldoTotal = isAdmin
    ? (saldos.data ?? []).reduce((s, x) => s + Number(x.saldo ?? 0), 0)
    : (saldos.data ?? []).filter((s) => s.afiliado_id === meuAfiliadoId).reduce((s, x) => s + Number(x.saldo ?? 0), 0);

  const now = new Date();
  const entradasMes = movs
    .filter((m) => {
      const d = new Date(m.created_at);
      return (
        m.tipo === "credito" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, m) => s + Number(m.valor ?? 0), 0);
  const saques = movs
    .filter((m) => m.tipo === "saque")
    .reduce((s, m) => s + Number(m.valor ?? 0), 0);

  return (
    <PortalLayout
      title="Financeiro"
      description="Saldos, saques e repasses."
      actions={
        <Button
          variant="secondary"
          disabled={movs.length === 0}
          onClick={() =>
            downloadCSV(
              "financeiro.csv",
              movs.map((m) => ({
                data: dataBR(m.created_at),
                afiliado: m.afiliados?.nome ?? "",
                tipo: m.tipo,
                status: m.status,
                valor: Number(m.valor ?? 0),
              })),
            )
          }
        >
          Exportar CSV
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Saldo disponível" value={brl(saldoTotal)} icon={Wallet} />
        <StatCard label="Entradas do mês" value={brl(entradasMes)} icon={ArrowUpRight} />
        <StatCard label="Saques solicitados" value={brl(saques)} icon={ArrowDownRight} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle>Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            {movimentacoes.isPending ? (
              <Skeleton className="h-40 w-full" />
            ) : movimentacoes.isError ? (
              <p className="text-sm text-destructive">
                Erro ao carregar: {(movimentacoes.error as Error).message}
              </p>
            ) : movs.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="Sem movimentações"
                description="Créditos, saques e repasses aparecem aqui conforme forem registrados."
              />
            ) : (
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
                <TableBody>
                  {movs.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{dataBR(m.created_at)}</TableCell>
                      <TableCell>{m.afiliados?.nome ?? "—"}</TableCell>
                      <TableCell>{m.tipo}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{brl(m.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Saldo por afiliado</CardTitle>
            </CardHeader>
            <CardContent>
              {saldos.isPending ? (
                <Skeleton className="h-40 w-full" />
              ) : (saldos.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum saldo apurado.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {(saldos.data ?? []).map((s) => (
                    <li key={s.afiliado_id} className="flex items-center justify-between gap-3">
                      <span>{s.nome}</span>
                      <span className="font-medium">{brl(s.saldo)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
