import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  Calendar,
  Phone,
  Mail,
  Eye,
  Edit,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Patient } from "@/lib/types";
import { Link } from "react-router-dom";

interface PatientCardProps {
  patient: Patient;
  compact?: boolean;
}

export function PatientCard({ patient, compact = false }: PatientCardProps) {
  const age =
    new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  const statusColor =
    patient.status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  const genderIcon =
    patient.gender === "female" ? "♀" : patient.gender === "male" ? "♂" : "⚧";

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary">
      <CardHeader className={cn("pb-2", compact && "pb-1")}>
        {/* Header responsivo: empilha no mobile, lado a lado no ≥sm */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="truncate">{patient.name}</span>
                <span className="text-sm text-gray-500">{genderIcon}</span>
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {age} anos
              </p>
            </div>
          </div>

          {/* Badge desce no mobile, mantém visual no desktop */}
          <div className="sm:self-start">
            <Badge className={statusColor}>
              {patient.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-3", compact && "space-y-2")}>
        {!compact && (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 shrink-0" />
              {/* Evita quebrar o layout com e-mails longos */}
              <span className="break-words">{patient.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="break-words">{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-3 w-3 shrink-0" />
              <span>Tipo sanguíneo: {patient.clinicalData.bloodType}</span>
            </div>
            {patient.clinicalData.allergies.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                <span className="break-words">
                  Alergias: {patient.clinicalData.allergies.join(", ")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Botões responsivos: ocupam a largura no mobile, lado a lado no ≥sm */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2">
          <Link to={`/patients/${patient.id}`} className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Ver Detalhes
            </Button>
          </Link>
          <Link to={`/patients/${patient.id}/edit`} className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Editar
            </Button>
          </Link>
        </div>

        <div className="text-xs text-gray-400 pt-1">
          Última atualização:{" "}
          {new Date(patient.updatedAt).toLocaleDateString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  );
}
