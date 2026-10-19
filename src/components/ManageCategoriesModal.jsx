import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Tag,
  Sparkles,
  Trash2,
  Check,
  Activity,
  Zap,
  Paintbrush,
  Droplets,
  Hammer,
  Wind,
  KeyRound,
  Dog,
  Brush,
  Wrench,
  Stethoscope,
  Scissors,
  Car,
  Heart,
  Briefcase,
} from "lucide-react";
import {
  getPlatformCategories,
  createPlatformCategory,
  deletePlatformCategory,
} from "../services/firestoreService";

const AVAILABLE_ICONS = [
  { name: "Activity", icon: Activity, label: "Salud / Ortopedia" },
  { name: "Stethoscope", icon: Stethoscope, label: "Médico / Clínico" },
  { name: "Zap", icon: Zap, label: "Electricidad" },
  { name: "Paintbrush", icon: Paintbrush, label: "Pintura / Acabados" },
  { name: "Droplets", icon: Droplets, label: "Plomería" },
  { name: "Hammer", icon: Hammer, label: "Carpintería / Construcción" },
  { name: "Wind", icon: Wind, label: "Climatización" },
  { name: "KeyRound", icon: KeyRound, label: "Cerrajería" },
  { name: "Dog", icon: Dog, label: "Mascotas" },
  { name: "Brush", icon: Brush, label: "Limpieza" },
  { name: "Wrench", icon: Wrench, label: "Técnico / Taller" },
  { name: "Scissors", icon: Scissors, label: "Belleza / Barbería" },
  { name: "Car", icon: Car, label: "Automotriz" },
  { name: "Heart", icon: Heart, label: "Cuidado / Bienestar" },
  { name: "Briefcase", icon: Briefcase, label: "Servicios Generales" },
];

export default function ManageCategoriesModal({ isOpen, onClose, onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Formulario nueva categoría
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Tag");
  const [submitting, setSubmitting] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const list = await getPlatformCategories();
      setCategories(list);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await createPlatformCategory({
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
      });

      setName("");
      setDescription("");
      setSelectedIcon("Tag");
      setIsCreating(false);
      setSuccessFeedback(true);
      setTimeout(() => setSuccessFeedback(false), 2500);

      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría personalizada?")) return;
    try {
      await deletePlatformCategory(catId);
      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                Categorías & Rubros del Sistema
                <span className="text-[10px] bg-slate-800 text-teal-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  {categories.length} activas
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gestiona las ramas de actividad disponibles para contratistas, orquestación y vitrinas públicas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {successFeedback && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-5 py-2 flex items-center gap-2 text-xs font-bold text-emerald-400 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Categoría creada y propagada con éxito a toda la plataforma.</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {/* Botón para abrir formulario de creación */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-dashed border-teal-500/40 hover:border-teal-400 text-teal-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
            >
              <Plus className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              <span>+ Crear Nueva Categoría Comercial (ej. Mecánica, Odontología, Peluquería)</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCategory} className="bg-slate-950 border border-teal-500/30 rounded-2xl p-4 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Nueva Categoría de Plataforma
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Nombre Comercial de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salud, Ortopedia & Biomecánica / Mecánica Automotriz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Breve descripción del alcance del rubro
                </label>
                <input
                  type="text"
                  placeholder="Ej: Servicios ortopédicos, rehabilitación, órtesis y equipos clínicos."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-medium"
                />
              </div>

              {/* Selector de Ícono */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Ícono Representativo
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setSelectedIcon(item.name)}
                        title={item.label}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? "bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
                >
                  {submitting ? "Guardando..." : "Guardar Categoría"}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Categorías Existentes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Categorías Habilitadas en VitrinaPro:
            </span>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Cargando categorías...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No hay categorías cargadas.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 flex items-start justify-between gap-2.5 transition-all"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {cat.description || `ID: ${cat.id}`}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                              id: {cat.id}
                            </span>
                            {cat.isCustom && (
                              <span className="text-[9px] font-bold bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded border border-teal-500/30">
                                Personalizada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {cat.isCustom && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          title="Eliminar categoría personalizada"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Las categorías creadas aquí quedan inmediatamente disponibles para todos los contratistas.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
