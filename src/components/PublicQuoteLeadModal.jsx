import React, { useState } from "react";
import {
  X,
  MessageCircle,
  Calculator,
  MapPin,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  Home,
} from "lucide-react";

export default function PublicQuoteLeadModal({
  isOpen,
  onClose,
  service,
  business,
  formatCurrency,
  getCleanPhone,
}) {
  if (!isOpen) return null;

  const category = business?.category || "general";
  const basePrice = service?.basePrice || 0;

  // Determine trade-specific quantity label and unit
  let defaultUnitLabel = "Unidades estimadas";
  let defaultPlaceholder = "1";
  let showAreaCalculator = false;

  if (category === "obra_blanca") {
    defaultUnitLabel = "Área estimada en m²";
    defaultPlaceholder = "Ej: 25";
    showAreaCalculator = true;
  } else if (category === "electricidad") {
    defaultUnitLabel = "Puntos o aparatos a revisar/instalar";
    defaultPlaceholder = "Ej: 3";
  } else if (category === "mascotas") {
    defaultUnitLabel = "Sesiones o días aproximados";
    defaultPlaceholder = "Ej: 4";
  }

  const [quantity, setQuantity] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientSector, setClientSector] = useState("");
  const [urgency, setUrgency] = useState("Esta semana");
  const [notes, setNotes] = useState("");

  const numQty = parseFloat(quantity) > 0 ? parseFloat(quantity) : 1;
  const estimatedTotal = basePrice > 0 ? basePrice * numQty : 0;

  const buildWhatsAppUrl = (isSimple = false) => {
    const phone = getCleanPhone(business?.whatsappNumber);
    const bizName = business?.businessName || "profesional";
    let message = "";

    if (isSimple) {
      if (service) {
        message = `¡Hola ${bizName}! 👋 Vi tu vitrina digital y me interesa cotizar el servicio de *${service.title}*. ¿Podrías darme información de disponibilidad y tarifas?`;
      } else {
        message = `¡Hola ${bizName}! 👋 Vi tu vitrina digital y quisiera cotizar un servicio.`;
      }
    } else {
      const namePart = clientName.trim() ? clientName.trim() : "Cliente interesado";
      const sectorPart = clientSector.trim() ? clientSector.trim() : (business?.city || "Zona local");
      const serviceTitle = service?.title || "Servicio profesional general";

      message = `¡Hola ${bizName}! 👋 
Acabo de ver tu vitrina digital y deseo solicitar una cotización formal:

📋 *Servicio:* ${serviceTitle}
👤 *Cliente:* ${namePart}
📍 *Ubicación / Sector:* ${sectorPart}
⏱️ *Plazo esperado:* ${urgency}`;

      if (basePrice > 0) {
        message += `\n📏 *Cantidad / Medida:* ${numQty} ${category === "obra_blanca" ? "m²" : "unidad(es)"}`;
        message += `\n💰 *Estimado de vitrina:* ${formatCurrency(estimatedTotal)} *(sujeto a visita o confirmación)*`;
      }

      if (notes.trim()) {
        message += `\n📝 *Detalle del trabajo:* ${notes.trim()}`;
      }

      message += `\n\n¿Tienes disponibilidad para revisar este requerimiento o agendar visita? Quedo atento(a).`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleSend = () => {
    const url = buildWhatsAppUrl(false);
    window.open(url, "_blank");
    onClose();
  };

  const handleSendQuick = () => {
    const url = buildWhatsAppUrl(true);
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="relative p-5 pb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
              <Calculator className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
              Cotizador Rápido Directo
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight pr-8">
            {service ? service.title : "Solicitar Cotización a Medida"}
          </h2>

          {service && basePrice > 0 && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Tarifa referencial:</span>
              <span className="text-emerald-400 font-bold">
                {formatCurrency(basePrice)}
                {category === "obra_blanca" ? " / m²" : ""}
              </span>
            </p>
          )}
        </div>

        {/* Cuerpo del formulario scrolleable */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200">
          {/* Cálculo de Cantidad / Medidas si tiene precio base */}
          {basePrice > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  {defaultUnitLabel}
                </label>
                <span className="text-[10px] text-slate-400">Aproximado</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  step={category === "obra_blanca" ? "5" : "1"}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={defaultPlaceholder}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-center font-bold text-slate-100 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />

                <div className="flex-1 bg-slate-900/90 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Total Estimado:</span>
                  <span className="text-sm font-black text-emerald-400">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
              </div>

              {category === "obra_blanca" && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400">Accesos directos:</span>
                  {[15, 30, 60, 100].map((m2) => (
                    <button
                      key={m2}
                      type="button"
                      onClick={() => setQuantity(m2)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                        Number(quantity) === m2
                          ? "bg-brand-500/20 text-brand-300 border-brand-500/50"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {m2} m²
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Datos del Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-brand-400" />
                Tu Nombre
              </label>
              <input
                type="text"
                placeholder="Ej: Carlos Arango"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-400" />
                Barrio o Municipio
              </label>
              <input
                type="text"
                placeholder="Ej: El Poblado, Envigado"
                value={clientSector}
                onChange={(e) => setClientSector(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Cuándo lo necesitas */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-400" />
              ¿Cuándo necesitas el servicio?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "🚨 Urgente / Hoy", value: "Urgente hoy" },
                { label: "🗓️ Esta semana", value: "Esta semana" },
                { label: "☕ Cotización previa", value: "Cotización previa" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgency(opt.value)}
                  className={`text-[10px] font-bold p-2 rounded-xl border text-center transition-all ${
                    urgency === opt.value
                      ? "bg-brand-500/20 text-brand-300 border-brand-500/50 shadow-sm"
                      : "bg-slate-950/60 text-slate-400 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas o Especificaciones */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">
              Detalles adicionales del lugar o trabajo (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Es en un 3er piso, se requiere cambiar también la tubería, tengo fotos disponibles..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-400 resize-none"
            />
          </div>

          {/* Banner de Garantía y Confianza */}
          <div className="flex items-start gap-2 bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-[11px] text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Respuesta directa del profesional en WhatsApp sin intermediarios ni comisiones. Garantía escrita de {business?.warrantyDays || "90 días"}.
            </span>
          </div>
        </div>

        {/* Footer de Acciones */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
          <button
            onClick={handleSend}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Solicitud Detallada por WhatsApp</span>
          </button>

          <button
            onClick={handleSendQuick}
            className="w-full text-xs text-slate-400 hover:text-slate-200 py-1.5 transition-colors flex items-center justify-center gap-1"
          >
            <span>O abrir chat de WhatsApp directo sin formulario</span>
            <span className="text-slate-600">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
