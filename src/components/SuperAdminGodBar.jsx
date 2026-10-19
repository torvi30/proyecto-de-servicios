import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  Search,
  Check,
  Globe,
  LayoutDashboard,
  Minimize2,
  Maximize2,
  LogOut,
  ShieldCheck,
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

  // Si no está activo, o si estamos en /superadmin, o en cualquier landing pública de cliente (/b/...), no mostrar nada
  if (
    !isSuperAdmin ||
    location.pathname === "/superadmin" ||
    location.pathname.startsWith("/b/") ||
    location.pathname === "/b"
  ) {
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
      if (location.pathname === "/admin") {
        window.location.reload();
      } else {
        navigate("/admin");
      }
    }
  };

  // Salir de la sesión Super Admin
  const handleExitSuperAdmin = () => {
    localStorage.removeItem("vitrinapro_superadmin_mode");
    setIsSuperAdmin(false);
    setIsDropdownOpen(false);
    window.location.href = "/admin";
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.businessSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vista reducida / minimizada (burbuja ejecutiva discreta)
  if (isMinimized) {
    return (
      <div className="fixed top-3 right-3 z-50 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          title="Sesión Super Admin Activa - Clic para desplegar barra"
          className="group flex items-center gap-2 px-3 py-1.5 bg-slate-900/95 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-slate-200 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
            Panel Master
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800/90 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Lado Izquierdo: Retorno a Torre de Control + Badge Corporativo */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/superadmin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-medium text-xs transition-all shadow-sm group"
            title="Regresar a la Torre de Control Global"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Torre de Control</span>
          </Link>

          {/* Insignia Profesional de Sesión Master */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-mono">Sesión:</span>
            <span className="font-semibold text-slate-200">Super Admin</span>
          </div>
        </div>

        {/* Centro: Selector Corporativo de Inquilinos */}
        <div className="flex items-center gap-2 relative">
          <span className="hidden md:inline text-xs text-slate-400 font-medium">Inquilino:</span>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-100 transition-all font-semibold max-w-[220px] sm:max-w-[300px] shadow-sm"
              title="Cambiar de empresa inquilina"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">
                {currentBusiness?.businessName || currentSlug || "Seleccionar Inquilino"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menú Desplegable con buscador */}
            {isDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800 mb-2.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-400" />
                    Inquilinos Registrados
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {filteredTenants.length} empresas
                  </span>
                </div>

                {/* Buscador */}
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar empresa, ciudad o slug..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
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
                              ? "bg-brand-500/10 border border-brand-500/30 text-brand-200"
                              : "hover:bg-slate-800/80 text-slate-300"
                          }`}
                        >
                          <button
                            onClick={() => handleSelectBusiness(t, "auto")}
                            className="flex items-center gap-2.5 text-left min-w-0 flex-1 pr-2"
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
                              <p className="text-xs font-semibold truncate flex items-center gap-1 text-slate-200">
                                {t.businessName}
                                {isCurrent && (
                                  <Check className="w-3 h-3 text-brand-400 inline shrink-0" />
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
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSelectBusiness(t, "public")}
                              title="Ver Vitrina Pública"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5" />
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

          {/* Conmutador Rápido de Vista a Vitrina */}
          {isAdminView && currentBusiness?.businessSlug && (
            <Link
              to={`/b/${currentBusiness.businessSlug}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all"
              title="Abrir vitrina pública que ven los clientes"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>Ver Vitrina</span>
            </Link>
          )}
        </div>

        {/* Lado Derecho: Minimizar y Salir */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(true)}
            title="Minimizar barra a botón flotante discreto"
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExitSuperAdmin}
            title="Cerrar sesión de Super Administrador"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión Master</span>
          </button>
        </div>

      </div>
    </div>
  );
}
