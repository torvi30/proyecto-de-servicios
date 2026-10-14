import React, { useState } from "react";
import { Sparkles, Sliders, ChevronsLeftRight, RotateCcw } from "lucide-react";

const DEFAULT_PORTFOLIO_ITEMS = {
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

export default function BeforeAfterGallery({ businessCategory = "electricidad", isPublicView = false }) {
  // Store slider position (0-100) per portfolio item, defaulting to 50%
  const [sliderPositions, setSliderPositions] = useState({});

  // Resolve active category key safely
  const categoryKey = businessCategory.includes("obra")
    ? "obra_blanca"
    : businessCategory.includes("mascota")
    ? "mascotas"
    : "electricidad";

  const items = DEFAULT_PORTFOLIO_ITEMS[categoryKey] || DEFAULT_PORTFOLIO_ITEMS.electricidad;

  const handleSliderChange = (id, value) => {
    setSliderPositions((prev) => ({ ...prev, [id]: Number(value) }));
  };

  const resetSlider = (id, targetVal = 50) => {
    setSliderPositions((prev) => ({ ...prev, [id]: targetVal }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const sliderPos = sliderPositions[item.id] !== undefined ? sliderPositions[item.id] : 50;

          return (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
            >
              {/* Interactive Split-View Comparison Slider */}
              <div className="relative h-60 sm:h-64 w-full bg-slate-950 overflow-hidden select-none">
                {/* After Image (Full background) */}
                <img
                  src={item.afterImage}
                  alt={`${item.title} - Resultado Después`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  loading="lazy"
                />

                {/* Before Image (Clipped dynamically by slider position) */}
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

                {/* Vertical Divider Line & Tactile Knob */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/95 shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none z-10 transition-transform"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950/95 border-2 border-white text-white flex items-center justify-center shadow-2xl backdrop-blur-md">
                    <ChevronsLeftRight className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                {/* Before / After Badges */}
                <div className="absolute top-3 left-3 pointer-events-none z-10">
                  <span className="text-[10px] font-heading font-black bg-slate-950/85 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full backdrop-blur-md shadow-md uppercase tracking-wider">
                    Antes ({sliderPos}%)
                  </span>
                </div>

                <div className="absolute top-3 right-3 pointer-events-none z-10">
                  <span className="text-[10px] font-heading font-black bg-slate-950/85 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full backdrop-blur-md shadow-md uppercase tracking-wider">
                    Después ✨
                  </span>
                </div>

                {/* Native Range Input for Silky Smooth Dragging on Touch and Desktop */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => handleSliderChange(item.id, e.target.value)}
                  aria-label={`Comparador antes y después para ${item.title}`}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0"
                />

                {/* Interactive Drag Hint */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
                  <Sliders className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-sans font-medium text-slate-200">
                    Arrastra para comparar
                  </span>
                </div>
              </div>

              {/* Project Details and Quick Presets */}
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

                {/* Quick 1-Touch Presets */}
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
    </div>
  );
}
