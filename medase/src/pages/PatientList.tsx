import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientTable } from "@/components/PatientTable";
import { PatientCard } from "@/components/PatientCard";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Grid, List, Download, Filter } from "lucide-react";
import { store } from "@/lib/store";
import { Patient } from "@/lib/types";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { toast } = useToast();

  useEffect(() => {
    setPatients(store.getPatients());
  }, []);

  const handleDeletePatient = (patientId: string) => {
    const success = store.deletePatient(patientId);
    if (success) {
      setPatients(store.getPatients());
      toast({
        title: "Paciente excluído",
        description: "O paciente foi removido do sistema com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o paciente.",
        variant: "destructive",
      });
    }
  };

  const activePatients = patients.filter((p) => p.status === "active").length;
  const inactivePatients = patients.filter(
    (p) => p.status === "inactive",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os pacientes do sistema
          </p>
        </div>
        <Link to="/patients/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{patients.length}</div>
                <div className="text-sm text-gray-600">Total de Pacientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {activePatients}
                </div>
                <div className="text-sm text-gray-600">Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {inactivePatients}
                </div>
                <div className="text-sm text-gray-600">Inativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
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
                <div className="text-sm text-gray-600">Com Restrições</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lista de Pacientes
              <Badge variant="secondary" className="ml-2">
                {patients.length} pacientes
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-8 px-2"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            <PatientTable patients={patients} onDelete={handleDeletePatient} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
              {patients.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum paciente encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece cadastrando o primeiro paciente do sistema.
                  </p>
                  <Link to="/patients/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Paciente
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
