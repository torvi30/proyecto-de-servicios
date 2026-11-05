// Helper de temas visuales, colores de marca y configuración de Landing para VitrinaPro

export const VITRINA_THEME_COMBOS = [
  {
    id: "dark-obsidian",
    name: "Oscuro Grafito & Violeta",
    tagline: "Fondo negro suave, tarjetas grafito y violeta eléctrico",
    bgColor: "#090d16",
    cardColor: "#151c2e",
    btnColor: "#8b5cf6",
    textColor: "#f8fafc",
  },
  {
    id: "dark-indigo",
    name: "Índigo Azul Noche",
    tagline: "Fondo azul profundo, tarjetas azul marino y cyan vibrante",
    bgColor: "#070b19",
    cardColor: "#101a33",
    btnColor: "#38bdf8",
    textColor: "#f8fafc",
  },
  {
    id: "clean-slate",
    name: "Gris Ejecutivo & Azul Cobalto",
    tagline: "Fondo gris platino claro, tarjetas blancas nítidas con sombra",
    bgColor: "#e2e8f0",
    cardColor: "#ffffff",
    btnColor: "#0284c7",
    textColor: "#0f172a",
  },
  {
    id: "mint-contrast",
    name: "Menta Fresco & Esmeralda",
    tagline: "Fondo menta suave con tarjetas blancas de alto contraste",
    bgColor: "#dcfce7",
    cardColor: "#ffffff",
    btnColor: "#059669",
    textColor: "#064e3b",
  },
  {
    id: "warm-amber",
    name: "Carbón Técnico & Ámbar",
    tagline: "Fondo carbón mate con acentos ámbar dorado",
    bgColor: "#111215",
    cardColor: "#1c1e24",
    btnColor: "#f59e0b",
    textColor: "#f8fafc",
  },
  {
    id: "sand-terracotta",
    name: "Arena Cálida & Terracota",
    tagline: "Fondo beige arena cálido con tarjetas blancas y naranja",
    bgColor: "#f5ebe0",
    cardColor: "#ffffff",
    btnColor: "#ea580c",
    textColor: "#1c1917",
  },
];

export const THEME_COLOR_PRESETS = [
  {
    id: "purple-electric",
    name: "Violeta Eléctrico",
    hex: "#8b5cf6",
    secondaryHex: "#c4b5fd",
    categoryHint: "Diseño, estética, tecnología, eventos",
    icon: "Sparkles",
  },
  {
    id: "indigo-royal",
    name: "Morado Índigo Real",
    hex: "#6366f1",
    secondaryHex: "#a5b4fc",
    categoryHint: "Ortopedia, tecnología médica, clínicas",
    icon: "Award",
  },
  {
    id: "blue-clinical",
    name: "Azul Clínico Pro",
    hex: "#0284c7",
    secondaryHex: "#7dd3fc",
    categoryHint: "Salud, fisioterapia, odontología, biomecánica",
    icon: "Activity",
  },
  {
    id: "teal-vitrina",
    name: "Teal Esmeralda Clásico",
    hex: "#14b8a6",
    secondaryHex: "#5eead4",
    categoryHint: "Servicios generales, remodelaciones, multiservicios",
    icon: "Check",
  },
  {
    id: "emerald-mint",
    name: "Verde Esmeralda Vivo",
    hex: "#10b981",
    secondaryHex: "#6ee7b7",
    categoryHint: "Limpieza, paisajismo, acabados ecológicos",
    icon: "Sparkles",
  },
  {
    id: "amber-electric",
    name: "Ámbar / Electricista",
    hex: "#f59e0b",
    secondaryHex: "#fde68a",
    categoryHint: "Electricistas, técnicos RETIE, carpintería",
    icon: "Zap",
  },
  {
    id: "orange-pets",
    name: "Naranja Cálido / Mascotas",
    hex: "#ea580c",
    secondaryHex: "#fdba74",
    categoryHint: "Paseadores, adiestramiento canino, veterinaria",
    icon: "Dog",
  },
  {
    id: "rose-emergency",
    name: "Rojo Carmesí / Urgencias",
    hex: "#e11d48",
    secondaryHex: "#fda4af",
    categoryHint: "Cerrajería, grúas, reparaciones 24/7",
    icon: "Flame",
  },
  {
    id: "fuchsia-vibrant",
    name: "Fucsia Magenta",
    hex: "#d946ef",
    secondaryHex: "#f0abfc",
    categoryHint: "Belleza, barbería, estilistas, fotografía",
    icon: "Paintbrush",
  },
  {
    id: "slate-executive",
    name: "Grafito Ejecutivo",
    hex: "#475569",
    secondaryHex: "#cbd5e1",
    categoryHint: "Consultoría, arquitectura, ingeniería, legal",
    icon: "Shield",
  },
];

