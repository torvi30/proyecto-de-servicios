import React, { useState, useEffect } from "react";
import {
  Sparkles,
  AlertTriangle,
  Wrench,
  Info,
  X,
  ChevronRight,
} from "lucide-react";
import { getGlobalBroadcastAnnouncement } from "../services/firestoreService";

export default function GlobalBroadcastBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGlobalBroadcastAnnouncement();
        if (data && data.isActive) {
          const dismissedId = sessionStorage.getItem("vitrinapro_dismissed_broadcast");
          if (dismissedId === data.id) {
            setIsDismissed(true);
          } else {
            setAnnouncement(data);
          }
        }
      } catch (e) {
        console.warn("Error loading broadcast banner:", e);
      }
    }
    load();
  }, []);

  if (!announcement || !announcement.isActive || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (announcement.id) {
      sessionStorage.setItem("vitrinapro_dismissed_broadcast", announcement.id);
    }
  };

  // Estilos según tipo
  let typeConfig = {
    badge: "NOVEDAD",
    icon: Sparkles,
    bg: "from-purple-950/90 via-slate-900 to-slate-950 border-purple-500/40 text-purple-200",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    iconColor: "text-purple-400",
  };

  if (announcement.type === "urgente") {
    typeConfig = {
      badge: "AVISO URGENTE",
      icon: AlertTriangle,
      bg: "from-red-950/90 via-slate-900 to-slate-950 border-red-500/40 text-red-200",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
      iconColor: "text-red-400",
    };
  } else if (announcement.type === "mantenimiento") {
    typeConfig = {
      badge: "MANTENIMIENTO",
      icon: Wrench,
      bg: "from-blue-950/90 via-slate-900 to-slate-950 border-blue-500/40 text-blue-200",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      iconColor: "text-blue-400",
    };
  }

  const IconComponent = typeConfig.icon;

  return (
    <div
      className={`mx-4 mt-3 mb-2 bg-gradient-to-r ${typeConfig.bg} border rounded-2xl p-3.5 shadow-lg relative overflow-hidden transition-all animate-fade-in`}
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 shadow-sm shrink-0 mt-0.5">
            <IconComponent className={`w-4 h-4 ${typeConfig.iconColor}`} />
          </div>

          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wider uppercase ${typeConfig.badgeColor}`}
              >
                {typeConfig.badge}
              </span>
              <h4 className="text-xs font-bold text-slate-100">
                {announcement.title}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {announcement.message}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-0 right-0 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          title="Ocultar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
