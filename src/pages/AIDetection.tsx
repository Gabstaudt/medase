import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Brain,
  Upload,
  User,
  FileImage,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";
import { store } from "@/lib/store";
import { Patient, AIAnalysis } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const symptoms = [
  "Sangramento anormal",
  "Corrimento com odor",
  "Dor pélvica",
  "Dor durante relação sexual",
  "Sangramento pós-menopausa",
  "Períodos menstruais irregulares",
];

const riskFactors = [
  "HPV positivo",
  "Múltiplos parceiros sexuais",
  "Histórico familiar de câncer",
  "Tabagismo",
  "Sistema imunológico comprometido",
  "Uso prolongado de contraceptivos",
];

const previousExams = [
  "Papanicolaou",
  "Colposcopia",
  "Biópsia",
  "HPV DNA",
  "Citologia líquida",
];

export default function AIDetection() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysis | null>(null);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    imageFiles: [] as string[],
    clinicalData: {
      age: 0,
      symptoms: [] as string[],
      riskFactors: [] as string[],
      previousExams: [] as string[],
      additionalInfo: "",
    },
  });

  useEffect(() => {
    setPatients(store.getPatients());
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);
      setFormData((prev) => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...fileNames],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        symptoms: checked
          ? [...prev.clinicalData.symptoms, symptom]
          : prev.clinicalData.symptoms.filter((s) => s !== symptom),
      },
    }));
  };

  const handleRiskFactorChange = (factor: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        riskFactors: checked
          ? [...prev.clinicalData.riskFactors, factor]
          : prev.clinicalData.riskFactors.filter((f) => f !== factor),
      },
    }));
  };

  const handleExamChange = (exam: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      clinicalData: {
        ...prev.clinicalData,
        previousExams: checked
          ? [...prev.clinicalData.previousExams, exam]
          : prev.clinicalData.previousExams.filter((e) => e !== exam),
      },
    }));
  };

  // Simulate AI analysis
  const performAnalysis = async () => {
    if (!selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um paciente para realizar a análise.",
        variant: "destructive",
      });
      return;
    }

    if (formData.imageFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Faça upload de pelo menos uma imagem para análise.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate analysis delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);

      // Generate mock analysis results
      const riskLevel =
        Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low";
      const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence

      const mockAnalysis: AIAnalysis = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        type: "cervical_cancer_detection",
        imageFiles: formData.imageFiles,
        clinicalData: {
          ...formData.clinicalData,
          age: formData.clinicalData.age || 35,
        },
        results: {
          riskLevel: riskLevel as "low" | "medium" | "high",
          confidence,
          findings:
            riskLevel === "high"
              ? [
                  "Células anômalas detectadas",
                  "Alterações nucleares significativas",
                  "Padrão de cromatina irregular",
                ]
              : riskLevel === "medium"
              ? [
                  "Células atípicas identificadas",
                  "Alterações celulares moderadas",
                  "Necessário acompanhamento",
                ]
              : [
                  "Células dentro da normalidade",
                  "Sem alterações significativas detectadas",
                  "Padrão celular normal",
                ],
          recommendations:
            riskLevel === "high"
              ? [
                  "Colposcopia urgente",
                  "Biópsia dirigida",
                  "Encaminhamento para oncologista",
                  "Repetir exame em 3 meses",
                ]
              : riskLevel === "medium"
              ? [
                  "Colposcopia de acompanhamento",
                  "Repetir citologia em 6 meses",
                  "Monitoramento clínico",
                ]
              : [
                  "Manter rotina de exames preventivos",
                  "Repetir em 1 ano",
                  "Acompanhamento de rotina",
                ],
          requiresFollowUp: riskLevel !== "low",
        },
        analyzedAt: new Date().toISOString(),
        analyzedBy: "IA Medase v2.1",
      };

      // Save analysis to store
      store.addAnalysis(mockAnalysis);
      setAnalysisResults(mockAnalysis);
      setAnalyzing(false);
      setShowResults(true);

      toast({
        title: "Análise concluída",
        description: "A análise de IA foi realizada com sucesso.",
      });
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      imageFiles: [],
      clinicalData: {
        age: 0,
        symptoms: [],
        riskFactors: [],
        previousExams: [],
        additionalInfo: "",
      },
    });
    setSelectedPatient("");
    setShowResults(false);
    setAnalysisResults(null);
    setProgress(0);
  };

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Detecção de Câncer Cervical - IA
          </h1>
          <p className="text-gray-600 mt-1 break-words">
            Análise inteligente para detecção precoce de câncer cervical
          </p>
        </div>
        <Button
          variant="outline"
          onClick={resetForm}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      {/* AI Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">IA Medase v2.1</h3>
              <p className="text-sm text-gray-600 break-words">
                Sistema de inteligência artificial treinado para detecção de
                câncer cervical com 95% de precisão
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Seleção do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="patient">Selecione o Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha um paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.cpf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPatientData && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedPatientData.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date().getFullYear() -
                        new Date(selectedPatientData.birthDate).getFullYear()}{" "}
                      anos •
                      {selectedPatientData.gender === "female"
                        ? " Feminino"
                        : selectedPatientData.gender === "male"
                        ? " Masculino"
                        : " Outro"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-primary" />
                Upload de Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images">Imagens do Exame Citológico</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Label htmlFor="images" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Clique para fazer upload das imagens</p>
                    <p className="text-sm text-gray-400 mt-1">JPG, PNG, TIFF até 10MB cada</p>
                  </Label>
                </div>
              </div>

              {formData.imageFiles.length > 0 && (
                <div>
                  <Label>Arquivos Selecionados</Label>
                  <div className="mt-2 space-y-2">
                    {formData.imageFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm break-words">{file}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          aria-label={`Remover ${file}`}
                          title={`Remover ${file}`}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Data */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Clínicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="age">Idade da Paciente</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.clinicalData.age || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicalData: {
                        ...prev.clinicalData,
                        age: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="Ex: 35"
                />
              </div>

              <div>
                <Label>Sintomas Reportados</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {symptoms.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={`symptom-${symptom}`}
                        checked={formData.clinicalData.symptoms.includes(symptom)}
                        onCheckedChange={(checked) => handleSymptomChange(symptom, !!checked)}
                      />
                      <Label htmlFor={`symptom-${symptom}`} className="text-sm">
                        {symptom}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Fatores de Risco</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {riskFactors.map((factor) => (
                    <div key={factor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`risk-${factor}`}
                        checked={formData.clinicalData.riskFactors.includes(factor)}
                        onCheckedChange={(checked) => handleRiskFactorChange(factor, !!checked)}
                      />
                      <Label htmlFor={`risk-${factor}`} className="text-sm">
                        {factor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Exames Anteriores</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {previousExams.map((exam) => (
                    <div key={exam} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exam-${exam}`}
                        checked={formData.clinicalData.previousExams.includes(exam)}
                        onCheckedChange={(checked) => handleExamChange(exam, !!checked)}
                      />
                      <Label htmlFor={`exam-${exam}`} className="text-sm">
                        {exam}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.clinicalData.additionalInfo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicalData: {
                        ...prev.clinicalData,
                        additionalInfo: e.target.value,
                      },
                    }))
                  }
                  placeholder="Descreva qualquer informação adicional relevante..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={performAnalysis}
                disabled={analyzing || !selectedPatient || formData.imageFiles.length === 0}
                className="w-full h-12 text-lg"
              >
                {analyzing ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Iniciar Análise IA
                  </>
                )}
              </Button>
              {analyzing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Processando imagens...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Upload de Imagens</p>
                  <p className="text-gray-600">Faça upload das imagens citológicas do exame</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Dados Clínicos</p>
                  <p className="text-gray-600">Informe sintomas e fatores de risco</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Análise IA</p>
                  <p className="text-gray-600">IA analisa as imagens e dados clínicos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium">Resultados</p>
                  <p className="text-gray-600">Receba relatório detalhado com recomendações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                Importante
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              <p>
                Esta análise de IA é uma ferramenta de apoio diagnóstico e não substitui a avaliação
                médica profissional. Sempre consulte um especialista para interpretação dos resultados.
              </p>
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análises Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {store
                  .getAnalyses()
                  .slice(-3)
                  .map((analysis) => {
                    const patient = patients.find((p) => p.id === analysis.patientId);
                    const riskColor =
                      analysis.results.riskLevel === "high"
                        ? "text-red-600"
                        : analysis.results.riskLevel === "medium"
                        ? "text-amber-600"
                        : "text-green-600";

                    return (
                      <div key={analysis.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{patient?.name || "Paciente"}</p>
                        <p className={`text-xs ${riskColor}`}>
                          {analysis.results.riskLevel === "high"
                            ? "Alto Risco"
                            : analysis.results.riskLevel === "medium"
                            ? "Médio Risco"
                            : "Baixo Risco"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(analysis.analyzedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    );
                  })}
                {store.getAnalyses().length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhuma análise realizada ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Resultados da Análise IA
            </DialogTitle>
            <DialogDescription>
              Análise de detecção de câncer cervical concluída
            </DialogDescription>
          </DialogHeader>

          {analysisResults && (
            <div className="space-y-6">
              {/* Risk Level */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                    analysisResults.results.riskLevel === "high"
                      ? "bg-red-100 text-red-800"
                      : analysisResults.results.riskLevel === "medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {analysisResults.results.riskLevel === "high" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  {analysisResults.results.riskLevel === "high"
                    ? "Alto Risco"
                    : analysisResults.results.riskLevel === "medium"
                    ? "Médio Risco"
                    : "Baixo Risco"}
                </div>
              </div>

              {/* Confidence */}
              <div>
                <Label className="text-base font-semibold">Confiança da Análise</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Progress value={analysisResults.results.confidence * 100} className="flex-1" />
                  <span className="text-xl font-bold text-primary">
                    {Math.round(analysisResults.results.confidence * 100)}%
                  </span>
                </div>
              </div>

              <Separator />

              {/* Findings */}
              <div>
                <Label className="text-base font-semibold">Achados da Análise</Label>
                <ul className="mt-3 space-y-2">
                  {analysisResults.results.findings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-primary mt-1">•</span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <Label className="text-base font-semibold">Recomendações</Label>
                <ul className="mt-3 space-y-2">
                  {analysisResults.results.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-amber-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {analysisResults.results.requiresFollowUp && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <AlertTriangle className="h-5 w-5" />
                    Acompanhamento Necessário
                  </div>
                  <p className="text-amber-700 mt-2">
                    Este resultado requer acompanhamento médico especializado urgente. Entre em
                    contato com um oncologista o mais breve possível.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  Baixar Relatório Completo
                </Button>
                <Button variant="outline" onClick={() => setShowResults(false)} className="w-full sm:w-auto">
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
