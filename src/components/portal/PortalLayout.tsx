import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, LogIn, Search } from "lucide-react";

import { AppSidebar } from "@/components/portal/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type PortalLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PortalLayout({ title, description, actions, children }: PortalLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar afiliado, produto ou venda" className="pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notificações">
                <Bell className="h-4 w-4" />
              </Button>
              <Button asChild size="sm">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
                  {description && (
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                {actions}
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
