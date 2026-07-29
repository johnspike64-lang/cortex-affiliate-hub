import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Percent, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  brl,
  dataBR,
  listComissoes,
  updateComissaoStatus,
  listAfiliados,
  listProdutos,
  listVendas,
  createComissao,
} from "@/lib/portal/api";
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

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    afiliado_id: "",
    venda_id: "",
    produto_id: "",
    base: "",
    valor: "",
    status: "pendente",
  });

  const comissoes = useQuery({ queryKey: ["comissoes"], queryFn: listComissoes });
  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados });
  const produtos = useQuery({ queryKey: ["produtos"], queryFn: listProdutos, enabled: isAdmin });
  const vendas = useQuery({ queryKey: ["vendas"], queryFn: listVendas, enabled: isAdmin });

  const mudar = useMutation({
    mutationFn: (v: { id: string; status: string }) => updateComissaoStatus(v.id, v.status),
    onSuccess: () => {
      toast.success("Comissão atualizada");
      qc.invalidateQueries({ queryKey: ["comissoes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const criarManual = useMutation({
    mutationFn: () =>
      createComissao({
        venda_id: form.venda_id || null,
        afiliado_id: form.afiliado_id,
        base: Number(form.base || 0),
        percentual: Number(form.valor || 0),
        valor: Number(form.valor || 0),
        status: form.status,
      }),
    onSuccess: () => {
      toast.success("Comissão gerada manualmente!");
      setOpen(false);
      setForm({
        afiliado_id: "",
        venda_id: "",
        produto_id: "",
        base: "",
        valor: "",
        status: "pendente",
      });
      qc.invalidateQueries({ queryKey: ["comissoes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleVendaChange = (vendaId: string) => {
    if (vendaId === "none") {
      setForm((prev) => ({
        ...prev,
        venda_id: "",
        base: "",
        valor: "",
      }));
      return;
    }
    const vendaSel = (vendas.data ?? []).find((v) => v.id === vendaId);
    if (vendaSel) {
      const prodSel = (produtos.data ?? []).find((p) => p.id === vendaSel.produto_id);
      setForm((prev) => ({
        ...prev,
        venda_id: vendaId,
        produto_id: vendaSel.produto_id ?? "",
        base: String(vendaSel.valor),
        valor: prodSel ? String(prodSel.comissao_percentual) : "",
      }));
    }
  };

  const handleProdutoChange = (prodId: string) => {
    const prodSel = (produtos.data ?? []).find((p) => p.id === prodId);
    setForm((prev) => ({
      ...prev,
      produto_id: prodId,
      base: prodSel ? String(prodSel.preco) : prev.base,
      valor: prodSel ? String(prodSel.comissao_percentual) : prev.valor,
    }));
  };

  const meuAfiliado = afiliados.data?.find((a) => a.email === user?.email) || afiliados.data?.[0];
  const meuAfiliadoId = meuAfiliado?.id;

  const todas = comissoes.data ?? [];
  const filtradas = isAdmin
    ? todas
    : (meuAfiliadoId ? todas.filter((c) => c.afiliado_id === meuAfiliadoId) : []);

  const total = (s: string) =>
    filtradas.filter((c) => c.status === s).reduce((acc, c) => acc + Number(c.valor ?? 0), 0);
  const lista = filtradas.filter((c) => c.status === aba);

  const vendasDoAfiliado = (vendas.data ?? []).filter(
    (v) => v.afiliado_id === form.afiliado_id && v.status === "aprovada"
  );

  return (
    <PortalLayout
      title="Comissões"
      description="Cálculo automático por venda e afiliado."
      actions={
        isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Gerar comissão manual
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Gerar comissão manualmente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Afiliado</Label>
                  <Select
                    value={form.afiliado_id}
                    onValueChange={(v) => setForm({ ...form, afiliado_id: v, venda_id: "", produto_id: "", base: "", valor: "" })}
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

                {form.afiliado_id && (
                  <>
                    <div className="grid gap-2">
                      <Label>Vincular a Venda (Opcional)</Label>
                      <Select
                        value={form.venda_id || "none"}
                        onValueChange={handleVendaChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma venda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma (Lançamento manual)</SelectItem>
                          {vendasDoAfiliado.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.produtos?.nome ?? "Produto"} · {brl(v.valor)} ({dataBR(v.created_at)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!form.venda_id && (
                      <div className="grid gap-2">
                        <Label>Produto</Label>
                        <Select
                          value={form.produto_id}
                          onValueChange={handleProdutoChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {(produtos.data ?? []).map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nome} ({brl(p.preco)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="base">Valor da Venda (Base)</Label>
                        <Input
                          id="base"
                          type="number"
                          step="0.01"
                          value={form.base}
                          onChange={(e) => setForm({ ...form, base: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="valor">Valor da Comissão</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          value={form.valor}
                          onChange={(e) => setForm({ ...form, valor: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Status da Comissão</Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => setForm({ ...form, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="aprovada">Aprovada</SelectItem>
                          <SelectItem value="paga">Paga</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => criarManual.mutate()}
                  disabled={
                    !form.afiliado_id ||
                    (!form.venda_id && !form.produto_id) ||
                    !form.base ||
                    !form.valor ||
                    criarManual.isPending
                  }
                >
                  {criarManual.isPending ? "Gerando..." : "Gerar Comissão"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null
      }
    >
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