export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return { r: 20, g: 184, b: 166 };
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return { r: 20, g: 184, b: 166 };

  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function isColorLight(hex) {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150;
}

export function getDefaultThemeForCategory(category = "") {
  const cat = (category || "").toLowerCase();
  if (cat.includes("ortoped") || cat.includes("salud") || cat.includes("medic")) {
    return "#6366f1";
  }
  if (cat.includes("electr")) {
    return "#f59e0b";
  }
  if (cat.includes("mascot") || cat.includes("perr") || cat.includes("canin")) {
    return "#ea580c";
  }
  if (cat.includes("obra") || cat.includes("drywall") || cat.includes("pintur")) {
    return "#0284c7";
  }
  if (cat.includes("limp") || cat.includes("jardin")) {
    return "#10b981";
  }
  if (cat.includes("cerraj") || cat.includes("urgenc")) {
    return "#e11d48";
  }
  return "#8b5cf6";
}

export function getThemeStyles(themeColor = "#8b5cf6", customBgColor = null, customCardColor = null) {
  const btnHex = themeColor || "#8b5cf6";
  const bgHex = customBgColor || "#090d16";
  const cardHex = customCardColor || "#111827";

  const { r: br, g: bg, b: bb } = hexToRgb(btnHex);
  const { r: cbr, g: cbg, b: cbb } = hexToRgb(cardHex);

  const isLightBackground = isColorLight(bgHex);
  const isLightCard = isColorLight(cardHex);
  const btnTextIsDark = isColorLight(btnHex);

  const mainTextColor = isLightBackground ? "#0f172a" : "#f8fafc";
  const secondaryTextColor = isLightBackground ? "#334155" : "#94a3b8";
  const cardTextColor = isLightCard ? "#0f172a" : "#f8fafc";
  const cardMutedTextColor = isLightCard ? "#334155" : "#94a3b8";
  const borderColor = isLightCard ? "rgba(203, 213, 225, 0.9)" : "rgba(51, 65, 85, 0.8)";

  return {
    primaryColor: btnHex,
    bgColor: bgHex,
    cardColor: cardHex,
    isLightBackground,
    isLightCard,
    rgb: `${br}, ${bg}, ${bb}`,
    pageStyle: {
      backgroundColor: bgHex,
      color: mainTextColor,
    },
    cardStyle: {
      backgroundColor: cardHex,
      borderColor: borderColor,
      color: cardTextColor,
    },
    mainTextColor,
    secondaryTextColor,
    cardTextColor,
    cardMutedTextColor,
    primaryBtn: {
      backgroundColor: btnHex,
      color: btnTextIsDark ? "#020617" : "#ffffff",
      boxShadow: `0 8px 24px -4px rgba(${br}, ${bg}, ${bb}, 0.55)`,
    },
    primaryBtnHover: {
      backgroundColor: `rgba(${br}, ${bg}, ${bb}, 0.9)`,
    },
    badge: {
      backgroundColor: `rgba(${br}, ${bg}, ${bb}, ${isLightCard ? 0.12 : 0.18})`,
      color: isLightCard ? btnHex : (btnTextIsDark ? "#fbbf24" : btnHex),
      borderColor: `rgba(${br}, ${bg}, ${bb}, 0.4)`,
    },
    borderLight: {
      borderColor: `rgba(${br}, ${bg}, ${bb}, 0.3)`,
    },
    borderGlow: {
      borderColor: `rgba(${br}, ${bg}, ${bb}, 0.7)`,
      boxShadow: `0 0 20px -3px rgba(${br}, ${bg}, ${bb}, 0.35)`,
    },
    textAccent: {
      color: btnHex,
    },
    subtleBg: {
      backgroundColor: `rgba(${br}, ${bg}, ${bb}, 0.12)`,
    },
    pillActive: {
      background: `linear-gradient(135deg, ${btnHex}, rgba(${br}, ${bg}, ${bb}, 0.85))`,
      color: btnTextIsDark ? "#020617" : "#ffffff",
      borderColor: btnHex,
      boxShadow: `0 4px 14px -2px rgba(${br}, ${bg}, ${bb}, 0.45)`,
    },
    heroGradient: `radial-gradient(ellipse 90% 65% at 50% -15%, rgba(${br}, ${bg}, ${bb}, 0.35), transparent 75%)`,
    glowShadow: `0 0 30px -4px rgba(${br}, ${bg}, ${bb}, 0.5)`,
  };
}

export const SUGGESTED_COVER_IMAGES = [
  {
    id: "cover-health",
    title: "Clínica & Salud",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "cover-electric",
    title: "Técnico & Electricidad",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "cover-dogs",
    title: "Perros & Parque",
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "cover-workshop",
    title: "Taller & Herramientas",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "cover-modern",
    title: "Minimalista Oscuro",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  },
];
