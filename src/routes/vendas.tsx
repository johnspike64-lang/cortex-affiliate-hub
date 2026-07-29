import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  brl,
  createVenda,
  dataBR,
  listAfiliados,
  listProdutos,
  listVendas,
  updateVendaStatus,
  type VendaStatus,
} from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

const etapas: { nome: string; status: VendaStatus }[] = [
  { nome: "Lead", status: "lead" },
  { nome: "Negociação", status: "negociacao" },
  { nome: "Aguardando pagamento", status: "aguardando_pagamento" },
  { nome: "Aprovada", status: "aprovada" },
  { nome: "Reembolsada", status: "reembolsada" },
];

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Pipeline de vendas — Cortex Engine" },
      {
        name: "description",
        content:
          "Pipeline de vendas do programa de afiliados: leads, negociação, pagamento, aprovação e reembolso.",
      },
      { property: "og:title", content: "Pipeline de vendas — Cortex Engine" },
      {
        property: "og:description",
        content: "Acompanhe cada venda do lead até a aprovação e o pagamento da comissão.",
      },
    ],
  }),
  component: Vendas,
});

function Vendas() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    afiliado_id: "",
    produto_id: "",
    cliente_nome: "",
    cliente_email: "",
    valor: "",
    status: "lead" as VendaStatus,
  });

  const vendas = useQuery({ queryKey: ["vendas"], queryFn: listVendas });
  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados });
  const produtos = useQuery({ queryKey: ["produtos"], queryFn: listProdutos });

  const meuAfiliado = (afiliados.data ?? []).find((a) => a.email === user?.email);
  const meuAfiliadoId = meuAfiliado?.id || user?.id;

  const criar = useMutation({
    mutationFn: () =>
      createVenda({
        afiliado_id: form.afiliado_id,
        produto_id: form.produto_id,
        cliente_nome: form.cliente_nome,
        cliente_email: form.cliente_email || undefined,
        valor: Number(form.valor || 0),
        status: form.status,
      }),
    onSuccess: () => {
      toast.success("Venda registrada");
      setOpen(false);
      setForm({
        afiliado_id: "",
        produto_id: "",
        cliente_nome: "",
        cliente_email: "",
        valor: "",
        status: "lead",
      });
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["comissoes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mover = useMutation({
    mutationFn: (v: { id: string; status: VendaStatus }) => updateVendaStatus(v.id, v.status),
    onSuccess: () => {
      toast.success("Status da venda atualizado");
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["comissoes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const todasVendas = vendas.data ?? [];
  const lista = isAdmin
    ? todasVendas
    : (meuAfiliadoId ? todasVendas.filter((v) => v.afiliado_id === meuAfiliadoId) : []);

  return (
    <PortalLayout
      title="Pipeline de vendas"
      description="Do lead ao pagamento da comissão."
      actions={
        isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar venda
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar venda</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Afiliado</Label>
                <Select
                  value={form.afiliado_id}
                  onValueChange={(v) => setForm({ ...form, afiliado_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o afiliado" />
                  </SelectTrigger>
                  <SelectContent>
                    {(afiliados.data ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Produto</Label>
                <Select
                  value={form.produto_id}
                  onValueChange={(v) => {
                    const p = (produtos.data ?? []).find((x) => x.id === v);
                    setForm({
                      ...form,
                      produto_id: v,
                      valor: p ? String(p.preco) : form.valor,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {(produtos.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="cnome">Cliente</Label>
                  <Input
                    id="cnome"
                    value={form.cliente_nome}
                    onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="cemail">E-mail do cliente</Label>
                  <Input
                    id="cemail"
                    type="email"
                    value={form.cliente_email}
                    onChange={(e) => setForm({ ...form, cliente_email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Etapa</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as VendaStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {etapas.map((e) => (
                        <SelectItem key={e.status} value={e.status}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => criar.mutate()}
                disabled={
                  !form.afiliado_id || !form.produto_id || !form.cliente_nome || criar.isPending
                }
              >
                {criar.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null
      }
    >
      {vendas.isPending ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {etapas.map((e) => (
            <Skeleton key={e.status} className="h-56 w-full" />
          ))}
        </div>
      ) : vendas.isError ? (
        <p className="text-sm text-destructive">
          Erro ao carregar vendas: {(vendas.error as Error).message}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {etapas.map((etapa) => {
            const itens = lista.filter((v) => v.status === etapa.status);
            return (
              <Card key={etapa.status} className="min-h-56">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm">{etapa.nome}</CardTitle>
                  <Badge variant="secondary">{itens.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {itens.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Sem vendas nesta etapa
                    </p>
                  ) : (
                    itens.map((v) => (
                      <div key={v.id} className="rounded-lg border border-border/60 p-3">
                        <p className="text-sm font-medium">{v.cliente_nome ?? "Cliente"}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.produtos?.nome ?? "—"} · {v.afiliados?.nome ?? "—"}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{brl(v.valor)}</p>
                        <p className="text-xs text-muted-foreground">
                          {dataBR(v.data_venda ?? v.created_at)}
                        </p>
                        <Select
                          value={v.status}
                          onValueChange={(s) => mover.mutate({ id: v.id, status: s as VendaStatus })}
                          disabled={!isAdmin}
                        >
                          <SelectTrigger className="mt-2 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {etapas.map((e) => (
                              <SelectItem key={e.status} value={e.status}>
                                {e.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!vendas.isPending && lista.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={TrendingUp}
            title="Pipeline vazio"
            description="Registre a primeira venda para acompanhar o funil do lead ao pagamento."
          />
        </div>
      )}
    </PortalLayout>
  );
}
