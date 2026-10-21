import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  X,
  CreditCard,
  Copy,
  Check,
  Send,
  Phone,
  DollarSign,
} from "lucide-react";

export default function PaymentTerminalModal({ isOpen, onClose, business }) {
  const [activeMethod, setActiveMethod] = useState("nequi"); // 'nequi' | 'bancolombia' | 'daviplata' | 'efectivo'
  const [chargeAmount, setChargeAmount] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const bank = business?.bankInfo || {};
  const methodsText = (business?.paymentMethods || "").toLowerCase();
  const nequiNumber =
    bank.nequiPhone ||
    (business?.whatsappNumber ? business.whatsappNumber.replace(/^57/, "") : "3001234567");
  const daviplataNumber = bank.daviplataPhone || "";
  const hasDaviplata = Boolean(daviplataNumber || (methodsText && methodsText.includes("daviplata")));
  const bancolombiaAccount =
    bank.bancolombiaAccount || "Ahorros 241-987654-12";
  const bankHolder = bank.bankHolder || business?.businessName || "Titular de Cuenta";
  const bankIdDoc = bank.bankIdDoc || "CC 1.020.304.050";

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanPhone = (phone) => {
    let clean = (phone || "").replace(/\D/g, "");
    if (clean.length === 10 && clean.startsWith("3")) {
      clean = "57" + clean;
    }
    return clean;
  };

  const handleSendPaymentWhatsApp = () => {
    const bizName = business?.businessName || "Servicios Profesionales";
    const amountStr = chargeAmount ? ` por valor de *${formatCurrency(chargeAmount)}*` : "";

    let message = `¡Hola! 👋 Te compartimos los datos oficiales de pago de *${bizName}*${amountStr}:\n\n`;

    if (activeMethod === "nequi") {
      message += `📱 *Nequi:* ${nequiNumber}\n👤 *Titular:* ${bankHolder}\n🪪 *Documento:* ${bankIdDoc}\n\n`;
    } else if (activeMethod === "bancolombia") {
      message += `🏦 *Bancolombia:* ${bancolombiaAccount}\n👤 *Titular:* ${bankHolder}\n🪪 *Documento:* ${bankIdDoc}\n\n`;
    } else if (activeMethod === "daviplata") {
      message += `🔴 *Daviplata:* ${daviplataNumber}\n👤 *Titular:* ${bankHolder}\n🪪 *Documento:* ${bankIdDoc}\n\n`;
    } else {
      message += `📱 *Nequi:* ${nequiNumber}\n🏦 *Bancolombia:* ${bancolombiaAccount}\n🔴 *Daviplata:* ${daviplataNumber}\n👤 *Titular:* ${bankHolder}\n\n`;
    }

    message += `Por favor envíanos la captura o comprobante por este chat para registrar tu abono formalmente. ¡Muchas gracias!`;

    const targetPhone = clientPhone ? cleanPhone(clientPhone) : "";
    const waUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  // Valor codificado en el QR
  const getQrPayload = () => {
    if (activeMethod === "nequi") {
      return `nequi://${nequiNumber}?amount=${chargeAmount || ""}`;
    }
    if (activeMethod === "bancolombia") {
      return `bancolombia://${bancolombiaAccount}?amount=${chargeAmount || ""}`;
    }
    if (activeMethod === "daviplata") {
      return `daviplata://${daviplataNumber}?amount=${chargeAmount || ""}`;
    }
    return `${window.location.origin}/b/${business?.businessSlug || "demo"}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-1.5 leading-tight">
                <span>Cobro Express en Sitio</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  QR & Cuentas
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Muestra el código al cliente o envía los datos en 1 toque
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campo opcional de monto a cobrar */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Monto a Cobrar (Opcional)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="number"
              placeholder="Ej: 350000"
              value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-100 font-black placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {chargeAmount > 0 && (
            <span className="text-xs font-black text-emerald-400 block pt-0.5">
              Total a transferir: {formatCurrency(chargeAmount)}
            </span>
          )}
        </div>

        {/* Pestañas de Medios de Pago */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMethod("nequi")}
            className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
              activeMethod === "nequi"
                ? "bg-purple-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📱 Nequi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMethod("bancolombia")}
            className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
              activeMethod === "bancolombia"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🏦 Bancolombia</span>
          </button>
          {hasDaviplata && (
            <button
              type="button"
              onClick={() => setActiveMethod("daviplata")}
              className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-0.5 ${
                activeMethod === "daviplata"
                  ? "bg-red-600 text-white shadow-md font-black"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🔴 Daviplata</span>
            </button>
          )}
        </div>

        {/* Vista del Medio Seleccionado con Código QR */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 text-center space-y-4">
          <div className="inline-block p-3.5 bg-white rounded-2xl shadow-xl ring-4 ring-emerald-500/20">
            <QRCodeCanvas
              value={getQrPayload()}
              size={170}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
              {activeMethod === "nequi"
                ? "Número Nequi"
                : activeMethod === "bancolombia"
                ? "Cuenta Bancolombia"
                : "Número Daviplata"}
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-100 tracking-wider">
                {activeMethod === "nequi"
                  ? nequiNumber
                  : activeMethod === "bancolombia"
                  ? bancolombiaAccount
                  : daviplataNumber}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    activeMethod === "nequi"
                      ? nequiNumber
                      : activeMethod === "bancolombia"
                      ? bancolombiaAccount
                      : daviplataNumber,
                    "account"
                  )
                }
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 transition-colors"
                title="Copiar número"
              >
                {copiedKey === "account" ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copiedKey === "account" && (
              <span className="text-[10px] text-emerald-400 font-bold block animate-fade-in">
                ✓ ¡Número copiado al portapapeles!
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-0.5">
            <p>
              Titular: <strong className="text-slate-200">{bankHolder}</strong>
            </p>
            <p>
              Documento: <strong className="text-slate-200">{bankIdDoc}</strong>
            </p>
          </div>
        </div>

        {/* Envío Directo por WhatsApp */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="WhatsApp del cliente (opcional, ej: 3001234567)"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSendPaymentWhatsApp}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Datos de Pago a WhatsApp del Cliente</span>
          </button>
        </div>
      </div>
    </div>
  );
}
