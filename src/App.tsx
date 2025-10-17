import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";

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
function AuthAwareLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthRoute) {
    // Não mostra Sidebar nas telas de autenticação
    return <>{children}</>;
  }

  // Layout padrão do sistema
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
