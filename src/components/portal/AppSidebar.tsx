import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  Percent,
  Wallet,
  FileBarChart,
  ShieldCheck,
  GraduationCap,
  UserPlus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

const operacao = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pipeline de vendas", url: "/vendas", icon: TrendingUp },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "Afiliados", url: "/afiliados", icon: Users },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Treinamentos", url: "/treinamentos", icon: GraduationCap },
];

const financeiro = [
  { title: "Comissões", url: "/comissoes", icon: Percent },
  { title: "Financeiro", url: "/financeiro", icon: Wallet },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart },
  { title: "Auditoria", url: "/auditoria", icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const operacaoFiltrada = operacao.filter((item) => {
    if (!isAdmin) {
      if (item.url === "/afiliados") return false;
    }
    return true;
  });

  const financeiroFiltrado = financeiro.filter((item) => {
    if (!isAdmin) {
      if (item.url === "/relatorios" || item.url === "/auditoria") return false;
    }
    return true;
  });

  const renderItems = (items: typeof operacao) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
            <Link to={item.url} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            CX
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold">Cortex Engine</p>
              <p className="text-xs text-muted-foreground">Portal de Afiliados</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(operacaoFiltrada)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(financeiroFiltrado)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
