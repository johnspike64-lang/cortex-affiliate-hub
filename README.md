# Cortex Affiliate Hub

Você é um Desenvolvedor Full Stack Sênior especializado em React, TypeScript, Supabase, PostgreSQL, Tailwind CSS e arquitetura SaaS.

Sua missão é construir um sistema completo chamado:

PORTAL DE AFILIADOS - CORTEX ENGINE

O sistema deverá ser profissional, moderno, extremamente rápido, responsivo e preparado para milhares de afiliados.

NÃO gere protótipos.

NÃO utilize dados mockados.

Crie um sistema funcional utilizando Supabase como banco de dados, autenticação e armazenamento.

Todo o projeto deverá possuir código limpo, organizado e escalável.

====================================================

IDENTIDADE VISUAL

Empresa:

Cortex Studios

Produto:

Cortex Engine

Cores

Roxo #6C3BFF

Preto #111111

Branco

Cinza claro

Design inspirado em

Stripe

Hubspot

Pipedrive

Notion

Linear

Utilizar:

TailwindCSS

Shadcn UI

Lucide Icons

Responsivo

Dark Mode

Light Mode

====================================================

TIPOS DE USUÁRIO

Administrador

Afiliado

Cada usuário deve visualizar somente o que possuir permissão.

====================================================

LOGIN

Login

Cadastro

Esqueci minha senha

Troca de senha

Autenticação Supabase

====================================================

PAINEL ADMINISTRADOR

Dashboard contendo

Receita total

Vendas do mês

Leads recebidos

Leads em andamento

Reuniões agendadas

Propostas enviadas

Vendas fechadas

Vendas perdidas

Afiliados ativos

Comissões pendentes

Comissões pagas

Gráficos

Leads por mês

Vendas por mês

Comissões pagas

Conversão

Top afiliados

====================================================

CADASTRO DE PLANOS

O administrador poderá cadastrar quantos produtos desejar.

Campos

Nome

Descrição

Preço

Comissão fixa

ou

Comissão percentual

Imagem

Categoria

Produto ativo

Produto inativo

Exemplos

Landing Page

Site Profissional

Site Premium

Sistema

CRM

Automação

Chatbot

====================================================

REGRAS DE COMISSÃO

Cada plano deverá possuir

Preço

Comissão fixa

ou

Comissão em %

Permitir alterar futuramente.

====================================================

CAMPANHAS

Administrador poderá criar campanhas.

Nome

Data inicial

Data final

Comissão especial

Produtos participantes

Ao finalizar a campanha o sistema retorna automaticamente para comissão normal.

====================================================

CADASTRO DE AFILIADOS

Nome

Foto

WhatsApp

Email

CPF

PIX

Cidade

Estado

Data cadastro

Status

Ativo

Inativo

Suspenso

====================================================

ÁREA DO AFILIADO

Dashboard

Quantidade de Leads

Leads Qualificados

Reuniões

Vendas

Conversão

Comissões Pendentes

Comissões Pagas

Valor recebido

Valor previsto

Últimos Leads

Últimas vendas

====================================================

CADASTRO DE LEADS

Campos

Nome

Empresa

WhatsApp

Email

Cidade

Estado

Instagram

Site

Segmento

Produto de interesse

Valor estimado

Observações

Origem

Data

Afiliado responsável

====================================================

PIPELINE

Status

Lead recebido

Em análise

Contato realizado

Reunião agendada

Reunião realizada

Proposta enviada

Negociação

Venda fechada

Venda perdida

Cada alteração deverá registrar

Usuário

Data

Hora

Observação

Criar histórico completo.

====================================================

TIMELINE

Cada lead terá histórico.

Exemplo

Lead criado

Contato realizado

Reunião marcada

Reunião concluída

Proposta enviada

Venda fechada

Pagamento comissão

====================================================

VENDA

Quando o administrador marcar

Venda Fechada

O sistema deverá

Selecionar o plano vendido

Calcular automaticamente

Valor da comissão

Criar registro financeiro

Status

Pendente

====================================================

FINANCEIRO

Tela exclusiva

Lista

Todas as comissões

Filtros

Afiliado

Status

Período

Produto

Cidade

Pagamento

Campos

Valor

Comissão

Data

PIX

Observações

Status

Pendente

Pago

Cancelado

Botão

Registrar pagamento

Ao pagar

Registrar

Data

Hora

Forma

PIX

TED

Transferência

Observação

====================================================

ÁREA DO AFILIADO

Extrato completo

Leads

Vendas

Comissões

Pendentes

Pagas

Filtros

Exportar PDF

Exportar Excel

====================================================

NOTIFICAÇÕES

Enviar notificações internas quando

Lead recebido

Status alterado

Reunião marcada

Venda fechada

Comissão liberada

Comissão paga

Exibir sino de notificações.

====================================================

RANKING

Top Afiliados

Maior faturamento

Maior número de vendas

Maior conversão

Maior ticket médio

====================================================

RELATÓRIOS

Leads

Conversão

Receita

Comissões

Produtos vendidos

Afiliados

Exportação PDF

Excel

CSV

====================================================

BUSCA

Pesquisar qualquer

Lead

Empresa

Telefone

Email

Cidade

Produto

Afiliado

====================================================

FILTROS

Período

Cidade

Produto

Status

Afiliado

====================================================

UPLOADS

Foto do afiliado

Logo empresa

Anexos

Propostas

Contratos

====================================================

BANCO DE DADOS SUPABASE

Criar todas as tabelas necessárias com relacionamentos e constraints.

Exemplos

users

profiles

roles

plans

campaigns

affiliates

leads

lead_history

meetings

sales

commissions

commission_payments

notifications

documents

settings

audit_logs

====================================================

SEGURANÇA

Implementar Row Level Security (RLS) em todas as tabelas.

Administrador visualiza tudo.

Afiliado visualiza apenas seus próprios registros.

Nenhum usuário poderá acessar dados de outro afiliado.

====================================================

AUDITORIA

Registrar todas as ações

Login

Cadastro

Alterações

Exclusões

Mudança de status

Pagamento

====================================================

CONFIGURAÇÕES

Nome empresa

Logo

Cores

Dados PIX

Percentuais padrão

Configurações gerais

====================================================

PERFORMANCE

Paginação

Lazy Loading

Loading Skeleton

Cache

Consultas otimizadas

Responsividade total

Desktop

Tablet

Celular

====================================================

QUALIDADE

Código em TypeScript.

Componentização completa.

Hooks reutilizáveis.

Validação com Zod.

React Hook Form.

Separação por módulos.

Boas práticas SOLID.

Sem código duplicado.

Sem dados mockados.

Sem erros de compilação.

====================================================

ENTREGA

Gerar o sistema completamente funcional, pronto para produção, utilizando Supabase, React, TypeScript, Tailwind CSS e Shadcn UI, com banco estruturado, autenticação, permissões, dashboard, pipeline de vendas, controle de afiliados, cadastro de produtos, cálculo automático de comissões, gestão financeira, notificações, relatórios, exportações, auditoria e interface moderna. O sistema deve estar pronto para publicação, com código organizado, escalável e de fácil manutenção.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cortex-affiliate-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ae4fd28f-6225-44cf-a5c5-b0dbe1f0578b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
