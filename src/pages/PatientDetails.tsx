import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { deletePatient, fetchPatient } from "@/lib/patient-api";
import { getDefaultRouteForUser, isSecretary } from "@/lib/auth";
import { Patient } from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  Edit,
  FileText,
  Heart,
  Mail,
  Phone,
  Pill,
  User,
} from "lucide-react";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const secretaryMode = isSecretary();
  const backRoute = secretaryMode ? "/secretary/patients" : "/patients";

  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadPatient = async () => {
      try {
        setPatient(await fetchPatient(id));
      } catch {
        toast({
          title: "Erro",
          description: "Paciente não encontrado.",
          variant: "destructive",
        });
        navigate(getDefaultRouteForUser());
      }
    };

    void loadPatient();
  }, [id, navigate, toast]);

  const handleDeletePatient = async () => {
    if (!patient) return;
    if (!window.confirm(`Deseja remover ${patient.name}?`)) return;

    try {
      await deletePatient(patient.id);
      toast({
        title: "Paciente removido",
        description: "O paciente foi removido com sucesso.",
      });
      navigate(backRoute);
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível excluir o paciente.",
        variant: "destructive",
      });
    }
  };

  if (!patient) {
    return <div>Carregando...</div>;
  }

  const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" onClick={() => navigate(backRoute)}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{patient.name}</h1>
            <p className="mt-1 text-gray-600">
              {secretaryMode
                ? "Visualização restrita para a secretária."
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
            onClick={() => void handleDeletePatient()}
          >
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
            <Badge className="bg-emerald-100 text-emerald-800">Ativo</Badge>
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
            <p>Gênero: {patient.gender === "female" ? "Feminino" : patient.gender === "male" ? "Masculino" : "Outro"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Dados clínicos básicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Tipo sanguíneo</p>
              <Badge variant="outline" className="mt-1">
                {patient.clinicalData.bloodType || "Não informado"}
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
            <div>
              <p className="text-sm font-medium text-gray-900">Último exame</p>
              <p className="mt-1 text-sm text-gray-600">
                {patient.clinicalData.lastExam
                  ? new Date(patient.clinicalData.lastExam).toLocaleDateString("pt-BR")
                  : "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Contato de emergência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>Nome: {patient.emergencyContact.name || "Não informado"}</p>
          <p>Parentesco: {patient.emergencyContact.relationship || "Não informado"}</p>
          <p>Telefone: {patient.emergencyContact.phone || "Não informado"}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="historico" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Histórico clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-medium text-gray-900">Dados clínicos</p>
                <p className="mt-1">{patient.clinicalData.observations || "Sem dados adicionais registrados."}</p>
              </div>
              {!secretaryMode && (
                <div>
                  <p className="font-medium text-gray-900">Histórico médico</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {patient.clinicalData.medicalHistory.length > 0 ? (
                      patient.clinicalData.medicalHistory.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">Nenhum histórico médico registrado.</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exames">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Exames
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              <p>Último exame registrado: {patient.clinicalData.lastExam || "Não informado"}</p>
              <p className="mt-2 text-gray-500">
                O histórico detalhado de exames ainda não foi integrado ao backend.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicamentos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Medicamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!secretaryMode && patient.clinicalData.medications.length > 0 ? (
                patient.clinicalData.medications.map((medication) => (
                  <Badge key={medication} variant="outline">
                    {medication}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {secretaryMode
                    ? "Campos exclusivos do médico não são exibidos para a secretária."
                    : "Nenhum medicamento registrado."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
