import React, { useState, useEffect } from "react";
import {
  X,
  Radio,
  Send,
  Eye,
  CheckCircle2,
  Power,
} from "lucide-react";
import {
  getGlobalBroadcastAnnouncement,
  saveGlobalBroadcastAnnouncement,
} from "../services/firestoreService";

export default function BroadcastAnnouncementModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("novedad");
  const [isActive, setIsActive] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    async function loadCurrent() {
      try {
        const current = await getGlobalBroadcastAnnouncement();
        if (current) {
          setTitle(current.title || "");
          setMessage(current.message || "");
          setType(current.type || "novedad");
          setIsActive(current.isActive !== false);
        }
      } catch (e) {
        console.error("Error loading broadcast in modal:", e);
      }
    }
    loadCurrent();
  }, [isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: `broadcast-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        type,
        isActive,
        updatedAt: new Date().toISOString(),
        author: "Dirección de Plataforma VitrinaPro",
      };

      await saveGlobalBroadcastAnnouncement(payload);
      setSaveFeedback(true);
      setTimeout(() => {
        setSaveFeedback(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error saving broadcast:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
              Emisión Global de Avisos (Broadcast)
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
            Comunicado a Todos los Contratistas
          </h2>
          <p className="text-xs text-slate-400">
            Publica un anuncio que aparecerá en el panel de todos los técnicos afiliados
          </p>
        </div>

        {/* Feedback de Éxito */}
        {saveFeedback && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-300 text-xs font-bold p-3 text-center flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¡Comunicado transmitido con éxito a toda la plataforma!</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200">
          {/* Switch de Activación */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                }`}
              >
                <Power className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Estado del Anuncio Global
                </span>
                <span className="text-[11px] text-slate-400">
                  {isActive ? "Visible para todos los contratistas" : "Pausado / Inactivo"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {isActive ? "🟢 ACTIVO" : "⚪ PAUSADO"}
            </button>
          </div>

          {/* Tipo de Anuncio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Tipo de Comunicado:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "novedad", label: "🚀 Novedad / Función", color: "purple" },
                { id: "urgente", label: "🚨 Aviso Urgente", color: "red" },
                { id: "mantenimiento", label: "🛠️ Mantenimiento", color: "blue" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    type === opt.id
                      ? "bg-purple-950/40 border-purple-500 text-purple-200 ring-1 ring-purple-500/40"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              Título del Anuncio:
            </label>
            <input
              type="text"
              required
              placeholder="Ej: 🚀 ¡Nueva función de cotización por m² disponible!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Mensaje */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              Mensaje Detallado para los Contratistas:
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ej: Estimados técnicos, a partir de hoy pueden cotizar pintura y drywall calculando el área en m² directamente desde el panel de Trabajos..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
            />
          </div>

          {/* Vista Previa en Vivo */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand-400" />
              Vista Previa en Vivo (Así lo verán los contratistas):
            </label>

            <div
              className={`p-3.5 rounded-2xl border bg-gradient-to-r ${
                type === "urgente"
                  ? "from-red-950/90 via-slate-900 to-slate-950 border-red-500/40 text-red-200"
                  : type === "mantenimiento"
                  ? "from-blue-950/90 via-slate-900 to-slate-950 border-blue-500/40 text-blue-200"
                  : "from-purple-950/90 via-slate-900 to-slate-950 border-purple-500/40 text-purple-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider bg-slate-950/60">
                  {type === "urgente" ? "AVISO URGENTE" : type === "mantenimiento" ? "MANTENIMIENTO" : "NOVEDAD"}
                </span>
                <span className="text-xs font-bold text-slate-100">
                  {title || "Título del comunicado"}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {message || "El mensaje redactado aparecerá aquí para todos los técnicos."}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-3 py-2 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-slate-100 font-black py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Comunicado Global</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
