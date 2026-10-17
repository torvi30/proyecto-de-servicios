import jsPDF from "jspdf";

/**
 * Genera y descarga un PDF profesional con membrete oficial,
 * desglose de mano de obra y materiales, términos de garantía y datos de pago.
 */
export function generateQuotePDF({ business, quote }) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const isMedical =
    quote?.isMedicalQuote ||
    Boolean(quote?.diagnosis) ||
    Boolean(quote?.patientIdNumber) ||
    business?.category === "ortopedia" ||
    business?.category === "salud" ||
    (business?.categoryLabel || "").toLowerCase().includes("ortopedia") ||
    (business?.categoryLabel || "").toLowerCase().includes("médic");

  const primaryColor = isMedical ? [13, 148, 136] : [13, 148, 136]; // Teal #0d9488 clínico / profesional
  const darkColor = [15, 23, 42];      // Slate #0f172a
  const slateColor = [100, 116, 139];  // Slate #64748b
  const lightBg = [248, 250, 252];     // Slate #f8fafc

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // --- 1. CABECERA & MEMBRETE ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 6, "F");

  // Fondo sutil de encabezado
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, 12, contentWidth, 32, 3, 3, "F");

  // Nombre del Negocio
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...darkColor);
  const bizName = (business?.businessName || (isMedical ? "Centro Ortopédico Especializado" : "Servicios Profesionales")).toUpperCase();
  doc.text(bizName, margin + 6, 23);

  // Categoría & Ciudad
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  const categoryText = business?.categoryLabel || business?.category || (isMedical ? "ORTOPEDIA & BIOMECÁNICA" : "TÉCNICO INDEPENDIENTE");
  doc.text(categoryText.toUpperCase(), margin + 6, 29);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...slateColor);
  doc.text(`Contacto / Citas: +${business?.whatsappNumber || "N/A"}`, margin + 6, 35);
  doc.text(`Sede / Cobertura: ${business?.city || "Atención Especializada"}`, margin + 6, 40);

  // Cuadro con Número de Cotización / Orden Clínica
  const quoteBoxX = pageWidth - margin - 52;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(quoteBoxX, 15, 48, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateColor);
  doc.text(isMedical ? "ORDEN Y PRESUPUESTO" : "COTIZACIÓN OFICIAL", quoteBoxX + 24, 21, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...darkColor);
  const prefix = isMedical ? "ORT" : "COT";
  const quoteNumber = `${prefix}-${(quote?.id || "001").slice(-5).toUpperCase()}`;
  doc.text(quoteNumber, quoteBoxX + 24, 27, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateColor);
  const dateStr = new Date(quote?.createdAt || Date.now()).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.text(`Emisión: ${dateStr}`, quoteBoxX + 24, 34, { align: "center" });

  // --- 2. INFORMACIÓN DEL PACIENTE / CLIENTE ---
  let currentY = 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkColor);
  doc.text(isMedical ? "FICHA DEL PACIENTE & DATOS TÉCNICOS" : "DATOS DEL CLIENTE", margin, currentY);

  currentY += 4;
  const clientBoxHeight = isMedical ? 28 : 18;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, contentWidth, clientBoxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  const clientLabel = isMedical ? "Paciente:" : "Cliente:";
  doc.text(`${clientLabel} ${quote?.clientName || "Paciente General"}`, margin + 5, currentY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slateColor);

  if (isMedical) {
    if (quote?.patientIdNumber) {
      doc.text(`Identificación: ${quote.patientIdNumber}`, margin + 5, currentY + 12);
    } else {
      doc.text(`Teléfono / WhatsApp: +${quote?.clientPhone || "N/A"}`, margin + 5, currentY + 12);
    }

    if (quote?.attendingDoctor) {
      doc.text(`Especialista Tratante: ${quote.attendingDoctor}`, margin + 5, currentY + 17.5);
    }

    if (quote?.diagnosis) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      const diagText = `Indicación / Diagnóstico: ${quote.diagnosis}`;
      const splitDiag = doc.splitTextToSize(diagText, contentWidth - 10);
      doc.text(splitDiag[0], margin + 5, currentY + 23);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slateColor);
    }

    doc.text(`Validez Presupuesto: 15 días`, pageWidth - margin - 5, currentY + 6.5, { align: "right" });
    doc.text(`Estado: ${(quote?.status || "Pendiente").toUpperCase()}`, pageWidth - margin - 5, currentY + 12, { align: "right" });
    if (quote?.rentalPeriod) {
      doc.text(`Período Alquiler: ${quote.rentalPeriod}`, pageWidth - margin - 5, currentY + 17.5, { align: "right" });
    }
  } else {
    doc.text(`Teléfono / WhatsApp: +${quote?.clientPhone || "N/A"}`, margin + 5, currentY + 13);
    doc.text(`Validez de Oferta: 15 días calendario`, pageWidth - margin - 5, currentY + 7, {
      align: "right",
    });
    doc.text(`Estado: ${(quote?.status || "Pendiente").toUpperCase()}`, pageWidth - margin - 5, currentY + 13, {
      align: "right",
    });
  }

  // --- 3. TABLA DE DETALLE DE SERVICIOS / DISPOSITIVOS ---
  currentY += clientBoxHeight + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...darkColor);
  doc.text(
    isMedical
      ? "DESGLOSE DE PROCEDIMIENTO, ÓRTESIS & EQUIPOS"
      : "ALCANCE DEL TRABAJO Y PRESUPUESTO",
    margin,
    currentY
  );

  currentY += 4;
  // Encabezado de tabla
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    isMedical
      ? "CONCEPTO CLÍNICO / DESCRIPCIÓN TÉCNICA DEL DISPOSITIVO"
      : "ÍTEM / DESCRIPCIÓN DEL SERVICIO",
    margin + 4,
    currentY + 5.5
  );
  doc.text("VALOR ESTIMADO", pageWidth - margin - 4, currentY + 5.5, { align: "right" });

  currentY += 8;

  // Fila del trabajo
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);

  // Dividir texto largo de descripción
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);

  const workDesc =
    quote?.workDescription ||
    (isMedical
      ? "Suministro, moldeo y adaptación de dispositivo órtico según valoración clínica."
      : "Servicio técnico especializado según requerimiento acordado.");
  const splitDesc = doc.splitTextToSize(workDesc, contentWidth - 45);
  const rowHeight = Math.max(22, splitDesc.length * 4.8 + 11);

  doc.rect(margin, currentY, contentWidth, rowHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.text(
    isMedical
      ? "1. Dispositivo / Procedimiento Especializado"
      : "1. Mano de Obra y Ejecución Especializada",
    margin + 4,
    currentY + 6
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slateColor);
  doc.text(splitDesc, margin + 4, currentY + 11.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(formatMoney(quote?.totalAmount), pageWidth - margin - 4, currentY + 8, {
    align: "right",
  });

  currentY += rowHeight;

  // --- 4. TOTALES ---
  currentY += 3;
  const totalBoxWidth = 72;
  const totalBoxX = pageWidth - margin - totalBoxWidth;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(totalBoxX, currentY, totalBoxWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slateColor);
  doc.text("Subtotal:", totalBoxX + 6, currentY + 7);
  doc.text(formatMoney(quote?.totalAmount), totalBoxX + totalBoxWidth - 6, currentY + 7, {
    align: "right",
  });

  doc.text("IVA / Impuestos:", totalBoxX + 6, currentY + 12);
  doc.text("Incluido ($0)", totalBoxX + totalBoxWidth - 6, currentY + 12, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text("TOTAL NETO:", totalBoxX + 6, currentY + 18);
  doc.text(formatMoney(quote?.totalAmount), totalBoxX + totalBoxWidth - 6, currentY + 18, {
    align: "right",
  });

  // --- 5. TÉRMINOS, CONDICIONES & GARANTÍA BIOMÉDICA ---
  currentY += 27;
  const termsBoxHeight = isMedical && quote?.clinicalNotes ? 40 : 32;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, termsBoxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text(
    isMedical
      ? "INDICACIONES TÉCNICAS, GARANTÍA Y CONDICIONES"
      : "TÉRMINOS Y FORMAS DE PAGO",
    margin + 5,
    currentY + 5.5
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(...slateColor);

  const medicalTerms = [
    quote?.clinicalNotes ? `• Cuidado Clínico: ${quote.clinicalNotes}` : null,
    "• Materiales grado médico certificados por INVIMA. Incluye 1 control de ajuste y adaptación anatómica sin costo.",
    "• Equipos en Alquiler: Entregados con protocolo estricto de higienización y desinfección grado clínico.",
    "• Medios de Pago Habilitados: Transferencia Bancolombia, Nequi, Tarjetas Débito/Crédito o Efectivo en sede.",
    "• Ante cualquier molestia, enrojecimiento o dolor atípico, suspenda el uso y contacte de inmediato al especialista.",
  ].filter(Boolean);

  const standardTerms = [
    "• Anticipo del 50% al momento de iniciar la obra / compra de materiales, y 50% al finalizar a conformidad.",
    "• Medios de Pago Habilitados: Transferencia Bancolombia, Nequi, Daviplata o Efectivo en mano.",
    "• Garantía Oficial de 90 días sobre mano de obra ejecutada con materiales certificados de primera calidad.",
    "• Cualquier trabajo o imprevisto adicional no contemplado será cotizado previamente para su autorización.",
  ];

  const termsToUse = isMedical ? medicalTerms : standardTerms;
  let termY = currentY + 11;
  termsToUse.slice(0, 4).forEach((t) => {
    const splitT = doc.splitTextToSize(t, contentWidth - 10);
    doc.text(splitT[0], margin + 5, termY);
    termY += 4.5;
  });

  // --- 6. FIRMAS ---
  currentY += termsBoxHeight + 8;
  const colWidth = (contentWidth - 15) / 2;

  // Firma Profesional / Especialista
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 10, currentY + 16, margin + colWidth - 10, currentY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  const signTitle = isMedical
    ? (quote?.attendingDoctor || business?.businessName || "Especialista Ortopédico")
    : (business?.businessName || "Técnico Responsable");
  doc.text(signTitle, margin + colWidth / 2, currentY + 20.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateColor);
  doc.text(
    isMedical ? "Especialista Clínico / R.M. o T.P." : "Prestador / Técnico Autorizado",
    margin + colWidth / 2,
    currentY + 24.5,
    { align: "center" }
  );

  // Firma Cliente / Paciente
  const col2X = margin + colWidth + 15;
  doc.line(col2X + 10, currentY + 16, col2X + colWidth - 10, currentY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text(quote?.clientName || (isMedical ? "Paciente" : "Cliente"), col2X + colWidth / 2, currentY + 20.5, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateColor);
  doc.text(
    isMedical ? "Firma del Paciente o Acudiente" : "Firma de Aceptación y Conformidad",
    col2X + colWidth / 2,
    currentY + 24.5,
    { align: "center" }
  );

  // --- 7. PIE DE PÁGINA ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateColor);
  doc.text(
    `Documento generado con VitrinaPro • Plataforma de Cotizaciones y Servicios Profesionales • ${new Date().getFullYear()}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  // Descargar archivo
  const fileName = `Cotizacion_${(quote?.clientName || "Cliente").replace(/\s+/g, "_")}_${quoteNumber}.pdf`;
  doc.save(fileName);
  return fileName;
}

/**
 * Genera y descarga un Comprobante de Pago / Recibo de Caja oficial
 * ideal para constatar el pago del 50% de anticipo o liquidación final.
 */
export function generateReceiptPDF({
  business,
  quote,
  payment,
  amountPaid,
  paymentMethod = "Nequi / Transferencia",
  receiptType = "Anticipo 50% para inicio",
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const emeraldColor = [16, 185, 129]; // Emerald #10b981
  const darkColor = [15, 23, 42];      // Slate #0f172a
  const slateColor = [100, 116, 139];  // Slate #64748b
  const lightBg = [248, 250, 252];     // Slate #f8fafc

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const total = Number(quote?.totalAmount) || 0;
  const currentPaid = payment
    ? Number(payment.amount) || 0
    : Number(amountPaid) || Math.round(total * 0.5);
  const effectiveMethod = payment?.paymentMethod || paymentMethod;
  const effectiveConcept = payment?.receiptType || receiptType;
  const effectiveNotes = payment?.notes || "";
  const paymentDate = payment?.createdAt ? new Date(payment.createdAt) : new Date();

  // Calcular acumulado histórico
  const allPayments = quote?.payments || [];
  let cumulativePaid = 0;
  if (allPayments.length > 0) {
    if (payment) {
      const pIdx = allPayments.findIndex((p) => p.id === payment.id);
      if (pIdx !== -1) {
        cumulativePaid = allPayments
          .slice(0, pIdx + 1)
          .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      } else {
        cumulativePaid =
          allPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) +
          currentPaid;
      }
    } else {
      cumulativePaid =
        allPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) +
        currentPaid;
    }
  } else {
    cumulativePaid = currentPaid;
  }

  const balance = Math.max(0, total - cumulativePaid);
  const percentPaid = total > 0 ? Math.min(100, Math.round((cumulativePaid / total) * 100)) : 0;

  // 1. Barra superior
  doc.setFillColor(...emeraldColor);
  doc.rect(0, 0, pageWidth, 6, "F");

  // Encabezado
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, 12, contentWidth, 32, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...darkColor);
  const bizName = (business?.businessName || "Servicios Profesionales").toUpperCase();
  doc.text(bizName, margin + 6, 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...emeraldColor);
  const categoryText = business?.categoryLabel || business?.category || "TÉCNICO INDEPENDIENTE";
  doc.text(categoryText.toUpperCase(), margin + 6, 29);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slateColor);
  doc.text(`Contacto / WhatsApp: +${business?.whatsappNumber || "N/A"}`, margin + 6, 35);
  doc.text(`Ciudad / Cobertura: ${business?.city || "A Domicilio"}`, margin + 6, 40);

  // Cuadro Número de Recibo
  const boxX = pageWidth - margin - 52;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(209, 250, 229);
  doc.roundedRect(boxX, 16, 46, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...emeraldColor);
  doc.text("RECIBO DE CAJA / ABONO", boxX + 23, 22, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  const receiptNumber =
    payment?.receiptNumber || `REC-${(quote?.id || "001").slice(-5).toUpperCase()}`;
  doc.text(receiptNumber, boxX + 23, 28, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateColor);
  const dateStr = paymentDate.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.text(`Fecha: ${dateStr}`, boxX + 23, 35, { align: "center" });

  // 2. Cliente y Concepto
  let currentY = 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text("DATOS DEL CLIENTE & SERVICIO", margin, currentY);

  currentY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text("Recibido de:", margin + 5, currentY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(quote?.clientName || "Cliente", margin + 30, currentY + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Teléfono / WhatsApp:", margin + 5, currentY + 13);
  doc.setFont("helvetica", "normal");
  doc.text(`+${quote?.clientPhone || "N/A"}`, margin + 44, currentY + 13);

  doc.setFont("helvetica", "bold");
  doc.text("Por concepto de:", margin + 5, currentY + 19);
  doc.setFont("helvetica", "normal");
  const descShort = (quote?.workDescription || "Servicios contratados").slice(0, 75);
  doc.text(descShort, margin + 36, currentY + 19);

  // 3. Montos y Estado de Cuenta
  currentY += 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text("ESTADO DE CUENTA Y LIQUIDACIÓN DEL ABONO", margin, currentY);

  currentY += 4;
  const boxHeight = effectiveNotes ? 64 : 58;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text("Valor Total Presupuestado (Cotización):", margin + 6, currentY + 8);
  doc.setFont("helvetica", "bold");
  doc.text(formatMoney(total), margin + contentWidth - 6, currentY + 8, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text("Medio de Pago Empleado:", margin + 6, currentY + 15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateColor);
  doc.text(effectiveMethod, margin + contentWidth - 6, currentY + 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkColor);
  doc.text("Concepto del Abono:", margin + 6, currentY + 22);
  doc.setFont("helvetica", "bold");
  doc.text(effectiveConcept, margin + contentWidth - 6, currentY + 22, { align: "right" });

  // Cuadro destacado de ESTE PAGO
  doc.setFillColor(209, 250, 229);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(margin + 4, currentY + 27, contentWidth - 8, 10, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(6, 78, 59);
  doc.text("ESTE ABONO / RECIBIDO A SATISFACCIÓN:", margin + 8, currentY + 33.5);
  doc.setFontSize(11);
  doc.text(formatMoney(currentPaid), margin + contentWidth - 8, currentY + 33.5, { align: "right" });

  // Total acumulado pagado
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...slateColor);
  doc.text(`Total Acumulado Pagado a la Fecha (${percentPaid}%):`, margin + 6, currentY + 43);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...emeraldColor);
  doc.text(formatMoney(cumulativePaid), margin + contentWidth - 6, currentY + 43, { align: "right" });

  // Saldo pendiente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(balance === 0 ? 16 : 180, balance === 0 ? 185 : 83, balance === 0 ? 129 : 9);
  doc.text(
    balance === 0
      ? "ESTADO: CUENTA TOTALMENTE SALDADA (PAZ Y SALVO ✓)"
      : "SALDO PENDIENTE POR PAGAR:",
    margin + 6,
    currentY + 51
  );
  if (balance > 0) {
    doc.text(formatMoney(balance), margin + contentWidth - 6, currentY + 51, { align: "right" });
  }

  if (effectiveNotes) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.text(`Nota: ${effectiveNotes}`, margin + 6, currentY + 59);
  }

  // 4. Cláusula de validez
  currentY += 62;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text("CONSTANCIA DE VALIDEZ", margin + 5, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateColor);
  doc.text(
    "El presente recibo certifica que el prestador del servicio ha recibido a conformidad la suma antes indicada.",
    margin + 5,
    currentY + 10.5
  );
  doc.text(
    "El saldo restante, de aplicar, será cancelado una vez entregado el trabajo acordado a satisfacción del cliente.",
    margin + 5,
    currentY + 14.5
  );

  // 5. Firmas
  currentY += 28;
  const colWidth = (contentWidth - 15) / 2;

  // Firma Receptor
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 10, currentY + 16, margin + colWidth - 10, currentY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text(business?.businessName || "Técnico Responsable", margin + colWidth / 2, currentY + 21, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateColor);
  doc.text("Firma de Quien Recibe / Prestador", margin + colWidth / 2, currentY + 25, {
    align: "center",
  });

  // Firma Entregó
  const col2X = margin + colWidth + 15;
  doc.line(col2X + 10, currentY + 16, col2X + colWidth - 10, currentY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text(quote?.clientName || "Cliente", col2X + colWidth / 2, currentY + 21, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateColor);
  doc.text("Firma de Quien Entrega / Pagador", col2X + colWidth / 2, currentY + 25, {
    align: "center",
  });

  // 6. Pie de Página
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateColor);
  doc.text(
    `Comprobante emitido con VitrinaPro • Control de Cobros y Anticipos Profesionales • ${new Date().getFullYear()}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  const fileName = `Recibo_${(quote?.clientName || "Cliente").replace(/\s+/g, "_")}_${receiptNumber}.pdf`;
  doc.save(fileName);
  return fileName;
}
