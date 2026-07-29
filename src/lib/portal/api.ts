import { supabase } from "@/integrations/supabase/client";

export type VendaStatus =
  | "lead"
  | "negociacao"
  | "aguardando_pagamento"
  | "aprovada"
  | "reembolsada"
  | "cancelada";

export type AfiliadoStatus = "pendente" | "ativo" | "suspenso" | "bloqueado";

export interface Afiliado {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  documento: string | null;
  status: AfiliadoStatus;
  nivel: string | null;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  preco: number;
  comissao_percentual: number;
  ativo: boolean;
  created_at: string;
}

export interface Venda {
  id: string;
  afiliado_id: string | null;
  produto_id: string | null;
  cliente_nome: string | null;
  cliente_email: string | null;
  valor: number;
  status: VendaStatus;
  data_venda: string | null;
  created_at: string;
  afiliados?: { nome: string } | null;
  produtos?: { nome: string } | null;
}

export interface Comissao {
  id: string;
  venda_id: string | null;
  afiliado_id: string | null;
  base: number;
  percentual: number;
  valor: number;
  status: string;
  created_at: string;
  afiliados?: { nome: string } | null;
}

export interface Movimentacao {
  id: string;
  afiliado_id: string | null;
  tipo: string;
  valor: number;
  descricao: string | null;
  status: string;
  created_at: string;
  afiliados?: { nome: string } | null;
}

export interface AuditoriaLog {
  id: string;
  user_id: string | null;
  acao: string;
  entidade: string | null;
  entidade_id: string | null;
  dados: unknown;
  created_at: string;
}

export interface Saldo {
  afiliado_id: string;
  nome: string;
  saldo: number;
}

const sel = (s: string): string => s;

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const listAfiliados = async () =>
  unwrap<Afiliado[]>(
    await supabase.from("afiliados").select(sel("*")).order("created_at", { ascending: false }),
  );

export const listProdutos = async () =>
  unwrap<Produto[]>(
    await supabase.from("produtos").select(sel("*")).order("created_at", { ascending: false }),
  );

export const listVendas = async () =>
  unwrap<Venda[]>(
    await supabase
      .from("vendas")
      .select(sel("*, afiliados(nome), produtos(nome)"))
      .order("created_at", { ascending: false }),
  );

export const listComissoes = async () =>
  unwrap<Comissao[]>(
    await supabase
      .from("comissoes")
      .select(sel("*, afiliados(nome)"))
      .order("created_at", { ascending: false }),
  );

export const listMovimentacoes = async () =>
  unwrap<Movimentacao[]>(
    await supabase
      .from("movimentacoes")
      .select(sel("*, afiliados(nome)"))
      .order("created_at", { ascending: false }),
  );

export const listAuditoria = async () =>
  unwrap<AuditoriaLog[]>(
    await supabase
      .from("auditoria")
      .select(sel("*"))
      .order("created_at", { ascending: false })
      .limit(200),
  );

export const listSaldos = async () =>
  unwrap<Saldo[]>(await supabase.from("v_saldos").select(sel("*")));

export async function createAfiliado(input: {
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  nivel?: string;
}) {
  const { error } = await supabase.from("afiliados").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateAfiliadoStatus(id: string, status: AfiliadoStatus) {
  const { error } = await supabase.from("afiliados").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createProduto(input: {
  nome: string;
  categoria?: string;
  preco: number;
  comissao_percentual: number;
  descricao?: string;
}) {
  const { error } = await supabase.from("produtos").insert(input);
  if (error) throw new Error(error.message);
}

export async function toggleProduto(id: string, ativo: boolean) {
  const { error } = await supabase.from("produtos").update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateProduto(
  id: string,
  input: {
    nome: string;
    categoria?: string;
    preco: number;
    comissao_percentual: number;
    descricao?: string;
  }
) {
  const { error } = await supabase.from("produtos").update(input).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProduto(id: string) {
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}


async function handleCommissionForSale(
  vendaId: string,
  produtoId: string,
  afiliadoId: string,
  vendaValor: number
) {
  // Check if commission already exists for this sale
  const { data: existing } = await supabase
    .from("comissoes")
    .select("id")
    .eq("venda_id", vendaId)
    .maybeSingle();

  if (!existing) {
    // Fetch product commission percent/value
    const { data: produto } = await supabase
      .from("produtos")
      .select("comissao_percentual")
      .eq("id", produtoId)
      .single();

    const comissaoPercentual = produto?.comissao_percentual ?? 0;
    const comissaoValor = (vendaValor * comissaoPercentual) / 100;

    const { error } = await supabase.from("comissoes").insert({
      venda_id: vendaId,
      afiliado_id: afiliadoId,
      base: vendaValor,
      percentual: comissaoPercentual,
      valor: comissaoValor,
      status: "pendente",
    });
    if (error) throw new Error(error.message);
  }
}

export async function createVenda(input: {
  afiliado_id: string;
  produto_id: string;
  cliente_nome: string;
  cliente_email?: string;
  valor: number;
  status: VendaStatus;
}) {
  const { data, error } = await supabase.from("vendas").insert(input).select().single();
  if (error) throw new Error(error.message);

  if (input.status === "aprovada" && data) {
    await handleCommissionForSale(data.id, input.produto_id, input.afiliado_id, input.valor);
  }
}

export async function updateVendaStatus(id: string, status: VendaStatus) {
  const { error } = await supabase.from("vendas").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  if (status === "aprovada") {
    // Fetch sale details to get product and affiliate
    const { data: venda } = await supabase
      .from("vendas")
      .select("produto_id, afiliado_id, valor")
      .eq("id", id)
      .single();

    if (venda && venda.produto_id && venda.afiliado_id) {
      await handleCommissionForSale(id, venda.produto_id, venda.afiliado_id, venda.valor);
    }
  } else {
    // Remove pending commission if the sale is moved away from approved
    const { error: delError } = await supabase
      .from("comissoes")
      .delete()
      .eq("venda_id", id)
      .eq("status", "pendente");
    if (delError) throw new Error(delError.message);
  }
}

export async function updateComissaoStatus(id: string, status: string) {
  const { error } = await supabase.from("comissoes").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createComissao(input: {
  venda_id?: string | null;
  afiliado_id: string;
  base: number;
  percentual: number;
  valor: number;
  status: string;
}) {
  const { error } = await supabase.from("comissoes").insert(input);
  if (error) throw new Error(error.message);
}

export const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0));

export const dataBR = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString("pt-BR") : "—";

export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))].join(
    "\n",
  );
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  const csv = toCSV(rows);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- Treinamentos ---------------- */

