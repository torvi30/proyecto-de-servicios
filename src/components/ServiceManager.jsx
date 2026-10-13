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
  BookOpen,
  Check,
  Search,
  Filter,
  Tag,
  Wrench,
  Zap,
  Paintbrush,
  Droplets,
  Hammer,
  Wind,
  Key,
  Dog,
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

      await addBusinessService(
        business.id,
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

      await updateBusinessService(
        business.id,
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
    try {
      await updateBusinessService(business.id, service.id, {
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
    const reordered = [...services];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    await reorderBusinessServices(business.id, reordered);
    if (onServicesUpdated) await onServicesUpdated();
  };

  // Reorder: Move Down
  const handleMoveDown = async (index) => {
    if (index === services.length - 1) return;
    const reordered = [...services];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    await reorderBusinessServices(business.id, reordered);
    if (onServicesUpdated) await onServicesUpdated();
  };

  // Delete Service
  const handleDelete = async (serviceId) => {
    if (window.confirm("¿Seguro que deseas eliminar este servicio de tu vitrina?")) {
      try {
        await deleteBusinessService(business.id, serviceId);
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
      await importPresetServices(business.id, selectedPresets);
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
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            Gestión y Organización de Servicios
            <span className="text-xs bg-brand-500/20 text-brand-400 font-bold px-2 py-0.5 rounded-full">
              {services.length} activos
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Catálogo Ilimitado
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Agrega todos los servicios que ofrezcas sin límite de cantidad. Puedes organizarlos, reordenarlos y ocultarlos con 1 clic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para Escoger Servicios Predefinidos */}
          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-brand-500/20 border border-brand-500/40 hover:border-brand-400 text-brand-300 font-bold px-3.5 py-2 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Escoger por Oficio</span>
          </button>

          {/* Botón Nuevo Servicio Personalizado */}
          <button
            onClick={() => {
              setTitle("");
              setDescription("");
              setBasePrice("");
              setCategoryTag("Instalación");
              setImageFile(null);
              setImagePreview("");
              setIsCreateModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-glow-teal transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Manual</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtro, Búsqueda y Estados */}
      <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Todos ({services.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                statusFilter === "active"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Visibles ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                statusFilter === "inactive"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Ocultos ({inactiveCount})
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
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
              No hay servicios en esta vista
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Puedes escoger servicios predefinidos listos para usar de electricistas, plomeros o pintores, o añadir uno propio.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsPresetsModalOpen(true)}
              className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-glow-teal transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Explorar Catálogo por Oficio
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              Crear desde Cero
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
                    ? "border-slate-800 hover:border-slate-700"
                    : "border-slate-800/60 opacity-60 bg-slate-950/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Foto del servicio */}
                  <div className="relative w-20 h-20 rounded-xl bg-slate-800 shrink-0 overflow-hidden border border-slate-700">
                    <img
                      src={
                        service.imageUrl ||
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80"
                      }
                      alt={service.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Información Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {service.categoryTag && (
                          <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                            {service.categoryTag}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                            isVisible
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {isVisible ? "● Visible en vitrina" : "○ Oculto"}
                        </span>
                      </div>

                      {/* Precio */}
                      <span className="text-xs font-black text-emerald-400 shrink-0">
                        {service.basePrice > 0
                          ? `Desde ${formatCurrency(service.basePrice)}`
                          : "A convenir"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 mt-1 line-clamp-1">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {service.description || "Sin descripción adicional."}
                    </p>
                  </div>
                </div>

                {/* Barra de Control de Orden y Acciones (Móvil Thumb-Friendly) */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {/* Reordenar posición en la vitrina */}
                  <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 px-1 font-semibold">
                      Posición:
                    </span>
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      title="Mover arriba"
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      title="Mover abajo"
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Acciones de Edición, Toggle y Borrado */}
                  <div className="flex items-center gap-1.5">
                    {/* Toggle Visibilidad */}
                    <button
                      onClick={() => handleToggleActive(service)}
                      title={isVisible ? "Ocultar de la vitrina" : "Mostrar en la vitrina"}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        isVisible
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      }`}
                    >
                      {isVisible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Pausar</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Activar</span>
                        </>
                      )}
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => openEditModal(service)}
                      title="Editar servicio"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => handleDelete(service.id)}
                      title="Eliminar de mi catálogo"
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] flex flex-col">
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

            {/* Pestañas de Oficios */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {TRADE_CATEGORIES.map((trade) => {
                const Icon = getTradeIcon(trade.id);
                const isActive = selectedTradeTab === trade.id;
                return (
                  <button
                    key={trade.id}
                    onClick={() => setSelectedTradeTab(trade.id)}
                    className={`flex items-center gap-1.5 py-2 px-3 rounded-xl whitespace-nowrap font-semibold transition-all ${
                      isActive
                        ? "bg-brand-500 text-slate-950 shadow-glow-teal"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{trade.name}</span>
                  </button>
                );
              })}
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
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                Seleccionados:{" "}
                <strong className="text-brand-400">{selectedPresets.length}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPresetsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleImportPresets}
                  disabled={selectedPresets.length === 0 || importingPresets}
                  className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-glow-teal disabled:opacity-40"
                >
                  {importingPresets ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Categoría / Etiqueta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Instalación, Urgencia"
                    value={categoryTag}
                    onChange={(e) => setCategoryTag(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Precio Base Estimado
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      placeholder="180000"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del trabajo
                </label>
                <textarea
                  rows={2}
                  placeholder="Qué incluye, garantía y materiales utilizados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Visibilidad en vitrina */}
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/70">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Mostrar en mi Vitrina Pública
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Si está desactivado, tus clientes no lo verán
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
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
                      🖼️ Galería Sugerida HD
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
                      📸 Subir Archivo
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
                        const isActive = photoCategoryTab === catKey;
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => setPhotoCategoryTab(catKey)}
                            className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                              isActive
                                ? "bg-slate-800 text-brand-300 border border-brand-500/40"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {labels[catKey] || catKey}
                          </button>
                        );
                      })}
                    </div>

                    {/* Grid de fotos sugeridas */}
                    <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
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

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-glow-teal flex items-center justify-center gap-2 disabled:opacity-50"
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
