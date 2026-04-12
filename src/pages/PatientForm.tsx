import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
import { store } from "@/lib/store";
import { Patient } from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  Heart,
  MapPin,
  Phone,
  Plus,
  Save,
  User,
  X,
} from "lucide-react";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const emptyPatientForm = {
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
  const [formData, setFormData] = useState(emptyPatientForm);

  useEffect(() => {
    if (!isEditing || !id) return;

    const patient = store.getPatient(id);
    if (!patient) {
      toast({
        title: "Erro",
        description: "Paciente nao encontrado.",
        variant: "destructive",
      });
      navigate(getDefaultRouteForUser());
      return;
    }

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
  }, [id, isEditing, navigate, toast]);

  const backRoute = secretaryMode ? "/secretary" : "/patients";

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = (
    value: string,
    setter: Dispatch<SetStateAction<string>>,
    key: "allergies" | "medications" | "medicalHistory",
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        [key]: [...prev.clinicalData[key], trimmed],
      },
    }));
    setter("");
  };

  const removeTag = (
    index: number,
    key: "allergies" | "medications" | "medicalHistory",
  ) => {
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
        const updatedPatient = store.updatePatient(id, formData as Partial<Patient>);
        if (!updatedPatient) {
          throw new Error("patient-not-found");
        }

        toast({
          title: "Paciente atualizado",
          description: "Os dados do paciente foram atualizados.",
        });
        navigate(secretaryMode ? "/secretary" : `/patients/${id}`);
        return;
      }

      store.addPatient(formData as Omit<Patient, "id" | "createdAt" | "updatedAt">);
      toast({
        title: "Paciente cadastrado",
        description: "O novo paciente foi cadastrado com sucesso.",
      });
      navigate(backRoute);
    } catch {
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar os dados do paciente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(backRoute)}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {isEditing ? "Editar Paciente" : "Novo Paciente"}
          </h1>
          <p className="mt-1 text-gray-600">
            {secretaryMode
              ? "A secretaria pode editar apenas os dados pessoais e clinicos basicos."
              : "Cadastro completo de paciente para o sistema Medase."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informacoes Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  required
                  value={formData.cpf}
                  onChange={(e) => updateField("cpf", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="birthDate">Data de nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Genero *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "female" | "male" | "other") =>
                    updateField("gender", value)
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
                    updateField("status", value)
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
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {!secretaryMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Endereco
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Rua / Avenida</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) =>
                      updateField("address", {
                        ...formData.address,
                        street: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="number">Numero</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) =>
                      updateField("address", {
                        ...formData.address,
                        number: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) =>
                      updateField("address", {
                        ...formData.address,
                        complement: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      updateField("address", {
                        ...formData.address,
                        city: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={formData.address.state}
                    onValueChange={(value) =>
                      updateField("address", {
                        ...formData.address,
                        state: value,
                      })
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
                      updateField("address", {
                        ...formData.address,
                        zipCode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Dados Clinicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={secretaryMode ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "grid grid-cols-1 gap-4 md:grid-cols-2"}>
              <div>
                <Label htmlFor="bloodType">Tipo sanguineo</Label>
                <Select
                  value={formData.clinicalData.bloodType}
                  onValueChange={(value) =>
                    updateField("clinicalData", {
                      ...formData.clinicalData,
                      bloodType: value,
                    })
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

              {!secretaryMode && (
                <div>
                  <Label htmlFor="lastExam">Ultimo exame</Label>
                  <Input
                    id="lastExam"
                    type="date"
                    value={formData.clinicalData.lastExam}
                    onChange={(e) =>
                      updateField("clinicalData", {
                        ...formData.clinicalData,
                        lastExam: e.target.value,
                      })
                    }
                  />
                </div>
              )}
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
                      addTag(newAllergy, setNewAllergy, "allergies");
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addTag(newAllergy, setNewAllergy, "allergies")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.clinicalData.allergies.map((allergy, index) => (
                  <Badge key={`${allergy}-${index}`} variant="secondary" className="gap-1">
                    <span>{allergy}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index, "allergies")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
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
                          addTag(newMedication, setNewMedication, "medications");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addTag(newMedication, setNewMedication, "medications")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.clinicalData.medications.map((medication, index) => (
                      <Badge key={`${medication}-${index}`} variant="outline" className="gap-1">
                        <span>{medication}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index, "medications")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Historico medico</Label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Digite uma condicao medica"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(newCondition, setNewCondition, "medicalHistory");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addTag(newCondition, setNewCondition, "medicalHistory")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.clinicalData.medicalHistory.map((condition, index) => (
                      <Badge key={`${condition}-${index}`} variant="destructive" className="gap-1">
                        <span>{condition}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index, "medicalHistory")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="observations">Observacoes</Label>
                  <Textarea
                    id="observations"
                    rows={3}
                    value={formData.clinicalData.observations}
                    onChange={(e) =>
                      updateField("clinicalData", {
                        ...formData.clinicalData,
                        observations: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!secretaryMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Contato de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="emergencyName">Nome</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    updateField("emergencyContact", {
                      ...formData.emergencyContact,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="relationship">Parentesco</Label>
                <Input
                  id="relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    updateField("emergencyContact", {
                      ...formData.emergencyContact,
                      relationship: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Telefone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    updateField("emergencyContact", {
                      ...formData.emergencyContact,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading
              ? "Salvando..."
              : isEditing
                ? "Atualizar paciente"
                : "Cadastrar paciente"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(backRoute)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
