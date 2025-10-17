import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientCard } from "@/components/PatientCard";
import {
  Users,
  UserCheck,
  ClipboardList,
  Brain,
  TrendingUp,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";
import { store } from "@/lib/store";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(store.getDashboardStats());
  }, []);

  if (!stats) {
    return <div>Carregando...</div>;
  }

  const statCards = [
    {
      title: "Total de Pacientes",
      value: stats.totalPatients,
      icon: Users,
      description: "Pacientes cadastrados",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pacientes Ativos",
      value: stats.activePatients,
      icon: UserCheck,
      description: "Em acompanhamento",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Exames Pendentes",
      value: stats.pendingExams,
      icon: ClipboardList,
      description: "Aguardando execução",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Análises IA (Mês)",
      value: stats.aiAnalysesThisMonth,
      icon: Brain,
      description: "Detecções realizadas",
      color: "text-primary",
      bgColor: "bg-primary/5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 break-words">Visão geral do sistema Medase</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link to="/patients/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Paciente
            </Button>
          </Link>
          <Link to="/ai-detection" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Análise IA
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12% este mês</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Pacientes Recentes
              </CardTitle>
              <Link to="/patients">
                <Button variant="outline" size="sm">Ver Todos</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentPatients.slice(0, 3).map((patient) => (
                <PatientCard key={patient.id} patient={patient} compact />
              ))}
              {stats.recentPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhum paciente encontrado</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/patients/new">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Paciente
                </Button>
              </Link>
              <Link to="/ai-detection">
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Nova Análise IA
                </Button>
              </Link>
              <Link to="/patients">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Pacientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent AI Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análises IA Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentAnalyses.map((analysis) => {
                const patient =
                  stats.recentPatients.find((p) => p.id === analysis.patientId) ||
                  store.getPatients().find((p) => p.id === analysis.patientId);

                const riskColor =
                  analysis.results.riskLevel === "high"
                    ? "bg-red-100 text-red-800"
                    : analysis.results.riskLevel === "medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800";

                return (
                  <div key={analysis.id} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm break-words">
                        {patient?.name || "Paciente não encontrado"}
                      </span>
                      <Badge className={riskColor}>
                        {analysis.results.riskLevel === "high"
                          ? "Alto Risco"
                          : analysis.results.riskLevel === "medium"
                          ? "Médio Risco"
                          : "Baixo Risco"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      Confiança: {Math.round(analysis.results.confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(analysis.analyzedAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                );
              })}
              {stats.recentAnalyses.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhuma análise recente
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Alertas do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">Exames Pendentes</span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  {stats.pendingExams} exames aguardando execução
                </p>
              </div>
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium text-sm">Sistema Atualizado</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  IA Medase v2.1 funcionando normalmente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