export type MaterialTipo = "video" | "documento" | "quiz" | "link";

export interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: MaterialTipo;
  url: string;
  arquivo_path: string | null;
  modulo: string | null;
  ordem: number | null;
  publicado: boolean;
  created_at: string;
}

export const listMateriais = async () =>
  unwrap<Material[]>(
    await supabase
      .from("materiais")
      .select(sel("*"))
      .order("modulo", { ascending: true })
      .order("ordem", { ascending: true }),
  );

export async function uploadMaterialArquivo(file: File) {
  const path = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const { error } = await supabase.storage.from("treinamentos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("treinamentos").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function createMaterial(input: {
  titulo: string;
  descricao?: string;
  tipo: MaterialTipo;
  url: string;
  arquivo_path?: string | null;
  modulo?: string;
  ordem?: number;
  publicado?: boolean;
}) {
  const { error } = await supabase.from("materiais").insert(input);
  if (error) throw new Error(error.message);
}

export async function toggleMaterial(id: string, publicado: boolean) {
  const { error } = await supabase.from("materiais").update({ publicado }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteMaterial(id: string, arquivoPath?: string | null) {
  if (arquivoPath) await supabase.storage.from("treinamentos").remove([arquivoPath]);
  const { error } = await supabase.from("materiais").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------- Leads ---------------- */

export type LeadStatus = "novo" | "em_contato" | "negociacao" | "fechado" | "perdido";

export interface Lead {
  id: string;
  afiliado_id: string;
  nome_responsavel: string;
  nome_empresa: string;
  nicho: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  valor_ofertado: number;
  status: LeadStatus;
  created_at: string;
  afiliados?: { nome: string } | null;
}

export interface MaterialProgresso {
  id: string;
  user_id: string;
  material_id: string;
  concluido: boolean;
  created_at: string;
}

export const listLeads = async () =>
  unwrap<Lead[]>(
    await supabase
      .from("leads")
      .select(sel("*, afiliados(nome)"))
      .order("created_at", { ascending: false }),
  );

export async function createLead(input: {
  afiliado_id: string;
  nome_responsavel: string;
  nome_empresa: string;
  nicho?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  valor_ofertado: number;
  status?: LeadStatus;
}) {
  const { error } = await supabase.from("leads").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  if (status === "fechado") {
    // 1. Obter detalhes do lead
    const { data: lead } = await supabase
      .from("leads")
      .select("afiliado_id, nome_responsavel, email, valor_ofertado")
      .eq("id", id)
      .single();

    if (lead) {
      // Evitar duplicidade de venda para o mesmo lead/email
      const { data: existingSale } = await supabase
        .from("vendas")
        .select("id")
        .eq("afiliado_id", lead.afiliado_id)
        .eq("cliente_email", lead.email || "")
        .maybeSingle();

      if (!existingSale) {
        // Obter o primeiro produto ativo cadastrado no sistema
        const { data: produtos } = await supabase
          .from("produtos")
          .select("id")
          .eq("ativo", true)
          .limit(1);

        const produtoId = produtos?.[0]?.id || null;

        // 2. Registrar a venda com status aprovada
        const { data: newSale, error: saleError } = await supabase
          .from("vendas")
          .insert({
            afiliado_id: lead.afiliado_id,
            produto_id: produtoId,
            cliente_nome: lead.nome_responsavel,
            cliente_email: lead.email || null,
            valor: lead.valor_ofertado,
            status: "aprovada",
          })
          .select()
          .single();

        if (saleError) throw new Error(saleError.message);

        // 3. Gerar comissão correspondente
        if (newSale && produtoId) {
          await handleCommissionForSale(newSale.id, produtoId, lead.afiliado_id, lead.valor_ofertado);
        }
      }
    }
  }
}

/* ---------------- Progresso Treinamentos ---------------- */

export const listProgresso = async () =>
  unwrap<MaterialProgresso[]>(
    await supabase
      .from("materiais_progresso")
      .select(sel("*"))
  );

export const listProgressoTodos = async () =>
  unwrap<MaterialProgresso[]>(
    await supabase
      .from("materiais_progresso")
      .select(sel("*"))
  );

export async function toggleMaterialProgresso(materialId: string, concluido: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  if (concluido) {
    const { error } = await supabase
      .from("materiais_progresso")
      .upsert({ user_id: user.id, material_id: materialId, concluido: true }, { onConflict: "user_id,material_id" });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("materiais_progresso")
      .delete()
      .eq("user_id", user.id)
      .eq("material_id", materialId);
    if (error) throw new Error(error.message);
  }
}
