import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Search, Filter, Download, Mail, Phone } from "lucide-react";
import { Patient } from "@/lib/types";
import { Link } from "react-router-dom";
import { useState } from "react";

interface PatientTableProps {
  patients: Patient[];
  onDelete?: (patientId: string) => void;
}

export function PatientTable({ patients, onDelete }: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filteredPatients = patients.filter((patient) => {
    const s = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !s ||
      patient.name.toLowerCase().includes(s) ||
      patient.email.toLowerCase().includes(s) ||
      patient.cpf.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getAge = (birthDate: string) =>
    new Date().getFullYear() - new Date(birthDate).getFullYear();

  const handleDeleteClick = (patientId: string, patientName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o paciente ${patientName}?`)) {
      onDelete?.(patientId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros / Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 flex-1">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none flex items-center gap-1">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Contagem */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredPatients.length} de {patients.length} pacientes
      </div>

      {/* ===== Vista MOBILE (cards) ===== */}
      <div className="md:hidden space-y-3">
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "Nenhum paciente encontrado para a busca realizada."
              : "Nenhum paciente cadastrado."}
          </div>
        )}

        {filteredPatients.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{p.name}</div>
                <div className="text-xs text-gray-500">{p.cpf}</div>
              </div>
              <Badge
                className={
                  p.status === "active"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                {p.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1 text-sm">
              <div className="text-gray-700">
                {getAge(p.birthDate)} anos ·{" "}
                {p.gender === "female" ? "♀ Feminino" : p.gender === "male" ? "♂ Masculino" : "⚧ Outro"}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-words">{p.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="break-words">{p.phone}</span>
              </div>
              <div>
                <Badge variant="outline" className="font-mono">
                  {p.clinicalData.bloodType}
                </Badge>
              </div>
              <div className="text-gray-700">
                Último exame:{" "}
                {p.clinicalData.lastExam
                  ? new Date(p.clinicalData.lastExam).toLocaleDateString("pt-BR")
                  : "Nenhum exame"}
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Link to={`/patients/${p.id}`} className="w-full">
                <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" /> Ver
                </Button>
              </Link>
              <Link to={`/patients/${p.id}/edit`} className="w-full">
                <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" /> Editar
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleDeleteClick(p.id, p.name)}
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Vista DESKTOP (tabela) ===== */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        {/* Wrapper com scroll horizontal suave para evitar quebra */}
        <div className="overflow-x-auto">
          <Table className="min-w-[880px]">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Idade</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Tipo Sanguíneo</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Último Exame</TableHead>
                <TableHead className="font-semibold text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.cpf}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{getAge(patient.birthDate)} anos</div>
                      <div className="text-gray-500">
                        {patient.gender === "female"
                          ? "♀ Feminino"
                          : patient.gender === "male"
                          ? "♂ Masculino"
                          : "⚧ Outro"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="break-words">{patient.phone}</div>
                      <div className="text-gray-500 break-words">{patient.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {patient.clinicalData.bloodType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        patient.status === "active"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    >
                      {patient.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {patient.clinicalData.lastExam
                        ? new Date(patient.clinicalData.lastExam).toLocaleDateString("pt-BR")
                        : "Nenhum exame"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link to={`/patients/${patient.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/patients/${patient.id}/edit`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(patient.id, patient.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "Nenhum paciente encontrado para a busca realizada."
              : "Nenhum paciente cadastrado."}
          </div>
        )}
      </div>
    </div>
  );
}
