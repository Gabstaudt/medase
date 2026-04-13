import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getDefaultRouteForUser, isSecretary } from "@/lib/auth";
import { store } from "@/lib/store";
import {
  AIAnalysis,
  DoctorAppointment,
  Patient,
  PatientExamRecord,
  PatientMedicationRecord,
} from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  Edit,
  FileText,
  Heart,
  Pill,
  Mail,
  Phone,
  PlusCircle,
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
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [examHistory, setExamHistory] = useState<PatientExamRecord[]>([]);
  const [medicationHistory, setMedicationHistory] = useState<PatientMedicationRecord[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointment | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentStatus, setAppointmentStatus] =
    useState<DoctorAppointment["status"]>("waiting");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState({
    name: "",
    date: "",
    status: "",
    result: "",
  });
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    period: "",
    status: "",
    description: "",
  });

  const syncPatientData = (patientId: string) => {
    const foundPatient = store.getPatient(patientId);
    if (!foundPatient) return;

    const patientAnalyses = store.getPatientAnalyses(patientId);
    const patientAppointments = store
      .getAppointments()
      .filter((appointment) => appointment.patientId === patientId);

    setPatient(foundPatient);
    setAnalyses(patientAnalyses);
    setAppointments(patientAppointments);
    setExamHistory(resolveExamHistory(foundPatient, patientAnalyses));
    setMedicationHistory(resolveMedicationHistory(foundPatient));
  };

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

    syncPatientData(id);
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
  const now = Date.now();
  const pastAppointments = appointments.filter(
    (appointment) => new Date(appointment.startsAt).getTime() < now,
  );
  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.startsAt).getTime() >= now,
  );

  const openAppointmentDetails = (appointment: DoctorAppointment) => {
    const startsAt = new Date(appointment.startsAt);
    setSelectedAppointment(appointment);
    setAppointmentDate(toDateInputValue(startsAt));
    setAppointmentTime(toTimeInputValue(startsAt));
    setAppointmentStatus(appointment.status);
    setAppointmentNotes(appointment.notes ?? "");
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentStatus("waiting");
    setAppointmentNotes("");
  };

  const handleSaveAppointment = () => {
    if (!selectedAppointment || !appointmentDate || !appointmentTime) return;

    const updated = store.updateAppointment(selectedAppointment.id, {
      startsAt: `${appointmentDate}T${appointmentTime}:00`,
      status: appointmentStatus,
      notes: appointmentNotes.trim() || undefined,
    });

    if (!updated) {
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar a consulta.",
        variant: "destructive",
      });
      return;
    }

    syncPatientData(patient.id);
    closeAppointmentDetails();
    toast({
      title: "Consulta atualizada",
      description: "As informacoes da consulta foram salvas.",
    });
  };

  const persistExamHistory = (nextHistory: PatientExamRecord[]) => {
    const updated = store.updatePatient(patient.id, {
      clinicalData: {
        ...patient.clinicalData,
        examHistory: nextHistory,
      },
    });

    if (updated) syncPatientData(patient.id);
  };

  const persistMedicationHistory = (nextHistory: PatientMedicationRecord[]) => {
    const updated = store.updatePatient(patient.id, {
      clinicalData: {
        ...patient.clinicalData,
        medicationHistory: nextHistory,
      },
    });

    if (updated) syncPatientData(patient.id);
  };

  const openNewExamDialog = () => {
    setEditingExamId(null);
    setExamForm({ name: "", date: "", status: "", result: "" });
    setIsExamDialogOpen(true);
  };

  const openEditExamDialog = (exam: PatientExamRecord) => {
    setEditingExamId(exam.id);
    setExamForm({
      name: exam.name,
      date: exam.date,
      status: exam.status,
      result: exam.result,
    });
    setIsExamDialogOpen(true);
  };

  const handleSaveExam = () => {
    if (!examForm.name || !examForm.date || !examForm.status || !examForm.result) return;

    const nextExam: PatientExamRecord = {
      id: editingExamId ?? `exam-${Date.now()}`,
      name: examForm.name,
      date: examForm.date,
      status: examForm.status,
      result: examForm.result,
    };

    const nextHistory = editingExamId
      ? examHistory.map((exam) => (exam.id === editingExamId ? nextExam : exam))
      : [nextExam, ...examHistory];

    persistExamHistory(nextHistory);
    setIsExamDialogOpen(false);
  };

  const handleDeleteExam = (examId: string) => {
    persistExamHistory(examHistory.filter((exam) => exam.id !== examId));
  };

  const openNewMedicationDialog = () => {
    setEditingMedicationId(null);
    setMedicationForm({ name: "", period: "", status: "", description: "" });
    setIsMedicationDialogOpen(true);
  };

  const openEditMedicationDialog = (medication: PatientMedicationRecord) => {
    setEditingMedicationId(medication.id);
    setMedicationForm({
      name: medication.name,
      period: medication.period,
      status: medication.status,
      description: medication.description,
    });
    setIsMedicationDialogOpen(true);
  };

  const handleSaveMedication = () => {
    if (
      !medicationForm.name ||
      !medicationForm.period ||
      !medicationForm.status ||
      !medicationForm.description
    ) {
      return;
    }

    const nextMedication: PatientMedicationRecord = {
      id: editingMedicationId ?? `med-${Date.now()}`,
      name: medicationForm.name,
      period: medicationForm.period,
      status: medicationForm.status,
      description: medicationForm.description,
    };

    const nextHistory = editingMedicationId
      ? medicationHistory.map((medication) =>
          medication.id === editingMedicationId ? nextMedication : medication,
        )
      : [nextMedication, ...medicationHistory];

    persistMedicationHistory(nextHistory);
    setIsMedicationDialogOpen(false);
  };

  const handleDeleteMedication = (medicationId: string) => {
    persistMedicationHistory(
      medicationHistory.filter((medication) => medication.id !== medicationId),
    );
  };

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
      )}

      <Tabs defaultValue="historico" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historico">Historico</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Ultimas consultas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastAppointments.length > 0 ? (
                  [...pastAppointments]
                    .sort(
                      (left, right) =>
                        new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime(),
                    )
                    .slice(0, 5)
                    .map((appointment) => (
                      <AppointmentHistoryCard
                        key={appointment.id}
                        appointment={appointment}
                        onClick={() => openAppointmentDetails(appointment)}
                      />
                    ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma consulta anterior registrada.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Proximas consultas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  [...upcomingAppointments]
                    .sort(
                      (left, right) =>
                        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
                    )
                    .slice(0, 5)
                    .map((appointment) => (
                      <AppointmentHistoryCard
                        key={appointment.id}
                        appointment={appointment}
                        onClick={() => openAppointmentDetails(appointment)}
                      />
                    ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma consulta futura agendada.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Historico das analises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyses.length > 0 ? (
                [...analyses]
                  .sort(
                    (left, right) =>
                      new Date(right.analyzedAt).getTime() - new Date(left.analyzedAt).getTime(),
                  )
                  .map((analysis) => (
                    <div key={analysis.id} className="rounded-xl border p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(analysis.analyzedAt).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-sm text-gray-600">{analysis.analyzedBy}</p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(analysis.results.confidence * 100)}% confianca
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-gray-700">
                        {analysis.results.findings.join(", ")}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Recomendacoes: {analysis.results.recommendations.join(", ")}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma analise registrada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exames" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Historico de exames e resultados
              </CardTitle>
              {!secretaryMode && (
                <Button variant="outline" onClick={openNewExamDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar registro
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {examHistory.length > 0 ? (
                examHistory.map((exam) => (
                  <div key={exam.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{exam.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(exam.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant="outline">{exam.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{exam.result}</p>
                    {!secretaryMode && (
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditExamDialog(exam)}>
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteExam(exam.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum exame registrado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicamentos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Historico de medicamentos
              </CardTitle>
              {!secretaryMode && (
                <Button variant="outline" onClick={openNewMedicationDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar registro
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {medicationHistory.length > 0 ? (
                medicationHistory.map((medication) => (
                  <div key={medication.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{medication.name}</p>
                        <p className="text-sm text-gray-600">{medication.period}</p>
                      </div>
                      <Badge variant="secondary">{medication.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{medication.description}</p>
                    {!secretaryMode && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditMedicationDialog(medication)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteMedication(medication.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhum medicamento associado ao historico do paciente.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedAppointment)} onOpenChange={(open) => !open && closeAppointmentDetails()}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Consulta</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-medium text-slate-900">
                  {selectedAppointment.doctorName} · {selectedAppointment.specialty}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(selectedAppointment.startsAt).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(selectedAppointment.startsAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="consult-date">Data</Label>
                  <Input
                    id="consult-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(event) => setAppointmentDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consult-time">Horario</Label>
                  <Input
                    id="consult-time"
                    type="time"
                    value={appointmentTime}
                    onChange={(event) => setAppointmentTime(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consult-status">Status</Label>
                <Select
                  value={appointmentStatus}
                  onValueChange={(value: DoctorAppointment["status"]) => setAppointmentStatus(value)}
                >
                  <SelectTrigger id="consult-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiting">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="cancelled">A reagendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consult-notes">Descritivo da consulta</Label>
                <Input
                  id="consult-notes"
                  value={appointmentNotes}
                  onChange={(event) => setAppointmentNotes(event.target.value)}
                  placeholder="Informacoes da consulta"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAppointmentDetails}>
              Fechar
            </Button>
            {!secretaryMode && selectedAppointment && new Date(selectedAppointment.startsAt).getTime() >= now && (
              <Button type="button" onClick={handleSaveAppointment}>
                Reagendar / salvar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingExamId ? "Editar exame" : "Adicionar exame"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Exame</Label>
              <Input
                id="exam-name"
                value={examForm.name}
                onChange={(event) => setExamForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exam-date">Data</Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={examForm.date}
                  onChange={(event) => setExamForm((current) => ({ ...current, date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-status">Status</Label>
                <Input
                  id="exam-status"
                  value={examForm.status}
                  onChange={(event) => setExamForm((current) => ({ ...current, status: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-result">Resultado</Label>
              <Input
                id="exam-result"
                value={examForm.result}
                onChange={(event) => setExamForm((current) => ({ ...current, result: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsExamDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveExam}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingMedicationId ? "Editar medicamento" : "Adicionar medicamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medicamento</Label>
              <Input
                id="med-name"
                value={medicationForm.name}
                onChange={(event) =>
                  setMedicationForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="med-period">Periodo</Label>
                <Input
                  id="med-period"
                  value={medicationForm.period}
                  onChange={(event) =>
                    setMedicationForm((current) => ({ ...current, period: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-status">Status</Label>
                <Input
                  id="med-status"
                  value={medicationForm.status}
                  onChange={(event) =>
                    setMedicationForm((current) => ({ ...current, status: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-description">Descricao</Label>
              <Input
                id="med-description"
                value={medicationForm.description}
                onChange={(event) =>
                  setMedicationForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMedicationDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveMedication}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppointmentHistoryCard({
  appointment,
  onClick,
}: {
  appointment: DoctorAppointment;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full rounded-xl border p-4 text-left transition hover:border-primary/40 hover:bg-slate-50"
      onClick={onClick}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-gray-900">
            {new Date(appointment.startsAt).toLocaleDateString("pt-BR")} às{" "}
            {new Date(appointment.startsAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-sm text-gray-600">
            {appointment.doctorName} · {appointment.specialty}
          </p>
        </div>
        <Badge
          className={
            appointment.status === "confirmed"
              ? "bg-emerald-100 text-emerald-800"
              : appointment.status === "waiting"
                ? "bg-amber-100 text-amber-800"
                : "bg-rose-100 text-rose-800"
          }
        >
          {appointment.status === "confirmed"
            ? "Confirmada"
            : appointment.status === "waiting"
              ? "Aguardando"
              : "A reagendar"}
        </Badge>
      </div>
      {appointment.notes && <p className="mt-3 text-sm text-gray-700">{appointment.notes}</p>}
    </button>
  );
}

function resolveExamHistory(patient: Patient, analyses: AIAnalysis[]) {
  if (patient.clinicalData.examHistory && patient.clinicalData.examHistory.length > 0) {
    return patient.clinicalData.examHistory;
  }

  const baseExams = analyses.flatMap((analysis) =>
    analysis.clinicalData.previousExams.map((examName) => ({
      id: `analysis-${analysis.id}-${examName}`,
      name: examName,
      date: analysis.analyzedAt.slice(0, 10),
      status: analysis.results.riskLevel === "high" ? "Requer atenção" : "Concluído",
      result: analysis.results.findings.join(", "),
    })),
  );

  if (patient.clinicalData.lastExam) {
    baseExams.unshift({
      id: "last-exam",
      name: "Último exame registrado",
      date: patient.clinicalData.lastExam,
      status: "Resultado disponível",
      result:
        patient.clinicalData.observations || "Sem observações adicionais registradas.",
    });
  }

  return baseExams;
}

function resolveMedicationHistory(patient: Patient) {
  if (
    patient.clinicalData.medicationHistory &&
    patient.clinicalData.medicationHistory.length > 0
  ) {
    return patient.clinicalData.medicationHistory;
  }

  return patient.clinicalData.medications.map((medication, index) => ({
    id: `medication-${index}-${medication}`,
    name: medication,
    period: "Uso atual registrado",
    status: "Em acompanhamento",
    description:
      patient.clinicalData.observations || "Sem observações adicionais para este medicamento.",
  }));
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
