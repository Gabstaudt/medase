import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDefaultRouteForUser } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuario"),
  password: z.string().min(6, "Minimo de 6 caracteres"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    const user = data.username.trim().toLowerCase();
    const pass = data.password.trim();

    if (user === "admin@medase.com" && pass === "admin123") {
      localStorage.setItem(
        "medase:user",
        JSON.stringify({
          id: 1,
          name: "Admin",
          email: "admin@medase.com",
          role: "ADMIN",
        }),
      );
      navigate(getDefaultRouteForUser());
      return;
    }

    if (user === "secretaria@medase.com" && pass === "secretaria123") {
      localStorage.setItem(
        "medase:user",
        JSON.stringify({
          id: 2,
          name: "Ana Secretaria",
          email: "secretaria@medase.com",
          role: "SECRETARIA",
        }),
      );
      navigate(getDefaultRouteForUser());
      return;
    }

    alert("Usuario ou senha invalidos.");
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
            className="pointer-events-none absolute left-0 top-0 h-full w-auto max-w-none select-none object-cover"
            draggable={false}
          />
        </div>

        <div className="relative flex items-center justify-center">
          <Card className="relative z-20 w-full max-w-[560px] border-0 bg-transparent px-6 shadow-none sm:px-8">
            <div className="mb-6 flex w-full justify-center">
              <img
                src="/login/logologin.png"
                alt="Medase"
                className="w-[200px] object-contain sm:w-[240px]"
              />
            </div>

            <CardContent className="p-0">
              <h1 className="mb-6 text-center text-3xl font-semibold text-gray-800">
                Bem-vindo de volta
              </h1>

              <SegmentedPill active="login" />

              <p className="mb-8 text-center text-[15px] leading-relaxed text-gray-600">
                Tecnologia e inteligencia para diagnosticos mais rapidos e
                cuidados mais humanos.
              </p>

              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="mx-auto w-full max-w-md space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700">
                    Usuario
                  </Label>
                  <Input
                    id="username"
                    placeholder="Entre com o usuario"
                    {...register("username")}
                    className="h-12 rounded-full bg-white px-5 text-[15px] placeholder:text-gray-400"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Entre com a sua senha"
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
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <Controller
                      name="remember"
                      control={control}
                      defaultValue={false}
                      render={({ field: { value, onChange } }) => (
                        <Checkbox
                          id="remember"
                          checked={!!value}
                          onCheckedChange={onChange}
                        />
                      )}
                    />
                    <span className="text-sm text-gray-700">Lembre-se de mim</span>
                  </label>
                  <Link to="#" className="text-sm text-gray-700 hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#7C4DFF] hover:bg-[#6F3DFF]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
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
