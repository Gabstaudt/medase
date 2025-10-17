import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import HeaderBar from "@/components/layout/HeaderBar";
import { useState } from "react";

// Pages
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientForm from "./pages/PatientForm";
import PatientDetails from "./pages/PatientDetails";
import AIDetection from "./pages/AIDetection";
import Settings from "./pages/Settings";
import DoctorProfile from "./pages/DoctorProfile";
import ExamsMedications from "./pages/ExamsMedications";
import NotFound from "./pages/NotFound";
import { Register } from "./pages/Register";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthAwareLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rotas internas */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/patients/:id/edit" element={<PatientForm />} />
            <Route path="/exams-medications" element={<ExamsMedications />} />
            <Route path="/ai-detection" element={<AIDetection />} />
            <Route path="/profile" element={<DoctorProfile />} />
            <Route path="/settings" element={<Settings />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthAwareLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

// --------------------------------------------------
// Layout inteligente: oculta Sidebar nas rotas de login/cadastro
// --------------------------------------------------
export function AuthAwareLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Layout padrão do sistema
  return (
    <div className="min-h-screen bg-background">
      {/* ===== SIDEBAR FIXA A PARTIR DE md (≥768px) ===== */}
      <div className="hidden md:block">
        <aside className="fixed inset-y-0 left-0 z-40 w-64">
          <Sidebar className="h-full" />
        </aside>
      </div>

      {/* ===== SIDEBAR RECOLHÍVEL NO MOBILE (<768px) ===== */}
      <div className="md:hidden">
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>

      {/* ===== HEADER COM MENU (SOMENTE MOBILE) ===== */}
      <div className="fixed inset-x-0 top-0 z-30 md:hidden">
        <HeaderBar onMenuClick={() => setIsOpen(true)} />
      </div>

      {/* ===== CONTEÚDO PRINCIPAL =====
          - pt-14 só no mobile por causa do HeaderBar fixo
          - pl-64 a partir de md por causa da sidebar fixa
      */}
      <main className="pt-14 md:pt-0 md:pl-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
