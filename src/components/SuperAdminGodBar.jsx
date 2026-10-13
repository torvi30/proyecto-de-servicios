import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Crown,
  Store,
  LayoutDashboard,
  ChevronDown,
  Search,
  LogOut,
  Minimize2,
  Maximize2,
  Check,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  getAllTenantsList,
  impersonateBusinessProfile,
  getLocalItem,
} from "../services/firestoreService";

export default function SuperAdminGodBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tenants, setTenants] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);

  // Verificar si el usuario tiene activo el modo Super Admin
  const checkSuperAdminStatus = () => {
    try {
      const active = localStorage.getItem("vitrinapro_superadmin_mode") === "true";
      setIsSuperAdmin(active);
      const biz = getLocalItem("business", null);
      setCurrentBusiness(biz);
      setTenants(getAllTenantsList());
    } catch (_) {
      setIsSuperAdmin(false);
    }
  };

  useEffect(() => {
    checkSuperAdminStatus();

    const handleSwitch = (e) => {
      if (e.detail) {
        setCurrentBusiness(e.detail);
      }
    };

    window.addEventListener("vitrinapro_business_switched", handleSwitch);
    window.addEventListener("storage", checkSuperAdminStatus);

    return () => {
      window.removeEventListener("vitrinapro_business_switched", handleSwitch);
      window.removeEventListener("storage", checkSuperAdminStatus);
    };
  }, [location.pathname]);

  // Si estamos en la misma página de /superadmin, no mostrar la barra para no duplicar controles
  if (!isSuperAdmin || location.pathname === "/superadmin") {
    return null;
  }

  // Detectar en qué sección estamos
  const isPublicView = location.pathname.startsWith("/b/");
  const isAdminView = location.pathname.startsWith("/admin");
  const currentSlug = isPublicView
    ? location.pathname.replace("/b/", "")
    : currentBusiness?.businessSlug || "";

  // Cambiar a otra empresa desde el selector
  const handleSelectBusiness = (tenant, targetView = "auto") => {
    impersonateBusinessProfile(tenant.businessSlug);
    setIsDropdownOpen(false);
    setSearchTerm("");

    if (targetView === "public" || (targetView === "auto" && isPublicView)) {
      navigate(`/b/${tenant.businessSlug}`);
    } else {
      navigate("/admin");
    }
  };

  // Salir de Modo Dios
  const handleExitGodMode = () => {
    localStorage.removeItem("vitrinapro_superadmin_mode");
    setIsSuperAdmin(false);
    setIsDropdownOpen(false);
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.businessSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vista Minimizado (Burbuja flotante de lujo)
  if (isMinimized) {
    return (
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          title="Modo Dios Super Admin Activo - Clic para desplegar barra"
          className="group flex items-center gap-2 px-3 py-2 bg-slate-900/95 hover:bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 rounded-full shadow-2xl shadow-amber-500/20 backdrop-blur-xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            Modo Super Admin
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-300" />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/30 text-slate-100 shadow-xl shadow-amber-500/5">
      <div className="max-w-3xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Lado Izquierdo: Insignia Super Admin + Volver */}
        <div className="flex items-center gap-2">
          <Link
            to="/superadmin"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
            title="Volver a la Torre de Control Super Admin"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Volver a Super Admin</span>
          </Link>

          {/* Badge Indicador de Modo Dios */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-heading font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>MODO DIOS</span>
          </div>
        </div>

        {/* Centro: Selector Rápido de Empresa + Conmutador de Vistas */}
        <div className="flex items-center gap-1.5 relative">
          {/* Selector de Empresa Desplegable */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-xs text-slate-200 transition-all font-medium max-w-[200px] sm:max-w-[260px]"
              title="Cambiar de Empresa Inquilina"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                {currentBusiness?.businessName || currentSlug || "Seleccionar Empresa"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menú Desplegable con buscador */}
            {isDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Cambiar Inquilino / Empresa
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {filteredTenants.length} registradas
                  </span>
                </div>

                {/* Buscador */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar empresa, ciudad o slug..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>

                {/* Lista de Empresas */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredTenants.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No se encontraron empresas con ese término.
                    </div>
                  ) : (
                    filteredTenants.map((t) => {
                      const isCurrent =
                        t.businessSlug === currentBusiness?.businessSlug ||
                        t.businessSlug === currentSlug;

                      return (
                        <div
                          key={t.id || t.businessSlug}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                            isCurrent
                              ? "bg-amber-500/15 border border-amber-500/30 text-amber-200"
                              : "hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          <button
                            onClick={() => handleSelectBusiness(t, "auto")}
                            className="flex items-center gap-2 text-left min-w-0 flex-1 pr-2"
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                              {t.logoUrl ? (
                                <img
                                  src={t.logoUrl}
                                  alt={t.businessName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold truncate flex items-center gap-1">
                                {t.businessName}
                                {isCurrent && (
                                  <Check className="w-3 h-3 text-amber-400 inline shrink-0" />
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                /{t.businessSlug} • {t.city}
                              </p>
                            </div>
                          </button>

                          {/* Acciones directas por fila */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleSelectBusiness(t, "admin")}
                              title="Gestionar en Panel Privado"
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSelectBusiness(t, "public")}
                              title="Ver Vitrina Pública"
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300"
                            >
                              <Store className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Conmutador Rápido de Vista (Panel vs Vitrina) */}
          {isAdminView && currentBusiness?.businessSlug && (
            <Link
              to={`/b/${currentBusiness.businessSlug}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-all"
              title="Ver cómo ven los clientes esta vitrina"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Vitrina Pública</span>
            </Link>
          )}

          {isPublicView && (
            <button
              onClick={() => {
                if (currentSlug) {
                  impersonateBusinessProfile(currentSlug);
                }
                navigate("/admin");
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 hover:text-blue-300 text-xs font-medium transition-all"
              title="Abrir el panel de gestión de este negocio"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gestionar en Panel</span>
            </button>
          )}
        </div>

        {/* Lado Derecho: Minimizar y Salir */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(true)}
            title="Minimizar barra a botón flotante discreto"
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExitGodMode}
            title="Salir del Modo Super Admin (Navegar como cliente anónimo)"
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
