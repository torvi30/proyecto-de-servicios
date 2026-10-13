import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Printer,
  Sparkles,
  QrCode as QrIcon,
} from "lucide-react";

export default function BusinessQRCode({ business }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const businessSlug = business?.businessSlug || "demo";
  const publicUrl = `${window.location.origin}/b/${businessSlug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar enlace:", err);
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Crear un canvas decorativo de alta calidad para imprimir
    const printCanvas = document.createElement("canvas");
    const ctx = printCanvas.getContext("2d");
    const width = 600;
    const height = 800;

    printCanvas.width = width;
    printCanvas.height = height;

    // Fondo degradado elegante
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#090d16");
    grad.addColorStop(1, "#111827");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Borde sutil
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Título del negocio
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(business?.businessName || "Servicios Profesionales", width / 2, 85);

    // Categoría / Subtítulo
    ctx.fillStyle = "#2dd4bf";
    ctx.font = "600 20px sans-serif";
    ctx.fillText(
      (business?.categoryLabel || business?.category || "Técnico Independiente").toUpperCase(),
      width / 2,
      125
    );

    // Marco blanco para el QR (para garantizar alto contraste y legibilidad con escáneres de celulares)
    const qrBoxSize = 380;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 160;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
    ctx.fill();

    // Dibujar el QR escalado
    ctx.drawImage(canvas, qrBoxX + 25, qrBoxY + 25, qrBoxSize - 50, qrBoxSize - 50);

    // Texto de llamado a la acción
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("¡Escanea para Cotizar por WhatsApp!", width / 2, 595);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px sans-serif";
    ctx.fillText("Portafolio • Precios • Trabajos Garantizados", width / 2, 635);

    // Teléfono
    if (business?.whatsappNumber) {
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`WhatsApp: +${business.whatsappNumber}`, width / 2, 680);
    }

    // Pie con URL corta
    ctx.fillStyle = "#64748b";
    ctx.font = "14px sans-serif";
    ctx.fillText(publicUrl, width / 2, 735);

    // Descargar imagen
    const link = document.createElement("a");
    link.download = `QR-${businessSlug}-VitrinaPro.png`;
    link.href = printCanvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business?.businessName || "Vitrina de Servicios",
          text: `Conoce mis servicios y cotiza directamente por WhatsApp:`,
          url: publicUrl,
        });
      } catch {
        // Usuario canceló compartir
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* Tarjeta Visual de Marketing Offline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Marketing Offline para tu Negocio</span>
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-100">
            {business?.businessName || "Mi Negocio"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Pega este QR en tu camioneta, tarjetas de presentación o uniformes para que tus clientes coticen al instante.
          </p>
        </div>

        {/* QR Code Container con marco de alto contraste */}
        <div
          ref={qrRef}
          className="inline-block p-4 bg-white rounded-2xl shadow-2xl mx-auto border-4 border-slate-700/60"
        >
          <QRCodeCanvas
            value={publicUrl}
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* URL directa */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between gap-2 max-w-sm mx-auto">
          <span className="text-xs text-slate-300 font-mono truncate text-left pl-2">
            {publicUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Botones de Acción Móviles de 1-toque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 max-w-sm mx-auto">
          <button
            onClick={handleDownloadQR}
            className="w-full bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow-teal transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar QR en PNG</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Vitrina Pública</span>
          </a>
        </div>

        <button
          onClick={handleShare}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors pt-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir enlace por redes sociales</span>
        </button>
      </div>

      {/* Consejos para Prestadores */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <Printer className="w-4 h-4 text-brand-400" />
          ¿Dónde imprimir este código QR?
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>Imprímelo en un sticker para la luneta de tu camioneta o moto.</li>
          <li>Añádelo al reverso de tus tarjetas personales de presentación.</li>
          <li>En la cotización física o recibo de caja de tus clientes.</li>
        </ul>
      </div>
    </div>
  );
}
