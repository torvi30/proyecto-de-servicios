import React, { useState, useEffect } from "react";
import {
  Plus,
  Send,
  Clock,
  DollarSign,
  Phone,
  Trash2,
  Loader2,
  Sparkles,
  MessageCircle,
  FileDown,
  Calculator,
  Check,
  Copy,
  Receipt,
  CreditCard,
  Ruler,
  Zap,
  Calendar,
  History,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  addBusinessQuote,
  updateQuoteStatus,
  deleteBusinessQuote,
  addQuotePayment,
  deleteQuotePayment,
} from "../services/firestoreService";
import { generateQuotePDF, generateReceiptPDF } from "../utils/pdfGenerator";

export default function QuoteManager({
  business,
  quotes,
  onQuotesUpdated,
  initialClient,
  onClearInitialClient,
}) {
  const [activeTabStatus, setActiveTabStatus] = useState("todos"); // 'todos' | 'pendiente' | 'en_progreso' | 'finalizado'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modo de cálculo en el formulario: 'simple', 'desglose' o 'medidas'
  const [calcMode, setCalcMode] = useState("simple");

  // Formulario de nueva cotización
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  useEffect(() => {
    if (initialClient) {
      setClientName(initialClient.name || "");
      setClientPhone(initialClient.phone || "");
      setIsModalOpen(true);
      if (onClearInitialClient) {
        onClearInitialClient();
      }
    }
  }, [initialClient, onClearInitialClient]);

  // Desglose opcional
  const [laborCost, setLaborCost] = useState("");
  const [materialsCost, setMaterialsCost] = useState("");
  const [transportCost, setTransportCost] = useState("");

  // Medidas y Calculadora asistida
  const [measureType, setMeasureType] = useState("area"); // 'area' | 'puntos' | 'sesiones'
  const [measureWidth, setMeasureWidth] = useState("");
  const [measureHeight, setMeasureHeight] = useState("");
  const [measurePricePerM2, setMeasurePricePerM2] = useState("");

  const [measurePoints, setMeasurePoints] = useState("");
  const [measurePricePerPoint, setMeasurePricePerPoint] = useState("");
  const [measureExtraBreaker, setMeasureExtraBreaker] = useState("");

  const [measureSessionsPerWeek, setMeasureSessionsPerWeek] = useState("");
  const [measureWeeks, setMeasureWeeks] = useState("4");
  const [measurePricePerSession, setMeasurePricePerSession] = useState("");

  // Modal de Recibo de Caja / Comprobante de Abono
  const [receiptQuote, setReceiptQuote] = useState(null);
  const [receiptAmount, setReceiptAmount] = useState("");
  const [receiptMethod, setReceiptMethod] = useState("Nequi");
  const [receiptType, setReceiptType] = useState("Anticipo 50% para inicio");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [receiptModalTab, setReceiptModalTab] = useState("nuevo"); // 'nuevo' | 'historial'
  const [savingPayment, setSavingPayment] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Calcular total si está en modo desglose
  const calculateTotalFromBreakdown = () => {
    const l = Number(laborCost) || 0;
    const m = Number(materialsCost) || 0;
    const t = Number(transportCost) || 0;
    return l + m + t;
  };

  const effectiveTotal =
    calcMode === "desglose"
      ? calculateTotalFromBreakdown()
      : Number(totalAmount) || 0;

  // Cálculos de la calculadora asistida de medidas
  const calcAreaM2 = (Number(measureWidth) || 0) * (Number(measureHeight) || 0);
  const calcAreaTotal = calcAreaM2 * (Number(measurePricePerM2) || 0);

  const calcPointsTotal =
    (Number(measurePoints) || 0) * (Number(measurePricePerPoint) || 0) +
    (Number(measureExtraBreaker) || 0);

  const calcTotalSessions =
    (Number(measureSessionsPerWeek) || 0) * (Number(measureWeeks) || 0);
  const calcSessionsTotal =
    calcTotalSessions * (Number(measurePricePerSession) || 0);

  const applyMeasureCalculation = (type) => {
    let calculatedVal = 0;
    let note = "";

    if (type === "area") {
      calculatedVal = Math.round(calcAreaTotal);
      note = `\n📐 Medición: ${measureWidth}m × ${measureHeight}m = ${calcAreaM2.toFixed(1)} m² a ${formatCurrency(measurePricePerM2)}/m²`;
    } else if (type === "puntos") {
      calculatedVal = Math.round(calcPointsTotal);
      note = `\n⚡ Instalación: ${measurePoints} puntos a ${formatCurrency(measurePricePerPoint)} c/u${
        Number(measureExtraBreaker) > 0
          ? ` + ${formatCurrency(measureExtraBreaker)} adicional`
          : ""
      }`;
    } else if (type === "sesiones") {
      calculatedVal = Math.round(calcSessionsTotal);
      note = `\n🐾 Plan: ${calcTotalSessions} sesiones (${measureSessionsPerWeek}/sem x ${measureWeeks} sem) a ${formatCurrency(measurePricePerSession)}/sesión`;
    }

    if (calculatedVal > 0) {
      setTotalAmount(calculatedVal.toString());
      setLaborCost(calculatedVal.toString());
      setWorkDescription((prev) => {
        const clean = (prev || "").trim();
        return clean ? `${clean}${note}` : note.trim();
      });
      setCalcMode("simple");
      showToast("¡Medidas calculadas y aplicadas al presupuesto!");
    } else {
      alert("Por favor ingresa valores válidos para calcular");
    }
  };

  const handleCopyPaymentInfo = (q) => {
    const bizName = business?.businessName || "Servicios Técnicos";
    const phone = business?.whatsappNumber || "";
    const displayPhone = phone.replace(/^57/, "");
    const advanceAmount = Math.round((Number(q.totalAmount) || 0) * 0.5);

    const text =
      `💳 *DATOS DE PAGO OFICIALES*\n` +
      `🏢 *${bizName}*\n\n` +
      `📲 *Nequi / Daviplata:* ${displayPhone}\n` +
      `🏦 *Bancolombia Ahorros:* 241-987654-12\n` +
      `👤 *Titular:* ${bizName}\n\n` +
      `📌 *Trabajo:* ${q.workDescription?.slice(0, 50)}...\n` +
      `💰 *Anticipo 50% requerido:* ${formatCurrency(advanceAmount)}\n\n` +
      `Por favor enviar el comprobante por este chat para confirmar la fecha e iniciar obra. ¡Gracias!`;

    navigator.clipboard.writeText(text);
    showToast("¡Datos de cobro (Nequi/Bancolombia) copiados para WhatsApp!");
  };

  const openReceiptModal = (q, defaultTab = "nuevo") => {
    setReceiptQuote(q);
    setReceiptModalTab(defaultTab);
    setReceiptNotes("");
    const payments = q.payments || [];
    const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const total = Number(q.totalAmount) || 0;
    const remaining = Math.max(0, total - totalPaid);

    if (payments.length === 0) {
      const half = Math.round(total * 0.5);
      setReceiptAmount(half > 0 ? half.toString() : "");
      setReceiptMethod("Nequi");
      setReceiptType("Anticipo 50% para inicio");
    } else if (remaining > 0) {
      setReceiptAmount(remaining.toString());
      setReceiptMethod("Nequi");
      setReceiptType("Liquidación final 100%");
    } else {
      setReceiptAmount("");
      setReceiptMethod("Nequi");
      setReceiptType("Abono adicional");
    }
  };

  const handleRegisterPayment = async (e) => {
    if (e) e.preventDefault();
    if (!receiptQuote) return;
    const amountNum = Number(receiptAmount);
    if (!amountNum || amountNum <= 0) {
      alert("Por favor ingresa un monto válido a abonar.");
      return;
    }

    setSavingPayment(true);
    try {
      const result = await addQuotePayment(business.id, receiptQuote.id, {
        amount: amountNum,
        paymentMethod: receiptMethod,
        receiptType: receiptType,
        notes: receiptNotes.trim(),
      });

      const newPayment = result.payment;
      const updatedPayments = [...(receiptQuote.payments || []), newPayment];
      const newTotalPaid = updatedPayments.reduce(
        (acc, p) => acc + (Number(p.amount) || 0),
        0
      );
      const isCompleted = newTotalPaid >= Number(receiptQuote.totalAmount);

      const updatedQuote = {
        ...receiptQuote,
        payments: updatedPayments,
        status: result.newStatus || receiptQuote.status,
      };
      setReceiptQuote(updatedQuote);

      if (isCompleted) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast("¡Trabajo 100% saldado y cobrado! 🎉");
      } else {
        showToast("¡Abono registrado exitosamente!");
      }

      // Descargar PDF oficial automáticamente
      try {
        generateReceiptPDF({
          business,
          quote: updatedQuote,
          payment: newPayment,
        });
      } catch (pdfErr) {
        console.error("Error generating receipt PDF:", pdfErr);
      }

      if (onQuotesUpdated) {
        onQuotesUpdated();
      }

      setReceiptModalTab("historial");
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("No se pudo registrar el abono");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!receiptQuote) return;
    if (!window.confirm("¿Seguro que deseas anular este comprobante de abono?")) return;

    try {
      await deleteQuotePayment(business.id, receiptQuote.id, paymentId);
      const updatedPayments = (receiptQuote.payments || []).filter(
        (p) => p.id !== paymentId
      );
      setReceiptQuote({
        ...receiptQuote,
        payments: updatedPayments,
      });
      showToast("Comprobante anulado");
      if (onQuotesUpdated) {
        onQuotesUpdated();
      }
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert("Error eliminando abono");
    }
  };

  const handleDownloadSingleReceipt = (payment) => {
    if (!receiptQuote || !payment) return;
    try {
      generateReceiptPDF({
        business,
        quote: receiptQuote,
        payment,
      });
      showToast("¡Recibo PDF descargado!");
    } catch (err) {
      console.error(err);
      alert("Error descargando recibo");
    }
  };

  const handleSendSingleReceiptWhatsApp = (payment) => {
    if (!receiptQuote || !payment) return;
    const cleanPhone = getCleanPhone(receiptQuote.clientPhone);
    const bizName = business?.businessName || "Servicios";
    const total = Number(receiptQuote.totalAmount) || 0;
    const allP = receiptQuote.payments || [];
    const pIdx = allP.findIndex((p) => p.id === payment.id);
    const cumulativePaid = (pIdx !== -1 ? allP.slice(0, pIdx + 1) : allP).reduce(
      (acc, p) => acc + (Number(p.amount) || 0),
      0
    );
    const balance = Math.max(0, total - cumulativePaid);

    const message =
      `🧾 *COMPROBANTE OFICIAL DE ABONO*\n` +
      `🏢 *${bizName}*\n\n` +
      `Hola *${receiptQuote.clientName}*, confirmamos el recibido a conformidad de:\n\n` +
      `💵 *Valor Abonado:* ${formatCurrency(payment.amount)}\n` +
      `💳 *Medio de Pago:* ${payment.paymentMethod}\n` +
      `📋 *Concepto:* ${payment.receiptType}\n` +
      (payment.notes ? `📝 *Nota:* ${payment.notes}\n` : "") +
      `🛠️ *Trabajo:* ${receiptQuote.workDescription}\n\n` +
      `📊 *Estado de Cuenta Actualizado:*\n` +
      `• Total Presupuestado: ${formatCurrency(total)}\n` +
      `• Total Abonado a la Fecha: ${formatCurrency(cumulativePaid)}\n` +
      `• Saldo Pendiente: ${
        balance === 0 ? "TOTALMENTE SALDADO ✓ (PAZ Y SALVO)" : formatCurrency(balance)
      }\n\n` +
      `¡Muchas gracias por tu pago y confianza en nuestro trabajo!`;

    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Construcción del mensaje de WhatsApp estandarizado
  const buildWhatsAppMessage = (client, work, amount) => {
    const bizName = business?.businessName || "Servicios Técnicos";
    return (
      `¡Hola *${client}*! 👋\n\n` +
      `Te comparto la cotización oficial de *${bizName}* para tu trabajo:\n\n` +
      `🛠️ *Alcance del Trabajo:*\n${work}\n\n` +
      `💰 *Valor Total Presupuestado:* ${formatCurrency(amount)}\n\n` +
      `🛡️ *Garantía:* 90 días sobre mano de obra con materiales certificados.\n` +
      `💳 *Formas de Pago:* Transferencia Bancolombia, Nequi, Daviplata o Efectivo (50% anticipo y 50% al finalizar).\n\n` +
      `¿Te gustaría que agendemos la fecha para iniciar? Quedo muy atento a tu confirmación.`
    );
  };

  const handleCreateAndSendQuote = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !workDescription.trim()) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const parsedAmount = effectiveTotal;
      const cleanPhone = getCleanPhone(clientPhone);

      const newQuoteData = {
        clientName: clientName.trim(),
        clientPhone: cleanPhone,
        workDescription: workDescription.trim(),
        totalAmount: parsedAmount,
        status: "pendiente",
        laborCost: Number(laborCost) || 0,
        materialsCost: Number(materialsCost) || 0,
        transportCost: Number(transportCost) || 0,
      };

      // 1. Guardar en Firestore subcolección `quotes`
      await addBusinessQuote(business.id, newQuoteData);

      // 2. Construir mensaje preformateado
      const message = buildWhatsAppMessage(
        clientName.trim(),
        workDescription.trim(),
        parsedAmount
      );

      // 3. Abrir WhatsApp API
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");

      // Resetear formulario y cerrar modal
      setClientName("");
      setClientPhone("");
      setWorkDescription("");
      setTotalAmount("");
      setLaborCost("");
      setMaterialsCost("");
      setTransportCost("");
      setIsModalOpen(false);

      if (onQuotesUpdated) {
        await onQuotesUpdated();
      }
    } catch (err) {
      console.error("Error creating quote:", err);
      alert("Error al guardar la cotización");
    } finally {
      setLoading(false);
    }
  };

  // Manejo de cambio de estado con celebración de Confetti si finaliza
  const handleStatusChange = async (quoteId, nextStatus) => {
    try {
      if (nextStatus === "finalizado") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#14b8a6", "#f59e0b", "#3b82f6"],
        });
      }

      await updateQuoteStatus(business.id, quoteId, nextStatus);
      if (onQuotesUpdated) {
        await onQuotesUpdated();
      }
    } catch (err) {
      console.error("Error updating quote status:", err);
    }
  };

  const handleDownloadPDF = (quote) => {
    try {
      generateQuotePDF({ business, quote });
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error al generar el documento PDF");
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm("¿Deseas eliminar este registro de cotización?")) {
      try {
        await deleteBusinessQuote(business.id, quoteId);
        if (onQuotesUpdated) {
          await onQuotesUpdated();
        }
      } catch (err) {
        console.error("Error deleting quote:", err);
      }
    }
  };

  const handleCopyMessage = (q) => {
    const message = buildWhatsAppMessage(q.clientName, q.workDescription, q.totalAmount);
    navigator.clipboard.writeText(message);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResendWhatsApp = (q) => {
    const cleanPhone = getCleanPhone(q.clientPhone);
    const message = buildWhatsAppMessage(
      q.clientName,
      q.workDescription,
      q.totalAmount
    );
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Contadores por estado
  const pendingQuotes = quotes.filter((q) => q.status === "pendiente");
  const inProgressQuotes = quotes.filter((q) => q.status === "en_progreso");
  const completedQuotes = quotes.filter((q) => q.status === "finalizado");

  const filteredQuotes =
    activeTabStatus === "todos"
      ? quotes
      : quotes.filter((q) => q.status === activeTabStatus);

  // Totales acumulados
  const totalCompletedEarnings = completedQuotes.reduce(
    (acc, q) => acc + (Number(q.totalAmount) || 0),
    0
  );
  const totalPendingEarnings = pendingQuotes.reduce(
    (acc, q) => acc + (Number(q.totalAmount) || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Resumen Financiero Móvil */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Cobrado & Cerrado
          </span>
          <span className="text-xl font-black text-slate-100 block">
            {formatCurrency(totalCompletedEarnings)}
          </span>
          <span className="text-[10px] text-emerald-400/80 font-medium block">
            {completedQuotes.length} trabajos finalizados
          </span>
        </div>

        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Por Cobrar / En Proceso
          </span>
          <span className="text-xl font-black text-slate-100 block">
            {formatCurrency(totalPendingEarnings)}
          </span>
          <span className="text-[10px] text-amber-400/80 font-medium block">
            {pendingQuotes.length + inProgressQuotes.length} en pipeline
          </span>
        </div>
      </div>

      {/* Botón Acción Principal */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-400 hover:to-emerald-300 active:scale-95 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-glow-teal transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Nueva Cotización / Orden</span>
        </button>
      </div>

      {/* Tabs Móviles estilo Pill para navegación rápida con el pulgar */}
      <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTabStatus("todos")}
          className={`flex-1 py-2 px-2 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTabStatus === "todos"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Todos ({quotes.length})
        </button>
        <button
          onClick={() => setActiveTabStatus("pendiente")}
          className={`flex-1 py-2 px-2 rounded-xl transition-all whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
            activeTabStatus === "pendiente"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Pendientes ({pendingQuotes.length})
        </button>
        <button
          onClick={() => setActiveTabStatus("en_progreso")}
          className={`flex-1 py-2 px-2 rounded-xl transition-all whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
            activeTabStatus === "en_progreso"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          En Obra ({inProgressQuotes.length})
        </button>
        <button
          onClick={() => setActiveTabStatus("finalizado")}
          className={`flex-1 py-2 px-2 rounded-xl transition-all whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
            activeTabStatus === "finalizado"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Cobrados ({completedQuotes.length})
        </button>
      </div>

      {/* Lista de Trabajos y Cotizaciones con Estados de 1-toque y PDF */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            No hay cotizaciones registradas en este estado
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Crea una cotización para descargar el PDF membretado y enviársela directo al WhatsApp de tu cliente.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear Cotización Ahora
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((q) => {
            const isPending = q.status === "pendiente";
            const isInProgress = q.status === "en_progreso";
            const isFinalized = q.status === "finalizado";

            return (
              <div
                key={q.id}
                className={`bg-slate-900/90 border rounded-2xl p-4 space-y-3 transition-all ${
                  isPending
                    ? "border-amber-500/30 hover:border-amber-500/50"
                    : isInProgress
                    ? "border-blue-500/30 hover:border-blue-500/50"
                    : "border-emerald-500/30 hover:border-emerald-500/50"
                }`}
              >
                {/* Cabecera del trabajo */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                      {q.clientName}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isPending
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : isInProgress
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isPending
                          ? "🟡 Pendiente"
                          : isInProgress
                          ? "🔵 En Obra"
                          : "🟢 Cobrado"}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      +{q.clientPhone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 block">
                      {formatCurrency(q.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>

                {/* Detalle del trabajo */}
                <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {q.workDescription}
                </p>

                {/* Resumen Financiero y Progreso de Cobro / Abonos */}
                {(() => {
                  const payments = q.payments || [];
                  const totalPaid = payments.reduce(
                    (acc, p) => acc + (Number(p.amount) || 0),
                    0
                  );
                  const total = Number(q.totalAmount) || 0;
                  const balance = Math.max(0, total - totalPaid);
                  const percent =
                    total > 0
                      ? Math.min(100, Math.round((totalPaid / total) * 100))
                      : 0;
                  const isFullyPaid = totalPaid >= total && total > 0;

                  return (
                    <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold text-slate-300">
                            {payments.length === 0
                              ? "Sin abonos registrados"
                              : `Abonado: ${formatCurrency(totalPaid)} (${percent}%)`}
                          </span>
                        </div>
                        <span
                          className={`font-black ${
                            isFullyPaid ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {isFullyPaid
                            ? "Paz y Salvo ✓"
                            : `Saldo: ${formatCurrency(balance)}`}
                        </span>
                      </div>

                      {/* Barra de progreso visual */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full transition-all duration-300 ${
                            isFullyPaid ? "bg-emerald-500" : "bg-emerald-400"
                          }`}
                        />
                      </div>

                      {payments.length > 0 && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <button
                            type="button"
                            onClick={() => openReceiptModal(q, "historial")}
                            className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <History className="w-3 h-3" />
                            <span>
                              Historial ({payments.length}{" "}
                              {payments.length === 1 ? "recibo" : "recibos"})
                            </span>
                          </button>
                          <span className="text-slate-500">
                            Último:{" "}
                            {new Date(
                              payments[payments.length - 1].createdAt
                            ).toLocaleDateString("es-CO", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Acciones Rápidas: PDF, WhatsApp y 1-toque de estado */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Selector de Estado con un toque */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 mr-1">Mover a:</span>
                    {!isPending && (
                      <button
                        onClick={() => handleStatusChange(q.id, "pendiente")}
                        title="Marcar como Pendiente"
                        className="py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold transition-colors"
                      >
                        🟡 Pendiente
                      </button>
                    )}
                    {!isInProgress && (
                      <button
                        onClick={() => handleStatusChange(q.id, "en_progreso")}
                        title="Marcar como En Obra"
                        className="py-1 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold transition-colors"
                      >
                        🔵 En Obra
                      </button>
                    )}
                    {!isFinalized && (
                      <button
                        onClick={() => handleStatusChange(q.id, "finalizado")}
                        title="Marcar como Cobrado (Celebrar)"
                        className="py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold transition-colors flex items-center gap-1"
                      >
                        <span>🟢 Cobrado</span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      </button>
                    )}
                  </div>

                  {/* Acciones de PDF, WhatsApp, Copiar y Borrar */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Botón Recibo de Abono / Anticipo */}
                    <button
                      onClick={() =>
                        openReceiptModal(
                          q,
                          (q.payments?.length || 0) > 0 ? "historial" : "nuevo"
                        )
                      }
                      title="Gestión de Abonos y Recibos de Caja (PDF/WhatsApp)"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Recibos</span>
                      {(q.payments?.length || 0) > 0 && (
                        <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                          {q.payments.length}
                        </span>
                      )}
                    </button>

                    {/* Botón Copiar Datos de Pago Nequi/Bancolombia */}
                    <button
                      onClick={() => handleCopyPaymentInfo(q)}
                      title="Copiar datos de Nequi / Bancolombia para cobrar anticipo"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">Cobro</span>
                    </button>

                    {/* Botón Descargar PDF Oficial */}
                    <button
                      onClick={() => handleDownloadPDF(q)}
                      title="Descargar PDF membretado oficial"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5 text-brand-400" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Copiar texto */}
                    <button
                      onClick={() => handleCopyMessage(q)}
                      title="Copiar texto de cotización"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {copiedId === q.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Reenviar WhatsApp */}
                    <button
                      onClick={() => handleResendWhatsApp(q)}
                      title="Enviar o chatear por WhatsApp"
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    {/* Borrar */}
                    <button
                      onClick={() => handleDeleteQuote(q.id)}
                      title="Eliminar registro"
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
          MODAL: NUEVA COTIZACIÓN CON CALCULADORA Y GENERADOR DE PDF
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Nueva Cotización Profesional
                </h3>
                <p className="text-xs text-slate-400">
                  Calcula el presupuesto, genera el PDF oficial y envía por WhatsApp
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAndSendQuote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Gómez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Celular / WhatsApp del Cliente *
                </label>
                <input
                  type="tel"
                  placeholder="Ej: 3001234567 o 573001234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción breve del trabajo *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Instalación de 8 tomas dobles, cambio de breakers y balanceo de tablero."
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Selector de Modo de Presupuesto: Simple vs Desglose vs Medidas */}
              <div className="bg-slate-950/70 p-1 rounded-xl border border-slate-800 flex gap-1">
                <button
                  type="button"
                  onClick={() => setCalcMode("simple")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    calcMode === "simple"
                      ? "bg-slate-800 text-slate-100 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Monto Fijo
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("desglose")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    calcMode === "desglose"
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Desglose</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("medidas")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    calcMode === "medidas"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Por Medidas</span>
                </button>
              </div>

              {calcMode === "simple" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Precio Total Acordado (COP/USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      placeholder="Ej: 280000"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      required
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {calcMode === "desglose" && (
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-3.5 space-y-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Mano de Obra
                      </label>
                      <input
                        type="number"
                        placeholder="180000"
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Materiales
                      </label>
                      <input
                        type="number"
                        placeholder="80000"
                        value={materialsCost}
                        onChange={(e) => setMaterialsCost(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Viáticos/Transp.
                      </label>
                      <input
                        type="number"
                        placeholder="20000"
                        value={transportCost}
                        onChange={(e) => setTransportCost(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                    <span className="text-xs text-slate-400">Total Calculado:</span>
                    <span className="text-sm font-black text-emerald-400">
                      {formatCurrency(effectiveTotal)}
                    </span>
                  </div>
                </div>
              )}

              {calcMode === "medidas" && (
                <div className="bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-3.5 space-y-3">
                  {/* Selector de tipo de medición */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700/60 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setMeasureType("area")}
                      className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        measureType === "area"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Ruler className="w-3 h-3" />
                      <span>Área (m²)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeasureType("puntos")}
                      className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        measureType === "puntos"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>Puntos/Tomas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeasureType("sesiones")}
                      className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        measureType === "sesiones"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Sesiones/Plan</span>
                    </button>
                  </div>

                  {/* 1. Modo Área m² (Pintura, Drywall, Enchape) */}
                  {measureType === "area" && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Ancho (m)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Ej: 4.5"
                            value={measureWidth}
                            onChange={(e) => setMeasureWidth(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Alto / Largo (m)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Ej: 2.6"
                            value={measureHeight}
                            onChange={(e) => setMeasureHeight(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Valor por m²
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 18000"
                            value={measurePricePerM2}
                            onChange={(e) => setMeasurePricePerM2(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Superficie: {calcAreaM2.toFixed(1)} m²
                          </span>
                          <span className="text-sm font-black text-emerald-400">
                            {formatCurrency(calcAreaTotal)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => applyMeasureCalculation("area")}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-transform active:scale-95"
                        >
                          ✓ Usar en Cotización
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Modo Puntos Eléctricos (Tomas, Luminarias) */}
                  {measureType === "puntos" && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Cant. Puntos
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 8"
                            value={measurePoints}
                            onChange={(e) => setMeasurePoints(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Precio x Punto
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 25000"
                            value={measurePricePerPoint}
                            onChange={(e) =>
                              setMeasurePricePerPoint(e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Tablero/Extra
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 50000"
                            value={measureExtraBreaker}
                            onChange={(e) =>
                              setMeasureExtraBreaker(e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Total {measurePoints || 0} salidas/puntos
                          </span>
                          <span className="text-sm font-black text-emerald-400">
                            {formatCurrency(calcPointsTotal)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => applyMeasureCalculation("puntos")}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-transform active:scale-95"
                        >
                          ✓ Usar en Cotización
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Modo Sesiones / Tiempo (Paseo de perros, Clases, Limpieza) */}
                  {measureType === "sesiones" && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Días x Semana
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 3"
                            value={measureSessionsPerWeek}
                            onChange={(e) =>
                              setMeasureSessionsPerWeek(e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Semanas
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 4"
                            value={measureWeeks}
                            onChange={(e) => setMeasureWeeks(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Tarifa x Sesión
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 15000"
                            value={measurePricePerSession}
                            onChange={(e) =>
                              setMeasurePricePerSession(e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Total {calcTotalSessions} sesiones pactadas
                          </span>
                          <span className="text-sm font-black text-emerald-400">
                            {formatCurrency(calcSessionsTotal)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => applyMeasureCalculation("sesiones")}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-transform active:scale-95"
                        >
                          ✓ Usar en Cotización
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vista previa del mensaje */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Vista previa de la plantilla:
                </span>
                <p className="text-[11px] text-emerald-400/90 italic font-mono leading-tight">
                  {clientName
                    ? `¡Hola ${clientName}! 👋 Te comparto la cotización de ${business?.businessName || 'nuestro servicio'}: ${formatCurrency(effectiveTotal)}...`
                    : "Ingresa los datos para ver la plantilla de WhatsApp..."}
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar por WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GESTIÓN DE ABONOS Y HISTORIAL DE RECIBOS DE CAJA
          ========================================================================= */}
      {receiptQuote && (() => {
        const payments = receiptQuote.payments || [];
        const totalAmount = Number(receiptQuote.totalAmount) || 0;
        const totalPaid = payments.reduce(
          (acc, p) => acc + (Number(p.amount) || 0),
          0
        );
        const remainingBalance = Math.max(0, totalAmount - totalPaid);
        const percentPaid =
          totalAmount > 0
            ? Math.min(100, Math.round((totalPaid / totalAmount) * 100))
            : 0;
        const isFullyPaid = totalPaid >= totalAmount && totalAmount > 0;

        const currentInputAmount = Number(receiptAmount) || 0;
        const projectedRemaining = Math.max(0, remainingBalance - currentInputAmount);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <span>Control de Abonos & Recibos de Caja</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Historial de pagos parciales, anticipos y constancias oficiales en PDF
                  </p>
                </div>
                <button
                  onClick={() => setReceiptQuote(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Resumen Financiero del Trabajo */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Cliente & Proyecto
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 leading-tight">
                      {receiptQuote.clientName}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {receiptQuote.workDescription}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Total Cotizado
                    </span>
                    <span className="text-sm font-black text-slate-100">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Métricas de Abono */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Abonado a la Fecha
                    </span>
                    <span className="text-xs font-black text-emerald-400 block">
                      {formatCurrency(totalPaid)} ({percentPaid}%)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Saldo Restante
                    </span>
                    <span
                      className={`text-xs font-black block ${
                        isFullyPaid ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {isFullyPaid ? "Paz y Salvo ✓" : formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentPaid}%` }}
                    className={`h-full transition-all duration-300 ${
                      isFullyPaid ? "bg-emerald-500" : "bg-emerald-400"
                    }`}
                  />
                </div>
              </div>

              {/* Selector de Pestañas: Registrar vs Historial */}
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setReceiptModalTab("nuevo")}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    receiptModalTab === "nuevo"
                      ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Registrar Abono</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModalTab("historial")}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    receiptModalTab === "historial"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Historial ({payments.length})</span>
                </button>
              </div>

              {/* ================= PESTAÑA: REGISTRAR NUEVO ABONO ================= */}
              {receiptModalTab === "nuevo" && (
                <form onSubmit={handleRegisterPayment} className="space-y-3">
                  {/* Botones de sugerencia rápida */}
                  {remainingBalance > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400 text-[10px]">Sugeridos:</span>
                      <button
                        type="button"
                        onClick={() => setReceiptAmount(remainingBalance.toString())}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-bold"
                      >
                        Saldar 100% ({formatCurrency(remainingBalance)})
                      </button>
                      {payments.length === 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setReceiptAmount(Math.round(totalAmount * 0.5).toString())
                          }
                          className="bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-lg font-bold"
                        >
                          50% Anticipo ({formatCurrency(Math.round(totalAmount * 0.5))})
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Monto a Recibir / Abonar (COP) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        placeholder="Ej: 250000"
                        value={receiptAmount}
                        onChange={(e) => setReceiptAmount(e.target.value)}
                        required
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Medio de Pago
                      </label>
                      <select
                        value={receiptMethod}
                        onChange={(e) => setReceiptMethod(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100"
                      >
                        <option value="Nequi">📱 Nequi</option>
                        <option value="Daviplata">🔴 Daviplata</option>
                        <option value="Bancolombia">🏦 Bancolombia</option>
                        <option value="Efectivo en mano">💵 Efectivo en mano</option>
                        <option value="Transferencia / Otro">💳 Otra Transferencia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Concepto
                      </label>
                      <select
                        value={receiptType}
                        onChange={(e) => setReceiptType(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100"
                      >
                        <option value="Anticipo 50% para inicio">Anticipo de inicio</option>
                        <option value="Abono parcial de avance">Abono parcial / avance</option>
                        <option value="Liquidación final 100%">Liquidación final 100%</option>
                        <option value="Compra de materiales">Compra de materiales</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                      Nota o Comprobante Interno (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Aprobación Nequi #84920"
                      value={receiptNotes}
                      onChange={(e) => setReceiptNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
                    />
                  </div>

                  {/* Saldo proyectado */}
                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-300">Nuevo saldo proyectado:</span>
                    <span className="font-black text-emerald-400">
                      {projectedRemaining === 0
                        ? "PAZ Y SALVO (100% Cubierto) ✓"
                        : formatCurrency(projectedRemaining)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPayment || !currentInputAmount}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {savingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando abono...</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4" />
                        <span>Registrar Abono y Descargar PDF</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ================= PESTAÑA: HISTORIAL DE ABONOS ================= */}
              {receiptModalTab === "historial" && (
                <div className="space-y-2.5">
                  {payments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 space-y-2">
                      <Receipt className="w-8 h-8 text-slate-500 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-300">
                        No hay abonos registrados todavía
                      </h4>
                      <p className="text-xs text-slate-500">
                        Ve a la pestaña &quot;+ Registrar Abono&quot; para asentar el primer anticipo del cliente.
                      </p>
                      <button
                        type="button"
                        onClick={() => setReceiptModalTab("nuevo")}
                        className="bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Registrar Primer Anticipo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                  {p.receiptNumber}
                                </span>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
                                  {p.receiptType}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {new Date(p.createdAt).toLocaleDateString("es-CO", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-400 block">
                                {formatCurrency(p.amount)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {p.paymentMethod}
                              </span>
                            </div>
                          </div>

                          {p.notes && (
                            <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 italic">
                              &ldquo;{p.notes}&rdquo;
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                            <button
                              type="button"
                              onClick={() => handleDeletePayment(p.id)}
                              className="text-red-400 hover:text-red-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                              title="Anular comprobante"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Anular</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDownloadSingleReceipt(p)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="Descargar PDF de este abono"
                              >
                                <FileDown className="w-3.5 h-3.5 text-brand-400" />
                                <span>PDF</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendSingleReceiptWhatsApp(p)}
                                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Enviar constancia por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <span>✓ {toastMessage}</span>
        </div>
      )}
    </div>
  );
}
