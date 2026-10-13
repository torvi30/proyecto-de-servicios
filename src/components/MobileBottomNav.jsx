import React from "react";
import { LayoutDashboard, Wrench, ClipboardList, QrCode } from "lucide-react";

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    {
      id: "dashboard",
      label: "Inicio",
      icon: LayoutDashboard,
    },
    {
      id: "services",
      label: "Servicios",
      icon: Wrench,
    },
    {
      id: "quotes",
      label: "Trabajos",
      icon: ClipboardList,
    },
    {
      id: "qr",
      label: "Mi QR",
      icon: QrCode,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2 shadow-float-nav">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-brand-400 bg-brand-500/10 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-400 rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
