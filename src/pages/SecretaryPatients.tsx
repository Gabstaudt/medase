import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { deletePatient, fetchPatients } from "@/lib/patient-api";
import { Patient } from "@/lib/types";
import { Mail, Plus, Trash2, Users } from "lucide-react";

export default function SecretaryPatients() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);

  const loadPatients = async () => {
    try {
      setPatients(await fetchPatients());
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível carregar os pacientes.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    void loadPatients();
  }, []);

  const handleRemovePatient = async (patientId: string, patientName: string) => {
    if (!window.confirm(`Remover ${patientName} da base de pacientes?`)) return;

    try {
      await deletePatient(patientId);
      await loadPatients();
      toast({
        title: "Paciente removido",
        description: `${patientName} foi removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível remover o paciente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Pacientes</h1>
          <p className="mt-1 text-gray-600">
            Visualização restrita aos dados pessoais e clínicos básicos.
          </p>
        </div>
        <Link to="/patients/new" className="w-full sm:w-auto">
          <Button className="flex w-full items-center gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo paciente
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-slate-50 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Pacientes cadastrados</div>
            <div className="text-2xl font-bold text-gray-900">{patients.length}</div>
            <div className="text-xs text-gray-500">Base disponível para a secretária</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Lista de pacientes</CardTitle>
            <p className="mt-1 text-sm text-gray-600">
              Nome, contato e informações essenciais para a agenda.
            </p>
          </div>
          <Badge variant="outline">{patients.length} pacientes</Badge>
        </CardHeader>
        <CardContent>
          <div className="hidden overflow-hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>Tipo sanguíneo</TableHead>
                  <TableHead>Alergias</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{patient.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.cpf}</TableCell>
                    <TableCell>
                      {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{patient.clinicalData.bloodType || "Não informado"}</TableCell>
                    <TableCell>
                      {patient.clinicalData.allergies.length > 0
                        ? patient.clinicalData.allergies.join(", ")
                        : "Nenhuma"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link to={`/patients/${patient.id}`}>
                          <Button size="sm" variant="outline">
                            Ver
                          </Button>
                        </Link>
                        <Link to={`/patients/${patient.id}/edit`}>
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => void handleRemovePatient(patient.id, patient.name)}
                        >
                          Remover
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {patients.map((patient) => (
              <div key={patient.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                  </div>
                  <Badge variant="outline">{patient.clinicalData.bloodType || "N/I"}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>CPF: {patient.cpf}</p>
                  <p>
                    Nascimento: {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                  </p>
                  <p>
                    Alergias:{" "}
                    {patient.clinicalData.allergies.length > 0
                      ? patient.clinicalData.allergies.join(", ")
                      : "Nenhuma"}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Link to={`/patients/${patient.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Ver dados
                    </Button>
                  </Link>
                  <Link to={`/patients/${patient.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => void handleRemovePatient(patient.id, patient.name)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover paciente
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
