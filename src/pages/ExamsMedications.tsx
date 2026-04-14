import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Stethoscope,
  Pill,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/lib/auth";

type ExamCategory = "laboratorial" | "imagem" | "funcional" | "outros";
type MedicationForm =
  | "comprimido"
  | "capsula"
  | "liquido"
  | "injetavel"
  | "topico"
  | "outros";

type Exam = {
  exame_id: number;
  nome: string;
  descricao: string;
  categoria: ExamCategory;
  preco: number;
  preparacao?: string | null;
  observacoes?: string | null;
  ativo: boolean;
};

type Medication = {
  medicamento_id: number;
  nome: string;
  principio_ativo: string;
  dosagem: string;
  forma_farmaceutica: MedicationForm;
  fabricante: string;
  descricao?: string | null;
  contraindicacoes?: string | null;
  efeitos_colaterais?: string | null;
  ativo: boolean;
};

const examCategories = [
  { value: "laboratorial", label: "Laboratorial" },
  { value: "imagem", label: "Imagem" },
  { value: "funcional", label: "Funcional" },
  { value: "outros", label: "Outros" },
] as const;

const medicationForms = [
  { value: "comprimido", label: "Comprimido" },
  { value: "capsula", label: "Cápsula" },
  { value: "liquido", label: "Líquido" },
  { value: "injetavel", label: "Injetável" },
  { value: "topico", label: "Tópico" },
  { value: "outros", label: "Outros" },
] as const;

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("Sessão expirada. Faça login novamente.");

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail =
      typeof payload?.detail === "string"
        ? payload.detail
        : Array.isArray(payload?.detail) && payload.detail.length > 0
          ? payload.detail[0]?.msg || "Não foi possível concluir a operação."
          : "Não foi possível concluir a operação.";
    throw new Error(detail);
  }

  return payload as T;
}

