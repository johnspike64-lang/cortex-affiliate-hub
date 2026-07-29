import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, createProduto, listProdutos, toggleProduto } from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

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
  const qc = useQueryClient();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    preco: "",
    comissao: "",
    descricao: "",
  });

  const produtos = useQuery({ queryKey: ["produtos"], queryFn: listProdutos });

  const criar = useMutation({
    mutationFn: () =>
      createProduto({
        nome: form.nome,
        categoria: form.categoria || undefined,
        preco: Number(form.preco || 0),
        comissao_percentual: Number(form.comissao || 0),
        descricao: form.descricao || undefined,
      }),
    onSuccess: () => {
      toast.success("Produto cadastrado");
      setOpen(false);
      setForm({ nome: "", categoria: "", preco: "", comissao: "", descricao: "" });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: (v: { id: string; ativo: boolean }) => toggleProduto(v.id, v.ativo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const termo = busca.trim().toLowerCase();
  const lista = (produtos.data ?? []).filter((p) =>
    termo ? p.nome.toLowerCase().includes(termo) : true,
  );

  return (
    <PortalLayout
      title="Produtos"
      description="Preços e regras de comissionamento."
      actions={
        isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo produto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="pnome">Nome</Label>
                  <Input
                    id="pnome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={form.preco}
                      onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="comissao">Comissão (%)</Label>
                    <Input
                      id="comissao"
                      type="number"
                      step="0.01"
                      value={form.comissao}
                      onChange={(e) => setForm({ ...form, comissao: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => criar.mutate()}
                  disabled={!form.nome.trim() || criar.isPending}
                >
                  {criar.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null
      }
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Buscar produto"
            className="max-w-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {produtos.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : produtos.isError ? (
            <p className="text-sm text-destructive">
              Erro ao carregar produtos: {(produtos.error as Error).message}
            </p>
          ) : lista.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum produto cadastrado"
              description="Cadastre produtos com preço e percentual de comissão para habilitar o cálculo automático."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Comissão</TableHead>
                  {isAdmin && <TableHead className="text-right">Ativo</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">{p.descricao ?? "—"}</p>
                    </TableCell>
                    <TableCell>{p.categoria ?? "—"}</TableCell>
                    <TableCell>{brl(p.preco)}</TableCell>
                    <TableCell>{Number(p.comissao_percentual ?? 0)}%</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Switch
                          checked={Boolean(p.ativo)}
                          disabled={!isAdmin}
                          onCheckedChange={(v) => alternar.mutate({ id: p.id, ativo: v })}
                        />
                      </TableCell>
                    )}
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
