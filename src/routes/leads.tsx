import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Users, Search, Building2, Phone, Mail, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  listLeads,
  createLead,
  updateLeadStatus,
  listAfiliados,
  brl,
  dataBR,
  type LeadStatus,
} from "@/lib/portal/api";
import { useAuth } from "@/lib/auth";

const etapasLeads: { nome: string; status: LeadStatus }[] = [
  { nome: "Novo", status: "novo" },
  { nome: "Em Contato", status: "em_contato" },
  { nome: "Negociação", status: "negociacao" },
  { nome: "Fechado (Ganho)", status: "fechado" },
  { nome: "Perdido", status: "perdido" },
];

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Pipeline de Leads — Cortex Engine" },
      {
        name: "description",
        content: "Gerenciamento e cadastro de leads do programa de afiliados Cortex Engine.",
      },
      { property: "og:title", content: "Pipeline de Leads — Cortex Engine" },
      {
        property: "og:description",
        content: "Cadastre e acompanhe seus leads desde o primeiro contato até o fechamento.",
      },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { role, user } = useAuth();
  const isAdmin = role === "admin";
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [filtroAfiliado, setFiltroAfiliado] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const [form, setForm] = useState({
    afiliado_id: "",
    nome_responsavel: "",
    nome_empresa: "",
    nicho: "",
    telefone: "",
    email: "",
    endereco: "",
    valor_ofertado: "",
    status: "novo" as LeadStatus,
  });

  const leads = useQuery({ queryKey: ["leads"], queryFn: listLeads });
  const afiliados = useQuery({ queryKey: ["afiliados"], queryFn: listAfiliados });

  const meuAfiliado = (afiliados.data ?? []).find((a) => a.email === user?.email);
  const meuAfiliadoId = meuAfiliado?.id || user?.id;

  const criar = useMutation({
    mutationFn: () => {
      // Se for afiliado, define o afiliado_id automaticamente a partir do seu perfil
      const afiliadoId = isAdmin ? form.afiliado_id : (meuAfiliadoId ?? "");
      if (!afiliadoId) {
        throw new Error("Erro de identificação do afiliado. Entre em contato com o suporte.");
      }

      return createLead({
        afiliado_id: afiliadoId,
        nome_responsavel: form.nome_responsavel,
        nome_empresa: form.nome_empresa,
        nicho: form.nicho || undefined,
        telefone: form.telefone || undefined,
        email: form.email || undefined,
        endereco: form.endereco || undefined,
        valor_ofertado: Number(form.valor_ofertado || 0),
        status: form.status,
      });
    },
    onSuccess: () => {
      toast.success("Lead cadastrado com sucesso!");
      setOpen(false);
      setForm({
        afiliado_id: "",
        nome_responsavel: "",
        nome_empresa: "",
        nicho: "",
        telefone: "",
        email: "",
        endereco: "",
        valor_ofertado: "",
        status: "novo",
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mover = useMutation({
    mutationFn: (v: { id: string; status: LeadStatus }) => updateLeadStatus(v.id, v.status),
    onSuccess: () => {
      toast.success("Status do lead atualizado");
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleOpenDialog = () => {
    // Inicializa o afiliado_id no form se for admin
    if (isAdmin) {
      setForm((f) => ({ ...f, afiliado_id: afiliados.data?.[0]?.id ?? "" }));
    }
    setOpen(true);
  };

  const termoBusca = busca.trim().toLowerCase();

  // Filtragem dos leads
  const listaFiltrada = (leads.data ?? []).filter((lead) => {
    // Se não for admin, só pode ver os próprios leads
    if (!isAdmin && lead.afiliado_id !== meuAfiliadoId) {
      return false;
    }

    // Filtro por afiliado (apenas admin usa isso, para afiliado o RLS já faz a filtragem no banco)
    if (isAdmin && filtroAfiliado !== "todos" && lead.afiliado_id !== filtroAfiliado) {
      return false;
    }

    // Busca por termo
    if (termoBusca) {
      const matchResponsavel = lead.nome_responsavel.toLowerCase().includes(termoBusca);
      const matchEmpresa = lead.nome_empresa.toLowerCase().includes(termoBusca);
      const matchNicho = (lead.nicho ?? "").toLowerCase().includes(termoBusca);
      return matchResponsavel || matchEmpresa || matchNicho;
    }

    return true;
  });

  return (
    <PortalLayout
      title="Cadastro de Leads"
      description={isAdmin ? "Gerencie todos os leads da rede." : "Cadastre e acompanhe seus leads comerciais."}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <div className="w-48">
              <Select value={filtroAfiliado} onValueChange={setFiltroAfiliado}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filtrar por Afiliado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Afiliados</SelectItem>
                  {(afiliados.data ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lead..."
              className="pl-8 h-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                {isAdmin && (
                  <div className="grid gap-1.5">
                    <Label>Afiliado Responsável</Label>
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
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="nome_responsavel">Nome do Responsável *</Label>
                  <Input
                    id="nome_responsavel"
                    placeholder="Ex: João Silva"
                    value={form.nome_responsavel}
                    onChange={(e) => setForm({ ...form, nome_responsavel: e.target.value })}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                  <Input
                    id="nome_empresa"
                    placeholder="Ex: ACME Ltda"
                    value={form.nome_empresa}
                    onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="nicho">Nicho / Setor</Label>
                    <Input
                      id="nicho"
                      placeholder="Ex: Tecnologia"
                      value={form.nicho}
                      onChange={(e) => setForm({ ...form, nicho: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="valor_ofertado">Valor Ofertado (R$)</Label>
                    <Input
                      id="valor_ofertado"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 5000"
                      value={form.valor_ofertado}
                      onChange={(e) => setForm({ ...form, valor_ofertado: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                    <Input
                      id="telefone"
                      placeholder="Ex: (11) 99999-9999"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contato@empresa.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="endereco">Endereço Comercial</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label>Etapa Inicial</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {etapasLeads.map((e) => (
                        <SelectItem key={e.status} value={e.status}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => criar.mutate()}
                  disabled={
                    !form.nome_responsavel.trim() ||
                    !form.nome_empresa.trim() ||
                    (isAdmin && !form.afiliado_id) ||
                    (!isAdmin && !meuAfiliadoId) ||
                    criar.isPending
                  }
                >
                  {criar.isPending ? "Salvando..." : "Salvar Lead"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {leads.isPending ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {etapasLeads.map((e) => (
            <Skeleton key={e.status} className="h-64 w-full" />
          ))}
        </div>
      ) : leads.isError ? (
        <p className="text-sm text-destructive">
          Erro ao carregar leads: {(leads.error as Error).message}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5 items-start">
          {etapasLeads.map((etapa) => {
            const itens = listaFiltrada.filter((l) => l.status === etapa.status);
            return (
              <Card key={etapa.status} className="min-h-56 bg-card/60 backdrop-blur-sm border-border/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold">{etapa.nome}</CardTitle>
                  <Badge variant="secondary" className="font-bold">
                    {itens.length}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 px-3">
                  {itens.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                      Sem leads nesta etapa
                    </p>
                  ) : (
                    itens.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-lg border border-border/50 bg-background/40 p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-foreground leading-tight">
                            {lead.nome_empresa}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3 shrink-0" />
                            {lead.nome_responsavel}
                          </p>
                          {lead.nicho && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Briefcase className="h-3 w-3 shrink-0" />
                              {lead.nicho}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-primary mt-1">
                            {brl(lead.valor_ofertado)}
                          </p>
                        </div>

                        {/* Informações Extras de Contato */}
                        <div className="mt-2 pt-2 border-t border-border/30 space-y-1 text-[11px] text-muted-foreground">
                          {lead.telefone && (
                            <p className="flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5 shrink-0" />
                              {lead.telefone}
                            </p>
                          )}
                          {lead.email && (
                            <p className="flex items-center gap-1 truncate">
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                              {lead.email}
                            </p>
                          )}
                          {lead.endereco && (
                            <p className="flex items-center gap-1 truncate">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {lead.endereco}
                            </p>
                          )}
                        </div>

                        {isAdmin && lead.afiliados && (
                          <div className="mt-2 pt-1 border-t border-border/20">
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">
                              Afiliado: {lead.afiliados.nome}
                            </span>
                          </div>
                        )}

                        <Select
                          value={lead.status}
                          onValueChange={(s) => mover.mutate({ id: lead.id, status: s as LeadStatus })}
                        >
                          <SelectTrigger className="mt-2 h-7 text-xs bg-background/50 border-border/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {etapasLeads.map((e) => (
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

      {!leads.isPending && listaFiltrada.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="Nenhum lead encontrado"
            description="Cadastre seu primeiro lead ou limpe os filtros para visualizar a lista."
          />
        </div>
      )}
    </PortalLayout>
  );
}
