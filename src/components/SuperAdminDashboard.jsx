import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  getSuperAdminOverviewData,
  impersonateBusinessProfile,
} from "../services/firestoreService";
import SubscriptionBillingModal from "./SubscriptionBillingModal";
import InviteCompanyModal from "./InviteCompanyModal";
import BroadcastAnnouncementModal from "./BroadcastAnnouncementModal";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterSubscriptionStatus, setFilterSubscriptionStatus] = useState("all");
  const [billingModalTenant, setBillingModalTenant] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tenants"); // 'tenants' | 'feed' | 'monetization'

  // Slider interactivo de monetización
  const [simulatedSubscribers, setSimulatedSubscribers] = useState(100);
  const [simulatedMonthlyPrice, setSimulatedMonthlyPrice] = useState(39000);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminOverviewData();
      setData(res);
    } catch (e) {
      console.error("Error loading super admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("vitrinapro_superadmin_mode", "true");
    loadData();
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
    navigate("/admin");
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
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-100 tracking-tight">
                  VitrinaPro <span className="text-amber-400 font-extrabold">SUPER ADMIN</span>
                </h1>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Torre de Control SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gestión Centralizada Multi-Tenant & Facturación de la Plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="bg-purple-600/90 hover:bg-purple-500 active:scale-95 text-slate-100 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
              title="Emitir comunicado o aviso a todos los contratistas"
            >
              <Radio className="w-4 h-4 animate-pulse text-purple-200" />
              <span className="hidden sm:inline">Aviso Global</span>
            </button>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Invitar</span>
              <span>Empresa</span>
            </button>

            <button
              onClick={loadData}
              title="Refrescar métricas"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-400" : ""}`} />
            </button>

            <Link
              to="/admin"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Volver a</span>
              <span>Panel Contratista</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Banner de Bienvenida Ejecutivo */}
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
                Supervisa el volumen transaccionado en la plataforma, ingresa al panel de cualquier contratista con 1 clic (God Mode) y proyecta el crecimiento del SaaS.
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
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
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
            <Crown className="w-4 h-4" />
            <span>Proyector Financiero SaaS</span>
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

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>➕ Afiliar Empresa</span>
                </button>

                <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                  <span className="text-xs text-slate-400 font-semibold">Plan:</span>
                  <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400 w-full sm:w-auto"
                  >
                    <option value="all">Todos los planes</option>
                    <option value="pro">Solo Planes PRO</option>
                    <option value="anual">Solo Anual VIP</option>
                    <option value="basico">Solo Básicos</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                  <span className="text-xs text-slate-400 font-semibold">Estado:</span>
                  <select
                    value={filterSubscriptionStatus}
                    onChange={(e) => setFilterSubscriptionStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-400 w-full sm:w-auto"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="al_dia">🟢 Al Día</option>
                    <option value="por_vencer">🟡 Por Vencer</option>
                    <option value="vencido">🔴 Vencidos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listado de Tarjetas de Contratistas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTenants.map((item) => {
                const biz = item.business;
                return (
                  <div
                    key={biz.businessSlug || biz.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all space-y-3.5"
                  >
                    <div>
                      {/* Top info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              biz.logoUrl ||
                              "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80"
                            }
                            alt={biz.businessName}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-800 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-slate-100 truncate max-w-[150px]">
                                {biz.businessName}
                              </h3>
                              {biz.subscriptionPlan === "pro" ? (
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-black">
                                  PRO
                                </span>
                              ) : biz.subscriptionPlan === "anual" ? (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black">
                                  ANUAL
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                                  FREE
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-brand-400 font-semibold block truncate">
                              {biz.categoryLabel || biz.category}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {biz.city || "Colombia"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Estado de Suscripción */}
                      <div className="flex items-center justify-between text-xs pt-2.5 pb-1 border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Mensualidad SaaS:
                        </span>
                        {biz.subscriptionStatus === "vencido" ? (
                          <span className="text-[10px] font-black text-red-400 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Vencido ({Math.abs(biz.diffDays)}d)
                          </span>
                        ) : biz.subscriptionStatus === "por_vencer" ? (
                          <span className="text-[10px] font-black text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Vence en {biz.diffDays}d
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Al Día ({biz.diffDays}d)
                          </span>
                        )}
                      </div>

                      {/* Métricas de este negocio */}
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-center">
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 block">Servicios</span>
                          <span className="text-xs font-bold text-slate-200">
                            {item.servicesCount}
                          </span>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 block">Cotizaciones</span>
                          <span className="text-xs font-bold text-slate-200">
                            {item.quotesCount}
                          </span>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 block">Facturado</span>
                          <span className="text-xs font-bold text-emerald-400 truncate block">
                            {formatCurrency(item.totalVolume)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones de Mando God Mode & Cobro */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                      <button
                        onClick={() => setBillingModalTenant(item)}
                        className="w-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-slate-100 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
                        title="Gestionar plan, registrar pago y enviar recordatorio por WhatsApp"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Gestionar Plan & Cobro</span>
                      </button>

                      <button
                        onClick={() => handleImpersonate(biz.businessSlug)}
                        className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                        title="Entrar al panel de este contratista para editar o configurar"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Entrar como este Negocio (God Mode)</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/b/${biz.businessSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Vitrina</span>
                        </a>

                        <a
                          href={`https://wa.me/${biz.whatsappNumber}?text=${encodeURIComponent(
                            `¡Hola ${biz.businessName}! Te escribo desde el equipo de soporte de VitrinaPro.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
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
      </main>

      {/* Modal de Facturación y Cobro de Suscripciones SaaS */}
      <SubscriptionBillingModal
        isOpen={!!billingModalTenant}
        onClose={() => setBillingModalTenant(null)}
        tenant={billingModalTenant}
        onSubscriptionUpdated={loadData}
      />

      {/* Modal de Invitación y Alta de Nuevas Empresas */}
      <InviteCompanyModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
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
    </div>
  );
}
