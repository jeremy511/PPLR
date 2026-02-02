"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { register, requestOTP } from "../api/auth";
import { toast } from "sonner";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

export const title = "Signup Form";

// ✅ esquema de validación
const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  lastName: z.string().min(2, {
    message: "El apellido debe tener al menos 2 caracteres.",
  }),
  phone: z.string().min(8, {
    message: "Ingresa un teléfono válido.",
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo válido.",
  }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  birthdate: z.string().min(1, { message: "La fecha de nacimiento es requerida." }),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Selecciona tu sexo.",
  }),
  otpCode: z.string().length(6, { message: "El código debe tener 6 dígitos." }),
  terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones.",
  }),
});

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      birthdate: "",
      gender: "MALE",
      otpCode: "",
      terms: false,
    },
  });

  const handleSendOTP = async () => {
    const email = form.getValues("email");
    const emailValidation = z.string().email().safeParse(email);

    if (!emailValidation.success) {
      form.setError("email", { message: "Ingresa un correo válido antes de solicitar el código." });
      return;
    }

    setIsRequestingOtp(true);
    setServerError("");
    try {
      await requestOTP(email);
      setIsOtpSent(true);
      toast.success("Código enviado a tu correo");
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await register(values);
      toast.success("Registro exitoso");

      // Loguear automáticamente tras registrarse
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setServerError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="flex-grow bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate para empezar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>

              {serverError && (
                <p className="text-red-600 text-sm text-center">{serverError}</p>
              )}

              {!isOtpSent ? (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="you@example.com"
                              type="email"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    type="button"
                    disabled={isRequestingOtp}
                    onClick={handleSendOTP}
                  >
                    {isRequestingOtp ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Verificar Email"
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md mb-4 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    <p className="text-xs text-indigo-700">
                      Hemos enviado un código a <b>{form.getValues("email")}</b>. Úsalo para completar tu cuenta.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="otpCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de verificación</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123456"
                            maxLength={6}
                            className="text-center text-lg tracking-[0.5em] font-bold"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+54 9 11 ..." {...field} />
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
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Crea una contraseña segura"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Debe contener mayúsculas, minúsculas y un número.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="birthdate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nacimiento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="MALE">Hombre</option>
                              <option value="FEMALE">Mujer</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-sm">
                            Acepto los{" "}
                            <a href="#" className="hover:underline text-blue-500">
                              términos y condiciones
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" type="submit">
                    Completar registro
                  </Button>

                  <Button
                    variant="link"
                    className="w-full text-xs text-gray-500"
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                  >
                    Cambiar correo electrónico
                  </Button>
                </>
              )}

              <p className="text-center text-muted-foreground text-sm pt-2">
                ¿Ya tienes una cuenta?{" "}
                <Link className="hover:underline text-indigo-600 font-medium" to="/login">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
