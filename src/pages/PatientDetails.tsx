import { type ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { deletePatient, fetchPatient } from "@/lib/patient-api";
import {
  createExamCatalogItem,
  createMedicationCatalogItem,
  createPatientExamRecord,
  createPatientHistory,
  createPatientMedicationRecord,
  deletePatientExamRecord,
  deletePatientHistory,
  deletePatientMedicationRecord,
  fetchExamCatalog,
  fetchMedicationCatalog,
  fetchPatientExamRecords,
  fetchPatientHistory,
  fetchPatientMedicationRecords,
  updatePatientExamRecord,
  updatePatientHistory,
  updatePatientMedicationRecord,
  type ExamCatalogItem,
  type MedicationCatalogItem,
  type PatientHistoryItem,
} from "@/lib/patient-clinical-api";
import { getDefaultRouteForUser, isSecretary } from "@/lib/auth";
import { type Patient, type PatientExamRecord, type PatientMedicationRecord } from "@/lib/types";
import { AlertTriangle, ArrowLeft, Edit, FileText, Heart, Mail, Phone, Pill, PlusCircle, Trash2, User } from "lucide-react";

type Mode = "existing" | "new";

function getRecordStatusClass(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("concl")) {
    return "rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700";
  }
  if (normalized.includes("andamento") || normalized.includes("agend")) {
    return "rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700";
  }
  if (normalized.includes("cancel") || normalized.includes("reag")) {
    return "rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700";
  }
  return "rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700";
}

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const secretaryMode = isSecretary();
  const backRoute = secretaryMode ? "/secretary/patients" : "/patients";
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<PatientHistoryItem[]>([]);
  const [examRecords, setExamRecords] = useState<PatientExamRecord[]>([]);
  const [medicationRecords, setMedicationRecords] = useState<PatientMedicationRecord[]>([]);
  const [examCatalog, setExamCatalog] = useState<ExamCatalogItem[]>([]);
  const [medicationCatalog, setMedicationCatalog] = useState<MedicationCatalogItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [medicationOpen, setMedicationOpen] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<Mode>("existing");
  const [medicationMode, setMedicationMode] = useState<Mode>("existing");
  const [historyForm, setHistoryForm] = useState({ titulo: "", descricao: "", data_registro: "" });
  const [examForm, setExamForm] = useState({ selectedCatalogId: "", nome: "", categoria: "laboratorial" as ExamCatalogItem["categoria"], descricaoCatalogo: "", data_exame: "", status: "", resultado: "", observacoes: "", pdf_nome: "", pdf_url: "" });
  const [medicationForm, setMedicationForm] = useState({ selectedCatalogId: "", nome: "", principio_ativo: "", dosagemCatalogo: "", forma_farmaceutica: "comprimido" as MedicationCatalogItem["forma_farmaceutica"], fabricante: "", dosagemPaciente: "", periodo: "", status: "", descricao: "", observacoes: "" });

  const loadAll = async (patientId: string) => {
    const patientData = await fetchPatient(patientId);
    setPatient(patientData);
    if (!secretaryMode) {
      const [h, e, m, ec, mc] = await Promise.all([
        fetchPatientHistory(patientId),
        fetchPatientExamRecords(patientId),
        fetchPatientMedicationRecords(patientId),
        fetchExamCatalog(),
        fetchMedicationCatalog(),
      ]);
      setHistory(h);
      setExamRecords(e);
      setMedicationRecords(m);
      setExamCatalog(ec);
      setMedicationCatalog(mc);
    }
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        await loadAll(id);
      } catch {
        toast({ title: "Erro", description: "Paciente não encontrado.", variant: "destructive" });
        navigate(getDefaultRouteForUser());
      }
    };
    void load();
  }, [id, secretaryMode]);

  if (!patient) return <div>Carregando...</div>;

  const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  const handleDeletePatient = async () => {
    if (!window.confirm(`Deseja remover ${patient.name}?`)) return;
    try {
      await deletePatient(patient.id);
      toast({ title: "Paciente removido", description: "O paciente foi removido com sucesso." });
      navigate(backRoute);
    } catch (error) {
      toast({ title: "Erro", description: error instanceof Error ? error.message : "Não foi possível excluir o paciente.", variant: "destructive" });
    }
  };

  const handleExamFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setExamForm((current) => ({ ...current, pdf_nome: "", pdf_url: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setExamForm((current) => ({ ...current, pdf_nome: file.name, pdf_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearExamFile = () => {
    setExamForm((current) => ({ ...current, pdf_nome: "", pdf_url: "" }));
  };

  const openExamEditor = (exam: PatientExamRecord) => {
    const catalog = examCatalog.find((item) => item.nome === exam.name);
    const nextMode: Mode = catalog ? "existing" : "new";

    setEditingExamId(exam.id);
    setExamMode(nextMode);
    setExamForm({
      selectedCatalogId: catalog ? String(catalog.exame_id) : "",
      nome: exam.name,
      categoria: catalog?.categoria || "laboratorial",
      descricaoCatalogo: exam.description || "",
      data_exame: exam.date,
      status: exam.status,
      resultado: exam.result,
      observacoes: exam.observations || "",
      pdf_nome: exam.pdfName || "",
      pdf_url: exam.pdfUrl || "",
    });
    setExamOpen(true);
  };

  const saveHistory = async () => {
    if (!id || !historyForm.titulo || !historyForm.descricao || !historyForm.data_registro) return;
    try {
      if (editingHistoryId) await updatePatientHistory(id, editingHistoryId, historyForm);
      else await createPatientHistory(id, historyForm);
      setHistory(await fetchPatientHistory(id));
      setHistoryOpen(false);
      setEditingHistoryId(null);
      setHistoryForm({ titulo: "", descricao: "", data_registro: "" });
    } catch (error) {
      toast({ title: "Erro", description: error instanceof Error ? error.message : "Não foi possível salvar o histórico.", variant: "destructive" });
    }
  };

  const saveExam = async () => {
    if (!id) return;
    try {
      let nome = examForm.nome.trim();
      if (examMode === "existing") {
        const catalog = examCatalog.find((item) => String(item.exame_id) === examForm.selectedCatalogId);
        if (!catalog) throw new Error("Selecione um exame do catálogo.");
        nome = catalog.nome;
      } else {
        if (!nome) throw new Error("Informe o nome do exame.");
        const created = await createExamCatalogItem({ nome, descricao: examForm.descricaoCatalogo || nome, categoria: examForm.categoria, preco: 0 });
        setExamCatalog((current) => [created, ...current]);
        nome = created.nome;
      }
      const payload = { nome, data_exame: examForm.data_exame || "", status: examForm.status || "", resultado: examForm.resultado || "", observacoes: examForm.observacoes || null, pdf_nome: examForm.pdf_nome || null, pdf_url: examForm.pdf_url || null, descricao: examMode === "new" ? examForm.descricaoCatalogo || null : null };
      if (editingExamId) await updatePatientExamRecord(id, editingExamId, payload);
      else await createPatientExamRecord(id, payload);
      setExamRecords(await fetchPatientExamRecords(id));
      setExamOpen(false);
      setEditingExamId(null);
      setExamMode("existing");
      setExamForm({ selectedCatalogId: "", nome: "", categoria: "laboratorial", descricaoCatalogo: "", data_exame: "", status: "", resultado: "", observacoes: "", pdf_nome: "", pdf_url: "" });
    } catch (error) {
      toast({ title: "Erro", description: error instanceof Error ? error.message : "Não foi possível salvar o exame.", variant: "destructive" });
    }
  };

  const saveMedication = async () => {
    if (!id) return;
    try {
      let nome = medicationForm.nome.trim();
      let dosagem = medicationForm.dosagemPaciente.trim() || null;
      if (medicationMode === "existing") {
        const catalog = medicationCatalog.find((item) => String(item.medicamento_id) === medicationForm.selectedCatalogId);
        if (!catalog) throw new Error("Selecione um medicamento do catálogo.");
        nome = catalog.nome;
        if (!dosagem) dosagem = catalog.dosagem || null;
      } else {
        if (!nome) throw new Error("Informe o nome do medicamento.");
        const created = await createMedicationCatalogItem({ nome, principio_ativo: medicationForm.principio_ativo, dosagem: medicationForm.dosagemCatalogo, forma_farmaceutica: medicationForm.forma_farmaceutica, fabricante: medicationForm.fabricante, descricao: medicationForm.descricao || null });
        setMedicationCatalog((current) => [created, ...current]);
        nome = created.nome;
        if (!dosagem) dosagem = created.dosagem || null;
      }
      const payload = { nome, dosagem, periodo: medicationForm.periodo || "", status: medicationForm.status || "", descricao: medicationForm.descricao || "", observacoes: medicationForm.observacoes || null };
      if (editingMedicationId) await updatePatientMedicationRecord(id, editingMedicationId, payload);
      else await createPatientMedicationRecord(id, payload);
      setMedicationRecords(await fetchPatientMedicationRecords(id));
      setMedicationOpen(false);
      setEditingMedicationId(null);
      setMedicationMode("existing");
      setMedicationForm({ selectedCatalogId: "", nome: "", principio_ativo: "", dosagemCatalogo: "", forma_farmaceutica: "comprimido", fabricante: "", dosagemPaciente: "", periodo: "", status: "", descricao: "", observacoes: "" });
    } catch (error) {
      toast({ title: "Erro", description: error instanceof Error ? error.message : "Não foi possível salvar o medicamento.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" onClick={() => navigate(backRoute)}><ArrowLeft className="h-4 w-4" />Voltar</Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{patient.name}</h1>
            <p className="mt-1 text-gray-600">{secretaryMode ? "Visualização restrita para a secretária." : "Histórico clínico completo do paciente."}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={`/patients/${patient.id}/edit`}><Button variant="outline" className="w-full gap-2 sm:w-auto"><Edit className="h-4 w-4" />Editar</Button></Link>
          <Button variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 sm:w-auto" onClick={() => void handleDeletePatient()}><Trash2 className="h-4 w-4" />Remover</Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-primary"><CardContent className="p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><User className="h-8 w-8 text-primary" /></div><div><h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2><p className="text-gray-600">{age} anos • CPF {patient.cpf}</p><p className="text-sm text-gray-500">Nascimento: {new Date(patient.birthDate).toLocaleDateString("pt-BR")}</p></div></div><Badge className="bg-emerald-100 text-emerald-800">Ativo</Badge></div></CardContent></Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Dados pessoais</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-gray-700"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{patient.email}</span></div><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{patient.phone}</span></div><p>Gênero: {patient.gender === "female" ? "Feminino" : patient.gender === "male" ? "Masculino" : "Outro"}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" />Dados clínicos básicos</CardTitle></CardHeader><CardContent className="space-y-4"><div><p className="text-sm font-medium text-gray-900">Tipo sanguíneo</p><Badge variant="outline" className="mt-1">{patient.clinicalData.bloodType || "Não informado"}</Badge></div><div><p className="text-sm font-medium text-gray-900">Alergias</p><div className="mt-2 flex flex-wrap gap-2">{patient.clinicalData.allergies.length > 0 ? patient.clinicalData.allergies.map((allergy) => <Badge key={allergy} variant="secondary">{allergy}</Badge>) : <span className="text-sm text-gray-500">Nenhuma alergia registrada</span>}</div></div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" />Contato de emergência</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-gray-700"><p>Nome: {patient.emergencyContact.name || "Não informado"}</p><p>Parentesco: {patient.emergencyContact.relationship || "Não informado"}</p><p>Telefone: {patient.emergencyContact.phone || "Não informado"}</p></CardContent></Card>

      <Tabs defaultValue="historico" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="historico">Histórico</TabsTrigger><TabsTrigger value="exames">Exames</TabsTrigger><TabsTrigger value="medicamentos">Medicamentos</TabsTrigger></TabsList>
        <TabsContent value="historico"><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Histórico clínico</CardTitle>{!secretaryMode && <Button variant="outline" onClick={() => setHistoryOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button>}</CardHeader><CardContent className="space-y-3">{secretaryMode ? <p className="text-sm text-gray-500">Histórico clínico detalhado é acessível apenas ao médico.</p> : history.length > 0 ? history.map((item) => <div key={item.historico_id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-gray-900">{item.titulo}</p><p className="text-sm text-gray-500">{new Date(item.data_registro).toLocaleDateString("pt-BR")}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setEditingHistoryId(String(item.historico_id)); setHistoryForm({ titulo: item.titulo, descricao: item.descricao, data_registro: item.data_registro }); setHistoryOpen(true); }}>Editar</Button><Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => void deletePatientHistory(patient.id, String(item.historico_id)).then(async () => setHistory(await fetchPatientHistory(patient.id)))}>Excluir</Button></div></div><p className="mt-3 text-sm text-gray-700">{item.descricao}</p></div>) : <p className="text-sm text-gray-500">Nenhum histórico clínico registrado.</p>}</CardContent></Card></TabsContent>
        <TabsContent value="exames"><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Exames e resultados</CardTitle>{!secretaryMode && <Button variant="outline" onClick={() => setExamOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button>}</CardHeader><CardContent className="space-y-3">{secretaryMode ? <p className="text-sm text-gray-500">O histórico de exames detalhado é acessível apenas ao médico.</p> : examRecords.length > 0 ? examRecords.map((exam) => <div key={exam.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-gray-900">{exam.name}</p><p className="text-sm text-gray-500">{new Date(exam.date).toLocaleDateString("pt-BR")}</p></div><div className="flex gap-2"><span className={getRecordStatusClass(exam.status)}>{exam.status}</span><Button variant="outline" size="sm" onClick={() => openExamEditor(exam)}>Editar</Button><Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => void deletePatientExamRecord(patient.id, exam.id).then(async () => setExamRecords(await fetchPatientExamRecords(patient.id)))}>Excluir</Button></div></div><p className="mt-3 text-sm text-gray-700">{exam.result}</p>{exam.description && <p className="mt-2 text-sm text-gray-500">{exam.description}</p>}{exam.observations && <p className="mt-2 text-sm text-gray-500">Observa??es: {exam.observations}</p>}{exam.pdfName && exam.pdfUrl && <a href={exam.pdfUrl} download={exam.pdfName} className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">Baixar arquivo: {exam.pdfName}</a>}{exam.pdfName && !exam.pdfUrl && <p className="mt-2 text-sm text-gray-400">Arquivo anexado: {exam.pdfName}</p>}</div>) : <p className="text-sm text-gray-500">Nenhum exame registrado.</p>}</CardContent></Card></TabsContent>
        <TabsContent value="medicamentos"><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary" />Medicamentos</CardTitle>{!secretaryMode && <Button variant="outline" onClick={() => setMedicationOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button>}</CardHeader><CardContent className="space-y-3">{secretaryMode ? <p className="text-sm text-gray-500">O histórico de medicamentos é acessível apenas ao médico.</p> : medicationRecords.length > 0 ? medicationRecords.map((medication) => <div key={medication.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-gray-900">{medication.name}</p><p className="text-sm text-gray-500">{medication.period}</p></div><div className="flex gap-2"><Badge variant="outline">{medication.status}</Badge><Button variant="outline" size="sm" onClick={() => { setEditingMedicationId(medication.id); setMedicationMode("existing"); setMedicationForm({ selectedCatalogId: "", nome: medication.name, principio_ativo: "", dosagemCatalogo: "", forma_farmaceutica: "comprimido", fabricante: "", dosagemPaciente: "", periodo: medication.period, status: medication.status, descricao: medication.description, observacoes: "" }); setMedicationOpen(true); }}>Editar</Button><Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => void deletePatientMedicationRecord(patient.id, medication.id).then(async () => setMedicationRecords(await fetchPatientMedicationRecords(patient.id)))}>Excluir</Button></div></div><p className="mt-3 text-sm text-gray-700">{medication.description}</p></div>) : <p className="text-sm text-gray-500">Nenhum medicamento registrado.</p>}</CardContent></Card></TabsContent>
      </Tabs>

      <Dialog open={historyOpen} onOpenChange={(open) => { setHistoryOpen(open); if (!open) { setEditingHistoryId(null); setHistoryForm({ titulo: "", descricao: "", data_registro: "" }); } }}><DialogContent className="sm:max-w-[620px]"><DialogHeader><DialogTitle>{editingHistoryId ? "Editar histórico clínico" : "Adicionar histórico clínico"}</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Título</Label><Input value={historyForm.titulo} onChange={(e) => setHistoryForm((c) => ({ ...c, titulo: e.target.value }))} /></div><div className="space-y-2"><Label>Data</Label><Input type="date" value={historyForm.data_registro} onChange={(e) => setHistoryForm((c) => ({ ...c, data_registro: e.target.value }))} /></div><div className="space-y-2"><Label>Descrição</Label><Textarea rows={4} value={historyForm.descricao} onChange={(e) => setHistoryForm((c) => ({ ...c, descricao: e.target.value }))} /></div></div><DialogFooter><Button variant="outline" onClick={() => setHistoryOpen(false)}>Cancelar</Button><Button onClick={() => void saveHistory()}>Salvar</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={examOpen} onOpenChange={(open) => { setExamOpen(open); if (!open) { setEditingExamId(null); setExamMode("existing"); setExamForm({ selectedCatalogId: "", nome: "", categoria: "laboratorial", descricaoCatalogo: "", data_exame: "", status: "", resultado: "", observacoes: "", pdf_nome: "", pdf_url: "" }); } }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]"><DialogHeader><DialogTitle>{editingExamId ? "Editar exame do paciente" : "Adicionar exame"}</DialogTitle></DialogHeader><div className="space-y-4"><div className="grid grid-cols-2 gap-2"><Button type="button" variant={examMode === "existing" ? "default" : "outline"} onClick={() => setExamMode("existing")}>Selecionar existente</Button><Button type="button" variant={examMode === "new" ? "default" : "outline"} onClick={() => setExamMode("new")}>Criar novo no catálogo</Button></div>{examMode === "existing" ? <div className="space-y-2"><Label>Exame do catálogo</Label><Select value={examForm.selectedCatalogId} onValueChange={(value) => setExamForm((c) => ({ ...c, selectedCatalogId: value }))}><SelectTrigger><SelectValue placeholder="Selecione um exame" /></SelectTrigger><SelectContent>{examCatalog.map((exam) => <SelectItem key={exam.exame_id} value={String(exam.exame_id)}>{exam.nome}</SelectItem>)}</SelectContent></Select></div> : <div className="space-y-3 rounded-xl border p-4"><div className="space-y-2"><Label>Nome do novo exame</Label><Input value={examForm.nome} onChange={(e) => setExamForm((c) => ({ ...c, nome: e.target.value }))} /></div><div className="space-y-2"><Label>Descrição do catálogo</Label><Textarea rows={3} value={examForm.descricaoCatalogo} onChange={(e) => setExamForm((c) => ({ ...c, descricaoCatalogo: e.target.value }))} /></div></div>}<div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Data do exame</Label><Input type="date" value={examForm.data_exame} onChange={(e) => setExamForm((c) => ({ ...c, data_exame: e.target.value }))} /></div><div className="space-y-2"><Label>Status</Label><Input value={examForm.status} onChange={(e) => setExamForm((c) => ({ ...c, status: e.target.value }))} /></div></div><div className="space-y-2"><Label>Resultado</Label><Textarea rows={3} value={examForm.resultado} onChange={(e) => setExamForm((c) => ({ ...c, resultado: e.target.value }))} /></div><div className="space-y-2"><Label>Observações</Label><Textarea rows={3} value={examForm.observacoes} onChange={(e) => setExamForm((c) => ({ ...c, observacoes: e.target.value }))} /></div><div className="space-y-2"><Label>Upload de resultado</Label><Input type="file" accept=".pdf,image/*" onChange={handleExamFileChange} />{examForm.pdf_nome && <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"><span className="truncate pr-3">Arquivo selecionado: {examForm.pdf_nome}</span><button type="button" className="font-medium text-rose-600 hover:text-rose-700" onClick={clearExamFile}>X</button></div>}</div></div><DialogFooter><Button variant="outline" onClick={() => setExamOpen(false)}>Cancelar</Button><Button onClick={() => void saveExam()}>Salvar</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={medicationOpen} onOpenChange={(open) => { setMedicationOpen(open); if (!open) { setEditingMedicationId(null); setMedicationMode("existing"); setMedicationForm({ selectedCatalogId: "", nome: "", principio_ativo: "", dosagemCatalogo: "", forma_farmaceutica: "comprimido", fabricante: "", dosagemPaciente: "", periodo: "", status: "", descricao: "", observacoes: "" }); } }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]"><DialogHeader><DialogTitle>{editingMedicationId ? "Editar medicamento do paciente" : "Adicionar medicamento"}</DialogTitle></DialogHeader><div className="space-y-4"><div className="grid grid-cols-2 gap-2"><Button type="button" variant={medicationMode === "existing" ? "default" : "outline"} onClick={() => setMedicationMode("existing")}>Selecionar existente</Button><Button type="button" variant={medicationMode === "new" ? "default" : "outline"} onClick={() => setMedicationMode("new")}>Criar novo no catálogo</Button></div>{medicationMode === "existing" ? <div className="space-y-2"><Label>Medicamento do catálogo</Label><Select value={medicationForm.selectedCatalogId} onValueChange={(value) => setMedicationForm((c) => ({ ...c, selectedCatalogId: value }))}><SelectTrigger><SelectValue placeholder="Selecione um medicamento" /></SelectTrigger><SelectContent>{medicationCatalog.map((medication) => <SelectItem key={medication.medicamento_id} value={String(medication.medicamento_id)}>{medication.nome}</SelectItem>)}</SelectContent></Select></div> : <div className="space-y-3 rounded-xl border p-4"><div className="space-y-2"><Label>Nome do novo medicamento</Label><Input value={medicationForm.nome} onChange={(e) => setMedicationForm((c) => ({ ...c, nome: e.target.value }))} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Princípio ativo</Label><Input value={medicationForm.principio_ativo} onChange={(e) => setMedicationForm((c) => ({ ...c, principio_ativo: e.target.value }))} /></div><div className="space-y-2"><Label>Dosagem padrão</Label><Input value={medicationForm.dosagemCatalogo} onChange={(e) => setMedicationForm((c) => ({ ...c, dosagemCatalogo: e.target.value }))} /></div></div><div className="space-y-2"><Label>Fabricante</Label><Input value={medicationForm.fabricante} onChange={(e) => setMedicationForm((c) => ({ ...c, fabricante: e.target.value }))} /></div></div>}<div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Dosagem para o paciente</Label><Input value={medicationForm.dosagemPaciente} onChange={(e) => setMedicationForm((c) => ({ ...c, dosagemPaciente: e.target.value }))} placeholder="Ex.: 500 mg 2x ao dia" /></div><div className="space-y-2"><Label>Período</Label><Input value={medicationForm.periodo} onChange={(e) => setMedicationForm((c) => ({ ...c, periodo: e.target.value }))} /></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Status</Label><Input value={medicationForm.status} onChange={(e) => setMedicationForm((c) => ({ ...c, status: e.target.value }))} /></div><div className="space-y-2"><Label>Observações</Label><Input value={medicationForm.observacoes} onChange={(e) => setMedicationForm((c) => ({ ...c, observacoes: e.target.value }))} /></div></div><div className="space-y-2"><Label>Descrição clínica</Label><Textarea rows={3} value={medicationForm.descricao} onChange={(e) => setMedicationForm((c) => ({ ...c, descricao: e.target.value }))} /></div></div><DialogFooter><Button variant="outline" onClick={() => setMedicationOpen(false)}>Cancelar</Button><Button onClick={() => void saveMedication()}>Salvar</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
