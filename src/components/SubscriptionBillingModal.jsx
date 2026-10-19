import React, { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  Copy,
  RotateCcw,
  Phone,
  Edit3,
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
  const [customMessage, setCustomMessage] = useState("");
  const [isMessageEdited, setIsMessageEdited] = useState(false);
  const [customPhone, setCustomPhone] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const biz = tenant?.business;

  // Cuentas oficiales de recaudo del SaaS
  const saasBankAccounts = {
    nequiDaviplata: "310 999 8877",
    bancolombia: "Ahorros 912-000345-21",
    holder: "VitrinaPro Colombia S.A.S.",
    nit: "901.884.221-5",
  };

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
    if (!targetDateStr) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr + "T00:00:00");
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Construir mensaje predeterminado de WhatsApp según plantilla
  const generateWhatsAppMessage = (
    type = reminderType,
    targetDate = nextBillingDate,
    plan = selectedPlan
  ) => {
    if (!biz) return "";
    const bizName = biz.businessName || "profesional";
    const refCode =
      biz.paymentReference ||
      `SUB-${(biz.businessSlug || "BIZ").slice(0, 4).toUpperCase()}-2026`;
    const planLabel =
      plan === "pro"
        ? "PLAN PRO ILIMITADO ($39.000 COP/mes)"
        : plan === "anual"
        ? "PLAN ANUAL VIP ($390.000 COP/año)"
        : "PLAN BÁSICO";
    const feeAmount =
      plan === "pro" ? 39000 : plan === "anual" ? 390000 : 0;
    const diff = calculateDaysLeft(targetDate);

    if (type === "confirmacion") {
      return `¡Hola ${bizName}! 🎉
Te confirmamos que hemos recibido tu pago para la renovación de tu suscripción en VitrinaPro.

✅ *Plan Activo:* ${planLabel}
🔖 *Referencia:* ${refCode}
🗓️ *Nueva fecha de vigencia:* ${targetDate}
🛡️ *Servicios incluidos:* Vitrina digital activa, cotizador interactivo por m², recibos oficiales en PDF y soporte prioritario.

¡Gracias por ser parte de VitrinaPro y profesionalizar tus servicios!`;
    }

    if (type === "vencido") {
      return `¡Hola ${bizName}! 🚨
Te escribimos desde la administración de VitrinaPro.

Tu suscripción de ${planLabel} ha llegado a su fecha de vencimiento (${targetDate}).

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

Te recordamos que tu ciclo de *${planLabel}* está próximo a vencer el *${targetDate}* (${
      diff > 0 ? `quedan ${diff} días` : "vence pronto"
    }).

💰 *Valor mensualidad:* ${formatCurrency(feeAmount)}
🔖 *Referencia:* ${refCode}

Puedes realizar tu pago a través de:
📱 *Nequi / Daviplata:* ${saasBankAccounts.nequiDaviplata}
🏦 *Bancolombia:* ${saasBankAccounts.bancolombia}
👤 *Titular:* ${saasBankAccounts.holder}

Envíanos tu soporte para registrar tu renovación inmediata. ¡Muchas gracias!`;
  };

  useEffect(() => {
    if (tenant?.business) {
      const plan = tenant.business.subscriptionPlan || "pro";
      const date =
        tenant.business.nextBillingDate ||
        new Date().toISOString().split("T")[0];
      setSelectedPlan(plan);
      setNextBillingDate(date);
      setCustomPhone(tenant.business.whatsappNumber || "");

      if (tenant.business.customMessage) {
        setCustomMessage(tenant.business.customMessage);
        setIsMessageEdited(true);
      } else {
        const initialMsg = generateWhatsAppMessage("preventivo", date, plan);
        setCustomMessage(initialMsg);
        setIsMessageEdited(false);
      }
      setFeedbackSuccess("");
    }
  }, [tenant]);

  if (!isOpen || !tenant || !biz) return null;

  const currentDiffDays = calculateDaysLeft(nextBillingDate);
  const isPastDue = currentDiffDays < 0;
  const isWarning = currentDiffDays >= 0 && currentDiffDays <= 4;

  // Modificar fecha manualmente
  const handleDateChange = (newDate) => {
    setNextBillingDate(newDate);
    if (!isMessageEdited) {
      setCustomMessage(generateWhatsAppMessage(reminderType, newDate, selectedPlan));
    }
  };

  // Botones de ajuste rápido de fecha
  const handleQuickAddDays = (days) => {
    let base = new Date();
    // Si la fecha actual elegida es en el futuro, podemos sumarle a esa fecha
    if (nextBillingDate && days > 0) {
      const currentSelected = new Date(nextBillingDate + "T00:00:00");
      if (currentSelected.getTime() > base.getTime()) {
        base = currentSelected;
      }
    }
    const target = new Date(base.getTime() + days * 86400000);
    const dateStr = target.toISOString().split("T")[0];
    handleDateChange(dateStr);
  };

  const handleSetToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    handleDateChange(todayStr);
  };

  // Cambiar plantilla de WhatsApp
  const handleSelectTemplate = (type) => {
    setReminderType(type);
    const msg = generateWhatsAppMessage(type, nextBillingDate, selectedPlan);
    setCustomMessage(msg);
    setIsMessageEdited(false);
  };

  // Restaurar plantilla original
  const handleResetTemplate = () => {
    const msg = generateWhatsAppMessage(reminderType, nextBillingDate, selectedPlan);
    setCustomMessage(msg);
    setIsMessageEdited(false);
  };

  // Copiar mensaje al portapapeles
  const handleCopyMessage = () => {
    const textToCopy =
      customMessage ||
      generateWhatsAppMessage(reminderType, nextBillingDate, selectedPlan);
    navigator.clipboard.writeText(textToCopy);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Enviar mensaje por WhatsApp
  const handleSendWhatsApp = () => {
    const messageToSend =
      customMessage ||
      generateWhatsAppMessage(reminderType, nextBillingDate, selectedPlan);
    const phone = getCleanPhone(customPhone || biz.whatsappNumber);
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      messageToSend
    )}`;
    window.open(waUrl, "_blank");
  };

  // Guardar cambios en el plan y fecha
  const handleSavePlanChanges = async () => {
    try {
      setIsSaving(true);
      await updateTenantSubscription(
        biz.businessSlug,
        {
          subscriptionPlan: selectedPlan,
          nextBillingDate,
          customMessage: isMessageEdited ? customMessage : undefined,
          monthlyFee:
            selectedPlan === "pro"
              ? 39000
              : selectedPlan === "anual"
              ? 32500
              : 0,
          whatsappNumber: customPhone || biz.whatsappNumber,
        },
        biz.id
      );

      setFeedbackSuccess("¡Fecha (" + nextBillingDate + ") y plan de suscripción guardados exitosamente!");
      if (onSubscriptionUpdated) await onSubscriptionUpdated();
      setTimeout(() => {
        setFeedbackSuccess("");
        onClose();
      }, 1300);
    } catch (err) {
      console.error("Error guardando ajustes de suscripción:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Registrar cobro recibido (+30 días automáticos)
  const handleRegisterPayment = async () => {
    try {
      setIsSaving(true);
      const currentDate = new Date();
      const newDate = new Date(currentDate.getTime() + 30 * 86400000);
      const newDateStr = newDate.toISOString().split("T")[0];

      setNextBillingDate(newDateStr);
      const planToSave = selectedPlan === "suspendido" ? "pro" : selectedPlan;
      setSelectedPlan(planToSave);

      await updateTenantSubscription(
        biz.businessSlug,
        {
          subscriptionPlan: planToSave,
          nextBillingDate: newDateStr,
          lastPaymentDate: currentDate.toISOString().split("T")[0],
          whatsappNumber: customPhone || biz.whatsappNumber,
        },
        biz.id
      );

      // Cambiar plantilla a confirmación de pago y actualizar mensaje
      setReminderType("confirmacion");
      const confirmMsg = generateWhatsAppMessage(
        "confirmacion",
        newDateStr,
        planToSave
      );
      setCustomMessage(confirmMsg);
      setIsMessageEdited(false);

      setFeedbackSuccess(
        `🎉 ¡Pago registrado! Fecha renovada al ${newDateStr} (+30 días). Plantilla de confirmación lista.`
      );
      if (onSubscriptionUpdated) await onSubscriptionUpdated();
      setTimeout(() => {
        setFeedbackSuccess("");
      }, 3500);
    } catch (err) {
      console.error("Error registrando pago:", err);
    } finally {
      setIsSaving(false);
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
              className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-sm shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-100 truncate">
                  {biz.businessName}
                </h2>
                {isPastDue ? (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> VENCIDO ({Math.abs(currentDiffDays)} DÍAS EN MORA)
                  </span>
                ) : isWarning ? (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <Clock className="w-3 h-3" /> VENCE EN {currentDiffDays} DÍAS
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> AL DÍA ({currentDiffDays} DÍAS RESTANTES)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ref:{" "}
                <span className="font-mono text-brand-400 font-bold">
                  {biz.paymentReference ||
                    `SUB-${(biz.businessSlug || "BIZ").slice(0, 4).toUpperCase()}-2026`}
                </span>{" "}
                • WhatsApp: {customPhone || biz.whatsappNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback visual si guardó o renovó */}
        {feedbackSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-300 text-xs font-bold p-3 text-center flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Cuerpo con scroll */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-200">
          {/* 1. Selector de Plan SaaS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Seleccionar Plan de Suscripción
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Opción Básico */}
              <div
                onClick={() => {
                  setSelectedPlan("basico");
                  if (!isMessageEdited) {
                    setCustomMessage(
                      generateWhatsAppMessage(reminderType, nextBillingDate, "basico")
                    );
                  }
                }}
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
                onClick={() => {
                  setSelectedPlan("pro");
                  if (!isMessageEdited) {
                    setCustomMessage(
                      generateWhatsAppMessage(reminderType, nextBillingDate, "pro")
                    );
                  }
                }}
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
                  Ilimitado, cotizador interactivo m², recibos PDF y vitrina activa.
                </p>
              </div>

              {/* Opción Anual */}
              <div
                onClick={() => {
                  setSelectedPlan("anual");
                  if (!isMessageEdited) {
                    setCustomMessage(
                      generateWhatsAppMessage(reminderType, nextBillingDate, "anual")
                    );
                  }
                }}
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

          {/* 2. Control Completo de Fecha de Suscripción con Ajustes Rápidos */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  2. Modificar Fecha de Corte / Vencimiento
                </label>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Estado actual:{" "}
                  <strong
                    className={
                      isPastDue
                        ? "text-red-400"
                        : isWarning
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }
                  >
                    {isPastDue
                      ? `Vencido hace ${Math.abs(currentDiffDays)} días`
                      : currentDiffDays === 0
                      ? "Vence hoy"
                      : `Faltan ${currentDiffDays} días`}
                  </strong>
                </span>
              </div>

              {/* Input de Fecha editable */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <input
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="flex-1 sm:flex-initial bg-slate-900 border border-slate-700 hover:border-brand-500 focus:border-brand-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-bold focus:outline-none transition-colors shadow-inner cursor-pointer min-w-[130px]"
                />

                <button
                  type="button"
                  onClick={handleRegisterPayment}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0 disabled:opacity-50"
                  title="Extiende 30 días automáticamente y registra pago recibido"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Cobro Recibido (+30 Días)</span>
                </button>
              </div>
            </div>

            {/* Botones de extensión y atajos rápidos de fecha */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">
                Atajos de fecha:
              </span>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(15)}
                className="text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                +15 Días
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(30)}
                className="text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-brand-300 border border-brand-500/30 hover:border-brand-500/60 px-2.5 py-1 rounded-lg transition-colors font-bold"
              >
                +1 Mes (30d)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(90)}
                className="text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
              >
                +3 Meses
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddDays(365)}
                className="text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 px-2.5 py-1 rounded-lg transition-colors font-bold"
              >
                +1 Año (365d)
              </button>
            </div>
          </div>

          {/* 3. Editor de Mensaje y Cobro por WhatsApp */}
          <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                3. Mensaje Personalizable para WhatsApp
              </label>

              <div className="flex items-center gap-2">
                {isMessageEdited && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Edit3 className="w-2.5 h-2.5" /> Mensaje personalizado
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  title="Restaurar el texto base de la plantilla seleccionada"
                  className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar plantilla</span>
                </button>
              </div>
            </div>

            {/* Selector de plantilla base */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "preventivo", label: "🗓️ Preventivo (Próximo)" },
                { id: "vencido", label: "🚨 Urgente (Mora / Vencido)" },
                { id: "confirmacion", label: "🎉 Confirmación de Pago" },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`text-[11px] font-bold py-2 px-2 rounded-xl border transition-all text-center ${
                    reminderType === tmpl.id
                      ? "bg-brand-500/20 text-brand-300 border-brand-500/50 shadow-sm"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            {/* Textarea editable del mensaje de WhatsApp */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  ✏️ Puedes editar y escribir lo que desees directamente abajo:
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {customMessage.length} caracteres
                </span>
              </div>

              <textarea
                rows={8}
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  setIsMessageEdited(true);
                }}
                placeholder="Escribe el mensaje que se enviará por WhatsApp..."
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-brand-400 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-inner resize-y"
              />
            </div>

            {/* Teléfono de envío y botones de acción */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-semibold">
                  WhatsApp:
                </span>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="3101234567"
                  className="bg-transparent border-none text-xs text-slate-100 font-mono font-bold focus:outline-none w-28 sm:w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                  title="Copiar texto del mensaje al portapapeles"
                >
                  <Copy className="w-3.5 h-3.5 text-brand-400" />
                  <span>{copyFeedback ? "¡Copiado! ✓" : "Copiar"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de Acciones del Modal */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-3 py-2 transition-colors"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSavePlanChanges}
            disabled={isSaving}
            className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black py-2.5 px-4 sm:px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 text-center"
          >
            <span>{isSaving ? "Guardando..." : "Guardar Ajustes"}</span>
            <span className="hidden sm:inline">{!isSaving && " de Suscripción"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
