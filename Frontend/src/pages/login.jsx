import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/schemas/auth";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const success = await login(email, password); // retorna true o false

      if (!success) {
        console.log(success);
        setGeneralError("Credenciales inválidas");
      } else {
        // Redirigir después del login
// usa react-router-dom o similar
      }
    } catch (err) {
      setGeneralError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Label
            htmlFor="account"
            className="justify-center font-bold text-5xl text-red-600"
          >
            PPLR
          </Label>
          <Separator className="my-4" />
          <CardTitle>Inicie sesión en su cuenta</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico a continuación para iniciar sesión en
            su cuenta.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors.length > 0 && (
            <ul className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-red-700 list-disc list-inside">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Error general */}
            {generalError && (
              <div className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-red-700">
                {generalError}
              </div>
            )}

            {/* Errores por campo */}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-red-700">
                {Object.entries(fieldErrors).map(([field, messages]) => (
                  <div key={field} className="mb-2">
                    <strong className="capitalize">{field}:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                type="email" // <-- fix aquí
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Olvidaste tu Contraseña?
                </a>
              </div>
              <Input
                value={password}
                id="password"
                type="password"
                placeholder="Contraseña"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                {loading ? "Cargando..." : "Entrar"}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <FcGoogle className="w-8 h-8" />
                <span className="text-base">Login with Google</span>
              </Button>

              <div className="grid gap-2">
                <Label htmlFor="account" className="justify-center font-bold">
                  No tienes una cuenta?
                  <Button variant="link" className="text-blue-500 font-bold">
                    Registrate
                  </Button>
                </Label>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
