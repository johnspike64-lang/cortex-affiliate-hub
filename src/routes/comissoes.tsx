import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Percent } from "lucide-react";
import { toast } from "sonner";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState, StatCard } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, dataBR, listComissoes, updateComissaoStatus, listAfiliados } from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

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
  const qc = useQueryClient();
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const [aba, setAba] = useState("pendente");
  const comissoes = useQuery({ queryKey: ["comissoes"], queryFn: listComissoes });
  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados, enabled: !isAdmin });

  const mudar = useMutation({
    mutationFn: (v: { id: string; status: string }) => updateComissaoStatus(v.id, v.status),
    onSuccess: () => {
      toast.success("Comissão atualizada");
      qc.invalidateQueries({ queryKey: ["comissoes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const meuAfiliado = afiliados.data?.find((a) => a.email === user?.email) || afiliados.data?.[0];
  const meuAfiliadoId = meuAfiliado?.id;

  const todas = comissoes.data ?? [];
  const filtradas = isAdmin
    ? todas
    : (meuAfiliadoId ? todas.filter((c) => c.afiliado_id === meuAfiliadoId) : []);

  const total = (s: string) =>
    filtradas.filter((c) => c.status === s).reduce((acc, c) => acc + Number(c.valor ?? 0), 0);
  const lista = filtradas.filter((c) => c.status === aba);

  return (
    <PortalLayout title="Comissões" description="Cálculo automático por venda e afiliado.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pendentes" value={brl(total("pendente"))} icon={Percent} />
        <StatCard label="Aprovadas" value={brl(total("aprovada"))} icon={Percent} />
        <StatCard label="Pagas" value={brl(total("paga"))} icon={Percent} />
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-6">
          <Tabs value={aba} onValueChange={setAba}>
            <TabsList>
              <TabsTrigger value="pendente">Pendentes</TabsTrigger>
              <TabsTrigger value="aprovada">Aprovadas</TabsTrigger>
              <TabsTrigger value="paga">Pagas</TabsTrigger>
            </TabsList>
          </Tabs>

          {comissoes.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : comissoes.isError ? (
            <p className="text-sm text-destructive">
              Erro ao carregar comissões: {(comissoes.error as Error).message}
            </p>
          ) : lista.length === 0 ? (
            <EmptyState
              icon={Percent}
              title="Nenhuma comissão nesta etapa"
              description="As comissões são calculadas automaticamente a partir das vendas aprovadas."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.afiliados?.nome ?? "—"}</TableCell>
                    <TableCell>{dataBR(c.created_at)}</TableCell>
                    <TableCell>{brl(c.base)}</TableCell>
                    <TableCell>{brl(c.percentual)}</TableCell>
                    <TableCell className="text-right font-medium">{brl(c.valor)}</TableCell>
                    <TableCell className="text-right">
                      {c.status === "pendente" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => mudar.mutate({ id: c.id, status: "aprovada" })}
                        >
                          Aprovar
                        </Button>
                      )}
                      {c.status === "aprovada" && (
                        <Button
                          size="sm"
                          onClick={() => mudar.mutate({ id: c.id, status: "paga" })}
                        >
                          Marcar como paga
                        </Button>
                      )}
                      {c.status === "paga" && (
                        <span className="text-xs text-muted-foreground">Concluída</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
