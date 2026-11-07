import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  Search,
  MessageCircle,
  LogIn,
  Crown,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
  Zap,
  ArrowLeft,
  Users,
  Eye,
  CreditCard,
  AlertTriangle,
  UserPlus,
  Radio,
  Tag,
  ShieldCheck,
  Mail,
  Phone,
  Trash2,
  UserCheck,
  ChevronDown,
  ExternalLink,
  Globe,
  Check,
} from "lucide-react";
import {
  getSuperAdminOverviewData,
  impersonateBusinessProfile,
  getSuperAdminsList,
  removeSuperAdmin,
  getLocalItem,
} from "../services/firestoreService";
import SubscriptionBillingModal from "./SubscriptionBillingModal";
import InviteCompanyModal from "./InviteCompanyModal";
import BroadcastAnnouncementModal from "./BroadcastAnnouncementModal";
import ManageCategoriesModal from "./ManageCategoriesModal";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [superAdminsList, setSuperAdminsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState("all");
  const [billingModalTenant, setBillingModalTenant] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteInitialRole, setInviteInitialRole] = useState("service_admin");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tenants"); // 'tenants' | 'feed' | 'monetization' | 'team'
  const [currentActiveBiz, setCurrentActiveBiz] = useState(() => {
    return getLocalItem("business", null);
  });
  const [isBizSelectorOpen, setIsBizSelectorOpen] = useState(false);
  const [bizSelectorSearch, setBizSelectorSearch] = useState("");
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);

  // Slider interactivo de monetización
  const [simulatedSubscribers, setSimulatedSubscribers] = useState(100);
  const [simulatedMonthlyPrice, setSimulatedMonthlyPrice] = useState(39000);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, saList] = await Promise.all([
        getSuperAdminOverviewData(),
        getSuperAdminsList(),
      ]);
      setData(res);
      setSuperAdminsList(saList || []);
      const savedBiz = getLocalItem("business", null);
      if (savedBiz) {
        setCurrentActiveBiz(savedBiz);
      }
    } catch (e) {
      console.error("Error loading super admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSuperAdmin = async (admin) => {
    if (confirm(`¿Estás seguro de que deseas retirar los privilegios de Super Admin a ${admin.name} (${admin.email})?`)) {
      await removeSuperAdmin(admin.id, admin.email);
      await loadData();
    }
  };

  useEffect(() => {
    localStorage.setItem("vitrinapro_superadmin_mode", "true");
    loadData();

    const handleBizSwitch = (e) => {
      if (e.detail) {
        setCurrentActiveBiz(e.detail);
      }
    };
    window.addEventListener("vitrinapro_business_switched", handleBizSwitch);
    return () => {
      window.removeEventListener("vitrinapro_business_switched", handleBizSwitch);
    };
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleImpersonate = (slug) => {
    impersonateBusinessProfile(slug);
    window.location.href = "/admin";
  };

  const handleSelectBusiness = (slug, target = "admin") => {
    const switched = impersonateBusinessProfile(slug);
    if (switched) {
      setCurrentActiveBiz(switched);
    }
    setIsBizSelectorOpen(false);
    if (target === "admin") {
      window.location.href = "/admin";
    } else if (target === "public") {
      window.open(`/b/${slug}`, "_blank");
    }
  };

  const filteredTenants = (data?.tenants || []).filter((t) => {
    const biz = t.business;
    const matchesSearch =
      biz.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.whatsappNumber?.includes(searchTerm);
    const matchesPlan =
      filterPlan === "all" || biz.subscriptionPlan === filterPlan;
    const matchesStatus =
      filterSubscriptionStatus === "all" || biz.subscriptionStatus === filterSubscriptionStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500">
      {/* Header Superior del Super Admin */}
      <header className="relative z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/90 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3">
          
          {/* Fila Principal: Logo, Título, Switcher de Negocio y Acciones */}
          <div className="flex items-center justify-between gap-3">
            
            {/* 👑 Marca & Título (Con protección shrink-0 para evitar solapamientos) */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-100 tracking-tight whitespace-nowrap">
                    VitrinaPro <span className="text-amber-400 font-black">SUPER ADMIN</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    Torre de Control
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                  Gestión Multi-Tenant & Facturación SaaS
                </p>
              </div>
            </div>

            {/* Acciones del Header */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* 🌟 SELECTOR RÁPIDO DE NEGOCIO ACTIVO */}
              <button
                type="button"
                onClick={() => setIsBizSelectorOpen(true)}
                className="bg-slate-950/90 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 text-slate-100 px-2 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm active:scale-95 group shrink-0"
                title="Elegir y navegar a cualquier negocio contratista"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                  <img
                    src={currentActiveBiz?.logoUrl || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80"}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden xl:block">
                  <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block leading-none">
                    🏢 Ir a Negocio
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate block max-w-[130px] leading-tight">
                    {currentActiveBiz?.businessName || "Seleccionar..."}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-200 hidden sm:inline xl:hidden truncate max-w-[110px]">
                  {currentActiveBiz?.businessName || "Negocios"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-transform ${isBizSelectorOpen ? "rotate-180 text-amber-400" : ""}`} />
              </button>

              {/* Botones de acción para Desktop (md+) con diseño uniforme y estilizado */}
              <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
                {/* Categorías */}
                <button
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className="bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/40 text-slate-200 hover:text-white font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                  title="Administrar y crear categorías y oficios de la plataforma"
                >
                  <Tag className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden lg:inline">Categorías</span>
                </button>

                {/* Aviso Global */}
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/40 text-slate-200 hover:text-white font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                  title="Emitir comunicado o aviso a todos los contratistas"
                >
                  <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span className="hidden lg:inline">Aviso Global</span>
                </button>

                {/* Invitar Empresa (CTA Primario) */}
                <button
                  onClick={() => {
                    setInviteInitialRole("service_admin");
                    setIsInviteModalOpen(true);
                  }}
                  className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all shrink-0"
                  title="Afiliar o invitar nueva empresa contratista"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Empresa</span>
                </button>

                {/* + Super Admin (CTA Secundario) */}
                <button
                  onClick={() => {
                    setInviteInitialRole("superadmin");
                    setIsInviteModalOpen(true);
                  }}
                  className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-300 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                  title="Nombrar o invitar a un nuevo Super Administrador / Socio"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline">+ Super Admin</span>
                </button>

                {/* Refrescar Datos */}
                <button
                  onClick={loadData}
                  title="Refrescar métricas SaaS"
                  className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
                </button>
              </div>

              {/* Botón de Acciones Rápidas para Móvil */}
              <button
                type="button"
                onClick={() => setIsMobileActionsOpen(true)}
                className="md:hidden bg-gradient-to-r from-amber-500/20 to-brand-500/20 border border-amber-500/40 text-amber-300 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                title="Herramientas y acciones del Super Admin"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Acciones</span>
              </button>

              <div className="w-px h-5 bg-slate-800 hidden sm:block mx-0.5" />

              {/* Botón Volver a Panel */}
              <Link
                to="/admin"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                title="Volver a panel contratista"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Panel</span>
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* =========================================================================
          🌟 MODAL CENTRADO PANTALLA COMPLETA/AMPLIO DE SELECCIÓN DE NEGOCIO
          ========================================================================= */}
      {isBizSelectorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          onClick={() => setIsBizSelectorOpen(false)}
        >
          <div
            className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl sm:rounded-2xl p-4 sm:p-5 space-y-3 h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl z-10 animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                    Cambiar de Negocio <span className="text-amber-400 text-xs font-bold">(Super Admin)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Selecciona una empresa ({data?.tenants?.length || 0} disponibles)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBizSelectorOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
                title="Cerrar (o toca afuera)"
              >
                ✕
              </button>
            </div>

            {/* Buscador interno */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre, oficio, slug o ciudad..."
                value={bizSelectorSearch}
                onChange={(e) => setBizSelectorSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            {/* Lista con scroll de empresas (flex-1 para llenar toda la altura cómodamente) */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {(data?.tenants || [])
                .filter((item) => {
                  const b = item.business;
                  const q = bizSelectorSearch.toLowerCase();
                  return (
                    !q ||
                    b.businessName?.toLowerCase().includes(q) ||
                    b.city?.toLowerCase().includes(q) ||
                    b.categoryLabel?.toLowerCase().includes(q) ||
                    b.businessSlug?.toLowerCase().includes(q)
                  );
                })
                .map((item) => {
                  const b = item.business;
                  const isCurrent = currentActiveBiz?.businessSlug === b.businessSlug;
                  return (
                    <div
                      key={b.businessSlug || b.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                        isCurrent
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        onClick={() => {
                          setIsBizSelectorOpen(false);
                          handleSelectBusiness(b.businessSlug, "admin");
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <img
                          src={b.logoUrl || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80"}
                          alt={b.businessName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-100 truncate block">
                              {b.businessName}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black shrink-0">
                                ACTIVO
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                            {b.categoryLabel || b.category} • {b.city || "Colombia"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsBizSelectorOpen(false);
                            handleSelectBusiness(b.businessSlug, "public");
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Ver Vitrina Pública"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsBizSelectorOpen(false);
                            handleSelectBusiness(b.businessSlug, "admin");
                          }}
                          className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                          title="Entrar a administrar este negocio"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Entrar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer con Afiliar y Cerrar */}
            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBizSelectorOpen(false);
                  setIsInviteModalOpen(true);
                }}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Afiliar nueva empresa</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBizSelectorOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 rounded-lg bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Diálogo de Acciones del Super Admin en Móvil (Centrado) */}
      {isMobileActionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer">
          <div className="fixed inset-0" onClick={() => setIsMobileActionsOpen(false)} />
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl sm:rounded-2xl p-5 space-y-3.5 shadow-2xl z-10 animate-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100">Herramientas Super Admin</h3>
                  <p className="text-[11px] text-slate-400">Acciones rápidas de plataforma</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileActionsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsMobileActionsOpen(false);
                  setInviteInitialRole("service_admin");
                  setIsInviteModalOpen(true);
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/40 p-3 rounded-2xl flex items-center gap-3 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-100">Invitar Nueva Empresa</span>
                    <span className="text-[9px] bg-brand-500/20 text-brand-300 font-bold px-1.5 py-0.5 rounded">SaaS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Afiliar contratista y crear cuenta</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMobileActionsOpen(false);
                  setInviteInitialRole("superadmin");
                  setIsInviteModalOpen(true);
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-3 rounded-2xl flex items-center gap-3 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-100">Nuevo Super Admin</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">Mesa Directiva</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Nombrar socio o administrador maestro</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMobileActionsOpen(false);
                  setIsCategoriesModalOpen(true);
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 p-3 rounded-2xl flex items-center gap-3 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-100">Categorías y Oficios</span>
                    <span className="text-[9px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded">Catálogo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Gestionar oficios de la plataforma</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMobileActionsOpen(false);
                  setIsBroadcastModalOpen(true);
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 p-3 rounded-2xl flex items-center gap-3 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-100">Aviso Global a Contratistas</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded">Broadcast</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Emitir comunicado a toda la red</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMobileActionsOpen(false);
                  loadData();
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                  <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-brand-400" : ""}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-slate-100 block">Refrescar Métricas SaaS</span>
                  <p className="text-[11px] text-slate-400 truncate">Sincronizar ingresos y datos en vivo</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        
        {/* Banner de Bienvenida Ejecutivo & KPIs Maestros (Impacto Inmediato) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Modo Fundador / Director de Plataforma
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Vista Panorámica de Todos los Negocios e Ingresos
              </h2>
              <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                Supervisa el volumen transaccionado en la plataforma, ingresa al panel de cualquier contratista con 1 clic (Modo Super Admin) y proyecta el crecimiento del SaaS.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-2xl font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistema 100% Operativo
              </span>
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas Macro (KPIs del SaaS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tarjeta 1: Total Contratistas */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Negocios Registrados</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-100 tracking-tight">
              {data?.stats?.totalTenants || 0}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-purple-400 font-bold">{data?.stats?.proTenants || 0} Pro</span>
              <span>•</span>
              <span className="text-slate-500">{data?.stats?.freeTenants || 0} Básicos</span>
            </div>
          </div>

          {/* Tarjeta 2: GMV Plataforma */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Volumen Total (GMV)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(data?.stats?.totalPlatformVolume || 0)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>Cobrado real:</span>
              <span className="text-slate-200 font-bold">
                {formatCurrency(data?.stats?.totalPlatformCompleted || 0)}
              </span>
            </div>
          </div>

          {/* Tarjeta 3: MRR Recurrente del SaaS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">MRR Suscripciones SaaS</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-400 tracking-tight">
              {formatCurrency(data?.stats?.estimatedMRR || 0)}
            </div>
            <div className="text-[11px] text-slate-400">
              A $39.000 COP / mes por contratista
            </div>
          </div>

          {/* Tarjeta 4: Total Cotizaciones */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Cotizaciones Emitidas</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-100 tracking-tight">
              {data?.stats?.totalQuotesCount || 0}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Alta tasa de conversión (~74%)</span>
            </div>
          </div>
        </div>

        {/* Barra de Pestañas */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("tenants")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "tenants"
                ? "bg-brand-500 text-slate-950 shadow-md font-black"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio de Contratistas ({filteredTenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "feed"
                ? "bg-brand-500 text-slate-950 shadow-md font-black"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Feed Global de Actividad ({data?.recentFeed?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("monetization")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "monetization"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Proyector Financiero SaaS</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "team"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Mesa Directiva & Super Admins ({superAdminsList.length})</span>
          </button>
        </div>


        {/* PESTAÑA 1: DIRECTORIO DE CONTRATISTAS */}
        {activeTab === "tenants" && (
          <div className="space-y-4">
            {/* Filtros y Buscador */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ciudad o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>➕ Afiliar Empresa</span>
                </button>

                <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto">
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold shrink-0">Plan:</span>
                    <select
                      value={filterPlan}
                      onChange={(e) => setFilterPlan(e.target.value)}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
                    >
                      <option value="all" className="bg-slate-900">Todos</option>
                      <option value="pro" className="bg-slate-900">PRO</option>
                      <option value="anual" className="bg-slate-900">Anual VIP</option>
                      <option value="basico" className="bg-slate-900">Básicos</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] text-slate-400 font-semibold shrink-0">Estado:</span>
                    <select
                      value={filterSubscriptionStatus}
                      onChange={(e) => setFilterSubscriptionStatus(e.target.value)}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
                    >
                      <option value="all" className="bg-slate-900">Todos</option>
                      <option value="al_dia" className="bg-slate-900">🟢 Al Día</option>
                      <option value="por_vencer" className="bg-slate-900">🟡 Por Vencer</option>
                      <option value="vencido" className="bg-slate-900">🔴 Vencidos</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Listado de Tarjetas Compactas de Contratistas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTenants.map((item) => {
                const biz = item.business;
                return (
                  <div
                    key={biz.businessSlug || biz.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3 shadow-sm transition-all flex flex-col justify-between gap-2.5"
                  >
                    {/* Fila 1: Logo, Nombre, Plan, Ubicación y Estado de Pago */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={
                            biz.logoUrl ||
                            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80"
                          }
                          alt={biz.businessName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700/80 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                              {biz.businessName}
                            </h3>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                                biz.subscriptionPlan === "pro"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                  : biz.subscriptionPlan === "anual"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {biz.subscriptionPlan?.toUpperCase() || "FREE"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {biz.categoryLabel || biz.category} • {biz.city || "Colombia"}
                          </p>
                        </div>
                      </div>

                      {/* Estado de Suscripción Compacto */}
                      <div className="shrink-0">
                        {biz.subscriptionStatus === "vencido" ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Vencido
                          </span>
                        ) : biz.subscriptionStatus === "por_vencer" ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {biz.diffDays}d
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Al Día
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila 2: Mini métricas + Barra de Acciones en 1 sola línea */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                      {/* Micro stats */}
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                        <span><strong className="text-slate-200">{item.servicesCount}</strong> serv</span>
                        <span>•</span>
                        <span><strong className="text-slate-200">{item.quotesCount}</strong> cotiz</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(item.totalVolume)}</span>
                      </div>

                      {/* Grupo de Botones de Acción Rápidos */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Entrar como este Negocio (Modo Super Admin) */}
                        <button
                          onClick={() => handleImpersonate(biz.businessSlug)}
                          className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                          title="Entrar al panel de este contratista con modo Super Admin"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Entrar</span>
                        </button>

                        {/* Gestionar Plan & Cobro */}
                        <button
                          onClick={() => setBillingModalTenant(item)}
                          className="p-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 transition-colors"
                          title="Gestionar plan, registrar pago y enviar recordatorio"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* Ver Vitrina Pública */}
                        <a
                          href={`/b/${biz.businessSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          title="Abrir vitrina pública que ven los clientes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>

                        {/* Contacto WhatsApp */}
                        <a
                          href={`https://wa.me/${biz.whatsappNumber}?text=${encodeURIComponent(
                            `¡Hola ${biz.businessName}! Te escribo desde el equipo de soporte de VitrinaPro.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-400 transition-colors"
                          title="Abrir chat de WhatsApp con el contratista"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: FEED GLOBAL DE ACTIVIDAD */}
        {activeTab === "feed" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Actividad en Tiempo Real de Toda la Plataforma
                </h3>
                <p className="text-xs text-slate-400">
                  Monitoreo en vivo de cotizaciones y solicitudes registradas por todos los contratistas
                </p>
              </div>
              <span className="text-xs text-brand-400 font-bold bg-brand-500/10 border border-brand-500/30 px-3 py-1 rounded-full">
                ● En vivo
              </span>
            </div>

            <div className="space-y-3">
              {(data?.recentFeed || []).map((ev, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-brand-300">
                        {ev.businessName}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-300 font-semibold">
                        Cliente: {ev.clientName}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ev.createdAt).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {ev.description || "Cotización formal de servicios técnicos"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-sm font-black text-emerald-400">
                      {formatCurrency(ev.totalAmount)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ev.status === "finalizado"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : ev.status === "en_progreso"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: PROYECTOR FINANCIERO SAAS */}
        {activeTab === "monetization" && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-100">
                  Simulador de Negocio e Ingresos del SaaS (Para Presentación Ejecutiva)
                </h3>
                <p className="text-xs text-slate-400">
                  Calcula el potencial de facturación recurrente de VitrinaPro en Colombia y Latinoamérica
                </p>
              </div>
            </div>

            {/* Controles de Simulación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Número de Contratistas Activos Suscritos:
                  </label>
                  <span className="text-sm font-black text-amber-400">
                    {simulatedSubscribers} contratistas
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={simulatedSubscribers}
                  onChange={(e) => setSimulatedSubscribers(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>10 (Inicial)</span>
                  <span>250 (Mediano)</span>
                  <span>1.000 (Escalado)</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Tarifa de Suscripción Mensual:
                  </label>
                  <span className="text-sm font-black text-emerald-400">
                    {formatCurrency(simulatedMonthlyPrice)} / mes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[29000, 39000, 49000, 59000].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setSimulatedMonthlyPrice(price)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        simulatedMonthlyPrice === price
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {formatCurrency(price)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resultados Proyectados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Ingreso Mensual (MRR)</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {formatCurrency(simulatedSubscribers * simulatedMonthlyPrice)}
                </div>
                <span className="text-[10px] text-slate-500">Facturación cada 30 días</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Ingreso Anual Proyectado (ARR)</span>
                <div className="text-xl sm:text-2xl font-black text-purple-400">
                  {formatCurrency(simulatedSubscribers * simulatedMonthlyPrice * 12)}
                </div>
                <span className="text-[10px] text-slate-500">12 meses de recurrencia</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Volumen Anual en la App (GMV Est.)</span>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {formatCurrency(simulatedSubscribers * 1800000 * 12)}
                </div>
                <span className="text-[10px] text-slate-500">Impacto económico transaccional</span>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: MESA DIRECTIVA & ROLES DE SUPER ADMINISTRADORES */}
        {activeTab === "team" && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Mesa Directiva & Super Administradores Autorizados
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Solo los usuarios registrados en esta lista tienen acceso a la Torre de Control (`/superadmin`) y pueden visualizar las finanzas y métricas globales de la plataforma.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setInviteInitialRole("superadmin");
                    setIsInviteModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 transition-all self-start sm:self-auto"
                >
                  <Crown className="w-4 h-4" />
                  <span>Nombrar Nuevo Super Admin</span>
                </button>
              </div>

              {/* Lista de Super Admins */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
                {superAdminsList.map((admin) => (
                  <div
                    key={admin.id || admin.email}
                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5">
                          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-black text-sm">
                            {admin.name?.charAt(0)?.toUpperCase() || "A"}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                            {admin.name}
                            <span className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400" title="Activo">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          </h4>
                          <span className="text-[11px] font-semibold text-amber-400">
                            {admin.roleTitle || "Super Admin"}
                          </span>
                        </div>
                      </div>

                      {admin.id !== "sa-main-victor" && (
                        <button
                          onClick={() => handleRevokeSuperAdmin(admin)}
                          title="Revocar permisos de Super Admin"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-1 border-t border-slate-900">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-300">{admin.email}</span>
                      </div>
                      {admin.whatsapp && (
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300">{admin.whatsapp}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Nivel: Plataforma Master</span>
                      <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">
                        {admin.status || "activo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Facturación y Cobro de Suscripciones SaaS */}
      <SubscriptionBillingModal
        isOpen={!!billingModalTenant}
        onClose={() => setBillingModalTenant(null)}
        tenant={billingModalTenant}
        onSubscriptionUpdated={loadData}
      />

      {/* Modal de Invitación y Alta de Nuevas Empresas o Super Admins */}
      <InviteCompanyModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        initialRole={inviteInitialRole}
        onCompanyCreated={loadData}
        onImpersonate={(slug) => {
          setIsInviteModalOpen(false);
          handleImpersonate(slug);
        }}
      />


      {/* Modal de Emisión de Comunicados Globales (Broadcast) */}
      <BroadcastAnnouncementModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      {/* Modal de Gestión Global de Categorías & Rubros */}
      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        onCategoriesChanged={loadData}
      />
    </div>
  );
}
