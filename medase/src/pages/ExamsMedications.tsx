import { useState } from "react";
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
  DialogTrigger,
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

interface Exam {
  id: string;
  name: string;
  description: string;
  category: "laboratorial" | "imagem" | "funcional" | "outros";
  price: number;
  duration: number;
  preparation?: string;
  observations?: string;
  active: boolean;
}

interface Medication {
  id: string;
  name: string;
  activeIngredient: string;
  dosage: string;
  form:
    | "comprimido"
    | "capsula"
    | "liquido"
    | "injetavel"
    | "topico"
    | "outros";
  manufacturer: string;
  description?: string;
  contraindications?: string;
  sideEffects?: string;
  active: boolean;
}

const examCategories = [
  { value: "laboratorial", label: "Laboratorial" },
  { value: "imagem", label: "Imagem" },
  { value: "funcional", label: "Funcional" },
  { value: "outros", label: "Outros" },
];

const medicationForms = [
  { value: "comprimido", label: "Comprimido" },
  { value: "capsula", label: "Cápsula" },
  { value: "liquido", label: "Líquido" },
  { value: "injetavel", label: "Injetável" },
  { value: "topico", label: "Tópico" },
  { value: "outros", label: "Outros" },
];

export default function ExamsMedications() {
  const { toast } = useToast();

  // Mock data
  const [exams, setExams] = useState<Exam[]>([
    {
      id: "1",
      name: "Hemograma Completo",
      description: "Análise completa dos componentes do sangue",
      category: "laboratorial",
      price: 45.0,
      duration: 15,
      preparation: "Jejum de 8 horas",
      observations: "Resultado em 24 horas",
      active: true,
    },
    {
      id: "2",
      name: "Ultrassom Pélvico",
      description: "Exame de imagem do sistema reprodutor feminino",
      category: "imagem",
      price: 120.0,
      duration: 30,
      preparation: "Bexiga cheia",
      observations: "Agendamento necessário",
      active: true,
    },
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Paracetamol 500mg",
      activeIngredient: "Paracetamol",
      dosage: "500mg",
      form: "comprimido",
      manufacturer: "EMS",
      description: "Analgésico e antitérmico",
      contraindications: "Hipersensibilidade ao paracetamol",
      sideEffects: "Raros: náuseas, vômitos",
      active: true,
    },
    {
      id: "2",
      name: "Ibuprofeno 600mg",
      activeIngredient: "Ibuprofeno",
      dosage: "600mg",
      form: "comprimido",
      manufacturer: "Medley",
      description: "Anti-inflamatório não esteroidal",
      contraindications: "Úlcera péptica, insuficiência renal",
      sideEffects: "Dor abdominal, náuseas, tonturas",
      active: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState("exams");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Exam | Medication | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [examForm, setExamForm] = useState({
    name: "",
    description: "",
    category: "laboratorial" as Exam["category"],
    price: 0,
    duration: 0,
    preparation: "",
    observations: "",
    active: true,
  });

  const [medicationForm, setMedicationForm] = useState({
    name: "",
    activeIngredient: "",
    dosage: "",
    form: "comprimido" as Medication["form"],
    manufacturer: "",
    description: "",
    contraindications: "",
    sideEffects: "",
    active: true,
  });

  const resetForms = () => {
    setExamForm({
      name: "",
      description: "",
      category: "laboratorial",
      price: 0,
      duration: 0,
      preparation: "",
      observations: "",
      active: true,
    });

    setMedicationForm({
      name: "",
      activeIngredient: "",
      dosage: "",
      form: "comprimido",
      manufacturer: "",
      description: "",
      contraindications: "",
      sideEffects: "",
      active: true,
    });

    setEditingItem(null);
  };

  const handleSaveExam = () => {
    if (!examForm.name) {
      toast({
        title: "Erro",
        description: "Nome do exame é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const newExam: Exam = {
      id: editingItem?.id || Date.now().toString(),
      ...examForm,
    };

    if (editingItem && "category" in editingItem) {
      setExams((prev) =>
        prev.map((exam) => (exam.id === editingItem.id ? newExam : exam)),
      );
      toast({
        title: "Exame atualizado",
        description: "O exame foi atualizado com sucesso.",
      });
    } else {
      setExams((prev) => [...prev, newExam]);
      toast({
        title: "Exame cadastrado",
        description: "O novo exame foi adicionado com sucesso.",
      });
    }

    resetForms();
    setIsDialogOpen(false);
  };

  const handleSaveMedication = () => {
    if (!medicationForm.name) {
      toast({
        title: "Erro",
        description: "Nome do medicamento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const newMedication: Medication = {
      id: editingItem?.id || Date.now().toString(),
      ...medicationForm,
    };

    if (editingItem && "activeIngredient" in editingItem) {
      setMedications((prev) =>
        prev.map((med) => (med.id === editingItem.id ? newMedication : med)),
      );
      toast({
        title: "Medicamento atualizado",
        description: "O medicamento foi atualizado com sucesso.",
      });
    } else {
      setMedications((prev) => [...prev, newMedication]);
      toast({
        title: "Medicamento cadastrado",
        description: "O novo medicamento foi adicionado com sucesso.",
      });
    }

    resetForms();
    setIsDialogOpen(false);
  };

  const handleEdit = (item: Exam | Medication) => {
    setEditingItem(item);

    if ("category" in item) {
      setExamForm({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        duration: item.duration,
        preparation: item.preparation || "",
        observations: item.observations || "",
        active: item.active,
      });
      setActiveTab("exams");
    } else {
      setMedicationForm({
        name: item.name,
        activeIngredient: item.activeIngredient,
        dosage: item.dosage,
        form: item.form,
        manufacturer: item.manufacturer,
        description: item.description || "",
        contraindications: item.contraindications || "",
        sideEffects: item.sideEffects || "",
        active: item.active,
      });
      setActiveTab("medications");
    }

    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, type: "exam" | "medication") => {
    const itemName =
      type === "exam"
        ? exams.find((e) => e.id === id)?.name
        : medications.find((m) => m.id === id)?.name;

    if (window.confirm(`Tem certeza que deseja excluir "${itemName}"?`)) {
      if (type === "exam") {
        setExams((prev) => prev.filter((exam) => exam.id !== id));
      } else {
        setMedications((prev) => prev.filter((med) => med.id !== id));
      }

      toast({
        title: `${type === "exam" ? "Exame" : "Medicamento"} excluído`,
        description: "Item removido com sucesso.",
      });
    }
  };

  const openAddDialog = () => {
    resetForms();
    setIsDialogOpen(true);
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMedications = medications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Exames & Medicamentos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie o catálogo de exames e medicamentos
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Novo Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{exams.length}</div>
                <div className="text-sm text-gray-600">Total de Exames</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{medications.length}</div>
                <div className="text-sm text-gray-600">
                  Total de Medicamentos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {exams.filter((e) => e.active).length}
                </div>
                <div className="text-sm text-gray-600">Exames Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {medications.filter((m) => m.active).length}
                </div>
                <div className="text-sm text-gray-600">Medicamentos Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catálogo</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exams" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Exames ({exams.length})
              </TabsTrigger>
              <TabsTrigger
                value="medications"
                className="flex items-center gap-2"
              >
                <Pill className="h-4 w-4" />
                Medicamentos ({medications.length})
              </TabsTrigger>
            </TabsList>

            {/* Exams Tab */}
            <TabsContent value="exams" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.name}</div>
                          <div className="text-sm text-gray-500">
                            {exam.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {
                            examCategories.find(
                              (c) => c.value === exam.category,
                            )?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>R$ {exam.price.toFixed(2)}</TableCell>
                      <TableCell>{exam.duration} min</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            exam.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {exam.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(exam)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(exam.id, "exam")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-4">
              <Table>
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
                    <TableRow key={medication.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{medication.name}</div>
                          <div className="text-sm text-gray-500">
                            {medication.manufacturer}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{medication.activeIngredient}</TableCell>
                      <TableCell>{medication.dosage}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {
                            medicationForms.find(
                              (f) => f.value === medication.form,
                            )?.label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            medication.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {medication.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(medication)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              handleDelete(medication.id, "medication")
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar" : "Adicionar"}{" "}
              {activeTab === "exams" ? "Exame" : "Medicamento"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do{" "}
              {activeTab === "exams" ? "exame" : "medicamento"}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exams">Exame</TabsTrigger>
              <TabsTrigger value="medications">Medicamento</TabsTrigger>
            </TabsList>

            {/* Exam Form */}
            <TabsContent value="exams" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examName">Nome do Exame</Label>
                  <Input
                    id="examName"
                    value={examForm.name}
                    onChange={(e) =>
                      setExamForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="examCategory">Categoria</Label>
                  <Select
                    value={examForm.category}
                    onValueChange={(value: Exam["category"]) =>
                      setExamForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {examCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="examDescription">Descrição</Label>
                <Textarea
                  id="examDescription"
                  value={examForm.description}
                  onChange={(e) =>
                    setExamForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examPrice">Preço (R$)</Label>
                  <Input
                    id="examPrice"
                    type="number"
                    step="0.01"
                    value={examForm.price}
                    onChange={(e) =>
                      setExamForm((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="examDuration">Duração (minutos)</Label>
                  <Input
                    id="examDuration"
                    type="number"
                    value={examForm.duration}
                    onChange={(e) =>
                      setExamForm((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="examPreparation">Preparação</Label>
                <Textarea
                  id="examPreparation"
                  value={examForm.preparation}
                  onChange={(e) =>
                    setExamForm((prev) => ({
                      ...prev,
                      preparation: e.target.value,
                    }))
                  }
                  placeholder="Ex: Jejum de 8 horas"
                />
              </div>

              <div>
                <Label htmlFor="examObservations">Observações</Label>
                <Textarea
                  id="examObservations"
                  value={examForm.observations}
                  onChange={(e) =>
                    setExamForm((prev) => ({
                      ...prev,
                      observations: e.target.value,
                    }))
                  }
                  placeholder="Informações adicionais"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="examActive"
                  checked={examForm.active}
                  onCheckedChange={(checked) =>
                    setExamForm((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="examActive">Exame ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveExam}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? "Atualizar" : "Cadastrar"} Exame
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </TabsContent>

            {/* Medication Form */}
            <TabsContent value="medications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medicationName">Nome do Medicamento</Label>
                  <Input
                    id="medicationName"
                    value={medicationForm.name}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="activeIngredient">Princípio Ativo</Label>
                  <Input
                    id="activeIngredient"
                    value={medicationForm.activeIngredient}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        activeIngredient: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosagem</Label>
                  <Input
                    id="dosage"
                    value={medicationForm.dosage}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        dosage: e.target.value,
                      }))
                    }
                    placeholder="Ex: 500mg"
                  />
                </div>
                <div>
                  <Label htmlFor="medicationForm">Forma Farmacêutica</Label>
                  <Select
                    value={medicationForm.form}
                    onValueChange={(value: Medication["form"]) =>
                      setMedicationForm((prev) => ({ ...prev, form: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {medicationForms.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input
                    id="manufacturer"
                    value={medicationForm.manufacturer}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        manufacturer: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medicationDescription">Descrição</Label>
                <Textarea
                  id="medicationDescription"
                  value={medicationForm.description}
                  onChange={(e) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contraindications">Contraindicações</Label>
                <Textarea
                  id="contraindications"
                  value={medicationForm.contraindications}
                  onChange={(e) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      contraindications: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="sideEffects">Efeitos Colaterais</Label>
                <Textarea
                  id="sideEffects"
                  value={medicationForm.sideEffects}
                  onChange={(e) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      sideEffects: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="medicationActive"
                  checked={medicationForm.active}
                  onCheckedChange={(checked) =>
                    setMedicationForm((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="medicationActive">Medicamento ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveMedication}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? "Atualizar" : "Cadastrar"} Medicamento
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
