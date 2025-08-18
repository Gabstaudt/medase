import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  User,
  Brain,
  Save,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    profile: {
      doctorName: "Dr. Admin",
      license: "CRM-SP 123456",
      specialty: "Ginecologia e Obstetrícia",
      institution: "Hospital Medase",
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      systemUpdates: true,
      analysisResults: true,
      patientReminders: true,
    },
    ai: {
      confidenceThreshold: 75,
      autoAnalysis: false,
      dataRetention: 365,
      modelVersion: "v2.1",
    },
    system: {
      autoBackup: true,
      dataExport: false,
      maintenanceMode: false,
    },
  });

  const handleSave = () => {
    // Simulate saving settings
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Importação de dados",
      description: "Funcionalidade será implementada em breve.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">
          Gerencie as configurações do sistema Medase
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Perfil Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctorName">Nome do Médico</Label>
                  <Input
                    id="doctorName"
                    value={settings.profile.doctorName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          doctorName: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="license">Registro Profissional</Label>
                  <Input
                    id="license"
                    value={settings.profile.license}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, license: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={settings.profile.specialty}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, specialty: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="institution">Instituição</Label>
                  <Input
                    id="institution"
                    value={settings.profile.institution}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          institution: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailAlerts">Alertas por Email</Label>
                  <p className="text-sm text-gray-600">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch
                  id="emailAlerts"
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        emailAlerts: checked,
                      },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsAlerts">Alertas por SMS</Label>
                  <p className="text-sm text-gray-600">
                    Receber alertas urgentes via SMS
                  </p>
                </div>
                <Switch
                  id="smsAlerts"
                  checked={settings.notifications.smsAlerts}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        smsAlerts: checked,
                      },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemUpdates">Atualizações do Sistema</Label>
                  <p className="text-sm text-gray-600">
                    Notificações sobre atualizações e melhorias
                  </p>
                </div>
                <Switch
                  id="systemUpdates"
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        systemUpdates: checked,
                      },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analysisResults">
                    Resultados de Análise IA
                  </Label>
                  <p className="text-sm text-gray-600">
                    Notificações quando análises estiverem prontas
                  </p>
                </div>
                <Switch
                  id="analysisResults"
                  checked={settings.notifications.analysisResults}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        analysisResults: checked,
                      },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="patientReminders">
                    Lembretes de Pacientes
                  </Label>
                  <p className="text-sm text-gray-600">
                    Lembretes de consultas e exames agendados
                  </p>
                </div>
                <Switch
                  id="patientReminders"
                  checked={settings.notifications.patientReminders}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        patientReminders: checked,
                      },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Configurações de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="confidenceThreshold">
                  Limite de Confiança ({settings.ai.confidenceThreshold}%)
                </Label>
                <input
                  type="range"
                  id="confidenceThreshold"
                  min="50"
                  max="95"
                  value={settings.ai.confidenceThreshold}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ai: {
                        ...prev.ai,
                        confidenceThreshold: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Análises com confiança abaixo deste valor requerem revisão
                  manual
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAnalysis">Análise Automática</Label>
                  <p className="text-sm text-gray-600">
                    Executar análise automaticamente ao fazer upload
                  </p>
                </div>
                <Switch
                  id="autoAnalysis"
                  checked={settings.ai.autoAnalysis}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, autoAnalysis: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div>
                <Label htmlFor="dataRetention">Retenção de Dados (dias)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={settings.ai.dataRetention}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ai: {
                        ...prev.ai,
                        dataRetention: parseInt(e.target.value) || 365,
                      },
                    }))
                  }
                />
                <p className="text-sm text-gray-600 mt-1">
                  Tempo para manter dados de análise no sistema
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Backup Automático</Label>
                  <p className="text-sm text-gray-600">
                    Realizar backup diário dos dados
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.system.autoBackup}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      system: { ...prev.system, autoBackup: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataExport">Exportação de Dados</Label>
                  <p className="text-sm text-gray-600">
                    Permitir exportação de dados em lote
                  </p>
                </div>
                <Switch
                  id="dataExport"
                  checked={settings.system.dataExport}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      system: { ...prev.system, dataExport: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Modo de Manutenção</Label>
                  <p className="text-sm text-gray-600">
                    Desabilitar acesso para manutenção
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.system.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      system: { ...prev.system, maintenanceMode: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Configurações
            </Button>
            <Button variant="outline">Cancelar</Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Versão IA</span>
                <Badge variant="outline">{settings.ai.modelVersion}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Último Backup</span>
                <span className="text-sm text-gray-600">Hoje, 03:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm text-gray-600">99.9%</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleImportData}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Sistema
              </Button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              <p>
                Mantenha suas configurações de segurança sempre atualizadas.
                Revise regularmente as permissões de acesso e os logs do
                sistema.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Ver Logs de Segurança
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong> suporte@medase.com
              </p>
              <p>
                <strong>Telefone:</strong> (11) 4000-0000
              </p>
              <p>
                <strong>Horário:</strong> 8h às 18h
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Abrir Chamado
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
