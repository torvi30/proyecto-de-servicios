import React, { useState } from "react";
import { Users, Phone, MessageCircle, DollarSign, Calendar, Search, Sparkles, ChevronRight, UserPlus } from "lucide-react";

export default function ClientDirectory({ business, quotes, onNewQuoteForClient }) {
  const [search, setSearch] = useState("");

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

  // Agrupar cotizaciones por cliente (nombre o teléfono)
  const clientMap = {};
  quotes.forEach((q) => {
    const key = q.clientPhone || q.clientName;
    if (!clientMap[key]) {
      clientMap[key] = {
        name: q.clientName,
        phone: q.clientPhone,
        totalSpent: 0,
        jobsCount: 0,
        lastJobDate: q.createdAt,
        lastJobDescription: q.workDescription,
        status: q.status,
      };
    }
    clientMap[key].jobsCount += 1;
    clientMap[key].totalSpent += Number(q.totalAmount) || 0;
    if (new Date(q.createdAt) > new Date(clientMap[key].lastJobDate)) {
      clientMap[key].lastJobDate = q.createdAt;
      clientMap[key].lastJobDescription = q.workDescription;
    }
  });

  const clientList = Object.values(clientMap).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleFollowUpWhatsApp = (c) => {
    const phone = getCleanPhone(c.phone);
    const bizName = business?.businessName || "Servicios";
    const msg = `¡Hola *${c.name}*! 👋 Te saludamos desde *${bizName}*. Esperamos que todo esté marchando excelente con tu trabajo reciente de "${c.lastJobDescription}". ¿Tienes alguna consulta o necesitas programar una nueva revisión técnica? Quedamos atentos.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Encabezado del Directorio */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            <span>Directorio y Cartera de Clientes</span>
            <span className="text-xs bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full">
              {clientList.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Historial de clientes atendidos, total facturado y reactivación por WhatsApp
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Lista de Clientes */}
      {clientList.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-2">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">No hay clientes registrados</h4>
          <p className="text-xs text-slate-500">
            Cada vez que generes una cotización, el cliente se guardará automáticamente en este directorio.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientList.map((client, index) => (
            <div
              key={index}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">
                      {client.name}
                    </h4>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                      {client.jobsCount} {client.jobsCount === 1 ? "trabajo" : "trabajos"}
                    </span>
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
                  <span className="text-xs font-black text-emerald-400 block">
                    {formatCurrency(client.totalSpent)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Total histórico
                  </span>
                </div>

                {/* Botón WhatsApp de seguimiento */}
                <button
                  onClick={() => handleFollowUpWhatsApp(client)}
                  className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Re-contactar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
