import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import HeaderBar from "@/components/layout/HeaderBar";
import { useState, type ReactNode } from "react";
import {
  getCurrentUser,
  getDefaultRouteForUser,
  hasRole,
  isAuthenticated,
} from "@/lib/auth";

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
import SecretaryDashboard from "./pages/SecretaryDashboard";
import SecretaryPatients from "./pages/SecretaryPatients";

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

            <Route path="/" element={<Navigate to={getDefaultRouteForUser()} replace />} />

            <Route
              path="/secretary"
              element={
                <ProtectedRoute allowedRoles={["SECRETARIA"]}>
                  <SecretaryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/secretary/patients"
              element={
                <ProtectedRoute allowedRoles={["SECRETARIA"]}>
                  <SecretaryPatients />
                </ProtectedRoute>
              }
            />

            {/* Rotas internas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <PatientList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/new"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SECRETARIA"]}>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SECRETARIA"]}>
                  <PatientDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SECRETARIA"]}>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams-medications"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ExamsMedications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-detection"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AIDetection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthAwareLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: Array<"ADMIN" | "SECRETARIA">;
}) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to={getDefaultRouteForUser()} replace />;
  }

  return <>{children}</>;
}

// --------------------------------------------------
// Layout inteligente: oculta Sidebar nas rotas de login/cadastro
// --------------------------------------------------
export function AuthAwareLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  const user = getCurrentUser();

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
        <HeaderBar
          onMenuClick={() => setIsOpen(true)}
          title={user.role === "SECRETARIA" ? "Medase Secretária" : "Medase"}
        />
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
