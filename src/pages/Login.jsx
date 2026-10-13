import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Lock,
  Mail,
  User,
  Zap,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAsDemo,
  } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      navigate("/admin");
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err.message?.includes("wrong-password") || err.message?.includes("user-not-found")
          ? "Credenciales incorrectas"
          : "Error de autenticación. Verifica tus datos o prueba el acceso Demo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGoogle();
      navigate("/admin");
    } catch (err) {
      console.error("Google auth error:", err);
      setError("No se pudo iniciar sesión con Google. Puedes probar el acceso Demo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    try {
      setLoading(true);
      await loginAsDemo();
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-slate-950 shadow-glow-teal mb-1">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Vitrina<span className="text-brand-400">Pro</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            El SaaS móvil para técnicos independientes: cotizaciones directas por WhatsApp, catálogo digital y control de trabajos.
          </p>
        </div>

        {/* Card Formulario */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Botón de Acceso Demo Instantáneo */}
          <button
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-400 hover:to-emerald-300 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow-teal transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Ingresar con Cuenta de Demostración (1 Clic)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              o con tu cuenta
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Botón de Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Formulario Email / Password */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Tu Nombre o Negocio
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ej: David Restrepo"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isRegister}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isRegister ? "Crear mi Cuenta" : "Iniciar Sesión"}</span>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="text-center pt-1">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium"
            >
              {isRegister
                ? "¿Ya tienes cuenta? Inicia sesión aquí"
                : "¿Eres nuevo prestador? Regístrate gratis"}
            </button>
          </div>
        </div>

        {/* Features Bullet Footer */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-slate-400">
          <div className="bg-slate-900/40 border border-slate-800/60 p-2.5 rounded-xl">
            <span className="font-semibold text-slate-200 block">📱 Móvil First</span>
            Diseñado para la calle
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 p-2.5 rounded-xl">
            <span className="font-semibold text-slate-200 block">💬 WhatsApp Direct</span>
            Cotizaciones en 1 toque
          </div>
        </div>
      </div>
    </div>
  );
}
