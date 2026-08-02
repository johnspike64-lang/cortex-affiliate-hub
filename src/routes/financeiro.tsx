import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState, StatCard } from "@/components/portal/Panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  brl,
  dataBR,
  downloadCSV,
  listMovimentacoes,
  listSaldos,
  listAfiliados,
  updateAfiliadoPix,
} from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Cortex Engine" },
      {
        name: "description",
        content: "Saldos e comissões pagas aos afiliados do Cortex Engine.",
      },
      { property: "og:title", content: "Financeiro — Cortex Engine" },
      {
        property: "og:description",
        content: "Controle de saldo e comissões pagas do programa de afiliados.",
      },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const qc = useQueryClient();

  const [tipoPix, setTipoPix] = useState("");
  const [chavePix, setChavePix] = useState("");

  const movimentacoes = useQuery({ queryKey: ["movimentacoes"], queryFn: listMovimentacoes });
  const saldos = useQuery({ queryKey: ["saldos"], queryFn: listSaldos });
  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados, enabled: !isAdmin });

  const meuAfiliado = afiliados.data?.find((a) => a.email === user?.email);
  const meuAfiliadoId = meuAfiliado?.id || user?.id;

  useEffect(() => {
    if (meuAfiliado) {
      setTipoPix(meuAfiliado.tipo_pix || "");
      setChavePix(meuAfiliado.chave_pix || "");
    }
  }, [meuAfiliado]);

  const atualizarPix = useMutation({
    mutationFn: () => updateAfiliadoPix({ chavePix, tipoPix }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["afiliados"] });
      toast.success("Chave PIX salva com sucesso!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const todasMovs = movimentacoes.data ?? [];
  const movs = isAdmin
    ? todasMovs
    : (meuAfiliadoId ? todasMovs.filter((m) => m.afiliado_id === meuAfiliadoId) : []);

  const saldoTotal = movs
    .filter((m) => m.tipo === "credito" && m.status !== "pago")
    .reduce((s, m) => s + Number(m.valor ?? 0), 0);

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
    .filter((m) => m.status === "pago")
    .reduce((s, m) => s + Number(m.valor ?? 0), 0);

  const saldoPorAfiliado = Object.values(
    todasMovs.reduce((acc, m) => {
      if (!m.afiliado_id || !m.afiliados?.nome) return acc;
      const id = m.afiliado_id;
      const nome = m.afiliados.nome;
      const current = acc[id] || { afiliado_id: id, nome, saldo: 0 };
      if (m.tipo === "credito" && m.status !== "pago") {
        current.saldo += Number(m.valor ?? 0);
      }
      acc[id] = current;
      return acc;
    }, {} as Record<string, { afiliado_id: string; nome: string; saldo: number }>)
  );

  return (
    <PortalLayout
      title="Financeiro"
      description="Saldos e comissões pagas."
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
                tipo: m.tipo === "saque" ? "pagamento" : m.tipo,
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
        <StatCard label="Comissões pagas" value={brl(saques)} icon={ArrowDownRight} />
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
                description="Créditos e comissões pagas aparecem aqui conforme forem registrados."
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
                      <TableCell className="capitalize">
                        {m.tipo === "saque" ? "pagamento" : m.tipo === "credito" ? "crédito" : m.tipo}
                      </TableCell>
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
              {movimentacoes.isPending ? (
                <Skeleton className="h-40 w-full" />
              ) : saldoPorAfiliado.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum saldo apurado.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {saldoPorAfiliado.map((s) => (
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

      {!isAdmin && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Dados de Recebimento (PIX)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {afiliados.isPending ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="tipo-pix">Tipo de Chave</Label>
                    <Select
                      value={tipoPix}
                      onValueChange={setTipoPix}
                    >
                      <SelectTrigger id="tipo-pix">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="chave_aleatoria">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="chave-pix">Chave PIX</Label>
                    <Input
                      id="chave-pix"
                      placeholder="Insira sua chave"
                      value={chavePix}
                      onChange={(e) => setChavePix(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => atualizarPix.mutate()}
                  disabled={atualizarPix.isPending || !chavePix.trim() || !tipoPix}
                >
                  {atualizarPix.isPending ? "Salvando..." : "Salvar Chave PIX"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PortalLayout>
  );
}
