import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import * as React from "react";

interface HeaderBarProps {
  /** Acionado no mobile para abrir a Sidebar */
  onMenuClick?: () => void;
  /** Título exibido ao lado do logo/nome */
  title?: string;
  /** Classe extra opcional */
  className?: string;
  /** Slot para ações do lado direito (ex.: avatar, tema, etc.) */
  rightSlot?: React.ReactNode;
}

export function HeaderBar({
  onMenuClick,
  title = "Medase",
  className,
  rightSlot,
}: HeaderBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
        {/* Botão hambúrguer: só aparece no mobile */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Abrir navegação"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Branding / título */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold truncate">{title}</span>
          <span className="hidden sm:inline text-xs text-gray-500">
            • sistema clínico
          </span>
        </div>

        {/* Ações à direita */}
        <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}

export default HeaderBar;
