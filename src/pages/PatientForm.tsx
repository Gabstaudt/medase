import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Heart,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { store } from "@/lib/store";
import { Patient } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const states = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    gender: "" as "female" | "male" | "other" | "",
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
      allergies: [] as string[],
      medications: [] as string[],
      medicalHistory: [] as string[],
      lastExam: "",
      observations: "",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    if (isEditing && id) {
      const patient = store.getPatient(id);
      if (patient) {
        setFormData({
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          cpf: patient.cpf,
          birthDate: patient.birthDate,
          gender: patient.gender,
          address: patient.address,
          clinicalData: patient.clinicalData,
          emergencyContact: patient.emergencyContact,
          status: patient.status,
        });
      } else {
        toast({
          title: "Erro",
          description: "Paciente não encontrado.",
          variant: "destructive",
        });
        navigate("/patients");
      }
    }
  }, [id, isEditing, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && id) {
        const updatedPatient = store.updatePatient(id, formData as Partial<Patient>);
        if (updatedPatient) {
          toast({
            title: "Paciente atualizado",
            description: "Os dados do paciente foram atualizados com sucesso.",
          });
          navigate(`/patients/${id}`);
        }
      } else {
        const newPatient = store.addPatient(
          formData as Omit<Patient, "id" | "createdAt" | "updatedAt">
        );
        toast({
          title: "Paciente cadastrado",
          description: "O novo paciente foi cadastrado com sucesso.",
        });
        navigate(`/patients/${newPatient.id}`);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados do paciente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData((prev) => ({
        ...prev,
        clinicalData: {
          ...prev.clinicalData,
          allergies: [...prev.clinicalData.allergies, newAllergy.trim()],
        },
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        allergies: prev.clinicalData.allergies.filter((_, i) => i !== index),
      },
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setFormData((prev) => ({
        ...prev,
        clinicalData: {
          ...prev.clinicalData,
          medications: [...prev.clinicalData.medications, newMedication.trim()],
        },
      }));
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        medications: prev.clinicalData.medications.filter((_, i) => i !== index),
      },
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData((prev) => ({
        ...prev,
        clinicalData: {
          ...prev.clinicalData,
          medicalHistory: [...prev.clinicalData.medicalHistory, newCondition.trim()],
        },
      }));
      setNewCondition("");
    }
  };

  const removeCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        medicalHistory: prev.clinicalData.medicalHistory.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Paciente" : "Novo Paciente"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Atualize as informações do paciente" : "Cadastre um novo paciente no sistema"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gênero *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "female" | "male" | "other") =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.address.number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, number: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.address.complement}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, complement: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Select
                  value={formData.address.state}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: value },
                    }))
                  }
                >
                  <SelectTrigger>
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
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value },
                    }))
                  }
                  placeholder="00000-000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Dados Clínicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodType">Tipo Sanguíneo</Label>
                <Select
                  value={formData.clinicalData.bloodType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicalData: { ...prev.clinicalData, bloodType: value },
                    }))
                  }
                >
                  <SelectTrigger>
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
                <Label htmlFor="lastExam">Último Exame</Label>
                <Input
                  id="lastExam"
                  type="date"
                  value={formData.clinicalData.lastExam}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicalData: {
                        ...prev.clinicalData,
                        lastExam: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Allergies */}
            <div>
              <Label>Alergias</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Digite uma alergia"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                  className="sm:flex-1"
                />
                <Button type="button" onClick={addAllergy} size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.clinicalData.allergies.map((allergy, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="break-words">{allergy}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeAllergy(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div>
              <Label>Medicamentos</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Digite um medicamento"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMedication();
                    }
                  }}
                  className="sm:flex-1"
                />
                <Button type="button" onClick={addMedication} size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.clinicalData.medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <span className="break-words">{medication}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeMedication(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical History */}
            <div>
              <Label>Histórico Médico</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Digite uma condição médica"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCondition();
                    }
                  }}
                  className="sm:flex-1"
                />
                <Button type="button" onClick={addCondition} size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.clinicalData.medicalHistory.map((condition, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center gap-1">
                    <span className="break-words">{condition}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent text-white"
                      onClick={() => removeCondition(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.clinicalData.observations}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    clinicalData: { ...prev.clinicalData, observations: e.target.value },
                  }))
                }
                placeholder="Observações gerais sobre o paciente..."
                rows={3}
                className="break-words"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Contato de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergencyName">Nome</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="relationship">Parentesco</Label>
                <Input
                  id="relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Telefone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : isEditing ? "Atualizar Paciente" : "Cadastrar Paciente"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/patients")}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
