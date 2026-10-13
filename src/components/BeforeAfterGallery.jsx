import React, { useState } from "react";
import { Sparkles, Image as ImageIcon, Plus, Trash2, CheckCircle2, ChevronRight, Sliders } from "lucide-react";

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
  const [activeItemView, setActiveItemView] = useState({}); // id -> 'before' | 'after'
  const [sliderPositions, setSliderPositions] = useState({}); // id -> 0..100

  // Obtener items correspondientes a la categoría
  const categoryKey = businessCategory.includes("obra")
    ? "obra_blanca"
    : businessCategory.includes("mascota")
    ? "mascotas"
    : "electricidad";

  const items = DEFAULT_PORTFOLIO_ITEMS[categoryKey] || DEFAULT_PORTFOLIO_ITEMS.electricidad;

  const toggleView = (id, mode) => {
    setActiveItemView((prev) => ({ ...prev, [id]: mode }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Portafolio de Trabajos Reales: Antes vs Después</span>
          </h3>
          <p className="text-xs text-slate-400">
            {isPublicView
              ? "Resultados garantizados y proyectos ejecutados por nuestro equipo"
              : "Fotos de transformaciones reales para demostrar calidad y justificar tus precios"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const currentMode = activeItemView[item.id] || "after"; // por defecto mostrar el 'después' que es el resultado impecable

          return (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all"
            >
              {/* Imagen Interactiva Antes / Después */}
              <div className="relative h-56 bg-slate-950 overflow-hidden">
                <img
                  src={currentMode === "after" ? item.afterImage : item.beforeImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Badge de Estado Actual */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border ${
                      currentMode === "after"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {currentMode === "after" ? "✨ RESULTADO FINAL (DESPUÉS)" : "⚠️ ESTADO INICIAL (ANTES)"}
                  </span>
                </div>

                {/* Selector Interactivo de 1-toque Antes / Después */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                  <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 flex gap-1 shadow-2xl">
                    <button
                      onClick={() => toggleView(item.id, "before")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentMode === "before"
                          ? "bg-amber-500 text-slate-950 shadow-md font-black"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Ver Antes
                    </button>
                    <button
                      onClick={() => toggleView(item.id, "after")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentMode === "after"
                          ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Ver Después ✨
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalle del Proyecto */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md">
                      {item.categoryTag}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Cliente: {item.client}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
