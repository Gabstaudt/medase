import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PatientTable } from "@/components/PatientTable";
import { PatientCard } from "@/components/PatientCard";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Grid, List } from "lucide-react";
import { Patient } from "@/lib/types";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { deletePatient, fetchPatients } from "@/lib/patient-api";

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { toast } = useToast();

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

  const handleDeletePatient = async (patientId: string) => {
    try {
      await deletePatient(patientId);
      await loadPatients();
      toast({
        title: "Paciente excluído",
        description: "O paciente foi removido do sistema com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Não foi possível excluir o paciente.",
        variant: "destructive",
      });
    }
  };

  const activePatients = patients.filter((p) => p.status === "active").length;
  const inactivePatients = patients.filter((p) => p.status === "inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Pacientes</h1>
          <p className="mt-1 text-gray-600">Gerencie todos os pacientes do sistema</p>
        </div>
        <Link to="/patients/new" className="w-full sm:w-auto">
          <Button className="flex w-full items-center gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo paciente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{patients.length}</div>
                <div className="text-sm text-gray-600">Total de pacientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{activePatients}</div>
                <div className="text-sm text-gray-600">Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{inactivePatients}</div>
                <div className="text-sm text-gray-600">Inativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {
                    patients.filter(
                      (p) =>
                        p.clinicalData.allergies.length > 0 ||
                        p.clinicalData.medicalHistory.length > 0,
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Com restrições</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">Lista de pacientes</span>
              <Badge variant="secondary">{patients.length} pacientes</Badge>
            </div>

            <div className="flex items-center rounded-lg border p-1">
              <Button
                aria-label="Ver em tabela"
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-2"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Ver em cartões"
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="h-8 px-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === "table" ? (
            <PatientTable patients={patients} onDelete={(id) => void handleDeletePatient(id)} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
              {patients.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-500">
                  <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Nenhum paciente encontrado
                  </h3>
                  <p className="mb-4 text-gray-500">
                    Comece cadastrando o primeiro paciente do sistema.
                  </p>
                  <Link to="/patients/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar primeiro paciente
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
