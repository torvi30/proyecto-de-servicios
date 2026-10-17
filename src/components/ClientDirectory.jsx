import React, { useState } from "react";
import {
  Users,
  Phone,
  MessageCircle,
  Search,
  Plus,
  DollarSign,
  Download,
  AlertCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";

export default function ClientDirectory({
  business,
  quotes = [],
  onNewQuoteForClient,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos"); // 'todos' | 'con_saldo' | 'al_dia'

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const getCleanPhone = (phone) => {
    let clean = (phone || "").replace(/\D/g, "");
    if (clean.length === 10 && clean.startsWith("3")) {
      clean = "57" + clean;
    }
    return clean;
  };

  // Agrupar cotizaciones por cliente (nombre o teléfono) calculando facturación, abonos y saldo
  const clientMap = {};
  quotes.forEach((q) => {
    const key = q.clientPhone || q.clientName;
    if (!clientMap[key]) {
      clientMap[key] = {
        name: q.clientName,
        phone: q.clientPhone,
        totalBilled: 0,
        totalPaid: 0,
        pendingBalance: 0,
        jobsCount: 0,
        lastJobDate: q.createdAt,
        lastJobDescription: q.workDescription,
        status: q.status,
        patientIdNumber: q.patientIdNumber || null,
        diagnosis: q.diagnosis || null,
        isMedical: Boolean(q.diagnosis || q.patientIdNumber || q.isMedicalQuote),
      };
    } else {
      if (q.patientIdNumber && !clientMap[key].patientIdNumber) clientMap[key].patientIdNumber = q.patientIdNumber;
      if (q.diagnosis && !clientMap[key].diagnosis) clientMap[key].diagnosis = q.diagnosis;
      if (q.isMedicalQuote) clientMap[key].isMedical = true;
    }

    const qTotal = Number(q.totalAmount) || 0;
    const qPaid = (q.payments || []).reduce(
      (acc, p) => acc + (Number(p.amount) || 0),
      0
    );

    clientMap[key].jobsCount += 1;
    clientMap[key].totalBilled += qTotal;
    clientMap[key].totalPaid += qPaid;
    clientMap[key].pendingBalance += Math.max(0, qTotal - qPaid);

    if (new Date(q.createdAt) > new Date(clientMap[key].lastJobDate)) {
      clientMap[key].lastJobDate = q.createdAt;
      clientMap[key].lastJobDescription = q.workDescription;
      clientMap[key].status = q.status;
    }
  });

  const allClients = Object.values(clientMap);

  // Totales de Cartera General
  const portfolioTotalBilled = allClients.reduce((acc, c) => acc + c.totalBilled, 0);
  const portfolioTotalPaid = allClients.reduce((acc, c) => acc + c.totalPaid, 0);
  const portfolioTotalDebt = allClients.reduce((acc, c) => acc + c.pendingBalance, 0);

  // Filtrado reactivo
  const filteredList = allClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.lastJobDescription || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "con_saldo") {
      return c.pendingBalance > 0;
    }
    if (statusFilter === "al_dia") {
      return c.pendingBalance === 0;
    }
    return true;
  });

  // Mensaje de cobro de saldo pendiente por WhatsApp
  const handleCollectDebtWhatsApp = (c) => {
    const phone = getCleanPhone(c.phone);
    const bizName = business?.businessName || "Servicios";
    const bank = business?.bankInfo || {};
    const nequi =
      bank.nequiPhone ||
      (business?.whatsappNumber ? business.whatsappNumber.replace(/^57/, "") : "");
    const bancolombia = bank.bancolombiaAccount || "";

    let paymentAccountsText = "";
    if (nequi) paymentAccountsText += `\n• Nequi: ${nequi}`;
    if (bancolombia) paymentAccountsText += `\n• Bancolombia: ${bancolombia}`;
    if (bank.bankHolder) paymentAccountsText += `\n• Titular: ${bank.bankHolder}`;

    let msg = "";
    if (c.isMedical) {
      msg =
        `Estimado(a) *${c.name}*,\n\n` +
        `Le saludamos cordialmente de *${bizName}*.\n\n` +
        (c.diagnosis ? `🩺 *Ficha / Indicación:* ${c.diagnosis}\n` : "") +
        `Esperamos que su proceso y adaptación al dispositivo marche de la mejor manera con su atención de "${c.lastJobDescription}".\n\n` +
        `📌 Le recordamos que presenta un saldo pendiente por valor de *${formatCurrency(
          c.pendingBalance
        )}*.\n\n` +
        `Puede realizar la transferencia a nuestras cuentas autorizadas:` +
        (paymentAccountsText ? `${paymentAccountsText}\n\n` : `\n`) +
        `Quedamos atentos a su comprobante para emitir su Paz y Salvo Oficial. ¡Muchas gracias por su confianza!`;
    } else {
      msg =
        `¡Hola *${c.name}*! 👋 Te saludamos cordialmente de *${bizName}*.\n\n` +
        `Esperamos que todo esté marchando excelente con tu trabajo reciente de "${c.lastJobDescription}".\n\n` +
        `📌 Te escribimos para recordarte que tienes un saldo pendiente por valor de *${formatCurrency(
          c.pendingBalance
        )}*.\n\n` +
        `Puedes realizar la transferencia a nuestras cuentas autorizadas:` +
        (paymentAccountsText ? `${paymentAccountsText}\n\n` : `\n`) +
        `Quedamos muy atentos a tu comprobante por este medio para emitir tu Recibo Oficial de Paz y Salvo. ¡Muchas gracias por tu confianza!`;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Mensaje de fidelización / mantenimiento preventivo
  const handleFollowUpWhatsApp = (c) => {
    const phone = getCleanPhone(c.phone);
    const bizName = business?.businessName || "Servicios";
    const msg = `¡Hola *${c.name}*! 👋 Te saludamos desde *${bizName}*. Esperamos que todo esté marchando excelente con tu proyecto reciente de "${c.lastJobDescription}". ¿Tienes alguna consulta técnica, deseas programar una revisión de mantenimiento o requieres algún nuevo servicio? Quedamos a tu entera disposición.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Exportar a Excel / CSV con formato universal compatible con Excel español
  const handleExportCSV = () => {
    if (allClients.length === 0) {
      alert("No hay clientes registrados en la cartera para exportar.");
      return;
    }

    const headers = [
      "Nombre del Cliente",
      "Teléfono WhatsApp",
      "Trabajos Realizados",
      "Total Facturado (COP)",
      "Total Recaudado (COP)",
      "Saldo Pendiente (COP)",
      "Estado de Cartera",
      "Último Trabajo",
      "Fecha Último Trabajo",
    ];

    const rows = allClients.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      c.jobsCount,
      c.totalBilled,
      c.totalPaid,
      c.pendingBalance,
      c.pendingBalance > 0 ? "Pendiente por Cobrar" : "Al Día (Paz y Salvo)",
      `"${(c.lastJobDescription || "").replace(/"/g, '""')}"`,
      `"${new Date(c.lastJobDate).toLocaleDateString("es-CO")}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const bizSlug = business?.businessSlug || "cartera";
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Cartera_Clientes_${bizSlug}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const countWithDebt = allClients.filter((c) => c.pendingBalance > 0).length;
  const countUpToDate = allClients.filter((c) => c.pendingBalance === 0).length;

  return (
    <div className="space-y-4">
      {/* Encabezado del Directorio y Exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            <span>Directorio y Cartera de Clientes</span>
            <span className="text-xs bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full">
              {allClients.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Control comercial, cobranza de saldos por WhatsApp y fidelización
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="self-start sm:self-auto bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          title="Descargar reporte para Microsoft Excel / Google Sheets"
        >
          <Download className="w-3.5 h-3.5 text-brand-400" />
          <span>Exportar Cartera (Excel/CSV)</span>
        </button>
      </div>

      {/* Resumen Ejecutivo de Cartera Comercial */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Facturado
          </span>
          <span className="text-sm font-black text-slate-100 block truncate">
            {formatCurrency(portfolioTotalBilled)}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {quotes.length} cotizaciones
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Recaudado
          </span>
          <span className="text-sm font-black text-emerald-400 block truncate">
            {formatCurrency(portfolioTotalPaid)}
          </span>
          <span className="text-[10px] text-slate-500 block">
            Abonos asentados
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Por Cobrar
          </span>
          <span
            className={`text-sm font-black block truncate ${
              portfolioTotalDebt > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {formatCurrency(portfolioTotalDebt)}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {countWithDebt} con saldo
          </span>
        </div>
      </div>

      {/* Buscador y Pestañas de Filtro */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o trabajo realizado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter("todos")}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all text-center ${
              statusFilter === "todos"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Todos ({allClients.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("con_saldo")}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${
              statusFilter === "con_saldo"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Por Cobrar ({countWithDebt})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("al_dia")}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${
              statusFilter === "al_dia"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Al Día ({countUpToDate})</span>
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-2">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">
            {allClients.length === 0
              ? "No hay clientes registrados"
              : "No se encontraron clientes con este filtro"}
          </h4>
          <p className="text-xs text-slate-500">
            {allClients.length === 0
              ? "Cada vez que generes una cotización formal, el cliente y sus cobros se organizarán automáticamente aquí."
              : "Prueba con otro término de búsqueda o limpia los filtros."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((client, index) => {
            const hasDebt = client.pendingBalance > 0;

            return (
              <div
                key={index}
                className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  hasDebt
                    ? "border-amber-500/30 hover:border-amber-500/50"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-sm shrink-0 ${
                      hasDebt
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-brand-500/10 border-brand-500/20 text-brand-400"
                    }`}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100">
                        {client.name}
                      </h4>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                        {client.jobsCount} {client.jobsCount === 1 ? "trabajo" : "trabajos"}
                      </span>
                      {client.isMedical && (
                        <span className="text-[10px] bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5 text-teal-400" />
                          <span>Paciente Ortopedia</span>
                        </span>
                      )}
                      {client.diagnosis && (
                        <span className="text-[10px] bg-slate-800 text-teal-300/90 border border-slate-700 px-2 py-0.5 rounded-md font-mono hidden md:inline truncate max-w-[200px]" title={client.diagnosis}>
                          {client.diagnosis}
                        </span>
                      )}
                      {hasDebt ? (
                        <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Debe: {formatCurrency(client.pendingBalance)}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Al día</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      +{client.phone}
                    </p>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Último: {client.lastJobDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="sm:text-right">
                    <span className="text-xs font-black text-slate-200 block">
                      {formatCurrency(client.totalBilled)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Recaudado: {formatCurrency(client.totalPaid)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {onNewQuoteForClient && (
                      <button
                        onClick={() => onNewQuoteForClient(client)}
                        className="flex items-center gap-1.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                        title="Generar nueva cotización para este cliente"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Cotizar</span>
                      </button>
                    )}

                    {/* Botón WhatsApp condicional: Cobro o Fidelización */}
                    {hasDebt ? (
                      <button
                        onClick={() => handleCollectDebtWhatsApp(client)}
                        className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                        title="Enviar recordatorio cordial de cobro con cuentas bancarias"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cobrar Saldo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollowUpWhatsApp(client)}
                        className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                        title="Enviar mensaje de saludo y mantenimiento técnico"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Fidelizar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
