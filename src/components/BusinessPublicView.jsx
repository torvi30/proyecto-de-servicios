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
  Phone,
  CreditCard,
  Activity,
  UserPlus,
  Smartphone,
  Building2,
  Banknote,
  FileCheck,
} from "lucide-react";
import { getBusinessBySlug } from "../services/firestoreService";
import BeforeAfterGallery from "./BeforeAfterGallery";
import PublicQuoteLeadModal from "./PublicQuoteLeadModal";
import { getThemeStyles, getDefaultThemeForCategory } from "../utils/themeHelper";
import { downloadBusinessVCard } from "../utils/vCardHelper";

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
  const [savedContactFeedback, setSavedContactFeedback] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Live Express Quote state
  const [selectedServices, setSelectedServices] = useState([]);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);

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

  useEffect(() => {
    const handleServicesChanged = (e) => {
      if (e.detail?.services && business) {
        const targetId = e.detail.businessId;
        if (
          !targetId ||
          targetId === business.id ||
          targetId === business.businessSlug ||
          businessSlug === targetId
        ) {
          const activeOnly = (e.detail.services || [])
            .filter((s) => s.isActive !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setBusiness((prev) => (prev ? { ...prev, services: activeOnly } : prev));
        }
      }
    };
    window.addEventListener("vitrinapro_services_changed", handleServicesChanged);
    return () =>
      window.removeEventListener("vitrinapro_services_changed", handleServicesChanged);
  }, [business, businessSlug]);

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
  const landingConfig = business.landingConfig || {};
  const themeStyles = getThemeStyles(
    business.themeColor || getDefaultThemeForCategory(business.category),
    landingConfig.bgColor,
    landingConfig.cardColor
  );
  const showBeforeAfter = landingConfig.showBeforeAfter ?? true;
  const showQuickQuote = landingConfig.showQuickQuote ?? true;
  const showBankInfo = landingConfig.showBankInfo ?? true;
  const showReviews = landingConfig.showReviews ?? true;
  // Solo se muestra el banner de beneficios si el cliente lo activó explícitamente y definió un texto
  const showPromoBanner = Boolean(landingConfig.showPromoBanner && landingConfig.promoTitle?.trim());

  // Portada cinematográfica según el oficio o foto personalizada
  const getCoverImage = () => {
    if (business.coverImageUrl) return business.coverImageUrl;
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
    if (cat === "ortopedia") {
      return "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80";
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

  // Preguntas Frecuentes (FAQ de Confianza adaptadas a la configuración del negocio)
  const faqItems = [
    {
      q: "¿Cómo se maneja el anticipo y las formas de pago?",
      a: `Para iniciar labores y compra de insumos se maneja habitualmente ${business.advancePercentage || "el anticipo acordado"} con soporte de recibo, y el saldo restante se liquida únicamente cuando el trabajo esté finalizado a tu entera conformidad. Medios habilitados: ${business.paymentMethods || "Nequi, Bancolombia o Efectivo"}.`,
    },
    {
      q: "¿Cómo es el proceso de cotización?",
      a: `Puedes cotizar seleccionando los servicios en esta vitrina o escribiendo directamente por WhatsApp para coordinar los detalles, acordar especificaciones o evaluar una visita técnica según tu requerimiento.`,
    },
    {
      q: "¿Entregan garantía por el servicio?",
      a: `Sí, todos los trabajos entregados por ${business.businessName} cuentan con respaldo y garantía de ${business.warrantyDays || "90 días"} que cubre la mano de obra realizada.`,
    },
  ];

  // Beneficio / Oferta personalizada exclusivamente por el negocio
  const getCategoryPromo = () => {
    return {
      badge: landingConfig.promoBadge?.trim() || "Beneficio Exclusivo",
      title: landingConfig.promoTitle?.trim() || "",
      btn: landingConfig.promoBtnText?.trim() || "Aprovechar",
    };
  };

  // Checklist de confianza adaptado a la profesión
  const getCategoryChecklist = () => {
    const cat = business?.category || "";
    if (cat === "ortopedia") {
      return [
        "Especialistas certificados en ortopedia técnica y biomecánica",
        "Dispositivos termomoldeables a medida y equipos clínicos higienizados",
      ];
    }
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
    if (t.includes("pintura") || t.includes("color")) return { Icon: Paintbrush };
    if (t.includes("drywall") || t.includes("muro")) return { Icon: Layers };
    if (t.includes("cielo") || t.includes("techo") || t.includes("luz") || t.includes("ilumin")) return { Icon: Lightbulb };
    if (t.includes("estuco") || t.includes("humedad") || t.includes("acabado")) return { Icon: Sparkles };
    if (t.includes("piso") || t.includes("laminado") || t.includes("pvc")) return { Icon: Hammer };
    if (t.includes("urgencia") || t.includes("eléctric") || t.includes("cable") || t.includes("retie")) return { Icon: Zap };
    if (t.includes("calentador") || t.includes("ducha")) return { Icon: Flame };
    if (t.includes("paseo") || t.includes("canino") || t.includes("perro")) return { Icon: Dog };
    if (t.includes("hosped") || t.includes("guarder")) return { Icon: Home };
    if (t.includes("adiestra") || t.includes("conducta") || t.includes("etolog") || t.includes("social")) return { Icon: Award };
    return { Icon: Wrench };
  };

  const promoInfo = getCategoryPromo();
  const tradeChecklist = getCategoryChecklist();

  // Detección dinámica de medios de pago según configuración del negocio
  const methodsText = (business?.paymentMethods || "").toLowerCase();
  const bank = business?.bankInfo || {};
  const hasCustomMethods = Boolean(business?.paymentMethods && business.paymentMethods.trim());

  const showNequi = hasCustomMethods
    ? (methodsText.includes("nequi") || methodsText.includes("llave"))
    : Boolean(bank.nequiPhone || true);

  const showBancolombia = hasCustomMethods
    ? (methodsText.includes("bancolombia") || methodsText.includes("transferencia"))
    : Boolean(bank.bancolombiaAccount || true);

  const showEfectivo = hasCustomMethods
    ? methodsText.includes("efectivo")
    : false;

  return (
    <div
      className="min-h-screen pb-32 transition-colors duration-300"
      style={themeStyles.pageStyle}
    >
      {/* Toast flotante de compartir */}
      {shareFeedback && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-xs font-black px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 animate-bounce"
          style={themeStyles.primaryBtn}
        >
          <Check className="w-4 h-4" />
          <span>¡Enlace de vitrina copiado al portapapeles!</span>
        </div>
      )}

      {/* Toast flotante de contacto guardado */}
      {savedContactFeedback && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-xs font-black px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2"
          style={themeStyles.primaryBtn}
        >
          <UserPlus className="w-4 h-4" />
          <span>¡Contacto listo! Toca el archivo descargado para agregarlo a tu agenda.</span>
        </div>
      )}
      {/* Portada Superior con Fotografía Cinemática y Overlay */}
      <div className="relative h-44 sm:h-60 overflow-hidden" style={{ backgroundColor: themeStyles.cardColor }}>
        <img
          src={getCoverImage()}
          alt="Portada"
          className="w-full h-full object-cover opacity-40 brightness-75 scale-105 transition-transform duration-1000"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${themeStyles.bgColor}, transparent)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-25 pointer-events-none transition-all duration-500"
          style={{ background: themeStyles.heroGradient }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] opacity-10 [background-size:20px_20px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-10 space-y-5 pb-36">
        {/* Tarjeta de Perfil del Profesional (Glassmorphism de Élite) */}
        <div
          className="backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 border transition-all"
          style={themeStyles.cardStyle}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="relative shrink-0">
              <img
                src={
                  business.logoUrl ||
                  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=240&auto=format&fit=crop&q=80"
                }
                alt={business.businessName}
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl ring-2 transition-all"
                style={{ ringColor: themeStyles.primaryColor }}
              />
              <span
                className="absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-slate-900 shadow-md"
                style={{ backgroundColor: themeStyles.primaryColor }}
                title="Empresa Verificada"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              </span>
            </div>

            <div className="flex flex-col items-end gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* Botón Guardar en Contactos (.vcf) */}
                <button
                  onClick={() => {
                    downloadBusinessVCard(business);
                    setSavedContactFeedback(true);
                    setTimeout(() => setSavedContactFeedback(false), 2500);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-500 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0"
                  title="Guardar contacto oficial en la agenda de tu teléfono"
                >
                  <UserPlus className="w-3.5 h-3.5" style={themeStyles.textAccent} />
                  <span className="text-[11px] font-semibold">Guardar Contacto</span>
                </button>

                {/* Botón Compartir al lado de la calificación / estrellita */}
                <button
                  onClick={handleShareVitrina}
                  className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 hover:border-brand-500/50 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0"
                  title="Compartir vitrina profesional"
                >
                  <Share2 className="w-3.5 h-3.5" style={themeStyles.textAccent} />
                  <span className="text-[11px] font-semibold">Compartir</span>
                </button>

                {showReviews && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{business.rating || "4.9"}</span>
                    <span className="text-amber-500/70 text-[10px]">({business.completedJobsCount || "140+"})</span>
                  </span>
                )}
              </div>

              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shrink-0 border"
                style={themeStyles.badge}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeStyles.primaryColor }} />
                Disponible hoy
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: themeStyles.cardTextColor }}
              >
                {business.businessName}
              </h1>
              {business.badge ? (
                <span
                  className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border transition-all"
                  style={themeStyles.badge}
                >
                  {business.badge.includes("RETIE") && business.category === "ortopedia"
                    ? "🩺 Ortopedia Técnica & Biomecánica"
                    : business.badge}
                </span>
              ) : null}
            </div>

            <p className="text-xs font-semibold mt-1 flex items-center gap-1.5 flex-wrap" style={themeStyles.textAccent}>
              <span className="font-bold">{business.categoryLabel || business.category?.toUpperCase() || "SERVICIOS TÉCNICOS"}</span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1 font-medium" style={{ color: themeStyles.cardTextColor }}>
                <MapPin className="w-3.5 h-3.5" style={themeStyles.textAccent} />
                {business.city || "Cobertura local & a domicilio"}
              </span>
              {business.coverageAreas && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="font-normal" style={{ color: themeStyles.cardMutedTextColor }}>
                    {business.coverageAreas}
                  </span>
                </>
              )}
            </p>

            <p
              className="text-xs mt-3 leading-relaxed"
              style={{ color: themeStyles.cardTextColor }}
            >
              {business.bio || "Servicios profesionales garantizados, atención directa e inmediata por WhatsApp."}
            </p>
          </div>

          {/* Badges de Confianza de 4 Columnas */}
          <div
            className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t text-center"
            style={{ borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)" }}
          >
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.4)",
                borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-[10px] block" style={{ color: themeStyles.cardMutedTextColor }}>Garantía</span>
              <span className="text-xs font-bold" style={{ color: themeStyles.cardTextColor }}>
                {business.warrantyDays || "90 Días Escrita"}
              </span>
            </div>
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.4)",
                borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-[10px] block" style={{ color: themeStyles.cardMutedTextColor }}>Experiencia</span>
              <span className="text-xs font-bold" style={{ color: themeStyles.cardTextColor }}>
                {business.experienceYears || "8+ Años"}
              </span>
            </div>
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.4)",
                borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-[10px] block" style={{ color: themeStyles.cardMutedTextColor }}>Cotización</span>
              <span className="text-xs font-bold" style={themeStyles.textAccent}>
                {business.quoteBadge || "Inmediata"}
              </span>
            </div>
            <div
              className="hidden sm:block p-2 rounded-xl border"
              style={{
                backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.4)",
                borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-[10px] block" style={{ color: themeStyles.cardMutedTextColor }}>Respuesta</span>
              <span className="text-xs font-bold" style={themeStyles.textAccent}>~10 Minutos</span>
            </div>
          </div>

          {/* Botones de Contacto Directo Inmediato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleWhatsAppContact()}
              style={themeStyles.primaryBtn}
              className="w-full active:scale-95 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chatear por WhatsApp</span>
            </button>
            <a
              href={`tel:+${getCleanPhone(business.whatsappNumber)}`}
              className="w-full bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-slate-200 border border-slate-700/80 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4" style={themeStyles.textAccent} />
              <span>Llamar al Profesional</span>
            </a>
          </div>

          {/* Medios de Pago y Cobro Aceptados en Sitio */}
          {showBankInfo && (
            <div
              className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px]"
              style={{
                borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                color: themeStyles.cardMutedTextColor,
              }}
            >
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: themeStyles.cardTextColor }}>
                <CreditCard className="w-3.5 h-3.5" style={themeStyles.textAccent} />
                <span>Medios de Pago:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {showNequi && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1"
                    style={{
                      backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                      borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                      color: themeStyles.cardTextColor,
                    }}
                  >
                    <Smartphone className="w-3 h-3 opacity-70" /> Nequi
                  </span>
                )}
                {showBancolombia && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1"
                    style={{
                      backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                      borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                      color: themeStyles.cardTextColor,
                    }}
                  >
                    <Building2 className="w-3 h-3 opacity-70" /> Bancolombia
                  </span>
                )}
                {showEfectivo && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1"
                    style={{
                      backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                      borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                      color: themeStyles.cardTextColor,
                    }}
                  >
                    <Banknote className="w-3 h-3 opacity-70" /> Efectivo
                  </span>
                )}
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1"
                  style={{
                    backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                    borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                    color: themeStyles.cardTextColor,
                  }}
                >
                  <FileCheck className="w-3 h-3 opacity-70" /> Recibo Oficial
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Banner Promocional / Oferta Especial de Temporada */}
        {showPromoBanner && (
          <div
            id="beneficios"
            className="border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg scroll-mt-20"
            style={themeStyles.cardStyle}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={themeStyles.subtleBg}
              >
                <Gift className="w-5 h-5" style={themeStyles.textAccent} />
              </div>
              <div>
                <span
                  className="text-[10px] font-heading font-bold uppercase tracking-wider block"
                  style={themeStyles.textAccent}
                >
                  {promoInfo.badge}
                </span>
                <p className="text-xs sm:text-sm font-sans font-semibold leading-tight" style={{ color: themeStyles.cardTextColor }}>
                  {promoInfo.title}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleWhatsAppContact()}
              style={themeStyles.primaryBtn}
              className="active:scale-95 font-heading font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 transition-all shadow-md"
            >
              {promoInfo.btn}
            </button>
          </div>
        )}

        {/* Sección de Catálogo de Servicios con Buscador & Filtros */}
        <div id="servicios" className="space-y-3.5 scroll-mt-20">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={themeStyles.textAccent} />
              <span>Servicios & Precios Estimados</span>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                style={themeStyles.badge}
              >
                {filteredServices.length} {filteredServices.length === 1 ? "servicio" : "servicios"}
              </span>
            </h2>
            <button
              onClick={() => {
                setQuoteModalService(null);
                setQuoteModalOpen(true);
              }}
              style={themeStyles.badge}
              className="text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 border active:scale-95 shadow-sm"
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
                  style={activeCategoryTag === "all" ? themeStyles.pillActive : undefined}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
                    activeCategoryTag === "all"
                      ? "font-heading font-black shadow-lg"
                      : "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      activeCategoryTag === "all"
                        ? "bg-black/20 text-current"
                        : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-heading font-bold">Todos</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                      activeCategoryTag === "all"
                        ? "bg-black/20 text-current"
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
                  const { Icon } = getCategoryIconConfig(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveCategoryTag(tag)}
                      style={isSelected ? themeStyles.pillActive : undefined}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
                        isSelected
                          ? "font-heading font-black shadow-lg"
                          : "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-black/20 text-current"
                            : "bg-slate-800/80 text-slate-300 group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-heading font-bold">{tag}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                          isSelected
                            ? "bg-black/20 text-current"
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
                <div
                  className="flex items-center justify-between px-3.5 py-2 border rounded-2xl text-xs animate-in fade-in duration-200"
                  style={themeStyles.cardStyle}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeStyles.primaryColor }} />
                    <span style={{ color: themeStyles.cardTextColor }}>
                      Mostrando trabajos de <strong style={themeStyles.textAccent}>{activeCategoryTag}</strong> ({filteredServices.length} disponible{filteredServices.length === 1 ? "" : "s"})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveCategoryTag("all")}
                    className="text-[11px] font-bold underline ml-2"
                    style={themeStyles.textAccent}
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
                <div
                  className="border rounded-2xl p-3 flex items-center justify-between gap-2 shadow-lg"
                  style={themeStyles.cardStyle}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: themeStyles.primaryColor }} />
                    <p className="text-xs font-sans truncate" style={{ color: themeStyles.cardTextColor }}>
                      <strong style={themeStyles.textAccent}>{selectedServices.length}</strong> {selectedServices.length === 1 ? "servicio en tu presupuesto" : "servicios en tu presupuesto"} • Total est:{" "}
                      <strong className="font-heading" style={themeStyles.textAccent}>
                        {expressTotalAmount > 0 ? formatCurrency(expressTotalAmount) : "A convenir"}
                      </strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsQuoteDrawerOpen(true)}
                    className="text-xs font-heading font-black underline shrink-0 px-2 py-1"
                    style={themeStyles.textAccent}
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
                    style={
                      isSelected
                        ? { ...themeStyles.cardStyle, ...themeStyles.borderGlow }
                        : themeStyles.cardStyle
                    }
                    className={`group border rounded-3xl overflow-hidden shadow-lg transition-all duration-300 ${
                      isSelected ? "ring-2" : "hover:brightness-105"
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
                            <span
                              className="text-[10px] font-black px-2 py-0.5 rounded-full shadow-md"
                              style={themeStyles.primaryBtn}
                            >
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
                                <span
                                  className="text-[10px] font-sans font-semibold px-2.5 py-0.5 rounded-lg border"
                                  style={themeStyles.badge}
                                >
                                  {service.categoryTag}
                                </span>
                              )}
                              {index === 0 && (
                                <span className="text-[10px] font-sans font-bold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                                  ⭐ Más Solicitado
                                </span>
                              )}
                              {isSelected && (
                                <span
                                  className="hidden sm:inline-flex text-[10px] font-sans font-black px-2 py-0.5 rounded-full shadow-sm"
                                  style={themeStyles.primaryBtn}
                                >
                                  ✓ Agregado
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              <span
                                className="text-xs sm:text-sm font-heading font-black border px-2.5 sm:px-3 py-1 rounded-xl whitespace-nowrap inline-flex items-center gap-1 shadow-sm"
                                style={themeStyles.badge}
                              >
                                {service.basePrice > 0 ? (
                                  <>
                                    <span className="text-[10px] opacity-80 font-sans font-medium uppercase tracking-wider">
                                      Desde
                                    </span>
                                    <span>{formatCurrency(service.basePrice)}</span>
                                    {business.category === "obra_blanca" && (
                                      <span className="text-[11px] opacity-80 font-sans font-normal">
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

                          <h3
                            className="text-sm sm:text-base font-heading font-bold transition-colors leading-snug"
                            style={{ color: themeStyles.cardTextColor }}
                          >
                            {service.title}
                          </h3>
                          <p
                            className="text-xs font-sans mt-1.5 line-clamp-2 leading-relaxed"
                            style={{ color: themeStyles.cardMutedTextColor }}
                          >
                            {service.description}
                          </p>

                          {/* Viñetas de Beneficios del Servicio Adaptadas al Oficio */}
                          <div
                            className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t text-[11px] font-sans"
                            style={{
                              borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                              color: themeStyles.cardTextColor,
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 shrink-0" style={themeStyles.textAccent} />
                              <span>{tradeChecklist[0]}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 shrink-0" style={themeStyles.textAccent} />
                              <span>{tradeChecklist[1]}</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA Directo con Cotizador Express Ergonomico */}
                        <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/60 flex-wrap xs:flex-nowrap">
                          <span className="text-[11px] font-sans text-slate-400 font-medium hidden xs:inline">
                            Garantía de 90 días incluida
                          </span>

                          <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-end ml-auto">
                            {isSelected ? (
                              <div
                                className="flex items-center gap-1.5 rounded-xl px-2 py-1 shadow-sm border"
                                style={themeStyles.badge}
                              >
                                <button
                                  onClick={() => updateServiceQuantity(service.id, -1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/20 hover:bg-black/40 text-current flex items-center justify-center font-bold transition-all active:scale-90"
                                  title="Restar cantidad"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold px-1.5 font-heading min-w-[20px] text-center" style={themeStyles.textAccent}>
                                  {selectedItem?.quantity || 1}
                                </span>
                                <button
                                  onClick={() => updateServiceQuantity(service.id, 1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/20 hover:bg-black/40 text-current flex items-center justify-center font-bold transition-all active:scale-90"
                                  title="Sumar cantidad"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeSelectedService(service.id)}
                                  className="ml-1 text-slate-400 hover:text-rose-400 p-1.5 transition-colors"
                                  title="Quitar de mi cotización"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleServiceSelection(service)}
                                style={themeStyles.badge}
                                className="flex-1 xs:flex-none flex items-center justify-center gap-1.5 font-heading font-bold px-3.5 py-2 rounded-xl text-xs transition-all active:scale-95 shadow-sm min-h-[38px] hover:brightness-110"
                              >
                                <Plus className="w-4 h-4" />
                                <span>+ Agregar al total</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setQuoteModalService(service);
                                setQuoteModalOpen(true);
                              }}
                              className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-all text-xs flex items-center justify-center gap-1 shrink-0 min-h-[38px]"
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

        {/* Portafolio Visual de Casos Reales Antes vs Después */}
        {showBeforeAfter && (
          <BeforeAfterGallery
            businessId={business.id}
            businessCategory={business.category || "electricidad"}
            isPublicView={true}
          />
        )}

        {/* Protocolo Clínico & Garantía Biomecánica si es ortopedia o salud */}
        {(business.category === "ortopedia" || business.category === "salud") && (
          <div
            className="rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border transition-all"
            style={themeStyles.cardStyle}
          >
            <div
              className="flex items-center justify-between border-b pb-3"
              style={{ borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                    borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Activity className="w-5 h-5" style={themeStyles.textAccent} />
                </div>
                <div>
                  <h3
                    className="text-sm sm:text-base font-black"
                    style={{ color: themeStyles.cardTextColor }}
                  >
                    Protocolo de Atención & Garantía Biomecánica
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: themeStyles.cardMutedTextColor }}
                  >
                    Estándares técnicos para prescripción, confección de órtesis y alquiler de equipos
                  </p>
                </div>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full hidden sm:inline-block border"
                style={themeStyles.badge}
              >
                Certificación INVIMA
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className="border rounded-2xl p-3 space-y-1"
                style={{
                  backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.3)",
                  borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                }}
              >
                <span className="font-bold flex items-center gap-1.5" style={themeStyles.textAccent}>
                  <Check className="w-4 h-4" />
                  Adaptación Anatómica a Medida
                </span>
                <p className="text-[11px] leading-relaxed" style={{ color: themeStyles.cardMutedTextColor }}>
                  Moldeo directo sobre el paciente con termoplásticos perforados de baja temperatura, ventilados e hipoalergénicos.
                </p>
              </div>

              <div
                className="border rounded-2xl p-3 space-y-1"
                style={{
                  backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.3)",
                  borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                }}
              >
                <span className="font-bold flex items-center gap-1.5" style={themeStyles.textAccent}>
                  <Check className="w-4 h-4" />
                  Asepsia en Equipos de Movilidad
                </span>
                <p className="text-[11px] leading-relaxed" style={{ color: themeStyles.cardMutedTextColor }}>
                  Sillas de ruedas, andadores y muletas desinfectados bajo protocolo hospitalario antes de cada entrega o alquiler.
                </p>
              </div>

              <div
                className="border rounded-2xl p-3 space-y-1"
                style={{
                  backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.3)",
                  borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                }}
              >
                <span className="font-bold flex items-center gap-1.5" style={themeStyles.textAccent}>
                  <Check className="w-4 h-4" />
                  Revisión y Ajuste de Control
                </span>
                <p className="text-[11px] leading-relaxed" style={{ color: themeStyles.cardMutedTextColor }}>
                  Incluye control y ajuste de cinchas durante el período de adaptación para garantizar máxima comodidad y función.
                </p>
              </div>

              <div
                className="border rounded-2xl p-3 space-y-1"
                style={{
                  backgroundColor: themeStyles.isLightCard ? "#f8fafc" : "rgba(0,0,0,0.3)",
                  borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.08)",
                }}
              >
                <span className="font-bold flex items-center gap-1.5" style={themeStyles.textAccent}>
                  <Check className="w-4 h-4" />
                  Ficha y Orden Oficial
                </span>
                <p className="text-[11px] leading-relaxed" style={{ color: themeStyles.cardMutedTextColor }}>
                  Emisión de orden técnica formal con diagnóstico médico, indicaciones de uso y recibo oficial de abonos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Métodos de Pago Habilitados */}
        {showBankInfo && (
          <div
            className="rounded-3xl p-4 sm:p-5 space-y-2.5 border transition-all"
            style={themeStyles.cardStyle}
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Medios de Pago Habilitados & Facilidades
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {showNequi && (
                <span
                  className="text-xs px-3 py-1 rounded-xl font-bold border flex items-center gap-1.5"
                  style={{
                    backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                    borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                    color: themeStyles.cardTextColor,
                  }}
                >
                  <Smartphone className="w-3.5 h-3.5" style={themeStyles.textAccent} /> Nequi
                </span>
              )}
              {showBancolombia && (
                <span
                  className="text-xs px-3 py-1 rounded-xl font-bold border flex items-center gap-1.5"
                  style={{
                    backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                    borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                    color: themeStyles.cardTextColor,
                  }}
                >
                  <Building2 className="w-3.5 h-3.5" style={themeStyles.textAccent} /> Bancolombia
                </span>
              )}
              {showEfectivo && (
                <span
                  className="text-xs px-3 py-1 rounded-xl font-bold border flex items-center gap-1.5"
                  style={{
                    backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                    borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                    color: themeStyles.cardTextColor,
                  }}
                >
                  <Banknote className="w-3.5 h-3.5" style={themeStyles.textAccent} /> Efectivo
                </span>
              )}
              <span
                className="text-xs px-3 py-1 rounded-xl font-bold border flex items-center gap-1.5"
                style={{
                  backgroundColor: themeStyles.isLightCard ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                  borderColor: themeStyles.isLightCard ? "#e2e8f0" : "rgba(255,255,255,0.12)",
                  color: themeStyles.cardTextColor,
                }}
              >
                <FileCheck className="w-3.5 h-3.5" style={themeStyles.textAccent} /> Recibo Oficial
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {business.category === "ortopedia"
                ? "Recepción de anticipo para confección de órtesis personalizadas o depósitos de alquiler. Se emite recibo oficial de caja y paz y salvo formal."
                : "Se recibe 50% de anticipo para compra de insumos/inicio y saldo al finalizar a conformidad. Entregamos recibo de caja oficial con constancia de paz y salvo."}
            </p>
          </div>
        )}

        {/* Preguntas Frecuentes Desplegables (FAQ de Confianza) */}
        <div
          id="faq"
          className="rounded-3xl p-5 space-y-3 scroll-mt-20 border transition-all"
          style={themeStyles.cardStyle}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" style={themeStyles.textAccent} />
            <h3
              className="text-sm font-black uppercase tracking-wider"
              style={{ color: themeStyles.cardTextColor }}
            >
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
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full">
              <span>Potenciado por</span>
              <span className="font-black text-brand-400">VitrinaPro</span>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-300 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-full transition-colors"
              title="Panel de administración del negocio"
            >
              <LogIn className="w-3 h-3 text-amber-400/80" />
              <span>Acceso Dueño</span>
            </Link>
          </div>
        </footer>
      </div>

      {/* Floating Bottom Bar with Live Totalizer & 1-Click WhatsApp Quote */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t p-2.5 sm:p-3 shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-colors duration-300"
        style={{
          backgroundColor: themeStyles.cardColor,
          borderColor: themeStyles.isLightCard ? '#cbd5e1' : 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          {selectedServices.length > 0 ? (
            <>
              {/* Expandable Breakdown Drawer */}
              {isQuoteDrawerOpen && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-2 shadow-2xl space-y-3 max-h-[55vh] overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" style={themeStyles.textAccent} />
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
                          <span className="font-heading font-bold min-w-[70px] text-right" style={themeStyles.textAccent}>
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
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <button
                  onClick={() => setIsQuoteDrawerOpen(!isQuoteDrawerOpen)}
                  className="flex items-center gap-2 sm:gap-2.5 text-left bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 px-2.5 sm:px-3 py-2 rounded-2xl transition-all shrink-0 min-h-[44px]"
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center"
                      style={themeStyles.badge}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span
                      className="absolute -top-1.5 -right-1.5 text-[10px] font-heading font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md"
                      style={themeStyles.primaryBtn}
                    >
                      {selectedServices.length}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-sans text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span>Total Estimado</span>
                      {isQuoteDrawerOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronUp className="w-3 h-3" style={themeStyles.textAccent} />
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-heading font-black leading-tight" style={themeStyles.textAccent}>
                      {expressTotalAmount > 0 ? formatCurrency(expressTotalAmount) : "A convenir"}
                      {hasConvenioServices && expressTotalAmount > 0 && (
                        <span className="text-[10px] font-normal text-slate-400 ml-1">+ extra</span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExpressQuoteWhatsApp}
                  style={themeStyles.primaryBtn}
                  className="flex-1 active:scale-95 font-heading font-black py-2.5 sm:py-3 px-3 sm:px-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all truncate min-h-[44px]"
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
                <div className="flex items-center gap-1.5 font-bold" style={themeStyles.textAccent}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeStyles.primaryColor }} />
                  <span>En línea • Respuesta en ~5 min</span>
                </div>
                <span className="text-slate-400 hidden xs:inline">💡 Toca &quot;+ Agregar al total&quot; para cotizar en vivo</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {showQuickQuote && (
                  <button
                    onClick={() => {
                      setQuoteModalService(null);
                      setQuoteModalOpen(true);
                    }}
                    className="bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-heading font-bold py-2.5 sm:py-3 px-3 sm:px-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 min-h-[44px]"
                    title="Calcular cotización interactiva"
                  >
                    <Calculator className="w-4 h-4 text-slate-400" />
                    <span className="hidden xs:inline">Cotizar a Medida</span>
                    <span className="xs:hidden">A Medida</span>
                  </button>
                )}

                <button
                  onClick={() => handleWhatsAppContact()}
                  style={themeStyles.primaryBtn}
                  className="flex-1 active:scale-95 font-heading font-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all truncate min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate hidden sm:inline">Hablar con {business.businessName.split(" ")[0]} por WhatsApp</span>
                  <span className="truncate sm:hidden">WhatsApp Directo</span>
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
