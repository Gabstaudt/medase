import { useState } from "react";
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

const registerSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  username: z.string().min(2, "Informe um nome de usuário"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  accessKey: z.string().min(4, "Informe sua chave de acesso"),
});
type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showAccess, setShowAccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    const fakeUser = { id: 1, name: data.username, email: data.email };
    localStorage.setItem("medase:user", JSON.stringify(fakeUser));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6]">
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[40%_60%]">
        {/* ESQUERDA (40%) */}
        <div className="relative hidden lg:block overflow-hidden">
          <div className="absolute inset-0 bg-[#7C4DFF]" />
          <motion.img
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            src="/login/medicos.png"
            alt="Médicos"
            className="absolute left-0 top-0 h-full w-auto max-w-none object-cover select-none pointer-events-none"
            draggable={false}
          />
        </div>

        {/* DIREITA (60%) + FORM */}
        <div className="relative flex items-center justify-center">
          <Card className="border-0 shadow-none bg-transparent w-full max-w-[560px] px-6 sm:px-8 relative z-20">
            {/* logo acima do formulário */}
            <div className="w-full flex justify-center mb-4 sm:mb-6">
              <img
                src="/login/logologin.png"
                alt="Medase"
                className="w-[200px] sm:w-[240px] object-contain"
              />
            </div>

            <CardContent className="p-0">
              <h1 className="text-center text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 sm:mb-6">
                Registre-se
              </h1>

              {/* pills com highlight animado */}
              <SegmentedPill active="register" />

              <p className="text-center text-[15px] text-gray-600 mb-8 leading-relaxed">
                Tecnologia e inteligência para diagnósticos mais rápidos e
                cuidados mais humanos.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    {...register("email")}
                    className="rounded-full bg-white h-12 px-5 text-[15px] placeholder:text-gray-400"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700">Usuário</Label>
                  <Input
                    id="username"
                    placeholder="Digite seu nome de usuário"
                    {...register("username")}
                    className="rounded-full bg-white h-12 px-5 text-[15px] placeholder:text-gray-400"
                  />
                  {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Digite sua senha"
                      {...register("password")}
                      className="rounded-full bg-white h-12 pl-5 pr-12 text-[15px] placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPass ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessKey" className="text-gray-700">Chave de Acesso</Label>
                  <div className="relative">
                    <Input
                      id="accessKey"
                      type={showAccess ? "text" : "password"}
                      placeholder="Digite seu código de acesso"
                      {...register("accessKey")}
                      className="rounded-full bg-white h-12 pl-5 pr-12 text-[15px] placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      aria-label={showAccess ? "Ocultar chave" : "Mostrar chave"}
                      onClick={() => setShowAccess((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showAccess ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  {errors.accessKey && <p className="text-sm text-red-600">{errors.accessKey.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#7C4DFF] hover:bg-[#6F3DFF]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Registrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* MÉDICA AO CENTRO */}
            <motion.img
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            src="/login/medica.png"
            alt="Médica à frente"
            className="hidden lg:block absolute bottom-0 z-10 select-none pointer-events-none"
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

function SegmentedPill({ active }: { active: "login" | "register" }) {
  return (
    <div className="mx-auto mb-6 w-full max-w-md">
      <div className="relative bg-[#E9D8FD] rounded-full p-1 flex overflow-hidden">
        <motion.div
          layout
          layoutId="pill-highlight"
          className="absolute top-1 bottom-1 rounded-full bg-[#6D28D9]"
          style={{
            left: active === "login" ? 4 : "50%",
            right: active === "login" ? "50%" : 4,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <Link
          to="/login"
          className={`relative z-10 flex-1 rounded-full py-2 text-sm font-medium text-center ${
            active === "login" ? "text-white" : "text-[#6D28D9]"
          }`}
        >
          Entrar
        </Link>
        <Link
          to="/register"
          className={`relative z-10 flex-1 rounded-full py-2 text-sm font-medium text-center ${
            active === "register" ? "text-white" : "text-[#6D28D9]"
          }`}
        >
          Registro
        </Link>
      </div>
    </div>
  );
}
