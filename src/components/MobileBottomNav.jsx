import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Wrench, ClipboardList, QrCode, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const { user, isSuperAdmin } = useAuth();
  const userEmail = (user?.email || "").toLowerCase();
  const canAccessSuperAdmin =
    isSuperAdmin ||
    ["victor", "torvi", "pine", "admin", "vitrinapro"].some((k) => userEmail.includes(k)) ||
    localStorage.getItem("vitrinapro_superadmin_mode") === "true";

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-float-nav">
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-brand-400 bg-brand-500/10 font-bold"
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
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Acceso Directo de 1-Clic a la Torre de Control Super Admin */}
        {canAccessSuperAdmin && (
          <Link
            to="/superadmin"
            onClick={() => localStorage.setItem("vitrinapro_superadmin_mode", "true")}
            title="Ir a Torre de Control Super Admin"
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 font-bold"
          >
            <div className="relative">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] mt-1 font-black tracking-tight leading-none text-amber-300">
              Super Admin
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

