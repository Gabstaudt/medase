import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser, isSecretary, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Brain,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const adminNavigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    href: "/patients",
    icon: Users,
  },
  {
    title: "Novo Paciente",
    href: "/patients/new",
    icon: UserPlus,
  },
  {
    title: "Exames & Medicamentos",
    href: "/exams-medications",
    icon: Stethoscope,
  },
  {
    title: "IA - Detecção",
    href: "/ai-detection",
    icon: Brain,
  },
  {
    title: "Meu Perfil",
    href: "/profile",
    icon: User,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

const secretaryNavigationItems = [
  {
    title: "Agenda da Médica",
    href: "/secretary",
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    href: "/secretary/patients",
    icon: Users,
  },
];

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const user = getCurrentUser();
  const secretaryMode = isSecretary();
  const navigationItems = secretaryMode
    ? secretaryNavigationItems
    : adminNavigationItems;

  const handleLogout = () => {
    if (!window.confirm("Tem certeza que deseja sair do sistema?")) return;

    logout();
    window.location.href = "/login";
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          isOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-white shadow-lg transition-transform duration-300 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className,
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div>
            <h1 className="text-xl font-bold text-medase-purple">Medase</h1>
            <p className="text-xs text-gray-500">
              {secretaryMode ? "Portal da Secretária" : "Painel Clínico"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-primary lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} to={item.href} onClick={onClose}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "h-11 w-full justify-start gap-3",
                      isActive && "bg-primary text-white shadow-sm",
                      !isActive &&
                        "text-gray-600 hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 px-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status Rápido
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {secretaryMode ? "Pacientes ativos" : "Pacientes ativos"}
                </span>
                <span className="font-medium text-primary">
                  {secretaryMode ? "24" : "124"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {secretaryMode ? "Agenda do dia" : "Análises IA (mês)"}
                </span>
                <span className="font-medium text-primary">
                  {secretaryMode ? "6" : "18"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span className="text-gray-600">
                  {secretaryMode ? "Pacientes em espera" : "Exames pendentes"}
                </span>
                <span className="font-medium text-amber-600">
                  {secretaryMode ? "2" : "7"}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-3 border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.name ?? "Usuário"}
              </p>
              <p className="text-xs text-gray-500">
                {secretaryMode ? "Secretária" : "Administrador"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="flex w-full items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair do Sistema
          </Button>
        </div>
      </aside>
    </>
  );
}
