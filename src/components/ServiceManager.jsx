import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
  Check,
  Search,
  Wrench,
  Zap,
  Paintbrush,
  Droplets,
  Hammer,
  Wind,
  Key,
  Dog,
  ChevronDown,
} from "lucide-react";
import {
  addBusinessService,
  updateBusinessService,
  deleteBusinessService,
  reorderBusinessServices,
  importPresetServices,
} from "../services/firestoreService";
import { TRADE_CATEGORIES, CURATED_SERVICE_PHOTOS } from "../data/tradePresets";

export default function ServiceManager({ business, services, onServicesUpdated }) {
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [selectedTradeTab, setSelectedTradeTab] = useState("electricidad");

  // Selection state for presets
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [importingPresets, setImportingPresets] = useState(false);

  // Form states (create / edit)
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryTag, setCategoryTag] = useState("Instalación");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Banco de fotos sugeridas
  const [photoSourceTab, setPhotoSourceTab] = useState("suggested"); // 'suggested' | 'upload'
  const [photoCategoryTab, setPhotoCategoryTab] = useState(business?.category || "electricidad");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Open Edit Modal
  const openEditModal = (service) => {
    setEditingServiceId(service.id);
    setTitle(service.title || "");
    setDescription(service.description || "");
    setBasePrice(service.basePrice ? String(service.basePrice) : "");
    setCategoryTag(service.categoryTag || "Instalación");
    setImagePreview(service.imageUrl || "");
    setImageFile(null);
    setIsActive(service.isActive !== false);
    setPhotoSourceTab("suggested");
    setIsEditModalOpen(true);
  };

  // Handle Create Service
  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Por favor ingresa el título del servicio");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const targetBizId = business?.id || business?.businessSlug || "demo-ortopedia";
      await addBusinessService(
        targetBizId,
        {
          title,
          description,
          basePrice: basePrice ? Number(basePrice) : 0,
          categoryTag: categoryTag.trim() || "General",
          isActive: true,
          imageUrl: imagePreview || "",
        },
        imageFile
      );

      // Reset
      setTitle("");
      setDescription("");
      setBasePrice("");
      setCategoryTag("Instalación");
      setImageFile(null);
      setImagePreview("");
      setIsCreateModalOpen(false);

      if (onServicesUpdated) await onServicesUpdated();
    } catch (err) {
      console.error("Error creating service:", err);
      setError("No se pudo guardar el servicio.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Service
  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Por favor ingresa el título del servicio");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const targetBizId = business?.id || business?.businessSlug || "demo-ortopedia";
      await updateBusinessService(
        targetBizId,
        editingServiceId,
        {
          title,
          description,
          basePrice: basePrice ? Number(basePrice) : 0,
          categoryTag: categoryTag.trim() || "General",
          isActive,
          imageUrl: imagePreview || "",
        },
        imageFile
      );

      setIsEditModalOpen(false);
      setEditingServiceId(null);
      setImageFile(null);
      if (onServicesUpdated) await onServicesUpdated();
    } catch (err) {
      console.error("Error updating service:", err);
      setError("No se pudo actualizar el servicio.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (service) => {
    const updatedStatus = service.isActive === false ? true : false;
    const targetBizId = business?.id || business?.businessSlug || "demo-ortopedia";
    try {
      await updateBusinessService(targetBizId, service.id, {
        isActive: updatedStatus,
      });
      if (onServicesUpdated) await onServicesUpdated();
    } catch (err) {
      console.error("Error toggling active status:", err);
    }
  };

  // Reorder: Move Up
  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const targetBizId = business?.id || business?.businessSlug || "demo-ortopedia";
    const reordered = [...services];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    await reorderBusinessServices(targetBizId, reordered);
    if (onServicesUpdated) await onServicesUpdated();
  };

  // Reorder: Move Down
  const handleMoveDown = async (index) => {
    if (index === services.length - 1) return;
    const targetBizId = business?.id || business?.businessSlug || "demo-ortopedia";
    const reordered = [...services];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    await reorderBusinessServices(targetBizId, reordered);
    if (onServicesUpdated) await onServicesUpdated();
  };

  // Delete Service
  const handleDelete = async (serviceId) => {
    if (window.confirm("¿Seguro que deseas eliminar este servicio de tu vitrina?")) {
      try {
        const targetBizId = business?.id || business?.businessSlug || "demo-ortopedia";
        await deleteBusinessService(targetBizId, serviceId);
        if (onServicesUpdated) await onServicesUpdated();
      } catch (err) {
        console.error("Error deleting service:", err);
      }
    }
  };

  // Toggle selection for preset import
  const handleTogglePresetSelection = (preset) => {
    const isSelected = selectedPresets.some((p) => p.title === preset.title);
    if (isSelected) {
      setSelectedPresets(selectedPresets.filter((p) => p.title !== preset.title));
    } else {
      setSelectedPresets([...selectedPresets, preset]);
    }
  };

  // Import Presets to business
  const handleImportPresets = async () => {
    if (selectedPresets.length === 0) return;
    try {
      setImportingPresets(true);
      const targetBizId = business?.id || business?.businessSlug || "demo-ortopedia";
      await importPresetServices(targetBizId, selectedPresets);
      setSelectedPresets([]);
      setIsPresetsModalOpen(false);
      if (onServicesUpdated) await onServicesUpdated();
    } catch (err) {
      console.error("Error importing presets:", err);
      alert("Error al importar los servicios seleccionados");
    } finally {
      setImportingPresets(false);
    }
  };

  // Helper icons for trade presets
  const getTradeIcon = (id) => {
    switch (id) {
      case "electricidad":
        return Zap;
      case "obra_blanca":
        return Paintbrush;
      case "plomeria":
        return Droplets;
      case "carpinteria":
        return Hammer;
      case "climatizacion":
        return Wind;
      case "cerrajeria":
        return Key;
      case "mascotas":
        return Dog;
      case "limpieza":
        return Sparkles;
      default:
        return Wrench;
    }
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.categoryTag && s.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "active") return matchesSearch && s.isActive !== false;
    if (statusFilter === "inactive") return matchesSearch && s.isActive === false;
    return matchesSearch;
  });

  const activeCount = services.filter((s) => s.isActive !== false).length;
  const inactiveCount = services.filter((s) => s.isActive === false).length;

  return (
    <div className="space-y-4">
      {/* Barra Superior con Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-100 flex flex-wrap items-center gap-2">
            <span>Gestión y Catálogo de Servicios</span>
            <span className="text-xs bg-brand-500/20 text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/30">
              {services.length} en catálogo
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Ilimitado
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Agrega todos los servicios que ofrezcas sin límite. Organízalos, cambia su orden y paúsalos con 1 toque.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Botón Nuevo Servicio */}
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setDescription("");
              setBasePrice("");
              setCategoryTag("General");
              setImageFile(null);
              setImagePreview("");
              setIsCreateModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-glow-teal transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Crear Servicio</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtro, Búsqueda y Estados */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2.5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950/40 border border-transparent"
              }`}
            >
              Todos ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "active"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950/40 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Visibles ({activeCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "inactive"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950/40 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Pausados ({inactiveCount})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            💡 Usa ▲ ▼ para ordenar la prioridad en tu vitrina
          </span>
        </div>
      </div>

      {/* Lista de Servicios con Organización y Reordenamiento */}
      {filteredServices.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {filterStatus === "all"
                ? "Aún no tienes servicios registrados"
                : `No hay servicios ${filterStatus === "active" ? "visibles" : "pausados"}`}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {filterStatus === "all"
                ? "Agrega tus servicios para que tus clientes puedan verlos y cotizar en línea."
                : "Puedes cambiar el filtro de arriba o agregar un nuevo servicio a tu catálogo."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setBasePrice("");
                setCategoryTag("General");
                setImageFile(null);
                setImagePreview("");
                setIsCreateModalOpen(true);
              }}
              className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-glow-teal transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Crear Servicio</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredServices.length - 1;
            const isVisible = service.isActive !== false;

            return (
              <div
                key={service.id}
                className={`bg-slate-900/90 border rounded-2xl p-3.5 space-y-3 transition-all ${
                  isVisible
                    ? "border-slate-800 hover:border-slate-700 shadow-sm"
                    : "border-slate-800/60 opacity-65 bg-slate-950/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Foto del servicio */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-800 shrink-0 overflow-hidden border border-slate-700/80 shadow-inner">
                    <img
                      src={
                        service.imageUrl ||
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80"
                      }
                      alt={service.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1 bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-300 border border-slate-800">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Información Principal */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {service.categoryTag && (
                          <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                            {service.categoryTag}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                            isVisible
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {isVisible ? "● Visible en vitrina" : "○ Pausado (Oculto)"}
                        </span>
                      </div>

                      {/* Precio estilo etiqueta pro */}
                      <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg shrink-0">
                        {service.basePrice > 0
                          ? `Desde ${formatCurrency(service.basePrice)}`
                          : "A convenir"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1 leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {service.description || "Sin descripción adicional."}
                    </p>
                  </div>
                </div>

                {/* Barra de Control de Orden y Acciones (100% Responsivo & Thumb-Friendly) */}
                <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Reordenar posición en la vitrina */}
                  <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 px-1 font-bold uppercase tracking-wider">
                      Posición:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      title="Mover arriba"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      title="Mover abajo"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Acciones de Edición, Toggle y Borrado */}
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                    {/* Toggle Visibilidad / Pausar */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(service)}
                      title={
                        isVisible
                          ? "Pausar servicio (Ocultar de la vitrina)"
                          : "Activar servicio (Mostrar en vitrina)"
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                        isVisible
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600"
                          : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                      }`}
                    >
                      {isVisible ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Activar</span>
                        </>
                      )}
                    </button>

                    {/* Editar */}
                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      title="Editar servicio"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-slate-600 transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="hidden xs:inline sm:hidden md:inline">Editar</span>
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleDelete(service.id)}
                      title="Eliminar de mi catálogo"
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ESCOGER SERVICIOS POR OFICIO / CATÁLOGO PREDEFINIDO
          ========================================================================= */}
      {isPresetsModalOpen && (
        <div 
          onClick={() => setIsPresetsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl sm:rounded-2xl p-5 space-y-4 h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col cursor-default"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Catálogo de Oficios Predefinidos
                </h3>
                <p className="text-xs text-slate-400">
                  Selecciona tu oficio y marca los servicios que ofreces para importarlos con 1 clic
                </p>
              </div>
              <button
                onClick={() => setIsPresetsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Acceso Rápido Directo: Crear Servicio Personalizado desde cero */}
            <div className="bg-gradient-to-r from-brand-500/15 via-emerald-500/10 to-slate-950 border border-brand-500/30 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-100 block truncate">
                    ¿Tienes un oficio o servicio diferente?
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    Crea tu servicio desde cero con tu propio título, precio y foto
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPresetsModalOpen(false);
                  setTitle("");
                  setDescription("");
                  setBasePrice("");
                  setCategoryTag("General");
                  setImageFile(null);
                  setImagePreview("");
                  setIsCreateModalOpen(true);
                }}
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-glow-teal whitespace-nowrap shrink-0 transition-all text-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Manual</span>
              </button>
            </div>

            {/* Selector de Oficios: Dropdown directo en Móvil (sin scroll lateral) y Chips Envolventes en Desktop */}
            <div className="space-y-1.5">
              {/* En Celular: Selector desplegable directo para no tener que deslizar horizontalmente */}
              <div className="sm:hidden">
                <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between mb-1">
                  <span>Elige tu oficio o rubro:</span>
                  <span className="text-[10px] text-brand-400 font-semibold">Toca para cambiar</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedTradeTab}
                    onChange={(e) => setSelectedTradeTab(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-brand-400 appearance-none pr-9 shadow-inner"
                  >
                    {TRADE_CATEGORIES.map((trade) => (
                      <option key={trade.id} value={trade.id}>
                        {trade.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* En Desktop y Tablet: Pestañas envolventes (flex-wrap) sin barras de scroll ocultas */}
              <div className="hidden sm:flex flex-wrap gap-1.5 text-xs">
                {TRADE_CATEGORIES.map((trade) => {
                  const Icon = getTradeIcon(trade.id);
                  const isActive = selectedTradeTab === trade.id;
                  return (
                    <button
                      key={trade.id}
                      type="button"
                      onClick={() => setSelectedTradeTab(trade.id)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl font-semibold transition-all ${
                        isActive
                          ? "bg-brand-500 text-slate-950 font-black shadow-glow-teal"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{trade.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Lista de Servicios Sugeridos para el Oficio Seleccionado */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
              {(() => {
                const currentTrade = TRADE_CATEGORIES.find(
                  (t) => t.id === selectedTradeTab
                );
                if (!currentTrade) return null;

                return currentTrade.services.map((preset) => {
                  const isChecked = selectedPresets.some(
                    (p) => p.title === preset.title
                  );
                  const alreadyInCatalog = services.some(
                    (s) => s.title.toLowerCase() === preset.title.toLowerCase()
                  );

                  return (
                    <div
                      key={preset.title}
                      onClick={() => !alreadyInCatalog && handleTogglePresetSelection(preset)}
                      className={`p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        alreadyInCatalog
                          ? "bg-slate-950/60 border-slate-800/80 opacity-60 cursor-not-allowed"
                          : isChecked
                          ? "bg-brand-500/10 border-brand-500/50 shadow-sm"
                          : "bg-slate-800/50 border-slate-700/60 hover:border-slate-600"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="pt-0.5">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-brand-500 text-slate-950 font-bold"
                              : alreadyInCatalog
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "border border-slate-600 bg-slate-900"
                          }`}
                        >
                          {(isChecked || alreadyInCatalog) && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>

                      {/* Imagen miniatura */}
                      <img
                        src={preset.imageUrl}
                        alt={preset.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
                      />

                      {/* Info del servicio */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] bg-slate-800 text-brand-300 font-semibold px-2 py-0.5 rounded">
                            {preset.categoryTag}
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            {formatCurrency(preset.basePrice)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 mt-1">
                          {preset.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {preset.description}
                        </p>
                        {alreadyInCatalog && (
                          <span className="text-[10px] text-emerald-400 font-medium mt-1 inline-block">
                            ✓ Ya está en tu catálogo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer con Contador e Importación */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Seleccionados:{" "}
                <strong className="text-brand-400">{selectedPresets.length}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPresetsModalOpen(false)}
                  className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors text-center"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleImportPresets}
                  disabled={selectedPresets.length === 0 || importingPresets}
                  className="flex-1 sm:flex-initial bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-glow-teal disabled:opacity-40 transition-all text-center"
                >
                  {importingPresets ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Importando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Agregar {selectedPresets.length} a mi Vitrina</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CREAR O EDITAR SERVICIO (FORMULARIO COMPLETO)
          ========================================================================= */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div 
          onClick={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl sm:rounded-2xl p-5 space-y-4 h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-400" />
                {isEditModalOpen ? "Editar Servicio" : "Nuevo Servicio Personalizado"}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={isEditModalOpen ? handleUpdateService : handleCreateService}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cambio de breakers o Masillado de drywall"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoría / Etiqueta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Instalación, Urgencia"
                    value={categoryTag}
                    onChange={(e) => setCategoryTag(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Precio Base Estimado
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="number"
                      placeholder="180000"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del trabajo
                </label>
                <textarea
                  rows={3}
                  placeholder="Qué incluye, garantía y materiales utilizados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors resize-y leading-relaxed"
                />
              </div>

              {/* Visibilidad en vitrina */}
              <div className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/80 shadow-inner">
                <div className="pr-2">
                  <span className="text-xs font-bold text-slate-200 block">
                    Mostrar en mi Vitrina Pública
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {isActive
                      ? "✓ Visible para todos tus clientes en la vitrina"
                      : "○ Servicio pausado (oculto temporalmente en la vitrina)"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-brand-500 rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Selector de Foto del Servicio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Foto del servicio
                  </label>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab("suggested")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        photoSourceTab === "suggested"
                          ? "bg-brand-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🖼️ Galería HD
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab("upload")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        photoSourceTab === "upload"
                          ? "bg-brand-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      📸 Subir Foto
                    </button>
                  </div>
                </div>

                {photoSourceTab === "suggested" ? (
                  <div className="space-y-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
                    {/* Selector de Oficio para las fotos */}
                    <div className="flex gap-1 overflow-x-auto no-scrollbar text-[10px] font-bold pb-1">
                      {Object.keys(CURATED_SERVICE_PHOTOS).map((catKey) => {
                        const labels = {
                          electricidad: "⚡ Electricidad",
                          obra_blanca: "🎨 Obra Blanca",
                          mascotas: "🐕 Mascotas",
                          plomeria: "🚰 Plomería",
                          carpinteria: "🪚 Carpintería",
                          limpieza: "✨ Limpieza",
                        };
                        const isPhotoTabActive = photoCategoryTab === catKey;
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => setPhotoCategoryTab(catKey)}
                            className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                              isPhotoTabActive
                                ? "bg-slate-800 text-brand-300 border border-brand-500/40"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {labels[catKey] || catKey}
                          </button>
                        );
                      })}
                    </div>

                    {/* Grid de fotos sugeridas: 4 cols en móvil, 5 en desktop */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-0.5">
                      {(CURATED_SERVICE_PHOTOS[photoCategoryTab] || []).map((photo) => {
                        const isSelected = imagePreview === photo.url;
                        return (
                          <div
                            key={photo.url}
                            onClick={() => {
                              setImagePreview(photo.url);
                              setImageFile(null);
                            }}
                            title={photo.title}
                            className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-square ${
                              isSelected
                                ? "border-emerald-400 ring-2 ring-emerald-400/30 scale-95"
                                : "border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center">
                                <span className="bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-brand-500 bg-slate-800/50 rounded-xl py-3 px-3 transition-colors text-xs text-slate-400">
                      <ImageIcon className="w-4 h-4 text-brand-400" />
                      <span>{imageFile ? imageFile.name : "Seleccionar archivo de tu dispositivo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Previsualización de la foto activa */}
                {imagePreview && (
                  <div className="flex items-center gap-2.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-slate-200 block truncate">
                        Foto seleccionada para este servicio
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        ✓ Lista para mostrar en la vitrina pública
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción del Modal (100% responsivos en móvil) */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="w-full sm:flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold py-3 rounded-xl text-xs transition-colors order-2 sm:order-1 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-glow-teal flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2 text-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{isEditModalOpen ? "Actualizar Servicio" : "Guardar Servicio"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
