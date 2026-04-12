import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getDefaultRouteForUser, isSecretary } from "@/lib/auth";
import { store } from "@/lib/store";
import { AIAnalysis, Patient } from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  Edit,
  Heart,
  Mail,
  Phone,
  Trash2,
  User,
} from "lucide-react";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const secretaryMode = isSecretary();
  const backRoute = secretaryMode ? "/secretary" : "/patients";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);

  useEffect(() => {
    if (!id) return;

    const foundPatient = store.getPatient(id);
    if (!foundPatient) {
      toast({
        title: "Erro",
        description: "Paciente nao encontrado.",
        variant: "destructive",
      });
      navigate(getDefaultRouteForUser());
      return;
    }

    setPatient(foundPatient);
    setAnalyses(store.getPatientAnalyses(id));
  }, [id, navigate, toast]);

  const handleDeletePatient = () => {
    if (!patient) return;
    if (!window.confirm(`Deseja remover ${patient.name}?`)) return;

    const deleted = store.deletePatient(patient.id);
    if (!deleted) {
      toast({
        title: "Erro",
        description: "Nao foi possivel excluir o paciente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Paciente removido",
      description: "O paciente foi removido com sucesso.",
    });
    navigate(backRoute);
  };

  if (!patient) {
    return <div>Carregando...</div>;
  }

  const age =
    new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" onClick={() => navigate(backRoute)}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {patient.name}
            </h1>
            <p className="mt-1 text-gray-600">
              {secretaryMode
                ? "Visualizacao restrita para a secretaria."
                : "Detalhes completos do paciente."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={`/patients/${patient.id}/edit`}>
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
            onClick={handleDeletePatient}
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-gray-600">
                  {age} anos • CPF {patient.cpf}
                </p>
                <p className="text-sm text-gray-500">
                  Nascimento: {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <Badge
              className={
                patient.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {patient.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Dados pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{new Date(patient.birthDate).toLocaleDateString("pt-BR")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Dados clinicos basicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Tipo sanguineo</p>
              <Badge variant="outline" className="mt-1">
                {patient.clinicalData.bloodType || "Nao informado"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Alergias</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {patient.clinicalData.allergies.length > 0 ? (
                  patient.clinicalData.allergies.map((allergy) => (
                    <Badge key={allergy} variant="secondary">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Nenhuma alergia registrada</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!secretaryMode && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Contato de emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>Nome: {patient.emergencyContact.name || "Nao informado"}</p>
              <p>Parentesco: {patient.emergencyContact.relationship || "Nao informado"}</p>
              <p>Telefone: {patient.emergencyContact.phone || "Nao informado"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Analises recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyses.length > 0 ? (
                analyses.map((analysis) => (
                  <div key={analysis.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">
                        {new Date(analysis.analyzedAt).toLocaleDateString("pt-BR")}
                      </span>
                      <Badge variant="outline">
                        {Math.round(analysis.results.confidence * 100)}% confianca
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {analysis.results.findings.join(", ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma analise registrada.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
