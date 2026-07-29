import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Video,
  FileText,
  ListChecks,
  LinkIcon,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { EmptyState } from "@/components/portal/Panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMaterial,
  deleteMaterial,
  listMateriais,
  toggleMaterial,
  uploadMaterialArquivo,
  type MaterialTipo,
} from "@/lib/portal/api";

export const Route = createFileRoute("/treinamentos")({
  head: () => ({
    meta: [
      { title: "Treinamentos — Cortex Engine" },
      {
        name: "description",
        content:
          "Central de treinamentos: vídeos, documentos, quizzes e links de apoio para os afiliados.",
      },
      { property: "og:title", content: "Treinamentos — Cortex Engine" },
      {
        property: "og:description",
        content: "Publique vídeos, documentos e quizzes para capacitar sua rede de afiliados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Treinamentos,
});

const tipos: { value: MaterialTipo; label: string; icon: typeof Video }[] = [
  { value: "video", label: "Vídeo", icon: Video },
  { value: "documento", label: "Documento", icon: FileText },
  { value: "quiz", label: "Quiz", icon: ListChecks },
  { value: "link", label: "Link", icon: LinkIcon },
];

const iconePara = (t: MaterialTipo) => tipos.find((x) => x.value === t)?.icon ?? LinkIcon;

function Treinamentos() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [aba, setAba] = useState<"todos" | MaterialTipo>("todos");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "video" as MaterialTipo,
    url: "",
    modulo: "",
    ordem: "",
    publicado: true,
  });

  const materiais = useQuery({ queryKey: ["materiais"], queryFn: listMateriais });

  const criar = useMutation({
    mutationFn: async () => {
      let url = form.url.trim();
      let arquivo_path: string | null = null;
      if (file) {
        const up = await uploadMaterialArquivo(file);
        url = up.url;
        arquivo_path = up.path;
      }
      if (!url) throw new Error("Envie um arquivo ou informe uma URL.");
      await createMaterial({
        titulo: form.titulo,
        descricao: form.descricao || undefined,
        tipo: form.tipo,
        url,
        arquivo_path,
        modulo: form.modulo || undefined,
        ordem: form.ordem ? Number(form.ordem) : undefined,
        publicado: form.publicado,
      });
    },
    onSuccess: () => {
      toast.success("Material publicado");
      setOpen(false);
      setFile(null);
      setForm({
        titulo: "",
        descricao: "",
        tipo: "video",
        url: "",
        modulo: "",
        ordem: "",
        publicado: true,
      });
      qc.invalidateQueries({ queryKey: ["materiais"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: (v: { id: string; publicado: boolean }) => toggleMaterial(v.id, v.publicado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materiais"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: (v: { id: string; path?: string | null }) => deleteMaterial(v.id, v.path),
    onSuccess: () => {
      toast.success("Material removido");
      qc.invalidateQueries({ queryKey: ["materiais"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = (materiais.data ?? []).filter((m) => (aba === "todos" ? true : m.tipo === aba));

  const grupos = lista.reduce<Record<string, typeof lista>>((acc, m) => {
    const k = m.modulo || "Sem módulo";
    (acc[k] ??= []).push(m);
    return acc;
  }, {});

  return (
    <PortalLayout
      title="Treinamentos"
      description="Vídeos, documentos, quizzes e links de apoio para a rede de afiliados."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo material de treinamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Tipo</Label>
                  <Select
                    value={form.tipo}
                    onValueChange={(v) => setForm({ ...form, tipo: v as MaterialTipo })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="modulo">Módulo</Label>
                  <Input
                    id="modulo"
                    placeholder="Ex.: Onboarding"
                    value={form.modulo}
                    onChange={(e) => setForm({ ...form, modulo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="arquivo">Arquivo (vídeo, PDF, slides...)</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept="video/*,application/pdf,image/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Se preferir, cole apenas um link abaixo (YouTube, Google Forms, Drive).
                </p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  disabled={!!file}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 items-end gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="ordem">Ordem</Label>
                  <Input
                    id="ordem"
                    type="number"
                    value={form.ordem}
                    onChange={(e) => setForm({ ...form, ordem: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch
                    id="publicado"
                    checked={form.publicado}
                    onCheckedChange={(v) => setForm({ ...form, publicado: v })}
                  />
                  <Label htmlFor="publicado">Publicado</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => criar.mutate()}
                disabled={!form.titulo.trim() || criar.isPending}
              >
                {criar.isPending ? "Enviando..." : "Publicar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <Tabs value={aba} onValueChange={(v) => setAba(v as typeof aba)}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            {tipos.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {materiais.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : materiais.isError ? (
          <p className="text-sm text-destructive">
            Erro ao carregar treinamentos: {(materiais.error as Error).message}
          </p>
        ) : lista.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Nenhum material publicado"
            description="Suba vídeos, documentos ou links de quiz para capacitar seus afiliados."
          />
        ) : (
          Object.entries(grupos).map(([modulo, itens]) => (
            <Card key={modulo}>
              <CardHeader>
                <CardTitle className="text-base">{modulo}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {itens.map((m) => {
                  const Icon = iconePara(m.tipo);
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col gap-3 rounded-lg border border-border/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                          <Icon className="h-4 w-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{m.titulo}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {m.descricao ?? "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{m.tipo}</Badge>
                        <Badge variant={m.publicado ? "default" : "outline"}>
                          {m.publicado ? "publicado" : "rascunho"}
                        </Badge>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <Button asChild size="sm" variant="outline">
                          <a href={m.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Abrir
                          </a>
                        </Button>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={m.publicado}
                            onCheckedChange={(v) =>
                              alternar.mutate({ id: m.id, publicado: v })
                            }
                            aria-label="Publicar material"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remover material"
                            onClick={() =>
                              remover.mutate({ id: m.id, path: m.arquivo_path })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PortalLayout>
  );
}
