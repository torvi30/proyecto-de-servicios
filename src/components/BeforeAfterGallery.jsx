import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  ChevronsLeftRight,
  RotateCcw,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  getBusinessPortfolioItems,
  addBusinessPortfolioItem,
  deleteBusinessPortfolioItem,
} from "../services/firestoreService";

const DEFAULT_PORTFOLIO_ITEMS = {
  ortopedia: [
    {
      id: "ba-ort-1",
      title: "Corrección Postural & Plantillas Computarizadas",
      description: "Estudio podométrico dinámico: alineación del eje de apoyo en retropié y reducción inmediata de sobrecarga en talón.",
      beforeImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Biomecánica & Marcha",
      client: "Paciente Juanita R.",
    },
    {
      id: "ba-ort-2",
      title: "Férula Termoplástica Perforada a Medida (Mano/Muñeca)",
      description: "Reemplazo de escayola pesada por órtesis anatómica ultraligera, lavable y con fijación en velcro suave.",
      beforeImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Órtesis & Inmovilización",
      client: "Paciente Carlos V.",
    },
  ],
  electricidad: [
    {
      id: "ba-el-1",
      title: "Actualización y Balanceo de Tablero General",
      description: "Sustitución de caja antigua de fusibles por tablero de 12 circuitos Schneider con certificación RETIE.",
      beforeImage: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Tableros Eléctricos",
      client: "Edificio Portal del Parque",
    },
    {
      id: "ba-el-2",
      title: "Iluminación Arquitectónica e Iluminación LED Indirecta",
      description: "Instalación de perfiles de aluminio y tiras led COB cálidas con conmutables inteligentes.",
      beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Iluminación",
      client: "Apartamento 604",
    },
  ],
  obra_blanca: [
    {
      id: "ba-ob-1",
      title: "Restauración de Muro con Humedad y Estuco Veneciano",
      description: "Impermeabilización previa con sika, resane estructural y aplicación de estuco plástico pulido.",
      beforeImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Pintura & Estuco",
      client: "Casa Campestre El Retiro",
    },
    {
      id: "ba-ob-2",
      title: "Cielo Raso Suspendido en Drywall con Cajillo de Luz",
      description: "Diseño moderno con doble nivel para sala principal y preparación lista para pintura lavable.",
      beforeImage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Drywall",
      client: "Oficinas WeWork",
    },
  ],
  mascotas: [
    {
      id: "ba-pet-1",
      title: "Modificación de Conducta y Paseo en Calma ('Zeus')",
      description: "Pastor Alemán con reactividad extrema a otros perros. Tras 4 sesiones pasea con correa floja sin ladridos.",
      beforeImage: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Conducta Canina",
      client: "Familia Restrepo",
    },
    {
      id: "ba-pet-2",
      title: "Socialización y Control de Ansiedad en Cachorro",
      description: "Golden Retriever de 5 meses: superación de miedos a ruidos de tráfico y obediencia básica en positivo.",
      beforeImage: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80",
      afterImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80",
      categoryTag: "Adiestramiento",
      client: "Mariana Gómez",
    },
  ],
};

