import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAuditoria } from "@/lib/portal/api";

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
  const logs = useQuery({ queryKey: ["auditoria"], queryFn: listAuditoria });
  const lista = logs.data ?? [];

  return (
    <PortalLayout title="Auditoria" description="Histórico de ações e alterações.">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {logs.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : logs.isError ? (
            <p className="text-sm text-destructive">
              Erro ao carregar auditoria: {(logs.error as Error).message}
            </p>
          ) : lista.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Nenhum registro"
              description="Cada criação, edição ou exclusão será registrada aqui automaticamente."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead className="text-right">Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="max-w-40 truncate">{l.user_id ?? "sistema"}</TableCell>
                    <TableCell>{l.acao}</TableCell>
                    <TableCell>{l.entidade ?? "—"}</TableCell>
                    <TableCell className="max-w-40 truncate text-right text-xs text-muted-foreground">
                      {l.entidade_id ?? "—"}
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
