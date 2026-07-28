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

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
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

export async function createVenda(input: {
  afiliado_id: string;
  produto_id: string;
  cliente_nome: string;
  cliente_email?: string;
  valor: number;
  status: VendaStatus;
}) {
  const { error } = await supabase.from("vendas").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateVendaStatus(id: string, status: VendaStatus) {
  const { error } = await supabase.from("vendas").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateComissaoStatus(id: string, status: string) {
  const { error } = await supabase.from("comissoes").update({ status }).eq("id", id);
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