export default function BeforeAfterGallery({
  businessId = "default",
  businessCategory = "electricidad",
  isPublicView = false,
}) {
  const [sliderPositions, setSliderPositions] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario nuevo caso
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryTag, setCategoryTag] = useState("Trabajo Realizado");
  const [client, setClient] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);

  const categoryKey = businessCategory.includes("ortopedia")
    ? "ortopedia"
    : businessCategory.includes("obra")
    ? "obra_blanca"
    : businessCategory.includes("mascota")
    ? "mascotas"
    : "electricidad";

  const defaultItems = DEFAULT_PORTFOLIO_ITEMS[categoryKey] || DEFAULT_PORTFOLIO_ITEMS.electricidad;
  const allItems = [...customItems, ...defaultItems];

  const loadCustomItems = async () => {
    try {
      const items = await getBusinessPortfolioItems(businessId);
      setCustomItems(items);
    } catch (e) {
      console.debug("Load portfolio error:", e);
    }
  };

  useEffect(() => {
    loadCustomItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const handleSliderChange = (id, value) => {
    setSliderPositions((prev) => ({ ...prev, [id]: Number(value) }));
  };

  const resetSlider = (id, targetVal = 50) => {
    setSliderPositions((prev) => ({ ...prev, [id]: targetVal }));
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!title.trim() || (!beforeImage && !beforeFile) || (!afterImage && !afterFile)) {
      alert("Por favor ingresa el título y ambas fotos (Antes y Después).");
      return;
    }

    try {
      setSubmitting(true);
      await addBusinessPortfolioItem(
        businessId,
        {
          title,
          description,
          categoryTag,
          client: client || "Cliente",
          beforeImage,
          afterImage,
        },
        beforeFile,
        afterFile
      );

      setTitle("");
      setDescription("");
      setClient("");
      setBeforeImage("");
      setAfterImage("");
      setBeforeFile(null);
      setAfterFile(null);
      setIsModalOpen(false);
      await loadCustomItems();
    } catch (err) {
      console.error("Error creating portfolio item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("¿Estás seguro de eliminar este caso de tu portafolio?")) return;
    try {
      await deleteBusinessPortfolioItem(businessId, itemId);
      await loadCustomItems();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-heading font-black text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Portafolio de Trabajos Reales: Antes vs Después</span>
          </h3>
          <p className="text-xs font-sans text-slate-400">
            {isPublicView
              ? "Desliza la barra central para comparar el estado inicial con el acabado final"
              : "Fotos de transformaciones reales para demostrar calidad y justificar tus precios"}
          </p>
        </div>

        {!isPublicView && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Subir Nuevo Caso Antes vs Después</span>
          </button>
        )}
      </div>

      {/* Grid de Comparadores Interactivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allItems.map((item) => {
          const sliderPos = sliderPositions[item.id] !== undefined ? sliderPositions[item.id] : 50;

          return (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group relative"
            >
              {/* Botón de borrar si es personalizado */}
              {!isPublicView && item.isCustom && (
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  title="Eliminar este caso"
                  className="absolute top-3 right-3 z-30 p-1.5 bg-slate-900/90 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Interactive Split-View Comparison Slider */}
              <div className="relative h-60 sm:h-64 w-full bg-slate-950 overflow-hidden select-none">
                {/* After Image */}
                <img
                  src={item.afterImage}
                  alt={`${item.title} - Resultado Después`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  loading="lazy"
                />

                {/* Before Image */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={item.beforeImage}
                    alt={`${item.title} - Estado Antes`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Vertical Divider Line & Knob */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/95 shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none z-10 transition-transform"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950/95 border-2 border-white text-white flex items-center justify-center shadow-2xl backdrop-blur-md">
                    <ChevronsLeftRight className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 pointer-events-none z-10">
                  <span className="text-[10px] font-heading font-black bg-slate-950/85 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full backdrop-blur-md shadow-md uppercase tracking-wider">
                    Antes ({sliderPos}%)
                  </span>
                </div>

                <div className="absolute top-3 right-12 pointer-events-none z-10">
                  <span className="text-[10px] font-heading font-black bg-slate-950/85 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full backdrop-blur-md shadow-md uppercase tracking-wider">
                    Después ✨
                  </span>
                </div>

                {/* Range Input for Dragging */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => handleSliderChange(item.id, e.target.value)}
                  aria-label={`Comparador antes y después para ${item.title}`}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0"
                />

                {/* Hint */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
                  <Sliders className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-sans font-medium text-slate-200">
                    Arrastra para comparar
                  </span>
                </div>
              </div>

              {/* Details & Quick Presets */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-heading font-bold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-lg">
                      {item.categoryTag}
                    </span>
                    <span className="text-[11px] font-sans text-slate-400 font-medium">
                      Cliente: {item.client}
                    </span>
                  </div>

                  <h4 className="text-sm font-heading font-bold text-slate-100 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-sans text-slate-400">
                    Vista rápida:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => resetSlider(item.id, 100)}
                      className={`text-[10px] font-heading px-2 py-1 rounded-lg transition-all ${
                        sliderPos === 100
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                          : "text-slate-400 hover:text-slate-200 bg-slate-800/80"
                      }`}
                    >
                      Antes
                    </button>
                    <button
                      onClick={() => resetSlider(item.id, 50)}
                      className={`text-[10px] font-heading px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        sliderPos === 50
                          ? "bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold"
                          : "text-slate-400 hover:text-slate-200 bg-slate-800/80"
                      }`}
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>50/50</span>
                    </button>
                    <button
                      onClick={() => resetSlider(item.id, 0)}
                      className={`text-[10px] font-heading px-2 py-1 rounded-lg transition-all ${
                        sliderPos === 0
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "text-slate-400 hover:text-slate-200 bg-slate-800/80"
                      }`}
                    >
                      Después ✨
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Subir Nuevo Caso Antes vs Después */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Subir Trabajo de Portafolio (Antes vs Después)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sube ambas fotografías para crear el comparador interactivo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Título del Trabajo / Procedimiento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Corrección de pisada con plantillas / Pintura de fachada"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Especialidad / Etiqueta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Biomecánica / Iluminación"
                    value={categoryTag}
                    onChange={(e) => setCategoryTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Cliente / Ubicación (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Paciente Mariana G. / Chicó Norte"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Subida de Fotos: Antes y Después */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Foto ANTES */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-amber-500/30">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    1. Foto del ANTES (Estado Inicial)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setBeforeFile(file);
                        setBeforeImage(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-amber-500/20 file:text-amber-300 file:font-bold file:cursor-pointer hover:file:bg-amber-500/30"
                  />
                  <input
                    type="url"
                    placeholder="O pega URL de imagen..."
                    value={beforeImage.startsWith("blob:") ? "" : beforeImage}
                    onChange={(e) => {
                      setBeforeImage(e.target.value);
                      setBeforeFile(null);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500"
                  />
                  {beforeImage && (
                    <img
                      src={beforeImage}
                      alt="Preview Antes"
                      className="w-full h-24 object-cover rounded-xl mt-1 border border-slate-800"
                    />
                  )}
                </div>

                {/* Foto DESPUÉS */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    2. Foto del DESPUÉS (Finalizado)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAfterFile(file);
                        setAfterImage(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-300 file:font-bold file:cursor-pointer hover:file:bg-emerald-500/30"
                  />
                  <input
                    type="url"
                    placeholder="O pega URL de imagen..."
                    value={afterImage.startsWith("blob:") ? "" : afterImage}
                    onChange={(e) => {
                      setAfterImage(e.target.value);
                      setAfterFile(null);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500"
                  />
                  {afterImage && (
                    <img
                      src={afterImage}
                      alt="Preview Después"
                      className="w-full h-24 object-cover rounded-xl mt-1 border border-slate-800"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Descripción del Resultado Obtenido
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalla qué problema se solucionó y cómo quedó la transformación..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-slate-850"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {submitting ? "Guardando..." : "Publicar Caso en Portafolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
