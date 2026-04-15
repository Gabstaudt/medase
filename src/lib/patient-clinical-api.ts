import { getAccessToken } from "@/lib/auth";
import { PatientExamRecord, PatientMedicationRecord } from "@/lib/types";

export type ExamCatalogItem = {
  exame_id: number;
  nome: string;
  descricao: string;
  categoria: "laboratorial" | "imagem" | "funcional" | "outros";
  preco: number;
  preparacao?: string | null;
  observacoes?: string | null;
  ativo: boolean;
};

export type MedicationCatalogItem = {
  medicamento_id: number;
  nome: string;
  principio_ativo: string;
  dosagem: string;
  forma_farmaceutica:
    | "comprimido"
    | "capsula"
    | "liquido"
    | "injetavel"
    | "topico"
    | "outros";
  fabricante: string;
  descricao?: string | null;
  contraindicoes?: string | null;
  contraindicacoes?: string | null;
  efeitos_colaterais?: string | null;
  ativo: boolean;
};

export type PatientHistoryItem = {
  historico_id: number;
  paciente_id: number;
  titulo: string;
  descricao: string;
  data_registro: string;
};

type PatientExamApi = {
  paciente_exame_id: number;
  paciente_id: number;
  nome: string;
  data_exame: string;
  status: string;
  resultado: string;
  descricao?: string | null;
  observacoes?: string | null;
  pdf_nome?: string | null;
};

type PatientMedicationApi = {
  paciente_medicamento_id: number;
  paciente_id: number;
  nome: string;
  dosagem?: string | null;
  periodo: string;
  status: string;
  descricao: string;
  observacoes?: string | null;
};

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

function mapExamRecord(record: PatientExamApi): PatientExamRecord {
  return {
    id: String(record.paciente_exame_id),
    name: record.nome,
    date: record.data_exame,
    status: record.status,
    result: record.resultado,
    description: record.descricao || record.observacoes || undefined,
    pdfName: record.pdf_nome || undefined,
  };
}

function mapMedicationRecord(record: PatientMedicationApi): PatientMedicationRecord {
  const summary = [record.dosagem, record.observacoes].filter(Boolean).join(" • ");
  return {
    id: String(record.paciente_medicamento_id),
    name: record.nome,
    period: record.periodo,
    status: record.status,
    description: summary ? `${record.descricao} • ${summary}` : record.descricao,
  };
}

export async function fetchExamCatalog(): Promise<ExamCatalogItem[]> {
  return apiRequest<ExamCatalogItem[]>("/exames/");
}

export async function createExamCatalogItem(payload: {
  nome: string;
  descricao: string;
  categoria: ExamCatalogItem["categoria"];
  preco: number;
  preparacao?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
}): Promise<ExamCatalogItem> {
  return apiRequest<ExamCatalogItem>("/exames/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo: true, ...payload }),
  });
}

export async function fetchMedicationCatalog(): Promise<MedicationCatalogItem[]> {
  return apiRequest<MedicationCatalogItem[]>("/medicamentos/");
}

export async function createMedicationCatalogItem(payload: {
  nome: string;
  principio_ativo: string;
  dosagem: string;
  forma_farmaceutica: MedicationCatalogItem["forma_farmaceutica"];
  fabricante: string;
  descricao?: string | null;
  contraindicacoes?: string | null;
  efeitos_colaterais?: string | null;
  ativo?: boolean;
}): Promise<MedicationCatalogItem> {
  return apiRequest<MedicationCatalogItem>("/medicamentos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo: true, ...payload }),
  });
}

export async function fetchPatientHistory(patientId: string): Promise<PatientHistoryItem[]> {
  return apiRequest<PatientHistoryItem[]>(`/pacientes/${patientId}/historico-clinico`);
}

export async function createPatientHistory(
  patientId: string,
  payload: Omit<PatientHistoryItem, "historico_id" | "paciente_id">,
): Promise<PatientHistoryItem> {
  return apiRequest<PatientHistoryItem>(`/pacientes/${patientId}/historico-clinico`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updatePatientHistory(
  patientId: string,
  historyId: string,
  payload: Partial<Omit<PatientHistoryItem, "historico_id" | "paciente_id">>,
): Promise<PatientHistoryItem> {
  return apiRequest<PatientHistoryItem>(`/pacientes/${patientId}/historico-clinico/${historyId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deletePatientHistory(patientId: string, historyId: string): Promise<void> {
  await apiRequest<void>(`/pacientes/${patientId}/historico-clinico/${historyId}`, {
    method: "DELETE",
  });
}

export async function fetchPatientExamRecords(patientId: string): Promise<PatientExamRecord[]> {
  const records = await apiRequest<PatientExamApi[]>(`/pacientes/${patientId}/exames`);
  return records.map(mapExamRecord);
}

export async function createPatientExamRecord(
  patientId: string,
  payload: {
    nome: string;
    data_exame: string;
    status: string;
    resultado: string;
    descricao?: string | null;
    observacoes?: string | null;
    pdf_nome?: string | null;
  },
): Promise<PatientExamRecord> {
  const record = await apiRequest<PatientExamApi>(`/pacientes/${patientId}/exames`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapExamRecord(record);
}

export async function updatePatientExamRecord(
  patientId: string,
  examId: string,
  payload: Partial<{
    nome: string;
    data_exame: string;
    status: string;
    resultado: string;
    descricao?: string | null;
    observacoes?: string | null;
    pdf_nome?: string | null;
  }>,
): Promise<PatientExamRecord> {
  const record = await apiRequest<PatientExamApi>(`/pacientes/${patientId}/exames/${examId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapExamRecord(record);
}

export async function deletePatientExamRecord(patientId: string, examId: string): Promise<void> {
  await apiRequest<void>(`/pacientes/${patientId}/exames/${examId}`, { method: "DELETE" });
}

export async function fetchPatientMedicationRecords(
  patientId: string,
): Promise<PatientMedicationRecord[]> {
  const records = await apiRequest<PatientMedicationApi[]>(`/pacientes/${patientId}/medicamentos`);
  return records.map(mapMedicationRecord);
}

export async function createPatientMedicationRecord(
  patientId: string,
  payload: {
    nome: string;
    dosagem?: string | null;
    periodo: string;
    status: string;
    descricao: string;
    observacoes?: string | null;
  },
): Promise<PatientMedicationRecord> {
  const record = await apiRequest<PatientMedicationApi>(`/pacientes/${patientId}/medicamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapMedicationRecord(record);
}

export async function updatePatientMedicationRecord(
  patientId: string,
  medicationId: string,
  payload: Partial<{
    nome: string;
    dosagem?: string | null;
    periodo: string;
    status: string;
    descricao: string;
    observacoes?: string | null;
  }>,
): Promise<PatientMedicationRecord> {
  const record = await apiRequest<PatientMedicationApi>(
    `/pacientes/${patientId}/medicamentos/${medicationId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return mapMedicationRecord(record);
}

export async function deletePatientMedicationRecord(
  patientId: string,
  medicationId: string,
): Promise<void> {
  await apiRequest<void>(`/pacientes/${patientId}/medicamentos/${medicationId}`, {
    method: "DELETE",
  });
}
