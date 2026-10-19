import React, { useState, useEffect } from "react";
import {
  Building2,
  Phone,
  CreditCard,
  ShieldCheck,
  MapPin,
  Check,
  Save,
  X,
  Copy,
  Award,
  Eye,
} from "lucide-react";
import {
  getPlatformCategories,
  createPlatformCategory,
} from "../services/firestoreService";

export default function BusinessVisualEditorModal({
  isOpen,
  onClose,
  business,
  onSave,
}) {
  const [activeSection, setActiveSection] = useState("identidad"); // 'identidad' | 'contacto' | 'pagos' | 'garantia'
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [platformCategories, setPlatformCategories] = useState([]);
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [customCatInput, setCustomCatInput] = useState("");

  // 1. Identidad & Marca
  const [businessName, setBusinessName] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [category, setCategory] = useState("electricidad");
  const [badge, setBadge] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");

  // 2. Contacto & Cobertura
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("");
  const [coverageAreas, setCoverageAreas] = useState("");
  const [bio, setBio] = useState("");

  // 3. Cuentas de Cobro & Medios de Pago
  const [nequiPhone, setNequiPhone] = useState("");
  const [daviplataPhone, setDaviplataPhone] = useState("");
  const [bancolombiaAccount, setBancolombiaAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankIdDoc, setBankIdDoc] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");

  // 4. Garantía & Políticas Comerciales
  const [warrantyDays, setWarrantyDays] = useState("90 días de garantía");
  const [advancePercentage, setAdvancePercentage] = useState("50% anticipo");
  const [serviceCommitment, setServiceCommitment] = useState("");

  useEffect(() => {
    if (business) {
      setBusinessName(business.businessName || "");
      setCategoryLabel(
        business.categoryLabel ||
          (business.category === "obra_blanca"
            ? "Maestro en Obra Blanca & Pintura"
            : business.category === "mascotas"
            ? "Especialista Canino & Paseador"
            : "Técnico Electricista Certificado")
      );
      setCategory(business.category || "electricidad");
      setBadge(
        business.badge ||
          (business.category === "obra_blanca"
            ? "🎨 Acabados Impecables & Drywall"
            : business.category === "mascotas"
            ? "🐾 Refuerzo Positivo & GPS en Vivo"
            : "⚡ Urgencias 24/7 y Norma RETIE")
      );
      setExperienceYears(business.experienceYears || "8+ años de experiencia");
      setBusinessSlug(business.businessSlug || "mi-negocio");

      setWhatsappNumber(business.whatsappNumber || "573001234567");
      setCity(business.city || "Medellín / Valle de Aburrá");
      setCoverageAreas(
        business.coverageAreas || "Toda el área metropolitana y alrededores"
      );
      setBio(
        business.bio ||
          "Servicios profesionales de alta calidad, puntualidad garantizada, cotizaciones transparentes y materiales certificados."
      );

      const bank = business.bankInfo || {};
      setNequiPhone(bank.nequiPhone || (business.whatsappNumber ? business.whatsappNumber.replace(/^57/, "") : "3001234567"));
      setDaviplataPhone(bank.daviplataPhone || (business.whatsappNumber ? business.whatsappNumber.replace(/^57/, "") : "3001234567"));
      setBancolombiaAccount(bank.bancolombiaAccount || "Ahorros 241-987654-12");
      setBankHolder(bank.bankHolder || business.businessName || "Titular de Cuenta");
      setBankIdDoc(bank.bankIdDoc || "CC 1.020.304.050");
      setPaymentMethods(
        business.paymentMethods || "Nequi, Daviplata, Bancolombia, Efectivo"
      );

      setWarrantyDays(business.warrantyDays || "90 días de garantía");
      setAdvancePercentage(business.advancePercentage || "50% anticipo para iniciar");
      setServiceCommitment(
        business.serviceCommitment ||
          "Entrega a conformidad, aseo total del área de trabajo y factura con respaldo profesional."
      );
    }
  }, [business, isOpen]);

  useEffect(() => {
    if (isOpen) {
      getPlatformCategories().then((cats) => {
        setPlatformCategories(cats);
      });
    }
  }, [isOpen]);

  const handleSaveCustomCategory = async () => {
    if (!customCatInput.trim()) return;
    try {
      const created = await createPlatformCategory({
        name: customCatInput.trim(),
      });
      setPlatformCategories((prev) => [...prev.filter((c) => c.id !== created.id), created]);
      setCategory(created.id);
      setCategoryLabel(created.name);
      setIsCreatingNewCat(false);
      setCustomCatInput("");
    } catch (e) {
      console.error("Error saving custom category:", e);
    }
  };

  if (!isOpen) return null;

  const publicLink = `${window.location.origin}/b/${businessSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleUseWhatsappForNequi = () => {
    const clean = (whatsappNumber || "").replace(/\D/g, "").replace(/^57/, "");
    setNequiPhone(clean);
  };

  const handleUseWhatsappForDaviplata = () => {
    const clean = (whatsappNumber || "").replace(/\D/g, "").replace(/^57/, "");
    setDaviplataPhone(clean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const cleanSlug = businessSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const cleanPhone = whatsappNumber.replace(/\D/g, "");
      const formattedPhone =
        cleanPhone.length === 10 && cleanPhone.startsWith("3")
          ? "57" + cleanPhone
          : cleanPhone;

      const updatedPayload = {
        businessName: businessName.trim(),
        categoryLabel: categoryLabel.trim(),
        category: category.trim(),
        badge: badge.trim(),
        experienceYears: experienceYears.trim(),
        businessSlug: cleanSlug || "mi-negocio",
        whatsappNumber: formattedPhone,
        city: city.trim(),
        coverageAreas: coverageAreas.trim(),
        bio: bio.trim(),
        paymentMethods: paymentMethods.trim(),
        warrantyDays: warrantyDays.trim(),
        advancePercentage: advancePercentage.trim(),
        serviceCommitment: serviceCommitment.trim(),
        bankInfo: {
          nequiPhone: nequiPhone.trim(),
          daviplataPhone: daviplataPhone.trim(),
          bancolombiaAccount: bancolombiaAccount.trim(),
          bankHolder: bankHolder.trim(),
          bankIdDoc: bankIdDoc.trim(),
        },
      };

      if (onSave) {
        await onSave(updatedPayload);
      }
      onClose();
    } catch (err) {
      console.error("Error saving business profile:", err);
      alert("Error al guardar los cambios del negocio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Principal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✏️</span>
              <h2 className="text-base font-black text-slate-100 tracking-tight">
                Personalizador Pro de Vitrina
              </h2>
              <span className="bg-brand-500/10 text-brand-400 border border-brand-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                EN VIVO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personaliza cada detalle de tu negocio. Se reflejará de inmediato en tu web y cotizaciones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mini Preview de Tarjeta de Negocio en Tiempo Real */}
        <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-base shadow-glow-teal">
              {businessName ? businessName.charAt(0).toUpperCase() : "V"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">
                  {businessName || "Nombre de tu Empresa"}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                  ✓ Verificado
                </span>
              </div>
              <p className="text-[11px] text-brand-300 font-medium">
                {categoryLabel || "Especialidad Técnica"} • {city || "Tu Ciudad"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copiar link público de tu vitrina"
              className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>/b/{businessSlug}</span>
                </>
              )}
            </button>

            <a
              href={`/b/${businessSlug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs flex items-center gap-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 px-2.5 py-1.5 rounded-xl border border-brand-500/30 font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Web</span>
            </a>
          </div>
        </div>

        {/* Barra de Pestañas de Edición Segmentada Pro (Sin scroll horizontal) */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-slate-900 border-b border-slate-800/80">
          <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveSection("identidad")}
              className={`py-2 px-1 sm:px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                activeSection === "identidad"
                  ? "bg-slate-800 text-brand-300 border border-brand-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Identidad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("contacto")}
              className={`py-2 px-1 sm:px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                activeSection === "contacto"
                  ? "bg-slate-800 text-brand-300 border border-brand-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Contacto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("pagos")}
              className={`py-2 px-1 sm:px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                activeSection === "pagos"
                  ? "bg-slate-800 text-brand-300 border border-brand-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Cobros</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("garantia")}
              className={`py-2 px-1 sm:px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                activeSection === "garantia"
                  ? "bg-slate-800 text-brand-300 border border-brand-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Garantía</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Formulario Llenable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar"
        >
          {/* ==============================================================
              SECCIÓN 1: IDENTIDAD & MARCA
              ============================================================== */}
          {activeSection === "identidad" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-brand-300 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Datos de Marca y Reconocimiento</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Comercial / Profesional *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej: ElectroVolt Soluciones, Pinturas & Acabados Pro..."
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Este nombre aparecerá en tu vitrina pública, cotizaciones y recibos oficiales en PDF.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Categoría / Oficio Principal *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewCat(!isCreatingNewCat)}
                        className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        {isCreatingNewCat ? "Ver lista" : "+ Crear nueva"}
                      </button>
                    </div>

                    {isCreatingNewCat ? (
                      <div className="space-y-1.5 animate-in fade-in">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Ej: Salud & Ortopedia / Mecánica"
                            value={customCatInput}
                            onChange={(e) => setCustomCatInput(e.target.value)}
                            className="flex-1 bg-slate-900 border border-teal-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 font-semibold"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleSaveCustomCategory}
                            className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 shadow-sm transition-all"
                          >
                            Crear
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Se agregará al catálogo global de categorías del sistema.
                        </span>
                      </div>
                    ) : (
                      <select
                        value={category}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__create_new__") {
                            setIsCreatingNewCat(true);
                            return;
                          }
                          setCategory(val);
                          const foundCat = platformCategories.find((c) => c.id === val);
                          if (foundCat) {
                            setCategoryLabel(foundCat.name);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {platformCategories.length === 0 ? (
                          <>
                            <option value="ortopedia">🩺 Salud & Ortopedia Especializada</option>
                            <option value="electricidad">⚡ Electricidad & Redes</option>
                            <option value="obra_blanca">🎨 Obra Blanca, Pintura & Drywall</option>
                            <option value="mascotas">🐕 Mascotas (Paseo & Adiestramiento)</option>
                            <option value="plomeria">🚰 Plomería & Gasfitería</option>
                          </>
                        ) : (
                          platformCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        )}
                        <option value="__create_new__">➕ Crear Nueva Categoría Comercial...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Título Público en tu Vitrina *
                    </label>
                    <input
                      type="text"
                      value={categoryLabel}
                      onChange={(e) => setCategoryLabel(e.target.value)}
                      placeholder="Ej: Maestro Pintor & Acabados de Lujo"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Distintivo / Slogan Resaltado
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Ej: ⚡ Urgencias 24/7 y Garantía Escrita"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Años de Trayectoria
                    </label>
                    <input
                      type="text"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="Ej: 8+ años de experiencia certificada"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enlace Personalizado para Clientes (Slug) *
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-800 text-slate-400 px-3 py-2.5 rounded-l-xl text-xs border border-r-0 border-slate-700 font-mono">
                      vitrina.pro/b/
                    </span>
                    <input
                      type="text"
                      value={businessSlug}
                      onChange={(e) =>
                        setBusinessSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                        )
                      }
                      placeholder="tu-negocio"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-r-xl px-3 py-2.5 text-xs text-brand-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              SECCIÓN 2: CONTACTO & COBERTURA
              ============================================================== */}
          {activeSection === "contacto" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Phone className="w-4 h-4" />
                  <span>Canales de Contacto Directo y Zonas de Trabajo</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número de Celular / WhatsApp Oficial *
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-800 text-slate-400 px-3 py-2.5 rounded-l-xl text-xs border border-r-0 border-slate-700 font-mono font-bold">
                      🇨🇴 +57
                    </span>
                    <input
                      type="tel"
                      value={whatsappNumber.replace(/^57/, "")}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="3001234567"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-r-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A este WhatsApp llegarán todas las solicitudes de cotización con 1 clic desde tu vitrina.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ciudad Principal *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej: Medellín / Envigado"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Barrios o Sectores de Cobertura
                    </label>
                    <input
                      type="text"
                      value={coverageAreas}
                      onChange={(e) => setCoverageAreas(e.target.value)}
                      placeholder="Ej: Poblado, Laureles, Belén, Sabaneta"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Biografía / Presentación Profesional *
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe tu experiencia, los equipos que utilizas y por qué los clientes deben confiar en tu servicio..."
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              SECCIÓN 3: CUENTAS DE COBRO & ANTICIPOS
              ============================================================== */}
          {activeSection === "pagos" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>Datos Oficiales para Cobro de Anticipos (50%)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Estos datos se usan para enviar el mensaje instantáneo de cobro a WhatsApp y salen en tus recibos en PDF.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        📱 Número Nequi
                      </label>
                      <button
                        type="button"
                        onClick={handleUseWhatsappForNequi}
                        className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold"
                      >
                        Mismo celular
                      </button>
                    </div>
                    <input
                      type="text"
                      value={nequiPhone}
                      onChange={(e) => setNequiPhone(e.target.value)}
                      placeholder="3001234567"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-purple-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        🔴 Número Daviplata
                      </label>
                      <button
                        type="button"
                        onClick={handleUseWhatsappForDaviplata}
                        className="text-[10px] text-red-400 hover:text-red-300 underline font-semibold"
                      >
                        Mismo celular
                      </button>
                    </div>
                    <input
                      type="text"
                      value={daviplataPhone}
                      onChange={(e) => setDaviplataPhone(e.target.value)}
                      placeholder="3001234567"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-red-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      🏦 Cuenta Bancolombia
                    </label>
                    <input
                      type="text"
                      value={bancolombiaAccount}
                      onChange={(e) => setBancolombiaAccount(e.target.value)}
                      placeholder="Ahorros 241-987654-12"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      👤 Titular de la Cuenta
                    </label>
                    <input
                      type="text"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      placeholder="Nombre del Titular"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Métodos de Pago Visibles en la Vitrina
                  </label>
                  <input
                    type="text"
                    value={paymentMethods}
                    onChange={(e) => setPaymentMethods(e.target.value)}
                    placeholder="Nequi, Daviplata, Bancolombia, Efectivo"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              SECCIÓN 4: GARANTÍA & POLÍTICAS
              ============================================================== */}
          {activeSection === "garantia" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Garantías y Condiciones Comerciales</span>
                </div>
                <p className="text-xs text-slate-400">
                  Estas cláusulas se insertan automáticamente en los PDF membretados y mensajes de cotización.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      🛡️ Garantía sobre Mano de Obra
                    </label>
                    <select
                      value={warrantyDays}
                      onChange={(e) => setWarrantyDays(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="30 días de garantía">30 días de garantía</option>
                      <option value="60 días de garantía">60 días de garantía</option>
                      <option value="90 días de garantía">90 días de garantía (Estándar Pro)</option>
                      <option value="6 meses de garantía">6 meses de garantía</option>
                      <option value="1 año de garantía">1 año de garantía</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      💰 Política de Anticipo
                    </label>
                    <select
                      value={advancePercentage}
                      onChange={(e) => setAdvancePercentage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="50% anticipo para iniciar">50% para inicio / 50% al finalizar (Recomendado)</option>
                      <option value="30% anticipo para iniciar">30% anticipo / 70% al finalizar</option>
                      <option value="100% contraentrega a conformidad">100% al finalizar a conformidad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Compromiso de Calidad y Limpieza
                  </label>
                  <input
                    type="text"
                    value={serviceCommitment}
                    onChange={(e) => setServiceCommitment(e.target.value)}
                    placeholder="Ej: Materiales certificados, entrega pulcra y sin manchas."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer del Modal con Botones */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              {["identidad", "contacto", "pagos", "garantia"].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeSection === sec
                      ? "bg-brand-400 scale-125"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-glow-teal flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar y Actualizar Vitrina</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