function StatCard({
  icon,
  iconClassName,
  value,
  label,
}: {
  icon: ReactNode;
  iconClassName: string;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${iconClassName}`}>{icon}</div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={`text-center text-gray-500 ${compact ? "py-6" : "py-8"}`}>
      {message}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function ExamsMedications() {
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeTab, setActiveTab] = useState<"exams" | "medications">("exams");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [editingMedicationId, setEditingMedicationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [examForm, setExamForm] = useState({
    nome: "",
    descricao: "",
    categoria: "laboratorial" as ExamCategory,
    preco: 0,
    preparacao: "",
    observacoes: "",
    ativo: true,
  });

  const [medicationForm, setMedicationForm] = useState({
    nome: "",
    principio_ativo: "",
    dosagem: "",
    forma_farmaceutica: "comprimido" as MedicationForm,
    fabricante: "",
    descricao: "",
    contraindicacoes: "",
    efeitos_colaterais: "",
    ativo: true,
  });

  const loadCatalogs = async () => {
    setIsLoading(true);
    try {
      const [examData, medicationData] = await Promise.all([
        apiRequest<Exam[]>("/exames/"),
        apiRequest<Medication[]>("/medicamentos/"),
      ]);
      setExams(examData);
      setMedications(medicationData);
    } catch (error) {
      toast({
        title: "Erro ao carregar catálogos",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalogs();
  }, []);

  const resetForms = () => {
    setExamForm({
      nome: "",
      descricao: "",
      categoria: "laboratorial",
      preco: 0,
      preparacao: "",
      observacoes: "",
      ativo: true,
    });
    setMedicationForm({
      nome: "",
      principio_ativo: "",
      dosagem: "",
      forma_farmaceutica: "comprimido",
      fabricante: "",
      descricao: "",
      contraindicacoes: "",
      efeitos_colaterais: "",
      ativo: true,
    });
    setEditingExamId(null);
    setEditingMedicationId(null);
  };

  const openAddDialog = (tab: "exams" | "medications" = activeTab) => {
    resetForms();
    setActiveTab(tab);
    setIsDialogOpen(true);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExamId(exam.exame_id);
    setEditingMedicationId(null);
    setExamForm({
      nome: exam.nome,
      descricao: exam.descricao,
      categoria: exam.categoria,
      preco: Number(exam.preco),
      preparacao: exam.preparacao || "",
      observacoes: exam.observacoes || "",
      ativo: exam.ativo,
    });
    setActiveTab("exams");
    setIsDialogOpen(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedicationId(medication.medicamento_id);
    setEditingExamId(null);
    setMedicationForm({
      nome: medication.nome,
      principio_ativo: medication.principio_ativo,
      dosagem: medication.dosagem,
      forma_farmaceutica: medication.forma_farmaceutica,
      fabricante: medication.fabricante,
      descricao: medication.descricao || "",
      contraindicacoes: medication.contraindicacoes || "",
      efeitos_colaterais: medication.efeitos_colaterais || "",
      ativo: medication.ativo,
    });
    setActiveTab("medications");
    setIsDialogOpen(true);
  };

  const handleSaveExam = async () => {
    if (!examForm.nome.trim() || !examForm.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Nome e descrição do exame são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const method = editingExamId ? "PUT" : "POST";
      const path = editingExamId ? `/exames/${editingExamId}` : "/exames/";
      await apiRequest<Exam>(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...examForm,
          preparacao: examForm.preparacao || null,
          observacoes: examForm.observacoes || null,
        }),
      });
      toast({
        title: editingExamId ? "Exame atualizado" : "Exame cadastrado",
        description: "A operação foi concluída com sucesso.",
      });
      setIsDialogOpen(false);
      resetForms();
      await loadCatalogs();
    } catch (error) {
      toast({
        title: "Erro ao salvar exame",
        description:
          error instanceof Error ? error.message : "Não foi possível salvar o exame.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMedication = async () => {
    if (
      !medicationForm.nome.trim() ||
      !medicationForm.principio_ativo.trim() ||
      !medicationForm.dosagem.trim() ||
      !medicationForm.fabricante.trim()
    ) {
      toast({
        title: "Erro",
        description: "Nome, princípio ativo, dosagem e fabricante são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const method = editingMedicationId ? "PUT" : "POST";
      const path = editingMedicationId ? `/medicamentos/${editingMedicationId}` : "/medicamentos/";
      await apiRequest<Medication>(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...medicationForm,
          descricao: medicationForm.descricao || null,
          contraindicacoes: medicationForm.contraindicacoes || null,
          efeitos_colaterais: medicationForm.efeitos_colaterais || null,
        }),
      });
      toast({
        title: editingMedicationId ? "Medicamento atualizado" : "Medicamento cadastrado",
        description: "A operação foi concluída com sucesso.",
      });
      setIsDialogOpen(false);
      resetForms();
      await loadCatalogs();
    } catch (error) {
      toast({
        title: "Erro ao salvar medicamento",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o medicamento.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExam = async (exam: Exam) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${exam.nome}"?`)) return;

    try {
      await apiRequest<void>(`/exames/${exam.exame_id}`, { method: "DELETE" });
      toast({
        title: "Exame excluído",
        description: "Item removido com sucesso.",
      });
      await loadCatalogs();
    } catch (error) {
      toast({
        title: "Erro ao excluir exame",
        description:
          error instanceof Error ? error.message : "Não foi possível excluir o exame.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedication = async (medication: Medication) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${medication.nome}"?`)) return;

    try {
      await apiRequest<void>(`/medicamentos/${medication.medicamento_id}`, {
        method: "DELETE",
      });
      toast({
        title: "Medicamento excluído",
        description: "Item removido com sucesso.",
      });
      await loadCatalogs();
    } catch (error) {
      toast({
        title: "Erro ao excluir medicamento",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o medicamento.",
        variant: "destructive",
      });
    }
  };

  const filteredExams = useMemo(
    () =>
      exams.filter(
        (exam) =>
          exam.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [exams, searchTerm],
  );

  const filteredMedications = useMemo(
    () =>
      medications.filter(
        (medication) =>
          medication.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medication.principio_ativo.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [medications, searchTerm],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Exames & Medicamentos
          </h1>
          <p className="mt-1 break-words text-gray-600">
            Gerencie o catálogo integrado com o backend
          </p>
        </div>
        <Button className="flex w-full items-center gap-2 sm:w-auto" onClick={() => openAddDialog()}>
          <Plus className="h-4 w-4" />
          Novo Item
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Stethoscope className="h-5 w-5 text-blue-600" />}
          iconClassName="bg-blue-100"
          value={exams.length}
          label="Total de Exames"
        />
        <StatCard
          icon={<Pill className="h-5 w-5 text-green-600" />}
          iconClassName="bg-green-100"
          value={medications.length}
          label="Total de Medicamentos"
        />
        <StatCard
          icon={<Stethoscope className="h-5 w-5 text-primary" />}
          iconClassName="bg-primary/10"
          value={exams.filter((exam) => exam.ativo).length}
          label="Exames Ativos"
        />
        <StatCard
          icon={<Pill className="h-5 w-5 text-purple-600" />}
          iconClassName="bg-purple-100"
          value={medications.filter((medication) => medication.ativo).length}
          label="Medicamentos Ativos"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Catálogo</CardTitle>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full pl-8"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "exams" | "medications")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exams" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Exames ({exams.length})
              </TabsTrigger>
              <TabsTrigger value="medications" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medicamentos ({medications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exams" className="space-y-4">
              {isLoading ? (
                <EmptyState message="Carregando exames..." />
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {filteredExams.length === 0 && <EmptyState message="Nenhum exame encontrado" compact />}
                    {filteredExams.map((exam) => (
                      <div key={exam.exame_id} className="rounded-lg border bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="break-words font-medium text-gray-900">{exam.nome}</div>
                            <div className="break-words text-xs text-gray-500">{exam.descricao}</div>
                          </div>
                          <Badge variant="outline">
                            {examCategories.find((item) => item.value === exam.categoria)?.label}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Preço</div>
                            <div>R$ {Number(exam.preco).toFixed(2)}</div>
                          </div>
                          <div className="col-span-2">
                            <Badge className={exam.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {exam.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => handleEditExam(exam)}>
                            <Edit className="mr-1 h-4 w-4" /> Editar
                          </Button>
                          <Button size="sm" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 sm:w-auto" onClick={() => handleDeleteExam(exam)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-hidden rounded-lg border md:block">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[880px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExams.map((exam) => (
                            <TableRow key={exam.exame_id}>
                              <TableCell>
                                <div>
                                  <div className="break-words font-medium">{exam.nome}</div>
                                  <div className="break-words text-sm text-gray-500">{exam.descricao}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {examCategories.find((item) => item.value === exam.categoria)?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>R$ {Number(exam.preco).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={exam.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {exam.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditExam(exam)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteExam(exam)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredExams.length === 0 && <EmptyState message="Nenhum exame encontrado" compact />}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              {isLoading ? (
                <EmptyState message="Carregando medicamentos..." />
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {filteredMedications.length === 0 && <EmptyState message="Nenhum medicamento encontrado" compact />}
                    {filteredMedications.map((medication) => (
                      <div key={medication.medicamento_id} className="rounded-lg border bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="break-words font-medium text-gray-900">{medication.nome}</div>
                            <div className="break-words text-xs text-gray-500">{medication.fabricante}</div>
                          </div>
                          <Badge variant="outline">
                            {medicationForms.find((item) => item.value === medication.forma_farmaceutica)?.label}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div className="col-span-2">
                            <div className="text-gray-600">Princípio ativo</div>
                            <div className="break-words">{medication.principio_ativo}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Dosagem</div>
                            <div className="break-words">{medication.dosagem}</div>
                          </div>
                          <div className="col-span-2">
                            <Badge className={medication.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {medication.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => handleEditMedication(medication)}>
                            <Edit className="mr-1 h-4 w-4" /> Editar
                          </Button>
                          <Button size="sm" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 sm:w-auto" onClick={() => handleDeleteMedication(medication)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-hidden rounded-lg border md:block">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[980px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Princípio Ativo</TableHead>
                            <TableHead>Dosagem</TableHead>
                            <TableHead>Forma</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMedications.map((medication) => (
                            <TableRow key={medication.medicamento_id}>
                              <TableCell>
                                <div>
                                  <div className="break-words font-medium">{medication.nome}</div>
                                  <div className="break-words text-sm text-gray-500">{medication.fabricante}</div>
                                </div>
                              </TableCell>
                              <TableCell className="break-words">{medication.principio_ativo}</TableCell>
                              <TableCell className="break-words">{medication.dosagem}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {medicationForms.find((item) => item.value === medication.forma_farmaceutica)?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={medication.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {medication.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditMedication(medication)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteMedication(medication)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredMedications.length === 0 && <EmptyState message="Nenhum medicamento encontrado" compact />}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          resetForms();
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "exams"
                ? editingExamId
                  ? "Editar exame"
                  : "Novo exame"
                : editingMedicationId
                  ? "Editar medicamento"
                  : "Novo medicamento"}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "exams"
                ? "Preencha os dados do exame disponível no catálogo."
                : "Preencha os dados do medicamento disponível no catálogo."}
            </DialogDescription>
          </DialogHeader>

          {activeTab === "exams" ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome do exame">
                  <Input
                    value={examForm.nome}
                    onChange={(event) =>
                      setExamForm((current) => ({ ...current, nome: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Categoria">
                  <Select
                    value={examForm.categoria}
                    onValueChange={(value) =>
                      setExamForm((current) => ({
                        ...current,
                        categoria: value as ExamCategory,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {examCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Descrição">
                <Textarea
                  value={examForm.descricao}
                  onChange={(event) =>
                    setExamForm((current) => ({ ...current, descricao: event.target.value }))
                  }
                  rows={4}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Preço">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={examForm.preco}
                    onChange={(event) =>
                      setExamForm((current) => ({
                        ...current,
                        preco: Number(event.target.value || 0),
                      }))
                    }
                  />
                </Field>
                <Field label="Status ativo">
                  <div className="flex h-10 items-center rounded-md border px-3">
                    <Switch
                      checked={examForm.ativo}
                      onCheckedChange={(checked) =>
                        setExamForm((current) => ({ ...current, ativo: checked }))
                      }
                    />
                    <span className="ml-3 text-sm text-gray-600">
                      {examForm.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </Field>
              </div>

              <Field label="Preparação">
                <Textarea
                  value={examForm.preparacao}
                  onChange={(event) =>
                    setExamForm((current) => ({ ...current, preparacao: event.target.value }))
                  }
                  rows={3}
                />
              </Field>

              <Field label="Observações">
                <Textarea
                  value={examForm.observacoes}
                  onChange={(event) =>
                    setExamForm((current) => ({ ...current, observacoes: event.target.value }))
                  }
                  rows={3}
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome do medicamento">
                  <Input
                    value={medicationForm.nome}
                    onChange={(event) =>
                      setMedicationForm((current) => ({ ...current, nome: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Forma farmacêutica">
                  <Select
                    value={medicationForm.forma_farmaceutica}
                    onValueChange={(value) =>
                      setMedicationForm((current) => ({
                        ...current,
                        forma_farmaceutica: value as MedicationForm,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicationForms.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Princípio ativo">
                  <Input
                    value={medicationForm.principio_ativo}
                    onChange={(event) =>
                      setMedicationForm((current) => ({
                        ...current,
                        principio_ativo: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Dosagem">
                  <Input
                    value={medicationForm.dosagem}
                    onChange={(event) =>
                      setMedicationForm((current) => ({ ...current, dosagem: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Fabricante">
                  <Input
                    value={medicationForm.fabricante}
                    onChange={(event) =>
                      setMedicationForm((current) => ({
                        ...current,
                        fabricante: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Status ativo">
                  <div className="flex h-10 items-center rounded-md border px-3">
                    <Switch
                      checked={medicationForm.ativo}
                      onCheckedChange={(checked) =>
                        setMedicationForm((current) => ({ ...current, ativo: checked }))
                      }
                    />
                    <span className="ml-3 text-sm text-gray-600">
                      {medicationForm.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </Field>
              </div>

              <Field label="Descrição">
                <Textarea
                  value={medicationForm.descricao}
                  onChange={(event) =>
                    setMedicationForm((current) => ({
                      ...current,
                      descricao: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </Field>

              <Field label="Contraindicações">
                <Textarea
                  value={medicationForm.contraindicacoes}
                  onChange={(event) =>
                    setMedicationForm((current) => ({
                      ...current,
                      contraindicacoes: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </Field>

              <Field label="Efeitos colaterais">
                <Textarea
                  value={medicationForm.efeitos_colaterais}
                  onChange={(event) =>
                    setMedicationForm((current) => ({
                      ...current,
                      efeitos_colaterais: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </Field>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForms();
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={activeTab === "exams" ? handleSaveExam : handleSaveMedication}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving
                ? "Salvando..."
                : editingExamId !== null || editingMedicationId !== null
                  ? "Salvar alterações"
                  : "Cadastrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
