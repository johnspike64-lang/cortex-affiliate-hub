import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createAfiliado,
  listAfiliados,
  listComissoes,
  listVendas,
  updateAfiliadoStatus,
  listProgressoTodos,
  listMateriais,
  type AfiliadoStatus,
} from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

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

const statusOptions: AfiliadoStatus[] = ["pendente", "ativo", "suspenso", "bloqueado"];

function Afiliados() {
  const { role, loading: authLoading } = useAuth();
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    nivel: "",
  });

  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados, enabled: isAdmin });
  const vendas = useQuery({ queryKey: ["vendas"], queryFn: listVendas, enabled: isAdmin });
  const comissoes = useQuery({ queryKey: ["comissoes"], queryFn: listComissoes, enabled: isAdmin });
  const progressoTodos = useQuery({ queryKey: ["progressoTodos"], queryFn: listProgressoTodos, enabled: isAdmin });
  const materiais = useQuery({ queryKey: ["materiais"], queryFn: listMateriais, enabled: isAdmin });

  if (authLoading) {
    return (
      <PortalLayout title="Afiliados" description="Carregando...">
        <Skeleton className="h-40 w-full" />
      </PortalLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PortalLayout title="Acesso Negado" description="Você não possui permissão para ver esta página comercial.">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Esta área é restrita para administradores.</p>
          </CardContent>
        </Card>
      </PortalLayout>
    );
  }

  const criar = useMutation({
    mutationFn: () =>
      createAfiliado({
        nome: form.nome,
        email: form.email || undefined,
        telefone: form.telefone || undefined,
        documento: form.documento || undefined,
        nivel: form.nivel || undefined,
      }),
    onSuccess: () => {
      toast.success("Afiliado cadastrado");
      setOpen(false);
      setForm({ nome: "", email: "", telefone: "", documento: "", nivel: "" });
      qc.invalidateQueries({ queryKey: ["afiliados"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mudarStatus = useMutation({
    mutationFn: (v: { id: string; status: AfiliadoStatus }) =>
      updateAfiliadoStatus(v.id, v.status),
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["afiliados"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const termo = filtro.trim().toLowerCase();
  const lista = (afiliados.data ?? []).filter((a) =>
    termo
      ? [a.nome, a.email, a.documento].some((v) => (v ?? "").toLowerCase().includes(termo))
      : true,
  );

  const vendasPor = (id: string) =>
    (vendas.data ?? []).filter((v) => v.afiliado_id === id && v.status === "aprovada").length;
  const comissaoPor = (id: string) =>
    (comissoes.data ?? [])
      .filter((c) => c.afiliado_id === id)
      .reduce((s, c) => s + Number(c.valor ?? 0), 0);

  return (
    <PortalLayout
      title="Afiliados"
      description="Cadastro, níveis e desempenho da rede."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo afiliado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo afiliado</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="documento">Documento</Label>
                  <Input
                    id="documento"
                    value={form.documento}
                    onChange={(e) => setForm({ ...form, documento: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="nivel">Nível</Label>
                <Input
                  id="nivel"
                  placeholder="Ex.: bronze, prata, ouro"
                  value={form.nivel}
                  onChange={(e) => setForm({ ...form, nivel: e.target.value })}
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
      }
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Filtrar por nome, e-mail ou documento"
            className="max-w-sm"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          {afiliados.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : afiliados.isError ? (
            <p className="text-sm text-destructive">
              Erro ao carregar afiliados: {(afiliados.error as Error).message}
            </p>
          ) : lista.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum afiliado encontrado"
              description="Cadastre o primeiro afiliado para começar a acompanhar vendas e comissões."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Treinamento</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead className="text-right">Comissão acumulada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((a) => {
                  const totalMats = (materiais.data ?? []).filter((m) => m.publicado).length;
                  const concluidosParaEsteAfiliado = (progressoTodos.data ?? []).filter((p) => p.user_id === a.id).length;
                  const progressoPercent = totalMats > 0 ? Math.round((concluidosParaEsteAfiliado / totalMats) * 100) : 0;

                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <p className="font-medium">{a.nome}</p>
                        <p className="text-xs text-muted-foreground">{a.email ?? "—"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{a.nivel ?? "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={a.status}
                          onValueChange={(v) =>
                            mudarStatus.mutate({ id: a.id, status: v as AfiliadoStatus })
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 w-28">
                          <span className="text-xs font-semibold">{progressoPercent}%</span>
                          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressoPercent}%`, backgroundImage: "var(--gradient-primary)" }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vendasPor(a.id)}</TableCell>
                      <TableCell className="text-right">{brl(comissaoPor(a.id))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
