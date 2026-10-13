import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SuperAdminGodBar from "./components/SuperAdminGodBar";
import { Loader2 } from "lucide-react";

// Code-Splitting: Carga bajo demanda para velocidad ultra rápida
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./components/SuperAdminDashboard"));
const BusinessPublicView = lazy(() => import("./components/BusinessPublicView"));
const Login = lazy(() => import("./pages/Login"));

function PageLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      <span className="text-xs text-slate-400">Cargando VitrinaPro...</span>
    </div>
  );
}

// Componente para proteger la ruta /admin
function ProtectedAdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard />;
}

// Redirección para la raíz /
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Barra de Navegación Flotante y Retorno Exclusiva para Super Admin */}
        <SuperAdminGodBar />

        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Ruta Raíz */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Autenticación */}
            <Route path="/login" element={<Login />} />

            {/* Panel Privado del Prestador */}
            <Route path="/admin/*" element={<ProtectedAdminRoute />} />

            {/* Torre de Control Master / Super Admin SaaS */}
            <Route path="/superadmin" element={<SuperAdminDashboard />} />

            {/* Vitrina Pública del Negocio */}
            <Route path="/b/:businessSlug" element={<BusinessPublicView />} />

            {/* Ruta fallback 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
