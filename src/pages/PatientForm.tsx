import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getDefaultRouteForUser, isSecretary } from "@/lib/auth";
import { createPatient, fetchPatient, updatePatient } from "@/lib/patient-api";
import { Patient } from "@/lib/types";
import { AlertTriangle, ArrowLeft, Heart, MapPin, Phone, Plus, Save, User, X } from "lucide-react";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const states = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const emptyPatientForm: Patient = {
  id: "",
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
  gender: "other",
  address: {
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
  },
  clinicalData: {
    bloodType: "",
    allergies: [],
    medications: [],
    medicalHistory: [],
    lastExam: "",
    observations: "",
  },
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
  createdAt: "",
  updatedAt: "",
  status: "active",
};

export default function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const secretaryMode = isSecretary();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [formData, setFormData] = useState<Patient>(emptyPatientForm);

  useEffect(() => {
    if (!isEditing || !id) return;

    const loadPatient = async () => {
      try {
        setFormData(await fetchPatient(id));
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
  }, [id, isEditing, navigate, toast]);

  const backRoute = secretaryMode ? "/secretary/patients" : "/patients";

  const updateField = <K extends keyof Patient>(key: K, value: Patient[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = (value: string, key: "allergies" | "medications" | "medicalHistory") => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        [key]: [...prev.clinicalData[key], trimmed],
      },
    }));

    if (key === "allergies") setNewAllergy("");
    if (key === "medications") setNewMedication("");
    if (key === "medicalHistory") setNewCondition("");
  };

  const removeTag = (index: number, key: "allergies" | "medications" | "medicalHistory") => {
    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        [key]: prev.clinicalData[key].filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isEditing && id) {
        await updatePatient(id, formData);
        toast({
          title: "Paciente atualizado",
          description: "Os dados do paciente foram atualizados.",
        });
        navigate(`/patients/${id}`);
      } else {
        await createPatient(formData);
        toast({
          title: "Paciente cadastrado",
          description: "O novo paciente foi cadastrado com sucesso.",
        });
        navigate(backRoute);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível salvar os dados do paciente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(backRoute)} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {isEditing ? "Editar paciente" : "Novo paciente"}
          </h1>
          <p className="mt-1 text-gray-600">
            {secretaryMode
              ? "A secretária pode editar os dados compartilhados do paciente."
              : "Cadastro completo de paciente para o sistema Medase."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input id="name" required value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" required value={formData.cpf} onChange={(e) => updateField("cpf", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="birthDate">Data de nascimento *</Label>
                <Input id="birthDate" type="date" required value={formData.birthDate} onChange={(e) => updateField("birthDate", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="gender">Gênero *</Label>
                <Select value={formData.gender} onValueChange={(value: Patient["gender"]) => updateField("gender", value)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" required value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Rua / Avenida</Label>
                <Input id="street" value={formData.address.street} onChange={(e) => updateField("address", { ...formData.address, street: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input id="number" value={formData.address.number} onChange={(e) => updateField("address", { ...formData.address, number: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input id="complement" value={formData.address.complement || ""} onChange={(e) => updateField("address", { ...formData.address, complement: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={formData.address.city} onChange={(e) => updateField("address", { ...formData.address, city: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Select value={formData.address.state} onValueChange={(value) => updateField("address", { ...formData.address, state: value })}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input id="zipCode" value={formData.address.zipCode} onChange={(e) => updateField("address", { ...formData.address, zipCode: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Dados clínicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bloodType">Tipo sanguíneo</Label>
                <Select value={formData.clinicalData.bloodType} onValueChange={(value) => updateField("clinicalData", { ...formData.clinicalData, bloodType: value })}>
                  <SelectTrigger id="bloodType">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lastExam">Último exame</Label>
                <Input id="lastExam" type="date" value={formData.clinicalData.lastExam} onChange={(e) => updateField("clinicalData", { ...formData.clinicalData, lastExam: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Alergias</Label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Digite uma alergia"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(newAllergy, "allergies");
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={() => addTag(newAllergy, "allergies")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.clinicalData.allergies.map((allergy, index) => (
                  <Button key={`${allergy}-${index}`} type="button" variant="outline" size="sm" onClick={() => removeTag(index, "allergies")}>
                    {allergy}
                    <X className="ml-2 h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>

            {!secretaryMode && (
              <>
                <div>
                  <Label>Medicamentos</Label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Digite um medicamento"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(newMedication, "medications");
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={() => addTag(newMedication, "medications")}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.clinicalData.medications.map((medication, index) => (
                      <Button key={`${medication}-${index}`} type="button" variant="outline" size="sm" onClick={() => removeTag(index, "medications")}>
                        {medication}
                        <X className="ml-2 h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Histórico médico</Label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Digite uma condição médica"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(newCondition, "medicalHistory");
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={() => addTag(newCondition, "medicalHistory")}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.clinicalData.medicalHistory.map((condition, index) => (
                      <Button key={`${condition}-${index}`} type="button" variant="outline" size="sm" onClick={() => removeTag(index, "medicalHistory")}>
                        {condition}
                        <X className="ml-2 h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea id="observations" rows={3} value={formData.clinicalData.observations} onChange={(e) => updateField("clinicalData", { ...formData.clinicalData, observations: e.target.value })} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Contato de emergência
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="emergencyName">Nome</Label>
              <Input id="emergencyName" value={formData.emergencyContact.name} onChange={(e) => updateField("emergencyContact", { ...formData.emergencyContact, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="relationship">Parentesco</Label>
              <Input id="relationship" value={formData.emergencyContact.relationship} onChange={(e) => updateField("emergencyContact", { ...formData.emergencyContact, relationship: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Telefone</Label>
              <Input id="emergencyPhone" value={formData.emergencyContact.phone} onChange={(e) => updateField("emergencyContact", { ...formData.emergencyContact, phone: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : isEditing ? "Atualizar paciente" : "Cadastrar paciente"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(backRoute)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
