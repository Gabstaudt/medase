import { getAccessToken } from "@/lib/auth";
import { Patient } from "@/lib/types";

type BackendPatient = {
  paciente_id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  genero: string;
  email: string;
  telefone: string;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  dados_clinicos?: string | null;
  tipo_sanguineo?: string | null;
  ultimo_exame?: string | null;
  alergias?: string | null;
  medicamentos?: string | null;
  historico_medico?: string | null;
  observacoes?: string | null;
  contato_emergencia_nome?: string | null;
  contato_emergencia_parentesco?: string | null;
  contato_emergencia_telefone?: string | null;
};

type PatientPayload = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  genero: string;
  email: string;
  telefone: string;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  dados_clinicos?: string | null;
  tipo_sanguineo?: string | null;
  ultimo_exame?: string | null;
  alergias?: string | null;
  medicamentos?: string | null;
  historico_medico?: string | null;
  observacoes?: string | null;
  contato_emergencia_nome?: string | null;
  contato_emergencia_parentesco?: string | null;
  contato_emergencia_telefone?: string | null;
};

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

function splitTextList(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinTextList(values: string[]): string | null {
  const sanitized = values.map((item) => item.trim()).filter(Boolean);
  return sanitized.length > 0 ? sanitized.join(", ") : null;
}

function normalizeGender(value: string): Patient["gender"] {
  const normalized = value.toLowerCase();
  if (normalized === "female" || normalized === "feminino") return "female";
  if (normalized === "male" || normalized === "masculino") return "male";
  return "other";
}

function serializeGender(value: Patient["gender"]): string {
  if (value === "female") return "feminino";
  if (value === "male") return "masculino";
  return "outro";
}

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

export function mapBackendPatientToPatient(patient: BackendPatient): Patient {
  const now = new Date().toISOString();
  return {
    id: String(patient.paciente_id),
    name: patient.nome,
    email: patient.email,
    phone: patient.telefone,
    cpf: patient.cpf,
    birthDate: patient.data_nascimento,
    gender: normalizeGender(patient.genero),
    address: {
      street: patient.rua || "",
      number: patient.numero || "",
      complement: patient.complemento || "",
      city: patient.cidade || "",
      state: patient.estado || "",
      zipCode: patient.cep || "",
    },
    clinicalData: {
      bloodType: patient.tipo_sanguineo || "",
      allergies: splitTextList(patient.alergias),
      medications: splitTextList(patient.medicamentos),
      medicalHistory: splitTextList(patient.historico_medico),
      lastExam: patient.ultimo_exame || "",
      observations: patient.observacoes || "",
    },
    emergencyContact: {
      name: patient.contato_emergencia_nome || "",
      relationship: patient.contato_emergencia_parentesco || "",
      phone: patient.contato_emergencia_telefone || "",
    },
    createdAt: now,
    updatedAt: now,
    status: "active",
  };
}

export function mapPatientToPayload(patient: Patient): PatientPayload {
  return {
    nome: patient.name.trim(),
    cpf: patient.cpf.trim(),
    data_nascimento: patient.birthDate,
    genero: serializeGender(patient.gender),
    email: patient.email.trim(),
    telefone: patient.phone.trim(),
    rua: patient.address.street || null,
    numero: patient.address.number || null,
    complemento: patient.address.complement || null,
    cidade: patient.address.city || null,
    estado: patient.address.state || null,
    cep: patient.address.zipCode || null,
    dados_clinicos: null,
    tipo_sanguineo: patient.clinicalData.bloodType || null,
    ultimo_exame: patient.clinicalData.lastExam || null,
    alergias: joinTextList(patient.clinicalData.allergies),
    medicamentos: joinTextList(patient.clinicalData.medications),
    historico_medico: joinTextList(patient.clinicalData.medicalHistory),
    observacoes: patient.clinicalData.observations || null,
    contato_emergencia_nome: patient.emergencyContact.name || null,
    contato_emergencia_parentesco: patient.emergencyContact.relationship || null,
    contato_emergencia_telefone: patient.emergencyContact.phone || null,
  };
}

export async function fetchPatients(): Promise<Patient[]> {
  const data = await apiRequest<BackendPatient[]>("/pacientes/");
  return data.map(mapBackendPatientToPatient);
}

export async function fetchPatient(patientId: string): Promise<Patient> {
  const data = await apiRequest<BackendPatient>(`/pacientes/${patientId}`);
  return mapBackendPatientToPatient(data);
}

export async function createPatient(patient: Patient): Promise<Patient> {
  const data = await apiRequest<BackendPatient>("/pacientes/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapPatientToPayload(patient)),
  });
  return mapBackendPatientToPatient(data);
}

export async function updatePatient(patientId: string, patient: Patient): Promise<Patient> {
  const data = await apiRequest<BackendPatient>(`/pacientes/${patientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapPatientToPayload(patient)),
  });
  return mapBackendPatientToPatient(data);
}

export async function deletePatient(patientId: string): Promise<void> {
  await apiRequest<void>(`/pacientes/${patientId}`, { method: "DELETE" });
}
