import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { store } from "@/lib/store";
import { DoctorAppointment, Patient } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

type SecretarySnapshot = ReturnType<typeof store.getSecretaryDashboardData>;
type CalendarView = "day" | "week" | "month";
type CalendarAppointment = DoctorAppointment & {
  endsAt: string;
};

const appointmentStatusStyles: Record<DoctorAppointment["status"], string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  waiting: "bg-amber-100 text-amber-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const appointmentStatusLabels: Record<DoctorAppointment["status"], string> = {
  confirmed: "Confirmada",
  waiting: "Aguardando",
  cancelled: "Cancelada",
};

export default function SecretaryDashboard() {
  const { toast } = useToast();
  const [snapshot, setSnapshot] = useState<SecretarySnapshot | null>(null);
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const refreshSnapshot = () => {
    setSnapshot(store.getSecretaryDashboardData());
  };

  useEffect(() => {
    refreshSnapshot();
  }, []);

  const groupedAppointments = useMemo(() => {
    if (!snapshot) return [];

    const groups = new Map<string, DoctorAppointment[]>();

    for (const appointment of snapshot.appointments) {
      const dateKey = new Date(appointment.startsAt).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
      const currentGroup = groups.get(dateKey) ?? [];
      currentGroup.push(appointment);
      groups.set(dateKey, currentGroup);
    }

    return Array.from(groups.entries());
  }, [snapshot]);

  const calendarAppointments = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.appointments.map((appointment) => ({
      ...appointment,
      endsAt: addMinutesToIsoString(appointment.startsAt, 60),
    }));
  }, [snapshot]);

  const handleRemovePatient = (patientId: string, patientName: string) => {
    if (!window.confirm(`Remover ${patientName} da base de pacientes?`)) return;

    const deleted = store.deletePatient(patientId);
    if (!deleted) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o paciente.",
        variant: "destructive",
      });
      return;
    }

    refreshSnapshot();
    toast({
      title: "Paciente removido",
      description: `${patientName} foi removido com sucesso.`,
    });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    const removed = store.deleteAppointment(appointmentId);
    if (!removed) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento.",
        variant: "destructive",
      });
      return;
    }

    refreshSnapshot();
    toast({
      title: "Agendamento removido",
      description: "A agenda do médico foi atualizada.",
    });
  };

  const handleCalendarAppointmentClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    const element = document.getElementById(`appointment-${appointmentId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (!snapshot) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Área da Secretária
          </h1>
          <p className="mt-1 text-gray-600">
            Gerencie a agenda da médica e os dados essenciais dos pacientes.
          </p>
        </div>
        <Link to="/patients/new" className="w-full md:w-auto">
          <Button className="flex w-full items-center gap-2 md:w-auto">
            <UserPlus className="h-4 w-4" />
            Cadastrar paciente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Pacientes"
          value={snapshot.totalPatients}
          description="Pacientes vinculados"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Ativos"
          value={snapshot.activePatients}
          description="Em acompanhamento"
          icon={<Users className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          title="Agenda hoje"
          value={snapshot.appointmentsToday}
          description="Consultas do dia"
          icon={<CalendarDays className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Em espera"
          value={snapshot.waitingAppointments}
          description="Pacientes aguardando"
          icon={<Clock3 className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <Card className="overflow-hidden border-none bg-[#F8FAFC] shadow-[0_18px_45px_-26px_rgba(15,23,42,0.28)]">
        <CardHeader className="gap-4 border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReferenceDate(new Date())}
                className="rounded-full border-slate-300 bg-white px-5"
              >
                Today
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setReferenceDate(shiftReferenceDate(referenceDate, calendarView, -1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setReferenceDate(shiftReferenceDate(referenceDate, calendarView, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <h2 className="pl-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {formatCalendarTitle(referenceDate, calendarView)}
                </h2>
              </div>
            </div>
            <Select
              value={calendarView}
              onValueChange={(value: CalendarView) => setCalendarView(value)}
            >
              <SelectTrigger className="w-[140px] rounded-full border-slate-300 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <CalendarShell
            view={calendarView}
            referenceDate={referenceDate}
            appointments={calendarAppointments}
            patients={snapshot.patients}
            onAppointmentClick={handleCalendarAppointmentClick}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Agenda da médica</CardTitle>
            <p className="mt-1 text-sm text-gray-600">
              A secretária acompanha e ajusta somente os horários da agenda.
            </p>
          </div>
          <Badge variant="outline">{snapshot.appointments.length} agendamentos</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          {groupedAppointments.map(([dateLabel, appointments]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="font-semibold capitalize text-gray-900">{dateLabel}</h3>
              </div>
              <div className="grid gap-3">
                {appointments.map((appointment) => {
                  const patient = snapshot.patients.find(
                    (item) => item.id === appointment.patientId,
                  );

                  return (
                    <div
                      key={appointment.id}
                      id={`appointment-${appointment.id}`}
                      className={`flex flex-col gap-3 rounded-xl border p-4 transition lg:flex-row lg:items-center lg:justify-between ${
                        selectedAppointmentId === appointment.id
                          ? "border-[#1A73E8] ring-2 ring-[#1A73E8]/15"
                          : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {patient?.name ?? "Paciente não encontrado"}
                          </span>
                          <Badge className={appointmentStatusStyles[appointment.status]}>
                            {appointmentStatusLabels[appointment.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {appointment.doctorName} • {appointment.specialty}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.startsAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {appointment.notes ? ` • ${appointment.notes}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {patient && (
                          <Link to={`/patients/${patient.id}`} className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto">
                              Ver paciente
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Retirar da agenda
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Pacientes cadastrados</CardTitle>
            <p className="mt-1 text-sm text-gray-600">
              Visualização restrita aos dados pessoais e clínicos básicos.
            </p>
          </div>
          <Link to="/patients/new" className="w-full sm:w-auto">
            <Button variant="outline" className="flex w-full items-center gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo paciente
            </Button>
          </Link>
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
                {snapshot.patients.map((patient) => (
                  <SecretaryPatientRow
                    key={patient.id}
                    patient={patient}
                    onRemove={handleRemovePatient}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {snapshot.patients.map((patient) => (
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
                    onClick={() => handleRemovePatient(patient.id, patient.name)}
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

function CalendarShell({
  view,
  referenceDate,
  appointments,
  patients,
  onAppointmentClick,
}: {
  view: CalendarView;
  referenceDate: Date;
  appointments: CalendarAppointment[];
  patients: Patient[];
  onAppointmentClick: (appointmentId: string) => void;
}) {
  if (view === "month") {
    return (
      <MonthCalendar
        referenceDate={referenceDate}
        appointments={appointments}
        patients={patients}
        onAppointmentClick={onAppointmentClick}
      />
    );
  }

  return (
    <TimeGridCalendar
      view={view}
      referenceDate={referenceDate}
      appointments={appointments}
      patients={patients}
      onAppointmentClick={onAppointmentClick}
    />
  );
}

function MonthCalendar({
  referenceDate,
  appointments,
  patients,
  onAppointmentClick,
}: {
  referenceDate: Date;
  appointments: CalendarAppointment[];
  patients: Patient[];
  onAppointmentClick: (appointmentId: string) => void;
}) {
  const monthDays = getMonthGrid(referenceDate);
  const visibleMonth = referenceDate.getMonth();
  const weeks = chunkDays(monthDays, 7);
  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[980px] overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div
          className="grid border-b border-slate-200 bg-white"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        >
          {weekdayLabels.map((label, index) => (
            <div
              key={label}
              className={`px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 ${
                index < weekdayLabels.length - 1 ? "border-r border-slate-200" : ""
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="bg-white">
          {weeks.map((week, weekIndex) => (
            <div
              key={week[0].toISOString()}
              className={weekIndex < weeks.length - 1 ? "border-b border-slate-200" : ""}
            >
              <div
                className="grid"
                style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
              >
                {week.map((day, dayIndex) => {
                  const dayAppointments = appointments.filter((appointment) =>
                    isSameDay(new Date(appointment.startsAt), day),
                  );
                  const isCurrentMonth = day.getMonth() === visibleMonth;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[176px] p-3 align-top ${
                        dayIndex < 6 ? "border-r border-slate-200" : ""
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-start">
                        <span
                          className={`inline-flex min-h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-medium ${
                            isToday(day)
                              ? "bg-[#1A73E8] text-white"
                              : isCurrentMonth
                                ? "text-slate-900"
                                : "text-slate-400"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {dayAppointments.slice(0, 4).map((appointment) => {
                          const patient = patients.find((item) => item.id === appointment.patientId);
                          const calendarStatus = getCalendarStatus(appointment);
                          return (
                            <button
                              type="button"
                              key={appointment.id}
                              className={`block w-full truncate rounded-md px-2 py-1 text-left text-xs font-medium transition hover:brightness-95 ${calendarStatus.monthClassName}`}
                              title={`${formatEventTime(appointment.startsAt)} ${patient?.name ?? "Paciente"} - ${calendarStatus.label}`}
                              onClick={() => onAppointmentClick(appointment.id)}
                            >
                              {formatEventTime(appointment.startsAt)} {patient?.name ?? "Paciente"}
                            </button>
                          );
                        })}
                        {dayAppointments.length > 4 && (
                          <div className="px-1 text-xs font-medium text-slate-500">
                            +{dayAppointments.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeGridCalendar({
  view,
  referenceDate,
  appointments,
  patients,
  onAppointmentClick,
}: {
  view: Extract<CalendarView, "day" | "week">;
  referenceDate: Date;
  appointments: CalendarAppointment[];
  patients: Patient[];
  onAppointmentClick: (appointmentId: string) => void;
}) {
  const days = view === "day" ? [startOfDay(referenceDate)] : getWeekDaysSunday(referenceDate);
  const startHour = 7;
  const endHour = 20;
  const hourHeight = 64;
  const totalHeight = (endHour - startHour) * hourHeight;

  return (
    <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `84px repeat(${days.length}, minmax(${view === "day" ? "360px" : "180px"}, 1fr))`,
          minWidth: view === "day" ? "480px" : "1120px",
        }}
      >
        <div className="border-r border-slate-200 bg-white" />
        {days.map((day, index) => (
          <div
            key={day.toISOString()}
            className={`border-b border-slate-200 bg-white px-4 py-4 ${index < days.length - 1 ? "border-r border-slate-200" : ""}`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold ${
                  isToday(day) ? "bg-[#1A73E8] text-white" : "text-slate-900"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          </div>
        ))}

        <div className="relative border-r border-slate-200 bg-white" style={{ height: totalHeight }}>
          {Array.from({ length: endHour - startHour }, (_, index) => {
            const top = index * hourHeight;
            return (
              <div
                key={index}
                className="absolute inset-x-0 border-t border-slate-200"
                style={{ top }}
              >
                <span className="absolute -top-3 left-2 bg-white px-1 text-xs text-slate-500">
                  {formatHourLabel(startHour + index)}
                </span>
              </div>
            );
          })}
        </div>

        {days.map((day, dayIndex) => {
          const dayAppointments = layoutAppointments(
            appointments.filter((appointment) =>
              isSameDay(new Date(appointment.startsAt), day),
            ),
          );

          return (
            <div
              key={day.toISOString()}
              className={`relative bg-white ${dayIndex < days.length - 1 ? "border-r border-slate-200" : ""}`}
              style={{ height: totalHeight }}
            >
              {Array.from({ length: endHour - startHour }, (_, index) => (
                <div
                  key={index}
                  className="absolute inset-x-0 border-t border-slate-200"
                  style={{ top: index * hourHeight }}
                />
              ))}
              {dayAppointments.map((item) => {
                const patient = patients.find((entry) => entry.id === item.appointment.patientId);
                const calendarStatus = getCalendarStatus(item.appointment);
                return (
                  <button
                    type="button"
                    key={item.appointment.id}
                    className={`absolute overflow-hidden rounded-xl border px-3 py-2 text-left shadow-sm transition hover:brightness-95 ${calendarStatus.gridClassName}`}
                    style={{
                      top: item.top,
                      height: item.height,
                      left: `calc(${(item.column / item.totalColumns) * 100}% + 6px)`,
                      width: `calc(${100 / item.totalColumns}% - 12px)`,
                    }}
                    title={`${patient?.name ?? "Paciente"} - ${formatEventTime(item.appointment.startsAt)} - ${calendarStatus.label}`}
                    onClick={() => onAppointmentClick(item.appointment.id)}
                  >
                    <div className="truncate text-xs font-semibold uppercase tracking-[0.12em]">
                      {formatEventTime(item.appointment.startsAt)}
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {patient?.name ?? "Paciente"}
                    </div>
                    <div className="truncate text-xs">
                      {calendarStatus.label}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-slate-50 p-2">{icon}</div>
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecretaryPatientRow({
  patient,
  onRemove,
}: {
  patient: Patient;
  onRemove: (patientId: string, patientName: string) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{patient.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{patient.email}</span>
        </div>
      </TableCell>
      <TableCell>{patient.cpf}</TableCell>
      <TableCell>{new Date(patient.birthDate).toLocaleDateString("pt-BR")}</TableCell>
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
            onClick={() => onRemove(patient.id, patient.name)}
          >
            Remover
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function shiftReferenceDate(date: Date, view: CalendarView, direction: number) {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return addDays(date, direction * 7);
  return addMonths(date, direction);
}

function formatCalendarTitle(date: Date, view: CalendarView) {
  if (view === "day") {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  if (view === "week") {
    const days = getWeekDaysSunday(date);
    const first = days[0];
    const last = days[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString("en-US", {
        month: "long",
      })} ${first.getFullYear()}`;
    }
    return `${first.toLocaleDateString("en-US", {
      month: "short",
    })} - ${last.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })}`;
  }
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function addMonths(date: Date, amount: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

function addMinutesToIsoString(startsAt: string, amount: number) {
  const date = new Date(startsAt);
  date.setMinutes(date.getMinutes() + amount);
  return date.toISOString();
}

function getMonthGrid(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const start = startOfDay(firstDay);
  start.setDate(start.getDate() - start.getDay());

  const end = startOfDay(lastDay);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  let cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

function getWeekDaysSunday(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function chunkDays(days: Date[], size: number) {
  const result: Date[][] = [];
  for (let index = 0; index < days.length; index += size) {
    result.push(days.slice(index, index + size));
  }
  return result;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

function formatEventTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

function getCalendarStatus(appointment: CalendarAppointment) {
  if (appointment.status === "waiting") {
    return {
      label: "Agendado",
      monthClassName: "bg-amber-100 text-amber-900",
      gridClassName: "border-amber-200 bg-amber-100 text-amber-900",
    };
  }

  if (appointment.status === "cancelled") {
    return {
      label: "A reagendar",
      monthClassName: "bg-rose-100 text-rose-900",
      gridClassName: "border-rose-200 bg-rose-100 text-rose-900",
    };
  }

  if (new Date(appointment.endsAt).getTime() < Date.now()) {
    return {
      label: "Consulta feita",
      monthClassName: "bg-slate-200 text-slate-800",
      gridClassName: "border-slate-300 bg-slate-200 text-slate-800",
    };
  }

  return {
    label: "Confirmado",
    monthClassName: "bg-emerald-100 text-emerald-900",
    gridClassName: "border-emerald-200 bg-emerald-100 text-emerald-900",
  };
}

function layoutAppointments(appointments: CalendarAppointment[]) {
  const sorted = [...appointments].sort(
    (left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );

  const columnsEnd: number[] = [];
  const items = sorted.map((appointment) => {
    const start = new Date(appointment.startsAt).getTime();
    const end = new Date(appointment.endsAt).getTime();
    let column = 0;

    while (columnsEnd[column] && columnsEnd[column] > start) {
      column += 1;
    }

    columnsEnd[column] = end;
    return { appointment, column };
  });

  const totalColumns = Math.max(...items.map((item) => item.column + 1), 1);

  return items.map((item) => ({
    ...item,
    totalColumns,
    top: getEventTop(item.appointment.startsAt, 7, 64),
    height: getEventHeight(item.appointment.startsAt, item.appointment.endsAt, 64),
  }));
}

function getEventTop(startsAt: string, startHour: number, hourHeight: number) {
  const date = new Date(startsAt);
  const minutes = (date.getHours() - startHour) * 60 + date.getMinutes();
  return (minutes / 60) * hourHeight + 2;
}

function getEventHeight(startsAt: string, endsAt: string, hourHeight: number) {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const minutes = Math.max((end - start) / 60000, 30);
  return (minutes / 60) * hourHeight - 4;
}
