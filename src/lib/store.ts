import {
  Patient,
  AIAnalysis,
  DashboardStats,
  DoctorAppointment,
} from "./types";

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    email: "maria.silva@email.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    birthDate: "1985-03-15",
    gender: "female",
    address: {
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    clinicalData: {
      bloodType: "A+",
      allergies: ["Penicilina"],
      medications: ["Vitamina D"],
      medicalHistory: ["Hipertensão"],
      lastExam: "2024-01-15",
      observations: "Paciente com acompanhamento regular",
    },
    emergencyContact: {
      name: "João Silva",
      relationship: "Esposo",
      phone: "(11) 88888-8888",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    status: "active",
  },
  {
    id: "2",
    name: "Ana Carolina Oliveira",
    email: "ana.oliveira@email.com",
    phone: "(11) 77777-7777",
    cpf: "987.654.321-00",
    birthDate: "1992-07-22",
    gender: "female",
    address: {
      street: "Avenida Principal",
      number: "456",
      city: "São Paulo",
      state: "SP",
      zipCode: "02345-678",
    },
    clinicalData: {
      bloodType: "O+",
      allergies: [],
      medications: [],
      medicalHistory: [],
      lastExam: "2024-02-10",
      observations: "Paciente saudável",
    },
    emergencyContact: {
      name: "Pedro Oliveira",
      relationship: "Irmão",
      phone: "(11) 66666-6666",
    },
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-10T00:00:00Z",
    status: "active",
  },
];

const mockAnalyses: AIAnalysis[] = [
  {
    id: "1",
    patientId: "1",
    type: "cervical_cancer_detection",
    imageFiles: ["exam1.jpg", "exam2.jpg"],
    clinicalData: {
      age: 39,
      symptoms: ["Sangramento irregular"],
      riskFactors: ["HPV positivo"],
      previousExams: ["Papanicolaou 2023"],
    },
    results: {
      riskLevel: "medium",
      confidence: 0.85,
      findings: ["Células atípicas detectadas", "Possível lesão pré-cancerosa"],
      recommendations: [
        "Colposcopia",
        "Biópsia dirigida",
        "Acompanhamento em 3 meses",
      ],
      requiresFollowUp: true,
    },
    analyzedAt: "2024-03-01T10:30:00Z",
    analyzedBy: "IA Medase v2.1",
  },
];

const mockAppointments: DoctorAppointment[] = [
  {
    id: "apt-1",
    patientId: "1",
    doctorName: "Dra. Helena Costa",
    specialty: "Ginecologia",
    startsAt: "2026-04-10T09:00:00",
    status: "confirmed",
    notes: "Retorno para revisão de exames",
  },
  {
    id: "apt-2",
    patientId: "2",
    doctorName: "Dra. Helena Costa",
    specialty: "Ginecologia",
    startsAt: "2026-04-10T10:30:00",
    status: "waiting",
    notes: "Primeira consulta",
  },
  {
    id: "apt-3",
    patientId: "1",
    doctorName: "Dra. Helena Costa",
    specialty: "Ginecologia",
    startsAt: "2026-04-11T14:00:00",
    status: "confirmed",
    notes: "Avaliação clínica",
  },
];

// Simple state management
class MedaseStore {
  private patients: Patient[] = [...mockPatients];
  private analyses: AIAnalysis[] = [...mockAnalyses];
  private appointments: DoctorAppointment[] = [...mockAppointments];

  // Patient management
  getPatients(): Patient[] {
    return [...this.patients];
  }

  getPatient(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  addPatient(
    patient: Omit<Patient, "id" | "createdAt" | "updatedAt">,
  ): Patient {
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.patients.push(newPatient);
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.patients[index] = {
      ...this.patients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.patients[index];
  }

  deletePatient(id: string): boolean {
    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.patients.splice(index, 1);
    return true;
  }

  searchPatients(query: string): Patient[] {
    const lowercaseQuery = query.toLowerCase();
    return this.patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(lowercaseQuery) ||
        patient.email.toLowerCase().includes(lowercaseQuery) ||
        patient.cpf.includes(query),
    );
  }

  // AI Analysis management
  getAnalyses(): AIAnalysis[] {
    return [...this.analyses];
  }

  getPatientAnalyses(patientId: string): AIAnalysis[] {
    return this.analyses.filter((a) => a.patientId === patientId);
  }

  getAppointments(): DoctorAppointment[] {
    return [...this.appointments].sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  }

  updateAppointmentStatus(
    appointmentId: string,
    status: DoctorAppointment["status"],
  ): DoctorAppointment | undefined {
    const index = this.appointments.findIndex((a) => a.id === appointmentId);
    if (index === -1) return undefined;

    this.appointments[index] = {
      ...this.appointments[index],
      status,
    };

    return this.appointments[index];
  }

  deleteAppointment(appointmentId: string): boolean {
    const index = this.appointments.findIndex((a) => a.id === appointmentId);
    if (index === -1) return false;

    this.appointments.splice(index, 1);
    return true;
  }

  addAnalysis(analysis: Omit<AIAnalysis, "id" | "analyzedAt">): AIAnalysis {
    const newAnalysis: AIAnalysis = {
      ...analysis,
      id: Date.now().toString(),
      analyzedAt: new Date().toISOString(),
    };
    this.analyses.push(newAnalysis);
    return newAnalysis;
  }

  // Dashboard stats
  getDashboardStats(): DashboardStats {
    const activePatients = this.patients.filter((p) => p.status === "active");
    const recentPatients = this.patients
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const aiAnalysesThisMonth = this.analyses.filter((a) => {
      const analysisDate = new Date(a.analyzedAt);
      return (
        analysisDate.getMonth() === currentMonth &&
        analysisDate.getFullYear() === currentYear
      );
    }).length;

    return {
      totalPatients: this.patients.length,
      activePatients: activePatients.length,
      pendingExams: Math.floor(Math.random() * 10) + 5, // Mock data
      aiAnalysesThisMonth,
      recentPatients,
      recentAnalyses: this.analyses.slice(-3),
    };
  }

  getSecretaryDashboardData() {
    const activePatients = this.patients.filter((p) => p.status === "active");
    const appointments = this.getAppointments();
    const today = new Date().toISOString().slice(0, 10);

    return {
      totalPatients: this.patients.length,
      activePatients: activePatients.length,
      appointmentsToday: appointments.filter((a) =>
        a.startsAt.startsWith(today),
      ).length,
      waitingAppointments: appointments.filter((a) => a.status === "waiting")
        .length,
      appointments,
      patients: this.getPatients(),
    };
  }
}

export const store = new MedaseStore();
