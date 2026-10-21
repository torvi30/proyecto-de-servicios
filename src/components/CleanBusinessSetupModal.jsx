import React, { useState } from "react";
import {
  Zap,
  Paintbrush,
  Dog,
  Activity,
  Plus,
  ArrowRight,
  Check,
  DollarSign,
  Trash2,
  Wrench,
} from "lucide-react";
import {
  switchDemoProfile,
  createNewCleanBusiness,
} from "../services/firestoreService";

export default function CleanBusinessSetupModal({
  isOpen,
  onClose,
  currentBusiness,
  onProfileSwitched,
  onManageServicesClick,
}) {
  const [mode, setMode] = useState("presets"); // 'presets' | 'create_clean'

  // Formulario de negocio desde cero (página limpia)
  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  // Lista de servicios iniciales para el nuevo negocio
  const [customServices, setCustomServices] = useState([
    {
      id: "s-1",
      title: "",
      description: "",
      basePrice: "",
      categoryTag: "General",
    },
  ]);

  if (!isOpen) return null;

  const handleSelectPreset = (key) => {
    const selected = switchDemoProfile(key);
    if (onProfileSwitched) {
      onProfileSwitched(selected?.business);
    }
    onClose();
  };

  const handleNameChange = (name) => {
    setBusinessName(name);
    setBusinessSlug(
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  };

  const handleAddServiceRow = () => {
    setCustomServices([
      ...customServices,
      {
        id: `s-${Date.now()}`,
        title: "",
        description: "",
        basePrice: "",
        categoryTag: "General",
      },
    ]);
  };

  const handleRemoveServiceRow = (id) => {
    if (customServices.length > 1) {
      setCustomServices(customServices.filter((s) => s.id !== id));
    }
  };

  const handleServiceChange = (id, field, value) => {
    setCustomServices(
      customServices.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleCreateCustomBusiness = (e) => {
    e.preventDefault();
    if (!businessName.trim() || !whatsappNumber.trim()) {
      alert("Por favor ingresa al menos el nombre del negocio y WhatsApp");
      return;
    }

    const cleanSlug = businessSlug.trim() || `negocio-${Date.now().toString().slice(-4)}`;
    const cleanPhone = whatsappNumber.replace(/\D/g, "");

    const newBiz = {
      id: `custom-biz-${Date.now()}`,
      ownerId: "demo-user-1",
      businessName: businessName.trim(),
      businessSlug: cleanSlug,
      category: "personalizado",
      categoryLabel: categoryLabel.trim() || "Servicios Independientes",
      whatsappNumber: cleanPhone,
      city: city.trim() || "A Domicilio",
      bio:
        bio.trim() ||
        "Servicios profesionales garantizados. Atención directa e inmediata por WhatsApp.",
      logoUrl:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=80",
      rating: 5.0,
      completedJobsCount: 15,
      paymentMethods: "Nequi, Daviplata, Efectivo",
    };

    // Procesar servicios que tengan al menos título
    const validServices = customServices
      .filter((s) => s.title.trim() !== "")
      .map((s, index) => ({
        id: `serv-${Date.now()}-${index}`,
        title: s.title.trim(),
        description: s.description.trim() || "Servicio garantizado con atención personalizada.",
        basePrice: Number(s.basePrice) || 0,
        categoryTag: s.categoryTag || "General",
        imageUrl:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
        order: index,
        isActive: true,
      }));

    createNewCleanBusiness(newBiz, validServices);

    if (onProfileSwitched) {
      onProfileSwitched();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-6 space-y-5 h-[90vh] sm:h-auto sm:max-h-[92vh] overflow-y-auto shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-400 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
              <Wrench className="w-3.5 h-3.5" />
              <span>Configuración de Servicios & Oficios</span>
            </div>
            <h3 className="text-lg font-black text-slate-100">
              {mode === "presets"
                ? "Cuadrar Servicios y Cambiar de Oficio"
                : "Crear Catálogo de Servicios desde Cero"}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === "presets"
                ? "Carga servicios listos por especialidad (Ortopedia, Electricidad, Obra Blanca, Mascotas) o edita los tuyos"
                : "Configura cualquier profesión en 1 minuto con tus propios servicios y precios"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Acceso Directo a Editar Precios y Fotos de Servicios Actuales */}
        {onManageServicesClick && (
          <div className="bg-gradient-to-r from-brand-500/15 via-brand-500/10 to-slate-900 border border-brand-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">
                  ¿Quieres cambiar precios, fotos o títulos de tus servicios actuales?
                </p>
                <p className="text-[11px] text-slate-400">
                  Edita tu lista activa directamente sin cambiar de plantilla de oficio.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onManageServicesClick}
              className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs whitespace-nowrap shadow-sm transition-all text-center"
            >
              Editar Mis Precios & Fotos →
            </button>
          </div>
        )}

        {/* Selector de Modo */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 gap-1 text-xs font-bold">
          <button
            onClick={() => setMode("presets")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all ${
              mode === "presets"
                ? "bg-slate-800 text-slate-100 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ Plantillas de Oficios (Ortopedia, Electricidad, Obra Blanca, Mascotas)
          </button>
          <button
            onClick={() => setMode("create_clean")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all ${
              mode === "create_clean"
                ? "bg-brand-500 text-slate-950 shadow-glow-teal"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ➕ Crear Lista de Servicios desde Cero
          </button>
        </div>

        {/* =========================================================================
            VISTA 1: PERFILES LISTOS PARA MOSTRAR A TUS CLIENTES
            ========================================================================= */}
        {mode === "presets" && (
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Toca un perfil para cargarlo y ver cómo luce:
            </span>

            {/* Tarjeta Destacada: Salud & Ortopedia Especializada */}
            <div
              onClick={() => handleSelectPreset("ortopedia")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                currentBusiness?.businessSlug === "ortopedia-san-rafael"
                  ? "bg-teal-500/10 border-teal-500/50 shadow-md ring-1 ring-teal-500/30"
                  : "bg-slate-800/40 border-slate-700/60 hover:border-teal-500/40 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-100">
                      Centro Ortopédico & Biomecánico
                    </h4>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded border border-teal-500/30">
                      Salud & Ortopedia
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Órtesis a medida, valoración de marcha, férulas y alquiler de equipos
                  </p>
                  <span className="text-[11px] text-teal-400 font-mono mt-0.5 block">
                    /b/ortopedia-san-rafael
                  </span>
                </div>
              </div>
              <span className="text-xs text-teal-400 font-bold flex items-center gap-1 shrink-0">
                {currentBusiness?.businessSlug === "ortopedia-san-rafael" ? "Activo ✓" : "Activar →"}
              </span>
            </div>

            {/* Tarjeta 1: Electricista */}
            <div
              onClick={() => handleSelectPreset("electricidad")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                currentBusiness?.businessSlug === "electrovolt"
                  ? "bg-amber-500/10 border-amber-500/50 shadow-md"
                  : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-100">
                      ElectroVolt Soluciones
                    </h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                      Electricista
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tableros, cortocircuitos, cableado y certificación RETIE
                  </p>
                  <span className="text-[11px] text-amber-400 font-mono mt-0.5 block">
                    /b/electrovolt
                  </span>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1 shrink-0">
                {currentBusiness?.businessSlug === "electrovolt" ? "Activo ✓" : "Activar →"}
              </span>
            </div>

            {/* Tarjeta 2: Obra Blanca */}
            <div
              onClick={() => handleSelectPreset("obra_blanca")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                currentBusiness?.businessSlug === "acabados-obra-blanca"
                  ? "bg-blue-500/10 border-blue-500/50 shadow-md"
                  : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Paintbrush className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-100">
                      Acabados & Drywall Pro
                    </h4>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded">
                      Obra Blanca
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pintura interiores, muros en drywall, cielo rasos y estuco
                  </p>
                  <span className="text-[11px] text-blue-400 font-mono mt-0.5 block">
                    /b/acabados-obra-blanca
                  </span>
                </div>
              </div>
              <span className="text-xs text-blue-400 font-bold flex items-center gap-1 shrink-0">
                {currentBusiness?.businessSlug === "acabados-obra-blanca" ? "Activo ✓" : "Activar →"}
              </span>
            </div>

            {/* Tarjeta 3: Adiestramiento y Paseo de Perros */}
            <div
              onClick={() => handleSelectPreset("mascotas")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                currentBusiness?.businessSlug === "huellas-canino"
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-md"
                  : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Dog className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-100">
                      Huellas & Colitas Adiestramiento
                    </h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                      Mascotas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paseo diario con GPS, adiestramiento en positivo y guardería
                  </p>
                  <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
                    /b/huellas-canino
                  </span>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                {currentBusiness?.businessSlug === "huellas-canino" ? "Activo ✓" : "Activar →"}
              </span>
            </div>

            {/* Botón para saltar a crear uno personalizado */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setMode("create_clean")}
                className="text-xs text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-1"
              >
                <span>¿Tienes otro oficio distinto? Crea una vitrina en blanco</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VISTA 2: CONFIGURADOR EN PÁGINA LIMPIA (CUALQUIER OFICIO)
            ========================================================================= */}
        {mode === "create_clean" && (
          <form onSubmit={handleCreateCustomBusiness} className="space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Información Básica del Profesional
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nombre de tu Negocio / Marca *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Paseos Caninos Toby o Plomería Ya"
                    value={businessName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Oficio o Especialidad *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Paseador de Perros, Carpintero, Barbero"
                    value={categoryLabel}
                    onChange={(e) => setCategoryLabel(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp para Cotizaciones *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 573001234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ciudad o Zona de Cobertura
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Medellín / Envigado o Bogotá Norte"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enlace público de tu vitrina (Slug)
                </label>
                <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-brand-400 font-mono">
                  <span>/b/{businessSlug || "tu-enlace"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Breve descripción de presentación
                </label>
                <textarea
                  rows={2}
                  placeholder="Qué ofreces, tu experiencia y por qué contratarte..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Sección: Servicios iniciales del negocio */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    2. Servicios que Ofreces
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Escribe lo que vendes y cuánto cobras aproximadamente
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddServiceRow}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Otro</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {customServices.map((service, index) => (
                  <div
                    key={service.id}
                    className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Servicio #{index + 1}
                      </span>
                      {customServices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceRow(service.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre: Ej. Paseo recreativo 1h o Pintura por m²"
                        value={service.title}
                        onChange={(e) =>
                          handleServiceChange(service.id, "title", e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />

                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="number"
                          placeholder="Precio base: Ej. 25000 (Opcional)"
                          value={service.basePrice}
                          onChange={(e) =>
                            handleServiceChange(service.id, "basePrice", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Descripción breve de lo que incluye..."
                      value={service.description}
                      onChange={(e) =>
                        handleServiceChange(service.id, "description", e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción final */}
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("presets")}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs transition-colors"
              >
                Volver a Perfiles
              </button>
              <button
                type="submit"
                className="flex-1 bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-xs shadow-glow-teal flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>🚀 Crear y Guardar Mi Vitrina</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
