import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { getDefaultRouteForUser, registerAccount } from "@/lib/auth";

const registerSchema = z
  .object({
    email: z.string().email("Informe um e-mail valido"),
    nome: z.string().min(2, "Informe o nome completo"),
    telefone: z.string().min(8, "Informe um telefone valido"),
    role: z.enum(["SECRETARIA", "MEDICO"]),
    password: z.string().min(6, "Minimo de 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a senha"),
    registroProfissional: z.string().optional(),
    especialidadePrincipal: z.string().optional(),
    instituicao: z.string().optional(),
    universidade: z.string().optional(),
    anoFormacao: z.string().optional(),
    residenciaMedica: z.string().optional(),
    especializacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas nao coincidem",
      });
    }

    if (data.role !== "MEDICO") {
      return;
    }

    const requiredDoctorFields: Array<[keyof typeof data, string]> = [
      ["registroProfissional", "Informe o registro profissional"],
      ["especialidadePrincipal", "Informe a especialidade principal"],
      ["instituicao", "Informe a instituicao"],
      ["universidade", "Informe a universidade"],
      ["anoFormacao", "Informe o ano de formacao"],
      ["residenciaMedica", "Informe a residencia medica"],
      ["especializacoes", "Informe ao menos uma especializacao"],
    ];

    for (const [fieldName, message] of requiredDoctorFields) {
      if (!data[fieldName] || !String(data[fieldName]).trim()) {
        ctx.addIssue({
          code: "custom",
          path: [fieldName],
          message,
        });
      }
    }
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "SECRETARIA",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError("");

    try {
      await registerAccount({
        email: data.email.trim().toLowerCase(),
        senha: data.password.trim(),
        nome: data.nome.trim(),
        telefone: data.telefone.trim(),
        role: data.role === "MEDICO" ? "medico" : "secretaria",
        registro_profissional:
          data.role === "MEDICO" ? data.registroProfissional?.trim() : undefined,
        especialidade_principal:
          data.role === "MEDICO" ? data.especialidadePrincipal?.trim() : undefined,
        instituicao: data.role === "MEDICO" ? data.instituicao?.trim() : undefined,
        universidade: data.role === "MEDICO" ? data.universidade?.trim() : undefined,
        ano_formacao:
          data.role === "MEDICO" && data.anoFormacao
            ? Number(data.anoFormacao)
            : undefined,
        residencia_medica:
          data.role === "MEDICO" ? data.residenciaMedica?.trim() : undefined,
        especializacoes:
          data.role === "MEDICO"
            ? (data.especializacoes || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
      });

      navigate(getDefaultRouteForUser());
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Nao foi possivel concluir o cadastro.",
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6]">
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[40%_60%]">
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[#7C4DFF]" />
          <motion.img
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            src="/login/medicos.png"
            alt="Medicos"
            className="absolute left-0 top-0 h-full w-auto max-w-none select-none object-cover pointer-events-none"
            draggable={false}
          />
        </div>

        <div className="relative flex items-center justify-center">
          <Card className="relative z-20 w-full max-w-[620px] border-0 bg-transparent px-6 shadow-none sm:px-8">
            <div className="mb-4 flex w-full justify-center sm:mb-6">
              <img
                src="/login/logologin.png"
                alt="Medase"
                className="w-[200px] object-contain sm:w-[240px]"
              />
            </div>

            <CardContent className="p-0">
              <h1 className="mb-4 text-center text-2xl font-semibold text-gray-800 sm:mb-6 sm:text-3xl">
                Registre-se
              </h1>

              <SegmentedPill active="register" />

              <p className="mb-8 text-center text-[15px] leading-relaxed text-gray-600">
                Tecnologia e inteligencia para diagnosticos mais rapidos e
                cuidados mais humanos.
              </p>

              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="mx-auto grid w-full max-w-xl gap-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nome completo" error={errors.nome?.message}>
                    <Input
                      placeholder="Digite seu nome"
                      {...register("nome")}
                      className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                    />
                  </Field>

                  <Field label="Telefone" error={errors.telefone?.message}>
                    <Input
                      placeholder="Digite seu telefone"
                      {...register("telefone")}
                      className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" error={errors.email?.message}>
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      {...register("email")}
                      className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                    />
                  </Field>

                  <Field label="Perfil" error={errors.role?.message}>
                    <select
                      {...register("role")}
                      className="h-12 w-full rounded-full border border-input bg-white px-5 text-[15px] outline-none"
                    >
                      <option value="SECRETARIA">Secretaria</option>
                      <option value="MEDICO">Medico</option>
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Senha" error={errors.password?.message}>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="Digite sua senha"
                        {...register("password")}
                        className="h-12 rounded-full bg-white pl-5 pr-12 text-[15px] placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setShowPass((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showPass ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
                    <div className="relative">
                      <Input
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        {...register("confirmPassword")}
                        className="h-12 rounded-full bg-white pl-5 pr-12 text-[15px] placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPass ? "Ocultar senha" : "Mostrar senha"}
                        onClick={() => setShowConfirmPass((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showConfirmPass ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </Field>
                </div>

                {selectedRole === "MEDICO" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Registro profissional"
                        error={errors.registroProfissional?.message}
                      >
                        <Input
                          placeholder="Ex.: CRM 123456"
                          {...register("registroProfissional")}
                          className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                        />
                      </Field>

                      <Field
                        label="Especialidade principal"
                        error={errors.especialidadePrincipal?.message}
                      >
                        <Input
                          placeholder="Ex.: Ginecologia"
                          {...register("especialidadePrincipal")}
                          className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Instituicao" error={errors.instituicao?.message}>
                        <Input
                          placeholder="Hospital ou clinica"
                          {...register("instituicao")}
                          className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                        />
                      </Field>

                      <Field label="Universidade" error={errors.universidade?.message}>
                        <Input
                          placeholder="Universidade de formacao"
                          {...register("universidade")}
                          className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Ano de formacao" error={errors.anoFormacao?.message}>
                        <Input
                          type="number"
                          placeholder="Ex.: 2018"
                          {...register("anoFormacao")}
                          className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                        />
                      </Field>

                      <Field
                        label="Residencia medica"
                        error={errors.residenciaMedica?.message}
                      >
                        <Input
                          placeholder="Residencia medica"
                          {...register("residenciaMedica")}
                          className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                        />
                      </Field>
                    </div>

                    <Field
                      label="Especializacoes"
                      error={errors.especializacoes?.message}
                    >
                      <Input
                        placeholder="Separe por virgula"
                        {...register("especializacoes")}
                        className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                      />
                    </Field>
                  </>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#7C4DFF] hover:bg-[#6F3DFF]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Registrar"}
                </Button>

                {submitError && (
                  <p className="text-center text-sm text-red-600">{submitError}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <motion.img
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          src="/login/medica.png"
          alt="Medica"
          className="pointer-events-none absolute bottom-0 z-10 hidden select-none lg:block"
          style={{
            left: "20%",
            transform: "translateX(-50%)",
            width: "30vw",
            maxWidth: "640px",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

export default Register;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700">{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SegmentedPill({ active }: { active: "login" | "register" }) {
  return (
    <div className="mx-auto mb-6 w-full max-w-md">
      <div className="relative flex overflow-hidden rounded-full bg-[#E9D8FD] p-1">
        <motion.div
          layout
          layoutId="pill-highlight"
          className="absolute bottom-1 top-1 rounded-full bg-[#6D28D9]"
          style={{
            left: active === "login" ? 4 : "50%",
            right: active === "login" ? "50%" : 4,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <Link
          to="/login"
          className={`relative z-10 flex-1 rounded-full py-2 text-center text-sm font-medium ${
            active === "login" ? "text-white" : "text-[#6D28D9]"
          }`}
        >
          Entrar
        </Link>
        <Link
          to="/register"
          className={`relative z-10 flex-1 rounded-full py-2 text-center text-sm font-medium ${
            active === "register" ? "text-white" : "text-[#6D28D9]"
          }`}
        >
          Registro
        </Link>
      </div>
    </div>
  );
}
