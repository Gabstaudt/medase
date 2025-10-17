import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Brain,
  Settings,
  FileText,
  AlertCircle,
  Stethoscope,
  LogOut,
  User,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/* ===============================
   Itens de navegação
================================ */
const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do sistema",
  },
  {
    title: "Pacientes",
    href: "/patients",
    icon: Users,
    description: "Lista de pacientes",
  },
  {
    title: "Novo Paciente",
    href: "/patients/new",
    icon: UserPlus,
    description: "Cadastrar paciente",
  },
  {
    title: "Exames & Medicamentos",
    href: "/exams-medications",
    icon: Stethoscope,
    description: "Cadastro de exames e medicamentos",
  },
  {
    title: "IA - Detecção",
    href: "/ai-detection",
    icon: Brain,
    description: "Análise de câncer cervical",
  },
  {
    title: "Meu Perfil",
    href: "/profile",
    icon: User,
    description: "Perfil do médico",
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Configurações do sistema",
  },
];

/* ===============================
   Tipagem das props
================================ */
interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

/* ===============================
   Componente principal
================================ */
export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair do sistema?")) {
      localStorage.removeItem("medase:user");
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* ===== BACKDROP (para o mobile) ===== */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      {/* ===== SIDEBAR ===== */}
      <aside
        className={cn(
          "fixed lg:static top-0 left-0 z-50 h-full w-64 flex flex-col border-r bg-white shadow-lg transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Cabeçalho */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold text-medase-purple">Medase</h1>

          {/* Botão fechar (só no mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-primary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navegação */}
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
                      "w-full justify-start gap-3 h-11",
                      isActive && "bg-primary text-white shadow-sm",
                      !isActive &&
                        "text-gray-600 hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <div>{item.title}</div>
                  </Button>
                </Link>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Quick Stats */}
          <div className="space-y-2 px-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status Rápido
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pacientes Ativos</span>
                <span className="font-medium text-primary">124</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Análises IA (mês)</span>
                <span className="font-medium text-primary">18</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span className="text-gray-600">Exames Pendentes</span>
                <span className="font-medium text-amber-600">7</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Rodapé */}
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Dr. Admin</p>
              <p className="text-xs text-gray-500">Sistema Ativo</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
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
