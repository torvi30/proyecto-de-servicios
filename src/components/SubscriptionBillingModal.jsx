import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  MessageCircle,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Building,
  RotateCcw,
} from "lucide-react";
import { updateTenantSubscription } from "../services/firestoreService";

export default function SubscriptionBillingModal({
  isOpen,
  onClose,
  tenant,
  onSubscriptionUpdated,
}) {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [nextBillingDate, setNextBillingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reminderType, setReminderType] = useState("preventivo"); // 'preventivo' | 'vencido' | 'confirmacion'
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  useEffect(() => {
    if (tenant?.business) {
      setSelectedPlan(tenant.business.subscriptionPlan || "pro");
      setNextBillingDate(
        tenant.business.nextBillingDate || new Date().toISOString().split("T")[0]
      );
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const biz = tenant.business;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCleanPhone = (phone) => {
    let clean = (phone || "").replace(/\D/g, "");
    if (clean.length === 10 && clean.startsWith("3")) {
      clean = "57" + clean;
    }
    return clean;
  };

  const calculateDaysLeft = (targetDateStr) => {
    const now = new Date();
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentDiffDays = calculateDaysLeft(nextBillingDate);
  const isPastDue = currentDiffDays < 0;
  const isWarning = currentDiffDays >= 0 && currentDiffDays <= 4;

  // Cuentas oficiales de recaudo del SaaS
  const saasBankAccounts = {
    nequiDaviplata: "310 999 8877",
    bancolombia: "Ahorros 912-000345-21",
    holder: "VitrinaPro Colombia S.A.S.",
    nit: "901.884.221-5",
  };

  // Construir mensaje de WhatsApp
  const generateWhatsAppMessage = () => {
    const bizName = biz.businessName || "profesional";
    const refCode = biz.paymentReference || `SUB-${biz.businessSlug?.slice(0, 4).toUpperCase()}-2026`;
    const planLabel =
      selectedPlan === "pro"
        ? "PLAN PRO ILIMITADO ($39.000 COP/mes)"
        : selectedPlan === "anual"
        ? "PLAN ANUAL VIP ($390.000 COP/año)"
        : "PLAN BÁSICO";
    const feeAmount = selectedPlan === "pro" ? 39000 : selectedPlan === "anual" ? 390000 : 0;

    if (reminderType === "confirmacion") {
      return `¡Hola ${bizName}! 🎉
Te confirmamos que hemos recibido tu pago para la renovación de tu suscripción en VitrinaPro.

✅ *Plan Activo:* ${planLabel}
🔖 *Referencia:* ${refCode}
🗓️ *Nueva fecha de vigencia:* ${nextBillingDate}
🛡️ *Servicios incluidos:* Vitrina digital activa, cotizador interactivo por m², recibos oficiales en PDF y soporte prioritario.

¡Gracias por ser parte de VitrinaPro y profesionalizar tus servicios!`;
    }

    if (reminderType === "vencido") {
      return `¡Hola ${bizName}! 🚨
Te escribimos desde la administración de VitrinaPro.

Tu suscripción de ${planLabel} ha llegado a su fecha de vencimiento (${nextBillingDate}).

Para evitar la pausa de tu vitrina digital y seguir generando cotizaciones y recibos oficiales en PDF, por favor renueva tu mensualidad de *${formatCurrency(
        feeAmount
      )}*:

📱 *Nequi / Daviplata:* ${saasBankAccounts.nequiDaviplata}
🏦 *Bancolombia:* ${saasBankAccounts.bancolombia}
👤 *Titular:* ${saasBankAccounts.holder}
🔖 *Referencia de pago:* ${refCode}

Envíanos el comprobante por este medio para mantener tus servicios 100% activos. Quedamos atentos.`;
    }

    // Por defecto: preventivo
    return `¡Hola ${bizName}! 👋
Te saludamos desde la administración de VitrinaPro.

Te recordamos que tu ciclo mensual de *${planLabel}* está próximo a vencer el *${nextBillingDate}* (${
      currentDiffDays > 0 ? `quedan ${currentDiffDays} días` : "vence pronto"
    }).

💰 *Valor mensualidad:* ${formatCurrency(feeAmount)}
🔖 *Referencia:* ${refCode}

Puedes realizar tu pago a través de:
📱 *Nequi / Daviplata:* ${saasBankAccounts.nequiDaviplata}
🏦 *Bancolombia:* ${saasBankAccounts.bancolombia}
👤 *Titular:* ${saasBankAccounts.holder}

Envíanos tu soporte para registrar tu renovación inmediata. ¡Muchas gracias!`;
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const phone = getCleanPhone(biz.whatsappNumber);
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  // Guardar cambios en el plan y fecha
  const handleSavePlanChanges = () => {
    const updated = updateTenantSubscription(biz.businessSlug, {
      subscriptionPlan: selectedPlan,
      nextBillingDate,
      monthlyFee: selectedPlan === "pro" ? 39000 : selectedPlan === "anual" ? 32500 : 0,
    });
    setFeedbackSuccess("¡Plan y fecha de facturación guardados!");
    setTimeout(() => {
      setFeedbackSuccess("");
      if (onSubscriptionUpdated) onSubscriptionUpdated();
      onClose();
    }, 1200);
  };

  // Registrar pago recibido (+30 días automáticos)
  const handleRegisterPayment = () => {
    const currentDate = new Date();
    // Sumar 30 días a partir de hoy
    const newDate = new Date(currentDate.getTime() + 30 * 86400000);
    const newDateStr = newDate.toISOString().split("T")[0];

    setNextBillingDate(newDateStr);
    updateTenantSubscription(biz.businessSlug, {
      subscriptionPlan: selectedPlan === "suspendido" ? "pro" : selectedPlan,
      nextBillingDate: newDateStr,
      lastPaymentDate: currentDate.toISOString().split("T")[0],
    });

    setFeedbackSuccess("🎉 ¡Pago registrado! Renovado por 30 días adicionales.");
    setTimeout(() => {
      setFeedbackSuccess("");
      if (onSubscriptionUpdated) onSubscriptionUpdated();
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src={
                biz.logoUrl ||
                "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80"
              }
              alt={biz.businessName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  {biz.businessName}
                </h2>
                {isPastDue ? (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> VENCIDO
                  </span>
                ) : isWarning ? (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <Clock className="w-3 h-3" /> VENCE EN {currentDiffDays} DÍAS
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> AL DÍA ({currentDiffDays} DÍAS)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ref: <span className="font-mono text-brand-400 font-bold">{biz.paymentReference || `SUB-${biz.businessSlug?.slice(0, 4).toUpperCase()}-2026`}</span> • WhatsApp: {biz.whatsappNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback visual si guardó */}
        {feedbackSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-300 text-xs font-bold p-3 text-center flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Cuerpo con scroll */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-200">
          {/* Selector de Plan SaaS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Seleccionar Plan de Suscripción
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Opción Básico */}
              <div
                onClick={() => setSelectedPlan("basico")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === "basico"
                    ? "bg-slate-800 border-brand-500 ring-1 ring-brand-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-300">Plan Básico</span>
                  <span className="text-xs font-black text-slate-400">Gratis</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Hasta 3 cotizaciones/mes, sin recibos PDF de anticipo.
                </p>
              </div>

              {/* Opción Pro */}
              <div
                onClick={() => setSelectedPlan("pro")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === "pro"
                    ? "bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Plan PRO
                  </span>
                  <span className="text-xs font-black text-purple-400">$39.000 / mes</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Ilimitado, cotizador interactivo m², recibos PDF y galería HD.
                </p>
              </div>

              {/* Opción Anual */}
              <div
                onClick={() => setSelectedPlan("anual")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === "anual"
                    ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-300">Plan Anual VIP</span>
                  <span className="text-xs font-black text-amber-400">$390.000 / año</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  2 meses de ahorro, soporte VIP prioritario y placa de oro.
                </p>
              </div>
            </div>
          </div>

          {/* Control de Fechas & Renovación de 1 Toque */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  Próxima Fecha de Corte / Vencimiento
                </label>
                <span className="text-[11px] text-slate-400">
                  Días restantes: <strong className={isPastDue ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400"}>{currentDiffDays} días</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-brand-400"
                />

                <button
                  onClick={handleRegisterPayment}
                  className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0"
                  title="Extiende 30 días automáticamente y registra pago recibido"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cobro Recibido (+30 Días)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Módulo de Notificación y Cobro por WhatsApp con Cuentas SaaS */}
          <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                2. Enviar Cobro o Confirmación por WhatsApp
              </label>
              <span className="text-[10px] text-slate-400">Cuentas VitrinaPro</span>
            </div>

            {/* Selector de plantilla de mensaje */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "preventivo", label: "🗓️ Preventivo (Vence pronto)" },
                { id: "vencido", label: "🚨 Urgente (Vencido en mora)" },
                { id: "confirmacion", label: "🎉 Confirmación de Pago" },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setReminderType(tmpl.id)}
                  className={`text-[11px] font-bold py-2 px-2.5 rounded-xl border transition-all text-center ${
                    reminderType === tmpl.id
                      ? "bg-brand-500/20 text-brand-300 border-brand-500/50"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            {/* Vista previa del mensaje */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {generateWhatsAppMessage()}
            </div>

            <button
              onClick={handleSendWhatsApp}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir WhatsApp y Enviar Cobro al Contratista</span>
            </button>
          </div>
        </div>

        {/* Footer de Acciones */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-3 py-2 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSavePlanChanges}
            className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
          >
            <span>Guardar Ajustes de Suscripción</span>
          </button>
        </div>
      </div>
    </div>
  );
}
