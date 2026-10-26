// Helper de temas visuales, colores de marca y configuración de Landing para VitrinaPro

export const THEME_COLOR_PRESETS = [
  {
    id: "blue",
    name: "Azul Clínico / Salud",
    hex: "#0284c7",
    categoryHint: "Ortopedia, médicos, fisioterapia, odontología",
    icon: "Activity",
  },
  {
    id: "amber",
    name: "Ámbar / Electricista",
    hex: "#f59e0b",
    categoryHint: "Electricistas, técnicos, obras, carpintería",
    icon: "Zap",
  },
  {
    id: "orange",
    name: "Naranja / Mascotas",
    hex: "#ea580c",
    categoryHint: "Adiestramiento de perros, paseadores, guarderías",
    icon: "Dog",
  },
  {
    id: "emerald",
    name: "Verde Esmeralda",
    hex: "#10b981",
    categoryHint: "Jardinería, limpieza, estética natural",
    icon: "Sparkles",
  },
  {
    id: "teal",
    name: "Teal Vitrina Clásico",
    hex: "#14b8a6",
    categoryHint: "Servicios generales, tecnología, corporativo",
    icon: "Award",
  },
  {
    id: "purple",
    name: "Violeta Creativo",
    hex: "#8b5cf6",
    categoryHint: "Diseño, eventos, fotografía, belleza",
    icon: "Paintbrush",
  },
  {
    id: "rose",
    name: "Rojo Carmesí / Urgencias",
    hex: "#e11d48",
    categoryHint: "Cerrajería, grúas, emergencias 24/7",
    icon: "Flame",
  },
  {
    id: "slate",
    name: "Grafito Ejecutivo",
    hex: "#475569",
    categoryHint: "Consultoría, contabilidad, asesoría legal",
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

export function getDefaultThemeForCategory(category = "") {
  const cat = (category || "").toLowerCase();
  if (cat.includes("ortoped") || cat.includes("salud") || cat.includes("medic")) {
    return "#0284c7";
  }
  if (cat.includes("electr")) {
    return "#f59e0b";
  }
  if (cat.includes("mascot") || cat.includes("perr") || cat.includes("canin")) {
    return "#ea580c";
  }
  if (cat.includes("obra") || cat.includes("drywall") || cat.includes("pintur")) {
    return "#3b82f6";
  }
  if (cat.includes("limp") || cat.includes("jardin")) {
    return "#10b981";
  }
  if (cat.includes("cerraj") || cat.includes("urgenc")) {
    return "#e11d48";
  }
  return "#14b8a6";
}

export function getThemeStyles(themeColor = "#14b8a6") {
  const { r, g, b } = hexToRgb(themeColor);
  
  // Calcular contraste para el texto sobre el botón principal
  // Fórmula de luminancia relativa estándar
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = yiq >= 140 ? "#020617" : "#ffffff";

  return {
    primaryColor: themeColor,
    rgb: `${r}, ${g}, ${b}`,
    primaryBtn: {
      backgroundColor: themeColor,
      color: textColor,
      boxShadow: `0 0 20px -3px rgba(${r}, ${g}, ${b}, 0.45)`,
    },
    primaryBtnHover: {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.9)`,
    },
    badge: {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
      color: themeColor,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
    },
    borderLight: {
      borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
    },
    borderGlow: {
      borderColor: `rgba(${r}, ${g}, ${b}, 0.6)`,
      boxShadow: `0 0 15px -3px rgba(${r}, ${g}, ${b}, 0.25)`,
    },
    textAccent: {
      color: themeColor,
    },
    subtleBg: {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.08)`,
    },
    heroGradient: `radial-gradient(ellipse 80% 60% at 50% -20%, rgba(${r}, ${g}, ${b}, 0.25), transparent 70%)`,
    glowShadow: `0 0 25px -4px rgba(${r}, ${g}, ${b}, 0.4)`,
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
