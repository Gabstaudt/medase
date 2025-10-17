import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Calendar,
  FileText,
  Brain,
  Download,
} from "lucide-react";
import { store } from "@/lib/store";
import { Patient, AIAnalysis } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);

  useEffect(() => {
    if (id) {
      const foundPatient = store.getPatient(id);
      if (foundPatient) {
        setPatient(foundPatient);
        setAnalyses(store.getPatientAnalyses(id));
      } else {
        toast({
          title: "Erro",
          description: "Paciente não encontrado.",
          variant: "destructive",
        });
        navigate("/patients");
      }
    }
  }, [id, navigate, toast]);

  const handleDeletePatient = () => {
    if (id) {
      const success = store.deletePatient(id);
      if (success) {
        toast({
          title: "Paciente excluído",
          description: "O paciente foi removido do sistema com sucesso.",
        });
        navigate("/patients");
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o paciente.",
          variant: "destructive",
        });
      }
    }
  };

  if (!patient) {
    return <div>Carregando...</div>;
  }

  const age =
    new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
  const genderLabel =
    patient.gender === "female"
      ? "Feminino"
      : patient.gender === "male"
      ? "Masculino"
      : "Outro";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/patients")}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
              {patient.name}
            </h1>
            <p className="text-gray-600 mt-1 break-words">
              Informações detalhadas do paciente
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link to={`/patients/${patient.id}/edit`} className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2 w-full sm:w-auto">
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o paciente {patient.name}? Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePatient}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir Paciente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Patient Status Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 break-words">
                  {patient.name}
                </h2>
                <p className="text-gray-600">
                  {age} anos • {genderLabel}
                </p>
                <p className="text-sm text-gray-500 break-words">CPF: {patient.cpf}</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <Badge
                className={
                  patient.status === "active"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                {patient.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">
                Cadastrado em{" "}
                {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm text-gray-500">
                Atualizado em{" "}
                {new Date(patient.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Pessoal
          </TabsTrigger>
          <TabsTrigger value="clinical" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Clínico
          </TabsTrigger>
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Análises IA
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div className="min-w-0">
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600 break-words">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div className="min-w-0">
                    <p className="font-medium">Telefone</p>
                    <p className="text-gray-600 break-words">{patient.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600 break-words">
                  <p>
                    {patient.address.street}, {patient.address.number}
                  </p>
                  {patient.address.complement && (
                    <p className="break-words">{patient.address.complement}</p>
                  )}
                  <p>
                    {patient.address.city}, {patient.address.state}
                  </p>
                  <p>CEP: {patient.address.zipCode}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Contato de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium text-gray-900">Nome</p>
                  <p className="text-gray-600 break-words">
                    {patient.emergencyContact.name || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Parentesco</p>
                  <p className="text-gray-600 break-words">
                    {patient.emergencyContact.relationship || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Telefone</p>
                  <p className="text-gray-600 break-words">
                    {patient.emergencyContact.phone || "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Information Tab */}
        <TabsContent value="clinical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Basic Clinical Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Dados Clínicos Básicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Tipo Sanguíneo</p>
                    <Badge variant="outline" className="font-mono mt-1">
                      {patient.clinicalData.bloodType || "Não informado"}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Último Exame</p>
                    <p className="text-gray-600 mt-1">
                      {patient.clinicalData.lastExam
                        ? new Date(patient.clinicalData.lastExam).toLocaleDateString("pt-BR")
                        : "Nenhum exame registrado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Alergias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.clinicalData.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.clinicalData.allergies.map((allergy, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span className="break-words">{allergy}</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma alergia registrada</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Medicamentos em Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.clinicalData.medications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.clinicalData.medications.map((medication, index) => (
                    <Badge key={index} variant="outline">
                      <span className="break-words">{medication}</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum medicamento registrado</p>
              )}
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Histórico Médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.clinicalData.medicalHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.clinicalData.medicalHistory.map((condition, index) => (
                    <Badge key={index} variant="destructive">
                      <span className="break-words">{condition}</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma condição médica registrada</p>
              )}
            </CardContent>
          </Card>

          {/* Observations */}
          {patient.clinicalData.observations && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap break-words">
                  {patient.clinicalData.observations}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Analyses Tab */}
        <TabsContent value="analyses" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-semibold">Análises de IA Realizadas</h3>
            <Link to="/ai-detection" className="w-full sm:w-auto">
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Brain className="h-4 w-4" />
                Nova Análise
              </Button>
            </Link>
          </div>

          {analyses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analyses.map((analysis) => {
                const riskColor =
                  analysis.results.riskLevel === "high"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : analysis.results.riskLevel === "medium"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-green-100 text-green-800 border-green-200";

                return (
                  <Card key={analysis.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Detecção de Câncer Cervical</CardTitle>
                        <Badge className={riskColor}>
                          {analysis.results.riskLevel === "high"
                            ? "Alto Risco"
                            : analysis.results.riskLevel === "medium"
                            ? "Médio Risco"
                            : "Baixo Risco"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Analisado em{" "}
                        {new Date(analysis.analyzedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium">Confiança da Análise</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${analysis.results.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(analysis.results.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-2">Achados</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.results.findings.map((finding, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span className="break-words">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">Recomendações</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.results.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              <span className="break-words">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {analysis.results.requiresFollowUp && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 text-amber-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">Acompanhamento Necessário</span>
                          </div>
                          <p className="text-sm text-amber-700 mt-1">
                            Este resultado requer acompanhamento médico especializado.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Relatório
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma análise de IA realizada
                </h3>
                <p className="text-gray-500 mb-4">
                  Ainda não foram realizadas análises de inteligência artificial para este paciente.
                </p>
                <Link to="/ai-detection">
                  <Button>
                    <Brain className="h-4 w-4 mr-2" />
                    Realizar Primeira Análise
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Funcionalidade em Desenvolvimento
              </h3>
              <p className="text-gray-500">
                A funcionalidade de documentos será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
