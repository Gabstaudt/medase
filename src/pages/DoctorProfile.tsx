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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Save,
  Eye,
  EyeOff,
  Shield,
  Plus,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const states = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function DoctorProfile() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState("");

  const [formData, setFormData] = useState({
    name: "Dr. Admin",
    email: "admin@medase.com",
    license: "CRM-SP 123456",
    specialty: "Ginecologia e Obstetrícia",
    institution: "Hospital Medase",
    phone: "(11) 99999-9999",
    address: {
      street: "Rua dos Médicos",
      number: "123",
      complement: "Sala 45",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    credentials: {
      university: "Universidade de São Paulo",
      graduationYear: 2010,
      residency: "Ginecologia e Obstetrícia - Hospital das Clínicas",
      specializations: ["Ginecologia", "Obstetrícia", "Ultrassonografia"],
    },
    security: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSave = () => {
    if (formData.security.newPassword) {
      if (formData.security.newPassword !== formData.security.confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        return;
      }
      if (formData.security.newPassword.length < 8) {
        toast({
          title: "Erro",
          description: "A nova senha deve ter pelo menos 8 caracteres.",
          variant: "destructive",
        });
        return;
      }
    }
    toast({ title: "Perfil atualizado", description: "Suas informações foram salvas com sucesso." });
  };

  const addSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !formData.credentials.specializations.includes(newSpecialization.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          specializations: [...prev.credentials.specializations, newSpecialization.trim()],
        },
      }));
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        specializations: prev.credentials.specializations.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1 break-words">
          Gerencie suas informações pessoais e profissionais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
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
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="license">Registro Profissional</Label>
                  <Input
                    id="license"
                    value={formData.license}
                    onChange={(e) => setFormData((prev) => ({ ...prev, license: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty">Especialidade Principal</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="institution">Instituição</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, institution: e.target.value }))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">Universidade</Label>
                  <Input
                    id="university"
                    value={formData.credentials.university}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        credentials: { ...prev.credentials, university: e.target.value },
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Ano de Formação</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.credentials.graduationYear}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        credentials: {
                          ...prev.credentials,
                          graduationYear: parseInt(e.target.value) || 2010,
                        },
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="residency">Residência Médica</Label>
                <Input
                  id="residency"
                  value={formData.credentials.residency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      credentials: { ...prev.credentials, residency: e.target.value },
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <Label>Especializações</Label>
                {/* Input + botão responsivos */}
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Digite uma especialização"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialization();
                      }
                    }}
                    className="w-full"
                  />
                  <Button type="button" onClick={addSpecialization} size="sm" aria-label="Adicionar especialização">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.credentials.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <span className="break-words">{spec}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeSpecialization(index)}
                        aria-label={`Remover ${spec}`}
                        title={`Remover ${spec}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
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
                    className="w-full"
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
                    className="w-full"
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
                    className="w-full"
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
                    className="w-full"
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
                    <SelectTrigger className="w-full">
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
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.security.currentPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        security: { ...prev.security, currentPassword: e.target.value },
                      }))
                    }
                    placeholder="Digite sua senha atual"
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.security.newPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          security: { ...prev.security, newPassword: e.target.value },
                        }))
                      }
                      placeholder="Digite a nova senha"
                      className="w-full"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.security.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        security: { ...prev.security, confirmPassword: e.target.value },
                      }))
                    }
                    placeholder="Confirme a nova senha"
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas,
                minúsculas e números.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button onClick={handleSave} className="flex items-center gap-2 w-full sm:w-auto">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 break-words">{formData.name}</h3>
                <p className="text-sm text-gray-600 break-words">{formData.specialty}</p>
                <Badge className="mt-2 break-words">{formData.license}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cadastrado desde</span>
                <span className="font-medium">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Último acesso</span>
                <span className="font-medium">Hoje</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pacientes ativos</span>
                <span className="font-medium text-primary">124</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Análises IA</span>
                <span className="font-medium text-primary">18</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              <p>
                Mantenha suas informações sempre atualizadas e use senhas seguras.
                Recomendamos alterar a senha a cada 90 dias.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
