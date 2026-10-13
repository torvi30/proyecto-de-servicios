import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MessageCircle,
  ShieldCheck,
  Star,
  MapPin,
  Sparkles,
  Loader2,
  Share2,
  Calculator,
  Search,
  Gift,
  HelpCircle,
  ChevronDown,
  Check,
  Award,
  X,
  LogIn,
  Paintbrush,
  Layers,
  Lightbulb,
  Zap,
  Hammer,
  Flame,
  Dog,
  Home,
  Wrench,
  Filter,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ChevronUp,
} from "lucide-react";
import { getBusinessBySlug } from "../services/firestoreService";
import BeforeAfterGallery from "./BeforeAfterGallery";
import PublicQuoteLeadModal from "./PublicQuoteLeadModal";

export default function BusinessPublicView() {
  const { businessSlug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteModalService, setQuoteModalService] = useState(null);

  // Search and category filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryTag, setActiveCategoryTag] = useState("all");
  const [shareFeedback, setShareFeedback] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Live Express Quote state
  const [selectedServices, setSelectedServices] = useState([]);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoading(true);
        const data = await getBusinessBySlug(businessSlug);
        setBusiness(data);
      } catch (err) {
        console.error("Error loading public business showcase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [businessSlug]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCleanPhone = (phone) => {
    let clean = (phone || "").replace(/\D/g, "");
    if (clean.length === 10 && clean.startsWith("3")) {
      clean = "57" + clean;
    }
    return clean;
  };

  // Helper to toggle service in express quote list
  const toggleServiceSelection = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      }
      return [
        ...prev,
        {
          id: service.id,
          title: service.title,
          basePrice: Number(service.basePrice) || 0,
          categoryTag: service.categoryTag || "",
          quantity: 1,
        },
      ];
    });
  };

  // Helper to change quantity of a selected service
  const updateServiceQuantity = (serviceId, delta) => {
    setSelectedServices((prev) =>
      prev.map((item) => {
        if (item.id === serviceId) {
          const nextQty = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      })
    );
  };

  // Helper to remove a single service from quotation
  const removeSelectedService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  // Calculate live total amount
  const expressTotalAmount = selectedServices.reduce((sum, item) => {
    return sum + (item.basePrice > 0 ? item.basePrice * (item.quantity || 1) : 0);
  }, 0);

  const hasConvenioServices = selectedServices.some(
    (item) => !item.basePrice || item.basePrice === 0
  );

  // Send formatted express quote through WhatsApp in 1 click
  const handleExpressQuoteWhatsApp = () => {
    if (selectedServices.length === 0) return;
    const phone = getCleanPhone(business?.whatsappNumber);
    const bizName = business?.businessName || "profesional";

    const itemsSummary = selectedServices
      .map((item) => {
        const qtyText = item.quantity > 1 ? ` (${item.quantity} unds)` : "";
        const priceText =
          item.basePrice > 0
            ? `~$${(item.basePrice * (item.quantity || 1)).toLocaleString("es-CO")}`
            : "(A convenir)";
        return `• *${item.title}*${qtyText}: ${priceText}`;
      })
      .join("\n");

    let message = `¡Hola ${bizName}! 👋 Estuve armando mi presupuesto en tu vitrina digital y me interesan estos servicios:\n\n${itemsSummary}\n\n`;

    if (expressTotalAmount > 0) {
      message += `💰 *Presupuesto Estimado:* ~$${expressTotalAmount.toLocaleString("es-CO")} COP`;
      if (hasConvenioServices) {
        message += ` (+ servicios a convenir)`;
      }
      message += `\n\n`;
    }

    message += `¿Cuándo tendrías disponibilidad para revisar los detalles o agendar una visita técnica? Quedo atento/a.`;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleWhatsAppContact = (serviceTitle = null) => {
    const phone = getCleanPhone(business?.whatsappNumber);
    const bizName = business?.businessName || "profesional";

    let message = "";
    if (serviceTitle) {
      message = `¡Hola ${bizName}! 👋 Vi tu vitrina digital y me interesa cotizar el servicio de *${serviceTitle}*. ¿Cuándo podrías realizar una visita o darme más información?`;
    } else {
      message = `¡Hola ${bizName}! 👋 Vi tu vitrina digital y me gustaría solicitar una cotización para un trabajo en mi domicilio.`;
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleShareVitrina = async () => {
    const url = window.location.href;
    const text = `Te comparto la vitrina profesional de ${business?.businessName || "servicios"}: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: business?.businessName || "Vitrina de Servicios",
          text,
          url,
        });
        return;
      } catch (_err) {
        // User dismissed share dialog
      }
    }

    navigator.clipboard.writeText(url);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        <p className="text-sm text-slate-400 font-medium">Cargando vitrina profesional...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">Vitrina no encontrada</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          No existe un perfil de servicios registrado con la dirección <span className="text-brand-400 font-mono">/b/{businessSlug}</span>.
        </p>
        <Link
          to="/"
          className="bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-glow-teal"
        >
          Ir al Inicio
        </Link>
      </div>
    );
  }

  const services = business.services || [];

  // Portada cinematográfica según el oficio
  const getCoverImage = () => {
    if (business.coverUrl) return business.coverUrl;
    const cat = business.category || "electricidad";
    if (cat === "obra_blanca") {
      return "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80";
    }
    if (cat === "electricidad") {
      return "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&auto=format&fit=crop&q=80";
    }
    if (cat === "mascotas") {
      return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80";
  };

  // Extraer categorías únicas para los filtros
  const categoryTags = Array.from(
    new Set(services.map((s) => s.categoryTag).filter(Boolean))
  );

  // Filtrado reactivo de servicios
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categoryTag?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      activeCategoryTag === "all" || s.categoryTag === activeCategoryTag;
    return matchesSearch && matchesTag;
  });

  // Preguntas Frecuentes (FAQ de Confianza)
  const faqItems = [
    {
      q: "¿Cómo se maneja el anticipo y los pagos?",
      a: "Para iniciar labores y compra de insumos se recibe el 50% de anticipo con recibo de caja oficial, y el 50% restante se liquida únicamente cuando el trabajo esté finalizado y aprobado a tu conformidad.",
    },
    {
      q: "¿La cotización y visita técnica tienen costo?",
      a: "No, la cotización inicial y la visita de diagnóstico no tienen costo ni compromiso dentro del área metropolitana.",
    },
    {
      q: "¿Entregan garantía por escrito?",
      a: `Sí, todos los trabajos entregados por ${business.businessName} cuentan con garantía escrita de ${business.warrantyDays || "90 días"} que cubre materiales y mano de obra.`,
    },
  ];

  const isSuperAdminActive =
    typeof window !== "undefined" &&
    localStorage.getItem("vitrinapro_superadmin_mode") === "true";

  // Beneficio / Oferta adaptada a la profesión
  const getCategoryPromo = () => {
    const cat = business?.category || "";
    if (cat === "mascotas") {
      return {
        badge: "Beneficio Exclusivo Canino",
        title: "Primera sesión de diagnóstico y paseo de socialización sin costo a domicilio.",
        btn: "Aprovechar",
      };
    }
    if (cat === "electricidad") {
      return {
        badge: "Revisión Preventiva",
        title: "Diagnóstico inicial de sobrecargas y revisión de seguridad eléctrica sin costo.",
        btn: "Solicitar",
      };
    }
    return {
      badge: "Beneficio Exclusivo de Vitrina",
      title: "Visita técnica y asesoría de acabados sin costo en tu domicilio.",
      btn: "Aprovechar",
    };
  };

  // Checklist de confianza adaptado a la profesión
  const getCategoryChecklist = () => {
    const cat = business?.category || "";
    if (cat === "mascotas") {
      return [
        "Personal calificado & amor canino",
        "Reporte y fotos en tiempo real",
      ];
    }
    if (cat === "electricidad") {
      return [
        "Técnico electricista certificado RETIE",
        "Materiales normados y seguridad total",
      ];
    }
    return [
      "Mano de obra calificada y certificada",
      "Protección de pisos y aseo final incluido",
    ];
  };

  const getCategoryIconConfig = (tag) => {
    const t = (tag || "").toLowerCase();
    if (t.includes("pintura") || t.includes("color")) {
      return { Icon: Paintbrush, color: "text-amber-400 bg-amber-500/15" };
    }
    if (t.includes("drywall") || t.includes("muro")) {
      return { Icon: Layers, color: "text-blue-400 bg-blue-500/15" };
    }
    if (t.includes("cielo") || t.includes("techo") || t.includes("luz") || t.includes("ilumin")) {
      return { Icon: Lightbulb, color: "text-yellow-400 bg-yellow-500/15" };
    }
    if (t.includes("estuco") || t.includes("humedad") || t.includes("acabado")) {
      return { Icon: Sparkles, color: "text-purple-400 bg-purple-500/15" };
    }
    if (t.includes("piso") || t.includes("laminado") || t.includes("pvc")) {
      return { Icon: Hammer, color: "text-emerald-400 bg-emerald-500/15" };
    }
    if (t.includes("urgencia") || t.includes("eléctric") || t.includes("cable") || t.includes("retie")) {
      return { Icon: Zap, color: "text-amber-400 bg-amber-500/15" };
    }
    if (t.includes("calentador") || t.includes("ducha")) {
      return { Icon: Flame, color: "text-rose-400 bg-rose-500/15" };
    }
    if (t.includes("paseo") || t.includes("canino") || t.includes("perro")) {
      return { Icon: Dog, color: "text-orange-400 bg-orange-500/15" };
    }
    if (t.includes("hosped") || t.includes("guarder")) {
      return { Icon: Home, color: "text-emerald-400 bg-emerald-500/15" };
    }
    if (t.includes("adiestra") || t.includes("conducta") || t.includes("etolog") || t.includes("social")) {
      return { Icon: Award, color: "text-teal-400 bg-teal-500/15" };
    }
    return { Icon: Wrench, color: "text-slate-300 bg-slate-800" };
  };

  const promoInfo = getCategoryPromo();
  const tradeChecklist = getCategoryChecklist();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32 selection:bg-brand-500">
      {/* Toast flotante de compartir */}
      {shareFeedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4" />
          <span>¡Enlace de vitrina copiado al portapapeles!</span>
        </div>
      )}

      {/* 🌟 NAVBAR SUPERIOR CINEMÁTICO */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 px-4 py-2.5 ${
          isScrolled
            ? "bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/90 shadow-2xl shadow-slate-950/80"
            : "bg-slate-950/60 backdrop-blur-md border-b border-slate-800/40"
        }`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Lado Izquierdo: Identidad de Marca */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo o Avatar */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 bg-slate-900 shadow-md">
              <img
                src={
                  business.logoUrl ||
                  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=240&auto=format&fit=crop&q=80"
                }
                alt={business.businessName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-heading font-bold text-slate-100 max-w-[160px] sm:max-w-[280px] truncate block">
                  {business.businessName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" title="Disponible hoy" />
              </div>
              <p className="text-[10px] font-sans text-slate-400 truncate hidden xs:block">
                {business.categoryLabel || business.city || "Servicios Verificados"}
              </p>
            </div>
          </div>

          {/* Centro: Enlaces de Navegación Rápida (Desktop / Tablets) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-300">
            <a
              href="#servicios"
              className="px-3 py-1.5 rounded-xl hover:text-brand-300 hover:bg-slate-900/80 transition-colors"
            >
              Servicios ({services.length})
            </a>
            <a
              href="#beneficios"
              className="px-3 py-1.5 rounded-xl hover:text-brand-300 hover:bg-slate-900/80 transition-colors"
            >
              Garantía & Beneficios
            </a>
            <a
              href="#faq"
              className="px-3 py-1.5 rounded-xl hover:text-brand-300 hover:bg-slate-900/80 transition-colors"
            >
              Preguntas Frecuentes
            </a>
          </nav>

          {/* Lado Derecho: Acciones de Contacto y Acceso Propietario */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botón Compartir */}
            <button
              onClick={handleShareVitrina}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Compartir vitrina profesional"
            >
              <Share2 className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* Botón WhatsApp Rápido */}
            <button
              onClick={() => handleWhatsAppContact()}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-heading font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              title="Escribir por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>

            {/* Acceso para el Dueño (Oculto si ya está en Modo Super Admin) */}
            {!isSuperAdminActive && (
              <Link
                to="/admin"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all"
                title="¿Eres el dueño de este negocio? Administra tu vitrina aquí"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Acceso Dueño</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Portada Superior con Fotografía Cinemática y Overlay */}
      <div className="relative h-44 sm:h-60 bg-slate-900 overflow-hidden">
        <img
          src={getCoverImage()}
          alt="Portada"
          className="w-full h-full object-cover opacity-40 brightness-75 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] opacity-10 [background-size:20px_20px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-10 space-y-5 pb-36">
        {/* Tarjeta de Perfil del Profesional (Glassmorphism de Élite) */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <img
                src={
                  business.logoUrl ||
                  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=240&auto=format&fit=crop&q=80"
                }
                alt={business.businessName}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl ring-2 ring-emerald-500/30"
              />
              <span
                className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-md"
                title="Empresa Verificada"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              </span>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{business.rating || "4.9"}</span>
                <span className="text-amber-500/70 text-[10px]">({business.completedJobsCount || "140+"})</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Disponible hoy
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                {business.businessName}
              </h1>
              {business.badge && (
                <span className="text-[10px] bg-brand-500/10 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  {business.badge}
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-brand-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{business.categoryLabel || business.category?.toUpperCase() || "SERVICIOS TÉCNICOS"}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                {business.city || "Cobertura local & a domicilio"}
              </span>
              {business.coverageAreas && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-normal">
                    {business.coverageAreas}
                  </span>
                </>
              )}
            </p>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {business.bio || "Servicios profesionales garantizados, atención directa e inmediata por WhatsApp."}
            </p>
          </div>

          {/* Badges de Confianza de 4 Columnas */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Garantía</span>
              <span className="text-xs font-bold text-slate-200">
                {business.warrantyDays || "90 Días Escrita"}
              </span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Experiencia</span>
              <span className="text-xs font-bold text-slate-200">
                {business.experienceYears || "8+ Años"}
              </span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Cotización</span>
              <span className="text-xs font-bold text-emerald-400">Sin Costo</span>
            </div>
            <div className="hidden sm:block bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Respuesta</span>
              <span className="text-xs font-bold text-brand-400">~10 Minutos</span>
            </div>
          </div>
        </div>

        {/* Banner Promocional / Oferta Especial de Temporada */}
        <div id="beneficios" className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-heading font-bold text-emerald-400 uppercase tracking-wider block">
                {promoInfo.badge}
              </span>
              <p className="text-xs sm:text-sm font-sans font-semibold text-slate-200 leading-tight">
                {promoInfo.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleWhatsAppContact()}
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-heading font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 transition-all shadow-md shadow-emerald-500/20"
          >
            {promoInfo.btn}
          </button>
        </div>

        {/* Sección de Catálogo de Servicios con Buscador & Filtros */}
        <div id="servicios" className="space-y-3.5 scroll-mt-20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Servicios & Precios Estimados</span>
              <span className="text-[11px] font-bold bg-slate-800 text-brand-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                {filteredServices.length} {filteredServices.length === 1 ? "servicio" : "servicios"}
              </span>
            </h2>
            <button
              onClick={() => {
                setQuoteModalService(null);
                setQuoteModalOpen(true);
              }}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 px-3 py-1 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Cotizar a medida</span>
            </button>
          </div>

          {/* Buscador de Servicios */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="¿Qué trabajo necesitas hacer? (ej: pintura, drywall, estuco...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 🌟 EXPLORADOR DE ESPECIALIDADES / CATEGORÍAS TÁCTIL */}
          {categoryTags.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[11px] font-heading font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Filter className="w-3.5 h-3.5 text-brand-400" />
                  <span>Explorar por Especialidad</span>
                </span>
                {activeCategoryTag !== "all" && (
                  <button
                    onClick={() => setActiveCategoryTag("all")}
                    className="text-[11px] font-sans font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 px-2 py-0.5 rounded-lg transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Ver todas ({services.length})</span>
                  </button>
                )}
              </div>

              {/* Carrusel Horizontal de Botones Táctiles con Iconos Dinámicos */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                {/* Botón: Todos */}
                <button
                  type="button"
                  onClick={() => setActiveCategoryTag("all")}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
                    activeCategoryTag === "all"
                      ? "bg-gradient-to-r from-brand-500 to-emerald-400 text-slate-950 font-heading font-black border-emerald-400 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                      : "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      activeCategoryTag === "all"
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-800 text-brand-400 group-hover:bg-slate-700"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-heading font-bold">Todos</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                      activeCategoryTag === "all"
                        ? "bg-slate-950/30 text-slate-950"
                        : "bg-slate-800/80 text-slate-400"
                    }`}
                  >
                    {services.length}
                  </span>
                </button>

                {/* Botones por Categoría con Iconos Curados */}
                {categoryTags.map((tag) => {
                  const count = services.filter((s) => s.categoryTag === tag).length;
                  const isSelected = activeCategoryTag === tag;
                  const { Icon, color } = getCategoryIconConfig(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveCategoryTag(tag)}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
                        isSelected
                          ? "bg-gradient-to-r from-brand-500 to-emerald-400 text-slate-950 font-heading font-black border-emerald-400 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                          : "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-slate-950/20 text-slate-950"
                            : color
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-heading font-bold">{tag}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                          isSelected
                            ? "bg-slate-950/30 text-slate-950"
                            : "bg-slate-800/80 text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback informativo cuando hay una categoría filtrada */}
              {activeCategoryTag !== "all" && (
                <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      Mostrando trabajos de <strong className="text-white font-bold">{activeCategoryTag}</strong> ({filteredServices.length} disponible{filteredServices.length === 1 ? "" : "s"})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveCategoryTag("all")}
                    className="text-[11px] font-bold text-emerald-400 hover:text-white underline ml-2"
                  >
                    Ver catálogo completo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Listado de Servicios Filtrados */}
          {filteredServices.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <p className="text-xs text-slate-400">
                No se encontraron servicios que coincidan con tu búsqueda.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategoryTag("all");
                }}
                className="text-xs font-bold text-brand-400 underline"
              >
                Ver todos los servicios
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subtle Helper Indicator for Express Quote */}
              {selectedServices.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-lg shadow-emerald-950/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <p className="text-xs font-sans text-slate-200 truncate">
                      <strong className="text-emerald-300 font-heading">{selectedServices.length}</strong> {selectedServices.length === 1 ? "servicio en tu presupuesto" : "servicios en tu presupuesto"} • Total est:{" "}
                      <strong className="text-emerald-400 font-heading">
                        {expressTotalAmount > 0 ? formatCurrency(expressTotalAmount) : "A convenir"}
                      </strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsQuoteDrawerOpen(true)}
                    className="text-xs font-heading font-black text-emerald-400 hover:text-emerald-300 underline shrink-0 px-2 py-1"
                  >
                    Ver resumen
                  </button>
                </div>
              )}

              {filteredServices.map((service, index) => {
                const isSelected = selectedServices.some((s) => s.id === service.id);
                const selectedItem = selectedServices.find((s) => s.id === service.id);

                return (
                  <div
                    key={service.id}
                    className={`group bg-slate-900/90 border rounded-3xl overflow-hidden shadow-lg transition-all duration-300 ${
                      isSelected
                        ? "border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-emerald-950/50 shadow-xl"
                        : "border-slate-800/90 hover:border-brand-500/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Imagen del servicio con hover zoom */}
                      <div className="sm:w-48 h-44 sm:h-auto relative bg-slate-800 shrink-0 overflow-hidden">
                        <img
                          src={
                            service.imageUrl ||
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80"
                          }
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 sm:hidden">
                          {index === 0 && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                              ⭐ Más Solicitado
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] font-black text-slate-950 bg-emerald-400 px-2 py-0.5 rounded-full shadow-md">
                              ✓ En cotización
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contenido detallado del servicio */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {service.categoryTag && (
                                <span className="text-[10px] font-sans font-semibold bg-slate-800 text-brand-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                                  {service.categoryTag}
                                </span>
                              )}
                              {index === 0 && (
                                <span className="text-[10px] font-sans font-bold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                                  ⭐ Más Solicitado
                                </span>
                              )}
                              {isSelected && (
                                <span className="hidden sm:inline-flex text-[10px] font-sans font-black text-slate-950 bg-emerald-400 px-2 py-0.5 rounded-full shadow-sm">
                                  ✓ Agregado
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              <span className="text-xs sm:text-sm font-heading font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 sm:px-3 py-1 rounded-xl whitespace-nowrap inline-flex items-center gap-1 shadow-sm">
                                {service.basePrice > 0 ? (
                                  <>
                                    <span className="text-[10px] text-emerald-300/80 font-sans font-medium uppercase tracking-wider">
                                      Desde
                                    </span>
                                    <span>{formatCurrency(service.basePrice)}</span>
                                    {business.category === "obra_blanca" && (
                                      <span className="text-[11px] text-emerald-300/80 font-sans font-normal">
                                        / m²
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="font-sans font-medium text-xs">Precio a convenir</span>
                                )}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-sm sm:text-base font-heading font-bold text-slate-100 group-hover:text-brand-300 transition-colors leading-snug">
                            {service.title}
                          </h3>
                          <p className="text-xs font-sans text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>

                          {/* Viñetas de Beneficios del Servicio Adaptadas al Oficio */}
                          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] font-sans text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{tradeChecklist[0]}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{tradeChecklist[1]}</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA Directo con Cotizador Express */}
                        <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/60 flex-wrap sm:flex-nowrap">
                          <span className="text-[11px] font-sans text-slate-400 font-medium">
                            Garantía de 90 días incluida
                          </span>

                          <div className="flex items-center gap-2 ml-auto">
                            {isSelected ? (
                              <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/50 rounded-xl px-2 py-1 shadow-sm">
                                <button
                                  onClick={() => updateServiceQuantity(service.id, -1)}
                                  className="w-6 h-6 rounded-lg bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold transition-all active:scale-90"
                                  title="Restar cantidad"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-emerald-300 px-1.5 font-heading min-w-[20px] text-center">
                                  {selectedItem?.quantity || 1}
                                </span>
                                <button
                                  onClick={() => updateServiceQuantity(service.id, 1)}
                                  className="w-6 h-6 rounded-lg bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold transition-all active:scale-90"
                                  title="Sumar cantidad"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeSelectedService(service.id)}
                                  className="ml-1 text-slate-400 hover:text-rose-400 p-1 transition-colors"
                                  title="Quitar de mi cotización"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleServiceSelection(service)}
                                className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 hover:border-emerald-400 font-heading font-bold px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Agregar al total</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setQuoteModalService(service);
                                setQuoteModalOpen(true);
                              }}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-all text-xs flex items-center gap-1 shrink-0"
                              title="Cotizar en detalle con medidas"
                            >
                              <Calculator className="w-3.5 h-3.5 text-slate-400" />
                              <span className="hidden sm:inline">Detalle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Portafolio de Trabajos Reales Antes vs Después */}
        <BeforeAfterGallery
          businessCategory={business.category || "electricidad"}
          isPublicView={true}
        />

        {/* Métodos de Pago Habilitados */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-2.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Medios de Pago Habilitados & Facilidades
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-xl font-bold">
              📱 Nequi
            </span>
            <span className="text-xs bg-red-500/10 text-red-300 border border-red-500/30 px-3 py-1 rounded-xl font-bold">
              🔴 Daviplata
            </span>
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl font-bold">
              🏦 Bancolombia
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
              💵 Efectivo
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Se recibe 50% de anticipo para compra de insumos/inicio y saldo al finalizar a conformidad. Entregamos recibo de caja oficial con constancia de paz y salvo.
          </p>
        </div>

        {/* Preguntas Frecuentes Desplegables (FAQ de Confianza) */}
        <div id="faq" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 scroll-mt-20">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              Preguntas Frecuentes al Contratar
            </h3>
          </div>

          <div className="space-y-2">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-slate-200 flex items-center justify-between gap-2 hover:text-brand-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-brand-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-2 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reseñas y Testimonios de Clientes Verificados (Social Proof Dinámico) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Opiniones de Clientes Verificados
            </h2>
            <span className="text-xs text-amber-400 font-black">4.9 / 5.0 (142+)</span>
          </div>

          {(() => {
            const cat = business.category || "electricidad";
            let reviews = [
              {
                name: "Carlos Mendoza",
                comment: "Excelente profesional. Cambió el tablero eléctrico y balanceó los circuitos en una sola tarde. Muy limpio, ordenado y puntual.",
              },
              {
                name: "Dra. Sofía Restrepo",
                comment: "Nos solucionó un corto en el consultorio que otros dos técnicos no habían podido identificar. Muy recomendado y precio transparente.",
              },
            ];

            if (cat === "obra_blanca") {
              reviews = [
                {
                  name: "Arq. Mauricio Vélez",
                  comment: "Contratamos el estuco y pintura de toda la casa campestre. Acabados impecables, nivelación de drywall perfecta y cero desorden al entregar.",
                },
                {
                  name: "Camila Cárdenas",
                  comment: "Pintaron el apartamento completo en 3 días. Protegieron los pisos y carpintería con plástico. Gran cumplimiento y pulcritud.",
                },
              ];
            } else if (cat === "mascotas") {
              reviews = [
                {
                  name: "Marcela Henao (Mamá de Max 🐕)",
                  comment: "Mi Golden salía muy ansioso y ahora regresa feliz y tranquilo. Me mandan fotos y reporte GPS en cada paseo. Súper confiables.",
                },
                {
                  name: "David Morales (Dueño de Rocky)",
                  comment: "El plan de adiestramiento fue excelente. En solo 4 sesiones corrigieron el tironeo de la correa con refuerzo positivo.",
                },
              ];
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{rev.name}</span>
                      <div className="flex text-amber-400 text-xs">★★★★★</div>
                    </div>
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Footer de Confianza */}
        <footer className="pt-6 border-t border-slate-800 text-center space-y-2.5">
          <p className="text-xs text-slate-400">
            Vitrina digital oficial de <span className="text-slate-200 font-bold">{business.businessName}</span>
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full">
            <span>Potenciado por</span>
            <span className="font-black text-brand-400">VitrinaPro</span>
          </div>
        </footer>
      </div>

      {/* Floating Bottom Bar with Live Totalizer & 1-Click WhatsApp Quote */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-2">
          {selectedServices.length > 0 ? (
            <>
              {/* Expandable Breakdown Drawer */}
              {isQuoteDrawerOpen && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-2 shadow-2xl space-y-3 max-h-[55vh] overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-heading font-black text-slate-100">
                        Tu Presupuesto Express ({selectedServices.length})
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedServices([])}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Vaciar</span>
                      </button>
                      <button
                        onClick={() => setIsQuoteDrawerOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-800/60 space-y-2">
                    {selectedServices.map((item) => (
                      <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-slate-200 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 font-sans">
                            {item.basePrice > 0 ? formatCurrency(item.basePrice) : "Precio a convenir"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-0.5">
                            <button
                              onClick={() => updateServiceQuantity(item.id, -1)}
                              className="text-slate-300 hover:text-white p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-xs text-brand-300 min-w-[16px] text-center font-heading">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateServiceQuantity(item.id, 1)}
                              className="text-slate-300 hover:text-white p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-heading font-bold text-emerald-400 min-w-[70px] text-right">
                            {item.basePrice > 0 ? formatCurrency(item.basePrice * item.quantity) : "A convenir"}
                          </span>
                          <button
                            onClick={() => removeSelectedService(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans italic pt-1 border-t border-slate-800/60">
                    * Estimado referencial sin compromiso. El profesional confirmará los detalles exactos en la visita o por chat.
                  </p>
                </div>
              )}

              {/* Live Bar with Totalizer & 1-Click WhatsApp Button */}
              <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                <button
                  onClick={() => setIsQuoteDrawerOpen(!isQuoteDrawerOpen)}
                  className="flex items-center gap-2 sm:gap-2.5 text-left bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 px-3 py-2 rounded-2xl transition-all shrink-0"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-slate-950 text-[10px] font-heading font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                      {selectedServices.length}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-sans text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span>Total Estimado</span>
                      {isQuoteDrawerOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronUp className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-heading font-black text-emerald-400 leading-tight">
                      {expressTotalAmount > 0 ? formatCurrency(expressTotalAmount) : "A convenir"}
                      {hasConvenioServices && expressTotalAmount > 0 && (
                        <span className="text-[10px] font-normal text-slate-400 ml-1">+ extra</span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExpressQuoteWhatsApp}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-brand-500 hover:from-emerald-400 hover:to-brand-400 active:scale-95 text-slate-950 font-heading font-black py-3 px-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all truncate"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">Pedir Cotización ({selectedServices.length})</span>
                </button>
              </div>
            </>
          ) : (
            /* Default Floating Bar when no services selected */
            <>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En línea • Respuesta en ~5 min</span>
                </div>
                <span className="text-slate-400 hidden xs:inline">💡 Toca &quot;+ Agregar al total&quot; para cotizar en vivo</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setQuoteModalService(null);
                    setQuoteModalOpen(true);
                  }}
                  className="bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-brand-300 border border-slate-700 font-heading font-bold py-3 px-3.5 rounded-2xl text-xs flex items-center gap-1.5 transition-all shrink-0"
                  title="Calcular cotización interactiva"
                >
                  <Calculator className="w-4 h-4 text-brand-400" />
                  <span className="hidden xs:inline">Cotizar a Medida</span>
                </button>

                <button
                  onClick={() => handleWhatsAppContact()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-heading font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all truncate"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">Hablar con {business.businessName.split(" ")[0]} por WhatsApp</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Interactivo de Cotización y Captura de Leads */}
      <PublicQuoteLeadModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        service={quoteModalService}
        business={business}
        formatCurrency={formatCurrency}
        getCleanPhone={getCleanPhone}
      />
    </div>
  );
}
