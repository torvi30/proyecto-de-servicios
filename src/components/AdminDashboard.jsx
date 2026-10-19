import React, { useState, useEffect } from "react";
import {
  Wrench,
  QrCode,
  Clock,
  ExternalLink,
  Settings,
  LogOut,
  Flame,
  Plus,
  Share2,
  Sparkles,
  Layers,
  AlertTriangle,
  Smartphone,
  Monitor,
  Users,
  TrendingUp,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getBusinessServices,
  getBusinessQuotes,
} from "../services/firestoreService";
import MobileBottomNav from "./MobileBottomNav";
import ServiceManager from "./ServiceManager";
import QuoteManager from "./QuoteManager";
import BusinessQRCode from "./BusinessQRCode";
import CleanBusinessSetupModal from "./CleanBusinessSetupModal";
import ClientDirectory from "./ClientDirectory";
import BeforeAfterGallery from "./BeforeAfterGallery";
import BusinessVisualEditorModal from "./BusinessVisualEditorModal";
import GlobalBroadcastBanner from "./GlobalBroadcastBanner";
import PaymentTerminalModal from "./PaymentTerminalModal";

export default function AdminDashboard() {
  const { user, business, logout, isDemoUser, isFirebaseConfigured, updateBusinessState, refreshBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'services' | 'quotes' | 'qr'
  const [dashboardSubView, setDashboardSubView] = useState("resumen"); // 'resumen' | 'clientes' | 'portafolio'
  const [isDevicePreview, setIsDevicePreview] = useState(false);
  const [services, setServices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCleanSetupOpen, setIsCleanSetupOpen] = useState(false);
  const [selectedClientForQuote, setSelectedClientForQuote] = useState(null);
  const [isPaymentTerminalOpen, setIsPaymentTerminalOpen] = useState(false);

  const [shareFeedback, setShareFeedback] = useState(false);

  const loadData = async (targetBiz = null) => {
    const activeBiz = targetBiz || business;
    if (!activeBiz?.id) return;
    try {
      setLoadingData(true);
      const [fetchedServices, fetchedQuotes] = await Promise.all([
        getBusinessServices(activeBiz.id),
        getBusinessQuotes(activeBiz.id),
      ]);
      setServices(fetchedServices || []);
      setQuotes(fetchedQuotes || []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (business) {
      loadData(business);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id, business?.businessSlug]);

  useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail) {
        loadData(e.detail);
      }
    };
    window.addEventListener("vitrinapro_business_switched", handleSwitch);
    return () => {
      window.removeEventListener("vitrinapro_business_switched", handleSwitch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShareVitrina = async () => {
    const url = `${window.location.origin}/b/${business?.businessSlug || "demo"}`;
    const promoText = `👋 ¡Hola! Conoce mis servicios profesionales, fotos de trabajos realizados y cotiza directamente por WhatsApp en mi vitrina oficial:\n\n🔗 ${url}\n\n¡Guarda mi contacto para cuando lo necesites!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: business?.businessName || "Vitrina de Servicios",
          text: promoText,
          url,
        });
        return;
      } catch (_err) {
        // Fallback to clipboard when user cancels or share is rejected
      }
    }

    navigator.clipboard.writeText(promoText);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2500);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Cálculos para métricas del dashboard
  const pendingQuotes = quotes.filter((q) => q.status === "pendiente");
  const inProgressQuotes = quotes.filter((q) => q.status === "en_progreso");
  const completedQuotes = quotes.filter((q) => q.status === "finalizado");

  const totalEarnings = completedQuotes.reduce(
    (acc, q) => acc + (Number(q.totalAmount) || 0),
    0
  );

  const totalPendingAmount = pendingQuotes.reduce(
    (acc, q) => acc + (Number(q.totalAmount) || 0),
    0
  );

  const totalInProgressAmount = inProgressQuotes.reduce(
    (acc, q) => acc + (Number(q.totalAmount) || 0),
    0
  );

  const totalPipelineAmount = totalEarnings + totalPendingAmount + totalInProgressAmount;
  const totalJobsCount = quotes.length;
  const closedJobsCount = completedQuotes.length;
  const closeRate = totalJobsCount > 0 ? Math.round((closedJobsCount / totalJobsCount) * 100) : 0;
  const averageTicket = closedJobsCount > 0 ? Math.round(totalEarnings / closedJobsCount) : 0;
  const estimatedAdvancesReceived = Math.round(totalInProgressAmount * 0.5);

  const publicUrl = `/b/${business?.businessSlug || "demo"}`;

  return (
    <div
      className={
        isDevicePreview
          ? "min-h-screen bg-slate-900 md:py-8 md:px-4 flex flex-col items-center justify-start selection:bg-brand-500"
          : "min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-brand-500"
      }
    >
      <div
        className={
          isDevicePreview
            ? "w-full md:max-w-[420px] bg-slate-950 text-slate-100 md:border-[10px] md:border-slate-800 md:rounded-[52px] md:shadow-2xl md:overflow-hidden md:relative md:ring-1 md:ring-slate-700/80 pb-24 transition-all"
            : "w-full"
        }
      >
        {isDevicePreview && (
          <div className="hidden md:flex justify-center pt-2.5 pb-1 bg-slate-950 border-b border-slate-900">
            <div className="w-28 h-4 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-950 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Top Header Móvil */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  business?.logoUrl ||
                  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80"
                }
                alt="Logo"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-brand-500/40 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-100 tracking-tight leading-none truncate max-w-[150px] sm:max-w-xs">
                  {business?.businessName || "VitrinaPro"}
                </h1>
                <span className="text-[10px] bg-brand-500/10 text-brand-400 font-semibold px-1.5 py-0.5 rounded">
                  PRO
                </span>
                {isDemoUser && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold px-1.5 py-0.5 rounded">
                    DEMO
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                /{business?.businessSlug || "slug"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">

            {/* Simulador de Vista Celular para Presentación */}
            <button
              onClick={() => setIsDevicePreview(!isDevicePreview)}
              title={isDevicePreview ? "Desactivar marco celular" : "Activar marco de celular para presentación"}
              className={`hidden md:flex p-2 rounded-xl transition-all items-center gap-1 text-xs font-bold ${
                isDevicePreview
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {isDevicePreview ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              <span>{isDevicePreview ? "Pantalla Completa" : "Vista Celular"}</span>
            </button>

            <button
              onClick={() => setIsPaymentTerminalOpen(true)}
              title="Terminal de cobro rápido en sitio con QR (Nequi, Bancolombia, Daviplata)"
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Cobrar en Sitio</span>
            </button>

            <button
              onClick={handleShareVitrina}
              title="Compartir enlace de vitrina"
              className="p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir vitrina pública"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Ajustes de mi negocio"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Banner de Comunicado Global Emitido por Super Admin */}
      <div className="max-w-2xl mx-auto">
        <GlobalBroadcastBanner />
      </div>

      {/* Main Content Area con holgura inferior para barra móvil fija */}
      <main className="max-w-2xl mx-auto px-4 pt-2 pb-28 sm:pb-24 space-y-4">
        {/* Selector Rápido de Oficio / Página Limpia */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-brand-500/30 rounded-2xl p-3 flex items-center justify-between gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-200 block truncate">
                Perfil: <strong className="text-brand-400">{business?.businessName}</strong> ({business?.categoryLabel || "Servicios"})
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {business?.city ? `📍 ${business.city} • ` : ""}
                {business?.bio ? business.bio.substring(0, 55) + "..." : "⚡ Electricista • 🏗️ Obra Blanca • 🐕 Mascotas • 🩺 Ortopedia"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-brand-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-brand-500/30 transition-all"
              title="Personalizar datos de negocio, WhatsApp, pagos y garantías"
            >
              <span>✏️ Personalizar</span>
            </button>
            <button
              onClick={() => setIsCleanSetupOpen(true)}
              className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-glow-teal transition-all"
              title="Cambiar entre perfiles o iniciar página limpia"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cambiar Oficio</span>
            </button>
          </div>
        </div>

        {/* Banner de Modo Demostración si no hay credenciales de Firebase en .env */}
        {!isFirebaseConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Modo Demostración Activo:</span>
              <p className="text-amber-300/80 leading-relaxed">
                Los datos se guardan de forma local en tu navegador. Para conectar tu base de datos de producción, añade tus credenciales en el archivo <code className="bg-amber-950/60 px-1 py-0.5 rounded font-mono">.env</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Dashboard Resumen */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {/* Sub-Pestañas del Dashboard */}
            <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 gap-1 text-xs font-bold">
              <button
                onClick={() => setDashboardSubView("resumen")}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all text-center ${
                  dashboardSubView === "resumen"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📊 Facturación
              </button>
              <button
                onClick={() => setDashboardSubView("clientes")}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                  dashboardSubView === "clientes"
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Clientes CRM</span>
              </button>
              <button
                onClick={() => setDashboardSubView("portafolio")}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                  dashboardSubView === "portafolio"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Antes vs Después</span>
              </button>
            </div>

            {loadingData && !services.length && !quotes.length ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-3xl">
                <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                <span>Cargando datos del negocio...</span>
              </div>
            ) : (
              <>
                {dashboardSubView === "resumen" && (
                  <>
                    {/* Tarjeta de Saludo, Ingresos y Métricas Ejecutivas */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 border border-brand-500/30 rounded-3xl p-5 shadow-glow-teal space-y-4">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl" />

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Flame className="w-4 h-4 text-brand-400" />
                      Rendimiento & Rentabilidad
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date().toLocaleDateString("es-CO", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Total Facturado & Cobrado</span>
                      <div className="text-3xl font-black text-slate-100 tracking-tight mt-0.5">
                        {formatCurrency(totalEarnings)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{closeRate}% Cierre</span>
                      </span>
                      <span className="text-xs bg-brand-500/10 text-brand-300 border border-brand-500/30 px-2.5 py-1 rounded-xl font-bold">
                        {closedJobsCount} cerrados
                      </span>
                    </div>
                  </div>

                  {/* Barra de Distribución del Pipeline Comercial */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Distribución de Contratos</span>
                      <span className="font-semibold text-slate-300">
                        Total en flujo: {formatCurrency(totalPipelineAmount)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        style={{
                          width: `${totalJobsCount > 0 ? (closedJobsCount / totalJobsCount) * 100 : 0}%`,
                        }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`Cobrado: ${closedJobsCount}`}
                      />
                      <div
                        style={{
                          width: `${totalJobsCount > 0 ? (inProgressQuotes.length / totalJobsCount) * 100 : 0}%`,
                        }}
                        className="bg-blue-500 h-full transition-all"
                        title={`En obra: ${inProgressQuotes.length}`}
                      />
                      <div
                        style={{
                          width: `${totalJobsCount > 0 ? (pendingQuotes.length / totalJobsCount) * 100 : 0}%`,
                        }}
                        className="bg-amber-500 h-full transition-all"
                        title={`Pendientes: ${pendingQuotes.length}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Cobrado ({closedJobsCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        En Obra ({inProgressQuotes.length})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Cotizado ({pendingQuotes.length})
                      </span>
                    </div>
                  </div>

                  {/* Grid de Métricas Ejecutivas Adicionales */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Ticket Promedio x Trabajo
                      </span>
                      <span className="text-sm font-black text-slate-200 block">
                        {formatCurrency(averageTicket)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Valor medio facturado
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Por Cobrar / En Ejecución
                      </span>
                      <span className="text-sm font-black text-amber-400 block">
                        {formatCurrency(totalPendingAmount + totalInProgressAmount)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {inProgressQuotes.length + pendingQuotes.length} proyectos (~{formatCurrency(estimatedAdvancesReceived)} en anticipos)
                      </span>
                    </div>
                  </div>

                  {/* Botones rápidos de acción */}
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => setActiveTab("quotes")}
                      className="flex-1 bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-teal"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cotizar por WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setIsPaymentTerminalOpen(true)}
                      className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 active:scale-95 text-emerald-300 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                      title="Cobro en sitio inmediato con QR de bancos"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Cobrar en Sitio</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("services")}
                      className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Servicios</span>
                    </button>
                  </div>
                </div>

            {/* Grid de 3 Métricas Rápidas */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => setActiveTab("quotes")}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 p-3 rounded-2xl cursor-pointer transition-all space-y-1 text-center"
              >
                <Clock className="w-4 h-4 text-amber-400 mx-auto" />
                <span className="text-base font-extrabold text-amber-400 block">
                  {pendingQuotes.length}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  Pendientes
                </span>
              </div>

              <div
                onClick={() => setActiveTab("quotes")}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 p-3 rounded-2xl cursor-pointer transition-all space-y-1 text-center"
              >
                <Layers className="w-4 h-4 text-blue-400 mx-auto" />
                <span className="text-base font-extrabold text-blue-400 block">
                  {inProgressQuotes.length}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  En Proceso
                </span>
              </div>

              <div
                onClick={() => setActiveTab("services")}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-brand-500/40 p-3 rounded-2xl cursor-pointer transition-all space-y-1 text-center"
              >
                <Wrench className="w-4 h-4 text-brand-400 mx-auto" />
                <span className="text-base font-extrabold text-brand-400 block">
                  {services.length}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  Servicios
                </span>
              </div>
            </div>

            {/* Accesos directos y QR promocional rápido */}
            <div
              onClick={() => setActiveTab("qr")}
              className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Mi Código QR para Camioneta y Tarjetas
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Descarga en PNG con marco de alta resolución
                  </p>
                </div>
              </div>
              <span className="text-xs text-brand-400 font-semibold flex items-center gap-1">
                Ver QR →
              </span>
            </div>

            {/* Mini Lista de Cotizaciones Recientes */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Cotizaciones Recientes
                </h3>
                <button
                  onClick={() => setActiveTab("quotes")}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  Ver todas ({quotes.length})
                </button>
              </div>

              {quotes.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  onClick={() => setActiveTab("quotes")}
                  className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition-all"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      {q.clientName}
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {q.workDescription}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-400 block">
                      {formatCurrency(q.totalAmount)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        q.status === "pendiente"
                          ? "bg-amber-500/20 text-amber-400"
                          : q.status === "en_progreso"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {q.status === "pendiente"
                        ? "Pendiente"
                        : q.status === "en_progreso"
                        ? "En Obra"
                        : "Cobrado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sub-Vista: Directorio y Cartera de Clientes (CRM) */}
        {dashboardSubView === "clientes" && (
          <ClientDirectory
            business={business}
            quotes={quotes}
            onNewQuoteForClient={(client) => {
              setSelectedClientForQuote(client);
              setActiveTab("quotes");
            }}
          />
        )}

        {/* Sub-Vista: Portafolio de Trabajos Reales Antes vs Después */}
        {dashboardSubView === "portafolio" && (
          <BeforeAfterGallery
            businessId={business?.id}
            businessCategory={business?.category || "electricidad"}
            isPublicView={false}
          />
        )}
              </>
            )}
      </div>
    )}

        {/* Tab 2: Servicios */}
        {activeTab === "services" && (
          <ServiceManager
            business={business}
            services={services}
            onServicesUpdated={loadData}
          />
        )}

        {/* Tab 3: Cotizaciones y Kanban de Trabajos */}
        {activeTab === "quotes" && (
          <QuoteManager
            business={business}
            quotes={quotes}
            onQuotesUpdated={loadData}
            initialClient={selectedClientForQuote}
            onClearInitialClient={() => setSelectedClientForQuote(null)}
          />
        )}

        {/* Tab 4: QR y Marketing Offline */}
        {activeTab === "qr" && <BusinessQRCode business={business} />}
      </main>

      {/* Modal Editor Visual de Vitrina y Negocio */}
      <BusinessVisualEditorModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        business={business}
        onSave={async (updatedPayload) => {
          const saved = await updateBusinessState(updatedPayload);
          await loadData(saved || updatedPayload);
          setShareFeedback(true);
          setTimeout(() => setShareFeedback(false), 2500);
        }}
      />

      {/* Toast de Enlace Copiado */}
      {shareFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-2xl shadow-xl text-xs flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <span>✓ ¡Mensaje promocional copiado listo para Estados de WhatsApp!</span>
        </div>
      )}

      {/* Modal de Configurador de Oficio / Página Limpia */}
      <CleanBusinessSetupModal
        isOpen={isCleanSetupOpen}
        onClose={() => setIsCleanSetupOpen(false)}
        currentBusiness={business}
        onProfileSwitched={async (newBiz) => {
          const isSuperAdminMode = localStorage.getItem("vitrinapro_superadmin_mode") === "true";
          if (!isSuperAdminMode && user?.uid) {
            await refreshBusiness(user.uid);
          }
          await loadData(newBiz || business);
        }}
      />

      {/* Modal Terminal de Cobro Rápido en Sitio */}
      <PaymentTerminalModal
        isOpen={isPaymentTerminalOpen}
        onClose={() => setIsPaymentTerminalOpen(false)}
        business={business}
      />

      {/* Floating Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
