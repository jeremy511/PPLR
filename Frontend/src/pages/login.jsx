import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/schemas/auth";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (values) => {
    setLoading(true);
    setGeneralError("");

    const { success, message } = await login(values.email, values.password);
    if (success) {
      navigate("/dashboard");
    } else {
      setGeneralError(message || "Credenciales inválidas");
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div className="flex-grow bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Label
            htmlFor="account"
            className="justify-center font-bold text-5xl text-red-600"
          >
            PPLR  a
          </Label>
          <Separator className="my-4" />
          <CardTitle>Inicie sesión en su cuenta</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico a continuación para iniciar sesión en
            su cuenta.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Error general */}
              {generalError && (
                <div className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-red-700">
                  {generalError}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Contraseña</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-indigo-600 font-medium"
                      >
                        ¿Olvidaste tu Contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Contraseña"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cargando..." : "Entrar"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <FcGoogle className="w-8 h-8" />
                  <span className="text-base">Login with Google</span>
                </Button>

                <div className="grid gap-2">
                  <Label htmlFor="account" className="justify-center font-bold">
                    No tienes una cuenta?
                    <Button
                      variant="link"
                      className="text-blue-500 font-bold"
                      onClick={() => navigate("/register")}
                      type="button"
                    >
                      Registrate
                    </Button>
                  </Label>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
