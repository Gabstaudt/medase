export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  gender: "female" | "male" | "other";
  address: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  clinicalData: {
    bloodType: string;
    allergies: string[];
    medications: string[];
    medicalHistory: string[];
    lastExam: string;
    observations: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
}

export interface AIAnalysis {
  id: string;
  patientId: string;
  type: "cervical_cancer_detection";
  imageFiles: string[];
  clinicalData: {
    age: number;
    symptoms: string[];
    riskFactors: string[];
    previousExams: string[];
  };
  results: {
    riskLevel: "low" | "medium" | "high";
    confidence: number;
    findings: string[];
    recommendations: string[];
    requiresFollowUp: boolean;
  };
  analyzedAt: string;
  analyzedBy: string;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  pendingExams: number;
  aiAnalysesThisMonth: number;
  recentPatients: Patient[];
  recentAnalyses: AIAnalysis[];
}

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  description?: string;
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  category: "laboratorial" | "imagem" | "funcional" | "outros";
  price: number;
  duration: number; // in minutes
  preparation?: string;
  observations?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
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
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  license: string;
  specialty: string;
  institution: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  credentials: {
    university: string;
    graduationYear: number;
    residency?: string;
    specializations: string[];
  };
  createdAt: string;
  updatedAt: string;
}
