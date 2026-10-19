import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, isFirebaseConfigured } from "../firebase";
import { TRADE_CATEGORIES } from "../data/tradePresets";

// Claves de persistencia para modo Demo / Local sin credenciales
const STORAGE_PREFIX = "vitrinapro_local_";

export const PRECONFIGURED_BUSINESSES = {
  ortopedia: {
    business: {
      id: "demo-ortopedia",
      ownerId: "demo-user-1",
      businessName: "Centro Ortopédico & Biomecánico San Rafael",
      businessSlug: "ortopedia-san-rafael",
      category: "ortopedia",
      categoryLabel: "Salud, Ortopedia & Biomecánica",
      whatsappNumber: "573157890123",
      city: "Bogotá (Chicó / Palermo)",
      bio: "Centro de ortopedia técnica avanzada, órtesis termomoldeables a medida, rehabilitación de movilidad y alquiler de equipos clínicos certificados.",
      logoUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&auto=format&fit=crop&q=80",
      rating: 4.98,
      completedJobsCount: 380,
      paymentMethods: "Bancolombia, Nequi, Tarjetas Débito/Crédito, Efectivo",
    },
    services: [
      {
        id: "serv-ort-1",
        title: "Valoración Biomecánica y Prescripción de Órtesis",
        description: "Evaluación postural computarizada, análisis cinemático de marcha y diseño de plan órtico personalizado.",
        basePrice: 90000,
        categoryTag: "Procedimiento / Valoración",
        imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
        order: 0,
        isActive: true,
      },
      {
        id: "serv-ort-2",
        title: "Férula Termoplástica Perforada a Medida (Muñeca / Mano)",
        description: "Moldeo directo sobre el paciente con termoplástico de baja temperatura, ventilado, lavable y con fijaciones en velcro suave.",
        basePrice: 165000,
        categoryTag: "Órtesis & Inmovilizadores",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
        order: 1,
        isActive: true,
      },
      {
        id: "serv-ort-3",
        title: "Plantillas Ortopédicas Computarizadas (Par)",
        description: "Estudio podométrico dinámico y fabricación en EVA multicapa para fascitis plantar, metatarsalgia o pie plano.",
        basePrice: 220000,
        categoryTag: "Biomecánica & Plantillas",
        imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80",
        order: 2,
        isActive: true,
      },
      {
        id: "serv-ort-4",
        title: "Alquiler Mensual Silla de Ruedas Clínica Plegable",
        description: "Estructura en acero cromado ultrarresistente, apoya-pies desmontables, frenos de seguridad y asiento ergonómico.",
        basePrice: 120000,
        categoryTag: "Alquiler de Equipos",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
        order: 3,
        isActive: true,
      },
      {
        id: "serv-ort-5",
        title: "Alquiler Quincenal Muletas Canadienses / Andador",
        description: "Aluminio anodizado ultraligero con regulación telescópica de altura y coderas anatómicas hipoalergénicas.",
        basePrice: 45000,
        categoryTag: "Alquiler de Equipos",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
        order: 4,
        isActive: true,
      },
      {
        id: "serv-ort-6",
        title: "Inmovilizador Graduable de Rodilla (Férula ROM Mecánica)",
        description: "Control de flexo-extensión de 0° a 120° para postoperatorio de ligamentos cruzados y meniscos.",
        basePrice: 195000,
        categoryTag: "Órtesis & Inmovilizadores",
        imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
        order: 5,
        isActive: true,
      },
    ],
    quotes: [
      {
        id: "q-ort-1",
        clientName: "Samuel Peñuela (Acudiente: Dra. Marcela Peñuela)",
        clientPhone: "573158882233",
        patientIdNumber: "TI 1.024.958.332",
        attendingDoctor: "Dr. Roberto Casas (Ortopedia Pediátrica)",
        diagnosis: "Esguince grado II ligamento colateral medial rodilla derecha",
        medicalConceptType: "integral",
        rentalPeriod: "30 días",
        clinicalNotes: "Uso continuo del inmovilizador graduado a 30° flexión. Apoyo parcial con muletas durante 15 días.",
        workDescription: "Adaptación de inmovilizador de rodilla graduable ROM + Alquiler mensual de muletas canadienses en aluminio y valoración biomecánica inicial.",
        totalAmount: 240000,
        status: "pendiente",
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "q-ort-2",
        clientName: "Valeria Domínguez",
        clientPhone: "573187774411",
        patientIdNumber: "CC 52.894.120",
        attendingDoctor: "Dra. Carolina Méndez (Especialista en Miembro Superior)",
        diagnosis: "Tenosinovitis de De Quervain y síndrome de túnel carpiano bilateral",
        medicalConceptType: "ortesis",
        clinicalNotes: "Retirar únicamente para baño personal. Revisión y ajuste de cinchas en 10 días.",
        workDescription: "Confección y moldeo anatómico directo de 2 férulas termoplásticas para inmovilización de pulgar y muñeca a medida.",
        totalAmount: 310000,
        status: "en_progreso",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        payments: [
          {
            id: "rec-ort-201",
            receiptNumber: "REC-ORT-2-01",
            amount: 155000,
            paymentMethod: "Bancolombia",
            receiptType: "Anticipo 50% para inicio",
            notes: "Abono inicial para moldeado de férulas",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },
      {
        id: "q-ort-3",
        clientName: "Don Hernando Morales",
        clientPhone: "573104449988",
        patientIdNumber: "CC 19.340.812",
        attendingDoctor: "Dr. Fernando Duarte (Traumatología Adulto Mayor)",
        diagnosis: "Postoperatorio reemplazo total de cadera derecha",
        medicalConceptType: "alquiler",
        rentalPeriod: "60 días",
        clinicalNotes: "Silla de ruedas con elevación de pierna derecha a 45°. Traslado asistido.",
        workDescription: "Alquiler bimestral de silla de ruedas clínica con descansapiernas elevable y entrega a domicilio con protocolo de higienización.",
        totalAmount: 220000,
        status: "finalizado",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        payments: [
          {
            id: "rec-ort-301",
            receiptNumber: "REC-ORT-3-01",
            amount: 110000,
            paymentMethod: "Transferencia Bancolombia",
            receiptType: "Anticipo 50% para inicio",
            notes: "Depósito mes 1",
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          },
          {
            id: "rec-ort-302",
            receiptNumber: "REC-ORT-3-02",
            amount: 110000,
            paymentMethod: "Efectivo en entrega",
            receiptType: "Liquidación final 100%",
            notes: "Pago segundo mes y liquidación a conformidad",
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
        ],
      },
    ],
  },
  electricidad: {
    business: {
      id: "demo-electricidad",
      ownerId: "demo-user-1",
      businessName: "ElectroVolt Soluciones",
      businessSlug: "electrovolt",
      category: "electricidad",
      categoryLabel: "Electricidad & Redes",
      whatsappNumber: "573105559876",
      city: "Bogotá / Medellín",
      bio: "Técnico electricista certificado CONALTEC. Instalaciones residenciales, cableado estructurado, detección de fugas eléctricas y tableros bajo norma RETIE.",
      logoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
      rating: 4.9,
      completedJobsCount: 142,
      paymentMethods: "Nequi, Daviplata, Bancolombia, Efectivo",
    },
    services: [
      {
        id: "serv-el-1",
        title: "Instalación de Tableros Eléctricos y Breakers",
        description: "Montaje, balanceo de cargas y sustitución de breakers según normativa RETIE para hogares y locales comerciales.",
        basePrice: 180000,
        categoryTag: "Instalación",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
        order: 0,
        isActive: true,
      },
      {
        id: "serv-el-2",
        title: "Detección de Cortocircuitos y Fugas de Energía",
        description: "Diagnóstico especializado con pinza amperimétrica y megóhmetro para corregir sobrecostos en tu factura.",
        basePrice: 130000,
        categoryTag: "Urgencias / Reparación",
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
        order: 1,
        isActive: true,
      },
      {
        id: "serv-el-3",
        title: "Cableado Estructurado e Iluminación LED",
        description: "Instalación de ojos de buey, tiras led perimetrales, conmutables inteligentes y puntos de red de alta velocidad.",
        basePrice: 95000,
        categoryTag: "Iluminación",
        imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80",
        order: 2,
        isActive: true,
      },
      {
        id: "serv-el-4",
        title: "Instalación de Calentadores Eléctricos y Duchas",
        description: "Montaje de circuito independiente con breaker diferencial, cableado de seguridad y prueba hidráulica.",
        basePrice: 110000,
        categoryTag: "Calentadores",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
        order: 3,
        isActive: true,
      },
      {
        id: "serv-el-5",
        title: "Certificación RETIE y Cuadro de Cargas",
        description: "Levantamiento de planos unifilares, medición de puesta a tierra y trámite para energización con la empresa de energía.",
        basePrice: 450000,
        categoryTag: "Certificación RETIE",
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
        order: 4,
        isActive: true,
      },
    ],
    quotes: [
      {
        id: "q-el-1",
        clientName: "Carlos Mendoza",
        clientPhone: "573001234567",
        workDescription: "Cambio de tablero general de 12 circuitos y breakers termomagnéticos en apartamento 402.",
        totalAmount: 350000,
        status: "pendiente",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "q-el-2",
        clientName: "Dra. Sofía Restrepo",
        clientPhone: "573119876543",
        workDescription: "Instalación de 14 paneles LED empotrados en consultorio y cableado de tomas reguladas.",
        totalAmount: 520000,
        status: "en_progreso",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        payments: [
          {
            id: "rec-el-201",
            receiptNumber: "REC-EL-2-01",
            amount: 260000,
            paymentMethod: "Bancolombia",
            receiptType: "Anticipo 50% para inicio",
            notes: "Transferencia inicio de obra",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },
      {
        id: "q-el-3",
        clientName: "Restaurante El Leñador",
        clientPhone: "573205551122",
        workDescription: "Acometida trifásica para horno industrial y certificación de puesta a tierra.",
        totalAmount: 890000,
        status: "finalizado",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        payments: [
          {
            id: "rec-el-301",
            receiptNumber: "REC-EL-3-01",
            amount: 450000,
            paymentMethod: "Nequi",
            receiptType: "Anticipo 50% para inicio",
            notes: "Abono inicial",
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
          {
            id: "rec-el-302",
            receiptNumber: "REC-EL-3-02",
            amount: 440000,
            paymentMethod: "Efectivo en mano",
            receiptType: "Liquidación final 100%",
            notes: "Liquidación final a satisfacción",
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
        ],
      },
    ],
  },
  obra_blanca: {
    business: {
      id: "demo-obra-blanca",
      ownerId: "demo-user-1",
      businessName: "Acabados & Drywall Pro",
      businessSlug: "acabados-obra-blanca",
      category: "obra_blanca",
      categoryLabel: "Obra Blanca & Acabados",
      whatsappNumber: "573124445566",
      city: "Medellín / Envigado / Sabaneta",
      bio: "Maestro especializado en pintura de interiores, muros divisorios en drywall, cielo rasos con cajillo de luz indirecta LED y estuco veneciano.",
      logoUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80",
      rating: 5.0,
      completedJobsCount: 118,
      paymentMethods: "Nequi, Bancolombia, Efectivo",
    },
    services: [
      {
        id: "serv-ob-1",
        title: "Pintura de Interiores y Fachadas (por m²)",
        description: "Preparación de superficie, resane de grietas, aplicación de base selladora y dos manos de pintura lavable de primera calidad.",
        basePrice: 16000,
        categoryTag: "Pintura",
        imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
        order: 0,
        isActive: true,
      },
      {
        id: "serv-ob-2",
        title: "Instalación de Muros en Drywall y Superboard",
        description: "Estructura galvanizada, placas de yeso o fibrocemento, cinta de malla y masillado listo para pintura.",
        basePrice: 55000,
        categoryTag: "Drywall",
        imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
        order: 1,
        isActive: true,
      },
      {
        id: "serv-ob-3",
        title: "Cielo Rasos en Drywall con Cajillo de Luz Indirecta",
        description: "Montaje de techos suspendidos modernos con diseño arquitectónico para iluminación perimetral.",
        basePrice: 68000,
        categoryTag: "Cielo Raso",
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
        order: 2,
        isActive: true,
      },
      {
        id: "serv-ob-4",
        title: "Estuco Plástico y Resane de Humedades (por m²)",
        description: "Impermeabilización previa, estuco plástico antihongos y lijado profesional con aspiradora sin polvo.",
        basePrice: 22000,
        categoryTag: "Estuco",
        imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80",
        order: 3,
        isActive: true,
      },
      {
        id: "serv-ob-5",
        title: "Instalación de Pisos Laminados y PVC Click (por m²)",
        description: "Nivelación de piso, colocación de aislante acústico y montaje de zócalos perimetrales.",
        basePrice: 28000,
        categoryTag: "Pisos",
        imageUrl: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&auto=format&fit=crop&q=80",
        order: 4,
        isActive: true,
      },
    ],
    quotes: [
      {
        id: "q-ob-1",
        clientName: "Familia Cárdenas",
        clientPhone: "573145558899",
        workDescription: "Pintura general de apartamento 85m² en blanco hueso y muro de acento sala.",
        totalAmount: 1350000,
        status: "pendiente",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "q-ob-2",
        clientName: "Estudio Creativo Mono",
        clientPhone: "573012223344",
        workDescription: "División de oficina en drywall acústico de 4x2.6m con puerta corrediza.",
        totalAmount: 880000,
        status: "finalizado",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
  },
  mascotas: {
    business: {
      id: "demo-mascotas",
      ownerId: "demo-user-1",
      businessName: "Huellas & Colitas Adiestramiento",
      businessSlug: "huellas-canino",
      category: "mascotas",
      categoryLabel: "Paseo & Adiestramiento Canino",
      whatsappNumber: "573009998877",
      city: "Bogotá (Usaquén / Chapinero / Cedritos)",
      bio: "Educador canino y paseador profesional. Paseos recreativos seguros con GPS, adiestramiento en positivo para cachorros y adultos, modificación de conducta y guardería.",
      logoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&auto=format&fit=crop&q=80",
      rating: 4.95,
      completedJobsCount: 230,
      paymentMethods: "Nequi, Daviplata, Efectivo",
    },
    services: [
      {
        id: "serv-pet-1",
        title: "Paseo Canino Recreativo y Socialización (1 Hora)",
        description: "Paseo guiado con hidratación, reporte de ruta por GPS, fotos en tiempo real y recogida puerta a puerta.",
        basePrice: 25000,
        categoryTag: "Paseo Diario",
        imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80",
        order: 0,
        isActive: true,
      },
      {
        id: "serv-pet-2",
        title: "Adiestramiento Básico en Positivo (Obediencia Urbana)",
        description: "Clase personalizada: control de jalones de correa, sentado, quieto, llamado confiable y autocontrol ante estímulos.",
        basePrice: 75000,
        categoryTag: "Adiestramiento",
        imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80",
        order: 1,
        isActive: true,
      },
      {
        id: "serv-pet-3",
        title: "Modificación de Conducta (Miedos, Reactividad y Ladridos)",
        description: "Evaluación etológica integral a domicilio para tratar ansiedad por separación, reactividad con otros perros o agresividad por miedo.",
        basePrice: 95000,
        categoryTag: "Conducta Canina",
        imageUrl: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&auto=format&fit=crop&q=80",
        order: 2,
        isActive: true,
      },
      {
        id: "serv-pet-4",
        title: "Hospedaje & Guardería Campestre (Fin de Semana)",
        description: "Estadía en finca campestre con piscina canina, dormitorios climatizados y supervisión médica 24 horas.",
        basePrice: 65000,
        categoryTag: "Guardería",
        imageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop&q=80",
        order: 3,
        isActive: true,
      },
      {
        id: "serv-pet-5",
        title: "Paseo en Manada y Socialización Canina",
        description: "Ruta de estímulos y ejercicio en grupo reducido de compatibilidad asegurada con educador canino.",
        basePrice: 32000,
        categoryTag: "Socialización",
        imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80",
        order: 4,
        isActive: true,
      },
    ],
    quotes: [
      {
        id: "q-pet-1",
        clientName: "Mariana Gómez (Golden Retriever 'Toby')",
        clientPhone: "573178889900",
        workDescription: "Paquete mensual de 12 paseos recreativos con socialización de 1 hora.",
        totalAmount: 280000,
        status: "pendiente",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "q-pet-2",
        clientName: "Alejandro Pérez (Pastor Alemán 'Zeus')",
        clientPhone: "573103334455",
        workDescription: "Plan de 5 sesiones de adiestramiento para control de reactividad con correa.",
        totalAmount: 360000,
        status: "en_progreso",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
};

const defaultDemoBusiness = PRECONFIGURED_BUSINESSES.electricidad.business;
const defaultDemoServices = PRECONFIGURED_BUSINESSES.electricidad.services;
const defaultDemoQuotes = PRECONFIGURED_BUSINESSES.electricidad.quotes;

// Helper de LocalStorage
export function getLocalItem(key, defaultValue) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

export function switchDemoProfile(profileKey) {
  const selected = PRECONFIGURED_BUSINESSES[profileKey];
  if (selected) {
    setLocalItem("business", selected.business);
    setLocalItem("services", selected.services);
    setLocalItem("quotes", selected.quotes);
    try {
      window.dispatchEvent(
        new CustomEvent("vitrinapro_business_switched", { detail: selected.business })
      );
    } catch (e) {
      console.debug("switchDemoProfile event dispatch error:", e);
    }
    return selected;
  }
  return null;
}

export function createNewCleanBusiness(customBusiness, initialServices = []) {
  setLocalItem("business", customBusiness);
  setLocalItem("services", initialServices);
  setLocalItem("quotes", []);
  try {
    window.dispatchEvent(
      new CustomEvent("vitrinapro_business_switched", { detail: customBusiness })
    );
  } catch (e) {
    console.debug("createNewCleanBusiness event dispatch error:", e);
  }
  return { business: customBusiness, services: initialServices, quotes: [] };
}

/* =========================================================================
   1. SERVICIOS DEL NEGOCIO (BUSINESS) & RESOLUCIÓN INTELIGENTE DE SLUGS
   ========================================================================= */

// Utilidad universal para generar slugs a partir de nombres
export function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Mapeo de alias comunes y URLs amigables
const SLUG_ALIASES = {
  "huellas-colitas-adiestramiento": "huellas-canino",
  "huellas-colitas": "huellas-canino",
  "huellas": "huellas-canino",
  "climaconfort-refrigeracion": "climaconfort-costa",
  "climaconfort": "climaconfort-costa",
  "hidrosoluciones-gas": "hidrosoluciones-cali",
  "hidrosoluciones": "hidrosoluciones-cali",
  "acabados-drywall": "acabados-obra-blanca",
  "drywall": "acabados-obra-blanca",
  "electro-volt": "electrovolt",
};

// Mock de inquilinos adicionales disponibles en la plataforma
export const EXTRA_DEMO_BUSINESSES = [
  {
    business: {
      id: "demo-plomeria",
      ownerId: "demo-user-4",
      businessName: "HidroSoluciones & Gas Cali",
      businessSlug: "hidrosoluciones-cali",
      category: "plomeria",
      categoryLabel: "Plomería & Redes de Gas",
      whatsappNumber: "573124445566",
      city: "Cali",
      bio: "Plomero certificado en detección geofónica de fugas, destape con sonda eléctrica y redes de gas residenciales.",
      logoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80",
      rating: 4.85,
      completedJobsCount: 96,
      subscriptionPlan: "pro",
      planSince: "2026-01-15",
      monthlyFee: 39000,
    },
    services: [
      { id: "s-p1", title: "Detección Geofónica de Fugas Ocultas", basePrice: 190000, categoryTag: "Diagnóstico" },
      { id: "s-p2", title: "Destape de Cañerías con Sonda Eléctrica", basePrice: 120000, categoryTag: "Urgencias" },
      { id: "s-p3", title: "Instalación de Calentadores a Gas", basePrice: 160000, categoryTag: "Gasodomésticos" },
    ],
    quotes: [
      { id: "q-p1", clientName: "Condominio Los Farallones", totalAmount: 480000, status: "finalizado", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), workDescription: "Reparación de matriz principal de 2 pulgadas" },
      { id: "q-p2", clientName: "Beatriz Arango", totalAmount: 340000, status: "en_progreso", createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), workDescription: "Cambio de grifería y sifones cocina" },
    ]
  },
  {
    business: {
      id: "demo-clima",
      ownerId: "demo-user-5",
      businessName: "ClimaConfort Refrigeración",
      businessSlug: "climaconfort-costa",
      category: "climatizacion",
      categoryLabel: "Aires Acondicionados & Climatización",
      whatsappNumber: "573007778899",
      city: "Barranquilla / Cartagena",
      bio: "Mantenimiento preventivo químico de minisplits, recarga de gas R410 e instalación inverter de alta eficiencia.",
      logoUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&auto=format&fit=crop&q=80",
      rating: 4.92,
      completedJobsCount: 180,
      subscriptionPlan: "pro",
      planSince: "2026-02-01",
      monthlyFee: 39000,
    },
    services: [
      { id: "s-c1", title: "Mantenimiento Químico Integral Minisplit", basePrice: 85000, categoryTag: "Mantenimiento" },
      { id: "s-c2", title: "Instalación de Aire Inverter 12.000 BTU", basePrice: 220000, categoryTag: "Instalación" },
      { id: "s-c3", title: "Detección de Fugas y Carga de Refrigerante", basePrice: 140000, categoryTag: "Reparación" },
    ],
    quotes: [
      { id: "q-c1", clientName: "Hotel Boutique Santa Ana", totalAmount: 850000, status: "finalizado", createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), workDescription: "Mantenimiento a 10 unidades de habitación" },
      { id: "q-c2", clientName: "Dr. Hernando Castro", totalAmount: 440000, status: "en_progreso", createdAt: new Date(Date.now() - 86400000).toISOString(), workDescription: "Instalación de 2 aires en consultorio médico" },
      { id: "q-c3", clientName: "Oficinas Puerto Central", totalAmount: 660000, status: "pendiente", createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), workDescription: "Revisión compresores y cambio de contactores" },
    ]
  }
];

export async function getBusinessBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  const effectiveSlug = SLUG_ALIASES[cleanSlug] || cleanSlug;

  if (isFirebaseConfigured) {
    try {
      // 1. Intentar con cleanSlug
      let q = query(
        collection(db, "businesses"),
        where("businessSlug", "==", cleanSlug)
      );
      let snapshot = await getDocs(q);

      // Si no se encuentra y hay un alias, intentar con effectiveSlug
      if (snapshot.empty && effectiveSlug !== cleanSlug) {
        q = query(
          collection(db, "businesses"),
          where("businessSlug", "==", effectiveSlug)
        );
        snapshot = await getDocs(q);
      }

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const business = { id: docSnap.id, ...docSnap.data() };
        // Cargar subcolección de servicios activos y ordenados
        const servicesSnapshot = await getDocs(
          collection(db, "businesses", docSnap.id, "services")
        );
        const services = servicesSnapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return { ...business, services };
      }
    } catch (error) {
      console.warn("Firestore getBusinessBySlug error, usando fallback:", error);
    }
  }

  // Función auxiliar para comparar slugs directos, alias y nombres slugificados
  const matchesSlug = (biz) => {
    if (!biz) return false;
    const bSlug = (biz.businessSlug || "").toLowerCase();
    const bNameSlug = slugify(biz.businessName);
    return (
      bSlug === cleanSlug ||
      bSlug === effectiveSlug ||
      bNameSlug === cleanSlug ||
      bNameSlug === effectiveSlug
    );
  };

  // 1. Fallback Local: Verificar si coincide con alguno de los perfiles precargados
  for (const key of Object.keys(PRECONFIGURED_BUSINESSES)) {
    const p = PRECONFIGURED_BUSINESSES[key];
    if (matchesSlug(p.business)) {
      // Si el negocio actualmente activo en localStorage es este mismo, usar los datos modificados por el usuario
      const currentLocalBiz = getLocalItem("business", null);
      if (currentLocalBiz && matchesSlug(currentLocalBiz)) {
        const localServices = getLocalItem("services", p.services)
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return { ...currentLocalBiz, services: localServices };
      }
      return { ...p.business, services: p.services };
    }
  }

  // 2. Fallback Local: Verificar en negocios demo adicionales (ClimaConfort, HidroSoluciones, etc.)
  for (const extra of EXTRA_DEMO_BUSINESSES) {
    if (matchesSlug(extra.business)) {
      const currentLocalBiz = getLocalItem("business", null);
      if (currentLocalBiz && matchesSlug(currentLocalBiz)) {
        const localServices = getLocalItem("services", extra.services)
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return { ...currentLocalBiz, services: localServices };
      }
      return { ...extra.business, services: extra.services };
    }
  }

  // 3. Fallback Local: Si coincide con el negocio guardado en localStorage
  const localBiz = getLocalItem("business", defaultDemoBusiness);
  if (matchesSlug(localBiz)) {
    const localServices = getLocalItem("services", defaultDemoServices)
      .filter((s) => s.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return { ...localBiz, services: localServices };
  }

  return null;
}

export async function getBusinessByOwnerId(ownerId) {
  if (!ownerId) return null;

  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "businesses"),
        where("ownerId", "==", ownerId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (error) {
      console.warn("Firestore getBusinessByOwnerId error:", error);
    }
  }

  // Fallback Local
  const localBiz = getLocalItem("business", {
    ...defaultDemoBusiness,
    ownerId: ownerId,
  });
  return localBiz;
}

export async function saveBusinessProfile(businessData) {
  if (isFirebaseConfigured && businessData?.id) {
    try {
      const docRef = doc(db, "businesses", businessData.id);
      await setDoc(docRef, { ...businessData, updatedAt: serverTimestamp() }, { merge: true });
      return businessData;
    } catch (error) {
      console.warn("Firestore saveBusinessProfile error:", error);
    }
  }

  setLocalItem("business", businessData);
  return businessData;
}

/* =========================================================================
   2. GESTIÓN DE SERVICIOS (SUBCOLECCIÓN `services`)
   ========================================================================= */

export async function getBusinessServices(businessId) {
  if (isFirebaseConfigured && businessId) {
    try {
      const snapshot = await getDocs(
        collection(db, "businesses", businessId, "services")
      );
      const services = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (services.length > 0) {
        return services.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      }
    } catch (error) {
      console.warn("Firestore getBusinessServices error:", error);
    }
  }

  // Fallback: verificar si coincide con alguno de los inquilinos preconfigurados
  if (businessId) {
    for (const key of Object.keys(PRECONFIGURED_BUSINESSES)) {
      const item = PRECONFIGURED_BUSINESSES[key];
      if (item.business.id === businessId || item.business.businessSlug === businessId) {
        return [...item.services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }

    for (const extra of EXTRA_DEMO_BUSINESSES) {
      if (extra.business.id === businessId || extra.business.businessSlug === businessId) {
        return [...extra.services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }
  }

  const local = getLocalItem("services", defaultDemoServices);
  return local.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function addBusinessService(businessId, serviceData, imageFile = null) {
  let imageUrl = serviceData.imageUrl || "";

  // 1. Subida a Firebase Storage si hay archivo de imagen y Firebase está activo
  if (imageFile && isFirebaseConfigured) {
    try {
      const fileExt = imageFile.name.split(".").pop();
      const storagePath = `businesses/${businessId}/services/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const imageRef = ref(storage, storagePath);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    } catch (storageError) {
      console.error("Error subiendo imagen a Firebase Storage:", storageError);
    }
  } else if (imageFile && !imageUrl) {
    // Modo local: DataURL temporal
    imageUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(imageFile);
    });
  }

  if (!imageUrl) {
    imageUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80";
  }

  const currentServices = await getBusinessServices(businessId);
  const nextOrder = currentServices.length;

  const payload = {
    title: serviceData.title.trim(),
    description: serviceData.description.trim(),
    basePrice: Number(serviceData.basePrice) || 0,
    categoryTag: serviceData.categoryTag || "General",
    isActive: serviceData.isActive !== false,
    order: serviceData.order !== undefined ? Number(serviceData.order) : nextOrder,
    imageUrl,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && businessId) {
    try {
      const docRef = await addDoc(
        collection(db, "businesses", businessId, "services"),
        { ...payload, timestamp: serverTimestamp() }
      );
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.warn("Firestore addBusinessService error:", error);
    }
  }

  // Fallback Local
  const newService = { id: `serv-${Date.now()}`, ...payload };
  const updated = [...currentServices, newService];
  setLocalItem("services", updated);
  return newService;
}

export async function updateBusinessService(businessId, serviceId, updatedFields, imageFile = null) {
  let imageUrl = updatedFields.imageUrl;

  if (imageFile && isFirebaseConfigured) {
    try {
      const fileExt = imageFile.name.split(".").pop();
      const storagePath = `businesses/${businessId}/services/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const imageRef = ref(storage, storagePath);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    } catch (storageError) {
      console.error("Error subiendo imagen a Storage:", storageError);
    }
  } else if (imageFile && !imageUrl) {
    imageUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(imageFile);
    });
  }

  const payload = {
    ...updatedFields,
    ...(imageUrl ? { imageUrl } : {}),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && businessId && serviceId) {
    try {
      const docRef = doc(db, "businesses", businessId, "services", serviceId);
      await updateDoc(docRef, { ...payload, timestamp: serverTimestamp() });
      return { id: serviceId, ...payload };
    } catch (error) {
      console.warn("Firestore updateBusinessService error:", error);
    }
  }

  const currentServices = getLocalItem("services", defaultDemoServices);
  const updated = currentServices.map((s) =>
    s.id === serviceId ? { ...s, ...payload } : s
  );
  setLocalItem("services", updated);
  return { id: serviceId, ...payload };
}

export async function reorderBusinessServices(businessId, orderedServices) {
  if (isFirebaseConfigured && businessId) {
    try {
      const promises = orderedServices.map((s, index) => {
        const docRef = doc(db, "businesses", businessId, "services", s.id);
        return updateDoc(docRef, { order: index });
      });
      await Promise.all(promises);
      return orderedServices.map((s, index) => ({ ...s, order: index }));
    } catch (error) {
      console.warn("Firestore reorderBusinessServices error:", error);
    }
  }

  const updated = orderedServices.map((s, index) => ({ ...s, order: index }));
  setLocalItem("services", updated);
  return updated;
}

export async function importPresetServices(businessId, presetList) {
  const currentServices = await getBusinessServices(businessId);
  let orderOffset = currentServices.length;

  const added = [];
  for (const preset of presetList) {
    const s = await addBusinessService(businessId, {
      title: preset.title,
      description: preset.description,
      basePrice: preset.basePrice,
      categoryTag: preset.categoryTag || "General",
      imageUrl: preset.imageUrl,
      order: orderOffset++,
      isActive: true,
    });
    added.push(s);
  }
  return added;
}

export async function deleteBusinessService(businessId, serviceId) {
  if (isFirebaseConfigured && businessId && serviceId) {
    try {
      await deleteDoc(doc(db, "businesses", businessId, "services", serviceId));
      return true;
    } catch (error) {
      console.warn("Firestore deleteBusinessService error:", error);
    }
  }

  const currentServices = getLocalItem("services", defaultDemoServices);
  const updated = currentServices.filter((s) => s.id !== serviceId);
  setLocalItem("services", updated);
  return true;
}

/* =========================================================================
   3. GESTIÓN DE COTIZACIONES Y TRABAJOS (SUBCOLECCIÓN `quotes`)
   ========================================================================= */

export async function getBusinessQuotes(businessId) {
  if (isFirebaseConfigured && businessId) {
    try {
      const q = query(
        collection(db, "businesses", businessId, "quotes"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const quotes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (quotes.length > 0) {
        return quotes;
      }
    } catch (error) {
      console.warn("Firestore getBusinessQuotes error:", error);
    }
  }

  // Fallback: verificar si coincide con alguno de los inquilinos preconfigurados
  if (businessId) {
    for (const key of Object.keys(PRECONFIGURED_BUSINESSES)) {
      const item = PRECONFIGURED_BUSINESSES[key];
      if (item.business.id === businessId || item.business.businessSlug === businessId) {
        return item.quotes || [];
      }
    }

    for (const extra of EXTRA_DEMO_BUSINESSES) {
      if (extra.business.id === businessId || extra.business.businessSlug === businessId) {
        return extra.quotes || [];
      }
    }
  }

  return getLocalItem("quotes", defaultDemoQuotes);
}

export async function addBusinessQuote(businessId, quoteData) {
  const payload = {
    clientName: quoteData.clientName.trim(),
    clientPhone: quoteData.clientPhone.replace(/\D/g, ""),
    workDescription: quoteData.workDescription.trim(),
    totalAmount: Number(quoteData.totalAmount) || 0,
    status: quoteData.status || "pendiente", // 'pendiente' | 'en_progreso' | 'finalizado'
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && businessId) {
    try {
      const docRef = await addDoc(
        collection(db, "businesses", businessId, "quotes"),
        { ...payload, timestamp: serverTimestamp() }
      );
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.warn("Firestore addBusinessQuote error:", error);
    }
  }

  const currentQuotes = getLocalItem("quotes", defaultDemoQuotes);
  const newQuote = { id: `q-${Date.now()}`, ...payload };
  const updated = [newQuote, ...currentQuotes];
  setLocalItem("quotes", updated);
  return newQuote;
}

export async function updateQuoteStatus(businessId, quoteId, newStatus) {
  if (isFirebaseConfigured && businessId && quoteId) {
    try {
      const docRef = doc(db, "businesses", businessId, "quotes", quoteId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.warn("Firestore updateQuoteStatus error:", error);
    }
  }

  const currentQuotes = getLocalItem("quotes", defaultDemoQuotes);
  const updated = currentQuotes.map((q) =>
    q.id === quoteId ? { ...q, status: newStatus } : q
  );
  setLocalItem("quotes", updated);
  return true;
}

export async function deleteBusinessQuote(businessId, quoteId) {
  if (isFirebaseConfigured && businessId && quoteId) {
    try {
      await deleteDoc(doc(db, "businesses", businessId, "quotes", quoteId));
      return true;
    } catch (error) {
      console.warn("Firestore deleteBusinessQuote error:", error);
    }
  }

  const currentQuotes = getLocalItem("quotes", defaultDemoQuotes);
  const updated = currentQuotes.filter((q) => q.id !== quoteId);
  setLocalItem("quotes", updated);
  return true;
}

export async function addQuotePayment(businessId, quoteId, paymentData) {
  const newPayment = {
    id: `rec-${Date.now()}`,
    receiptNumber:
      paymentData.receiptNumber ||
      `REC-${(quoteId || "001").slice(-5).toUpperCase()}-${Date.now().toString().slice(-3)}`,
    amount: Number(paymentData.amount) || 0,
    paymentMethod: paymentData.paymentMethod || "Nequi",
    receiptType: paymentData.receiptType || "Abono parcial",
    notes: paymentData.notes || "",
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && businessId && quoteId) {
    try {
      const docRef = doc(db, "businesses", businessId, "quotes", quoteId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const currentData = snap.data();
        const existingPayments = currentData.payments || [];
        const updatedPayments = [...existingPayments, newPayment];
        const totalPaid = updatedPayments.reduce(
          (acc, p) => acc + (Number(p.amount) || 0),
          0
        );
        const totalAmount = Number(currentData.totalAmount) || 0;

        let newStatus = currentData.status;
        if (totalPaid >= totalAmount && totalAmount > 0) {
          newStatus = "finalizado";
        } else if (newStatus === "pendiente" && totalPaid > 0) {
          newStatus = "en_progreso";
        }

        await updateDoc(docRef, {
          payments: updatedPayments,
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        return { payment: newPayment, newStatus };
      }
    } catch (error) {
      console.warn("Firestore addQuotePayment error:", error);
    }
  }

  const currentQuotes = getLocalItem("quotes", defaultDemoQuotes);
  let updatedStatus = null;
  const updated = currentQuotes.map((q) => {
    if (q.id === quoteId) {
      const existingPayments = q.payments || [];
      const updatedPayments = [...existingPayments, newPayment];
      const totalPaid = updatedPayments.reduce(
        (acc, p) => acc + (Number(p.amount) || 0),
        0
      );
      const totalAmount = Number(q.totalAmount) || 0;

      let newStatus = q.status;
      if (totalPaid >= totalAmount && totalAmount > 0) {
        newStatus = "finalizado";
      } else if (newStatus === "pendiente" && totalPaid > 0) {
        newStatus = "en_progreso";
      }
      updatedStatus = newStatus;

      return {
        ...q,
        payments: updatedPayments,
        status: newStatus,
      };
    }
    return q;
  });

  setLocalItem("quotes", updated);
  return { payment: newPayment, newStatus: updatedStatus };
}

export async function deleteQuotePayment(businessId, quoteId, paymentId) {
  if (isFirebaseConfigured && businessId && quoteId) {
    try {
      const docRef = doc(db, "businesses", businessId, "quotes", quoteId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const currentData = snap.data();
        const existingPayments = currentData.payments || [];
        const updatedPayments = existingPayments.filter((p) => p.id !== paymentId);
        await updateDoc(docRef, {
          payments: updatedPayments,
          updatedAt: serverTimestamp(),
        });
        return true;
      }
    } catch (error) {
      console.warn("Firestore deleteQuotePayment error:", error);
    }
  }

  const currentQuotes = getLocalItem("quotes", defaultDemoQuotes);
  const updated = currentQuotes.map((q) => {
    if (q.id === quoteId) {
      return {
        ...q,
        payments: (q.payments || []).filter((p) => p.id !== paymentId),
      };
    }
    return q;
  });
  setLocalItem("quotes", updated);
  return true;
}

/* =========================================================================
   6. SUPER ADMIN / GOD MODE (TORRE DE CONTROL MULTI-TENANT DEL SAAS)
   ========================================================================= */

export async function getSuperAdminOverviewData() {
  // Construir inquilinos unificados (Base preconfigurada + extras + modificaciones en localStorage)
  const tenantList = [];

  // 1. Electricidad (ElectroVolt)
  const elecLocal = getLocalItem("business", null);
  const isElecActive = elecLocal?.businessSlug === "electrovolt";
  const elecServices = isElecActive ? getLocalItem("services", PRECONFIGURED_BUSINESSES.electricidad.services) : PRECONFIGURED_BUSINESSES.electricidad.services;
  const elecQuotes = isElecActive ? getLocalItem("quotes", PRECONFIGURED_BUSINESSES.electricidad.quotes) : PRECONFIGURED_BUSINESSES.electricidad.quotes;
  
  tenantList.push({
    business: {
      ...(isElecActive ? elecLocal : PRECONFIGURED_BUSINESSES.electricidad.business),
      subscriptionPlan: "pro",
      planSince: "2025-11-10",
      monthlyFee: 39000,
    },
    servicesCount: elecServices.length,
    quotesCount: elecQuotes.length,
    quotes: elecQuotes,
    totalVolume: elecQuotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
    completedVolume: elecQuotes.filter(q => q.status === "finalizado").reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
  });

  // 2. Obra Blanca (Acabados & Drywall Pro)
  const isDrywallActive = elecLocal?.businessSlug === "acabados-obra-blanca";
  const drywallServices = isDrywallActive ? getLocalItem("services", PRECONFIGURED_BUSINESSES.obra_blanca.services) : PRECONFIGURED_BUSINESSES.obra_blanca.services;
  const drywallQuotes = isDrywallActive ? getLocalItem("quotes", PRECONFIGURED_BUSINESSES.obra_blanca.quotes) : PRECONFIGURED_BUSINESSES.obra_blanca.quotes;
  
  tenantList.push({
    business: {
      ...(isDrywallActive ? elecLocal : PRECONFIGURED_BUSINESSES.obra_blanca.business),
      subscriptionPlan: "pro",
      planSince: "2025-12-01",
      monthlyFee: 39000,
    },
    servicesCount: drywallServices.length,
    quotesCount: drywallQuotes.length,
    quotes: drywallQuotes,
    totalVolume: drywallQuotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
    completedVolume: drywallQuotes.filter(q => q.status === "finalizado").reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
  });

  // 3. Mascotas (Huellas & Colitas)
  const isPetsActive = elecLocal?.businessSlug === "huellas-canino";
  const petServices = isPetsActive ? getLocalItem("services", PRECONFIGURED_BUSINESSES.mascotas.services) : PRECONFIGURED_BUSINESSES.mascotas.services;
  const petQuotes = isPetsActive ? getLocalItem("quotes", PRECONFIGURED_BUSINESSES.mascotas.quotes) : PRECONFIGURED_BUSINESSES.mascotas.quotes;

  tenantList.push({
    business: {
      ...(isPetsActive ? elecLocal : PRECONFIGURED_BUSINESSES.mascotas.business),
      subscriptionPlan: "basico",
      planSince: "2026-02-15",
      monthlyFee: 0,
    },
    servicesCount: petServices.length,
    quotesCount: petQuotes.length,
    quotes: petQuotes,
    totalVolume: petQuotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
    completedVolume: petQuotes.filter(q => q.status === "finalizado").reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
  });

  // 4. Extras
  EXTRA_DEMO_BUSINESSES.forEach(extra => {
    tenantList.push({
      business: extra.business,
      servicesCount: extra.services.length,
      quotesCount: extra.quotes.length,
      quotes: extra.quotes,
      totalVolume: extra.quotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
      completedVolume: extra.quotes.filter(q => q.status === "finalizado").reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0),
    });
  });

  // 5. Inquilinos creados mediante invitación
  const customInvited = getLocalItem("invited_tenants", []);
  customInvited.forEach(inv => {
    if (!tenantList.some(t => t.business.businessSlug === inv.business.businessSlug)) {
      tenantList.unshift(inv);
    }
  });

  // Si hay datos en Firestore, los cargamos o integramos
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, "businesses"));
      if (!snap.empty) {
        // Enriquecer o concatenar negocios reales creados en producción
        const firestoreTenants = snap.docs.map(d => ({
          business: { id: d.id, ...d.data() },
          servicesCount: 3,
          quotesCount: 2,
          quotes: [],
          totalVolume: 500000,
          completedVolume: 350000,
        }));
        // Si hay negocios reales, unificarlos
        firestoreTenants.forEach(ft => {
          if (!tenantList.some(t => t.business.businessSlug === ft.business.businessSlug)) {
            tenantList.unshift(ft);
          }
        });
      }
    } catch (e) {
      console.warn("Firestore superadmin load error:", e);
    }
  }

  // Métricas Consolidadas del SaaS
  const overrides = getLocalItem("subscriptions_override", {});

  // Enriquecer cada inquilino con su estado de suscripción detallado
  tenantList.forEach(t => {
    const ov = overrides[t.business.businessSlug] || {};
    const subDetails = calculateSubscriptionDetails(t.business, ov);
    t.business.subscriptionPlan = subDetails.plan;
    t.business.subscriptionStatus = subDetails.status;
    t.business.nextBillingDate = subDetails.nextBillingDate;
    t.business.diffDays = subDetails.diffDays;
    t.business.monthlyFee = subDetails.monthlyFee;
    t.business.lastPaymentDate = subDetails.lastPaymentDate;
    t.business.paymentReference = subDetails.paymentReference;
  });

  const totalTenants = tenantList.length;
  const proTenants = tenantList.filter(t => t.business.subscriptionPlan === "pro" || t.business.subscriptionPlan === "anual").length;
  const freeTenants = tenantList.filter(t => t.business.subscriptionPlan === "basico").length;
  const pastDueTenants = tenantList.filter(t => t.business.subscriptionStatus === "vencido").length;
  const warningTenants = tenantList.filter(t => t.business.subscriptionStatus === "por_vencer").length;
  const upToDateTenants = tenantList.filter(t => t.business.subscriptionStatus === "al_dia").length;

  const totalPlatformVolume = tenantList.reduce((acc, t) => acc + t.totalVolume, 0);
  const totalPlatformCompleted = tenantList.reduce((acc, t) => acc + t.completedVolume, 0);
  const totalQuotesCount = tenantList.reduce((acc, t) => acc + t.quotesCount, 0);
  const estimatedMRR = tenantList.reduce((acc, t) => acc + (t.business.monthlyFee || 0), 0);

  // Feed Global de Eventos Recientes
  const globalFeed = [];
  tenantList.forEach(t => {
    (t.quotes || []).forEach(q => {
      globalFeed.push({
        id: q.id,
        businessName: t.business.businessName,
        businessSlug: t.business.businessSlug,
        clientName: q.clientName,
        totalAmount: q.totalAmount,
        status: q.status,
        createdAt: q.createdAt || new Date().toISOString(),
        description: q.workDescription,
      });
    });
  });

  // Ordenar eventos por fecha más reciente
  globalFeed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    tenants: tenantList,
    stats: {
      totalTenants,
      proTenants,
      freeTenants,
      pastDueTenants,
      warningTenants,
      upToDateTenants,
      totalPlatformVolume,
      totalPlatformCompleted,
      totalQuotesCount,
      estimatedMRR,
    },
    recentFeed: globalFeed.slice(0, 10),
  };
}

export function calculateSubscriptionDetails(biz, override = {}) {
  const plan = override.subscriptionPlan || biz.subscriptionPlan || "pro";
  const monthlyFee = plan === "pro" ? 39000 : plan === "anual" ? 32500 : 0;
  
  let nextBillingDate = override.nextBillingDate || biz.nextBillingDate;
  if (!nextBillingDate) {
    const now = new Date();
    if (biz.businessSlug === "acabados-obra-blanca") {
      const d = new Date(now.getTime() + 3 * 86400000);
      nextBillingDate = d.toISOString().split("T")[0];
    } else if (biz.businessSlug === "hidrosoluciones-cali") {
      const d = new Date(now.getTime() - 2 * 86400000);
      nextBillingDate = d.toISOString().split("T")[0];
    } else {
      const d = new Date(now.getTime() + 18 * 86400000);
      nextBillingDate = d.toISOString().split("T")[0];
    }
  }

  const now = new Date();
  const next = new Date(nextBillingDate);
  const diffTime = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = "al_dia";
  if (plan === "suspendido") {
    status = "suspendido";
  } else if (diffDays < 0) {
    status = "vencido";
  } else if (diffDays <= 4) {
    status = "por_vencer";
  } else {
    status = "al_dia";
  }

  return {
    plan,
    monthlyFee,
    nextBillingDate,
    diffDays,
    status,
    lastPaymentDate: override.lastPaymentDate || "2026-09-28",
    paymentReference: override.paymentReference || `SUB-${(biz.businessSlug || "BIZ").slice(0, 4).toUpperCase()}-2026`,
  };
}

export function updateTenantSubscription(slug, updates) {
  const overrides = getLocalItem("subscriptions_override", {});
  overrides[slug] = {
    ...(overrides[slug] || {}),
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setLocalItem("subscriptions_override", overrides);
  return overrides[slug];
}

// Crear y Afiliar Nueva Empresa con Invitación Oficial
export async function createAndInviteNewBusiness(payload) {
  const cleanSlug = (payload.businessSlug || payload.businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();
  const invitationCode = `INV-${cleanSlug.slice(0, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  // Encontrar servicios predeterminados según el oficio
  const matchedTrade = TRADE_CATEGORIES.find(t => t.id === payload.category);
  const initialServices = (matchedTrade?.services && matchedTrade.services.length > 0)
    ? matchedTrade.services.slice(0, 4).map((s, idx) => ({ ...s, id: `serv-inv-${idx + 1}` }))
    : [
        {
          id: "serv-inv-1",
          title: "Diagnóstico y Cotización en Sitio",
          description: "Visita técnica especializada para evaluación de requerimientos y presupuesto exacto.",
          basePrice: 50000,
          categoryTag: "Diagnóstico",
          imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
        }
      ];

  const newTenant = {
    business: {
      id: `invited-${Date.now()}`,
      businessName: payload.businessName,
      businessSlug: cleanSlug,
      ownerName: payload.adminName || "Administrador",
      whatsappNumber: payload.whatsappNumber,
      city: payload.city || "Colombia",
      category: payload.category || "general",
      categoryLabel: matchedTrade?.name || payload.categoryLabel || "Servicios Técnicos",
      bio: payload.bio || `Servicios profesionales de ${matchedTrade?.name || "alta calidad"} en ${payload.city || "la ciudad"}. Atención garantizada y cumplimiento.`,
      logoUrl: payload.logoUrl || (initialServices[0]?.imageUrl || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80"),
      rating: 5.0,
      completedJobsCount: 0,
      subscriptionPlan: payload.subscriptionPlan || "pro",
      invitationCode,
      invitationStatus: "enviada", // 'enviada' | 'aceptada'
      invitedAt: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      monthlyFee: payload.subscriptionPlan === "basico" ? 0 : 39000,
      paymentReference: `SUB-${cleanSlug.slice(0, 4).toUpperCase()}-2026`,
    },
    servicesCount: initialServices.length,
    quotesCount: 0,
    services: initialServices,
    quotes: [],
    totalVolume: 0,
    completedVolume: 0,
  };

  // Guardar en local storage para modo demo / offline
  const invitedList = getLocalItem("invited_tenants", []);
  invitedList.unshift(newTenant);
  setLocalItem("invited_tenants", invitedList);

  // Si Firebase está configurado, guardar en Firestore
  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, "businesses"), newTenant.business);
      newTenant.business.id = docRef.id;
    } catch (e) {
      console.warn("Firestore error adding invited business:", e);
    }
  }

  return { newTenant, invitationCode };
}

// Impersonar / Iniciar sesión como un inquilino (God Mode)
export function impersonateBusinessProfile(slug) {
  let targetBiz = null;
  let targetServices = [];
  let targetQuotes = [];

  for (const key of Object.keys(PRECONFIGURED_BUSINESSES)) {
    const item = PRECONFIGURED_BUSINESSES[key];
    if (item.business.businessSlug === slug) {
      targetBiz = item.business;
      targetServices = item.services;
      targetQuotes = item.quotes;
      break;
    }
  }

  if (!targetBiz) {
    const extra = EXTRA_DEMO_BUSINESSES.find(e => e.business.businessSlug === slug);
    if (extra) {
      targetBiz = extra.business;
      targetServices = extra.services;
      targetQuotes = extra.quotes;
    }
  }

  if (!targetBiz) {
    const customInvited = getLocalItem("invited_tenants", []);
    const foundInvited = customInvited.find(inv => inv.business.businessSlug === slug);
    if (foundInvited) {
      targetBiz = foundInvited.business;
      targetServices = foundInvited.services || [];
      targetQuotes = foundInvited.quotes || [];
    }
  }

  if (targetBiz) {
    setLocalItem("business", targetBiz);
    setLocalItem("services", targetServices);
    setLocalItem("quotes", targetQuotes);
    try {
      localStorage.setItem("vitrinapro_superadmin_mode", "true");
      window.dispatchEvent(new CustomEvent("vitrinapro_business_switched", { detail: targetBiz }));
    } catch (e) {
      console.debug("SuperAdmin mode storage error:", e);
    }
    return targetBiz;
  }

  return null;
}

// Obtener lista plana de inquilinos para el conmutador rápido del Super Admin
export function getAllTenantsList() {
  const list = [];
  
  // 1. Preconfigurados principales
  Object.keys(PRECONFIGURED_BUSINESSES).forEach(key => {
    const b = PRECONFIGURED_BUSINESSES[key].business;
    list.push({
      id: b.id,
      businessName: b.businessName,
      businessSlug: b.businessSlug,
      category: b.category,
      city: b.city || "Colombia",
      logoUrl: b.logoUrl,
    });
  });

  // 2. Negocios del Directorio
  EXTRA_DEMO_BUSINESSES.forEach(extra => {
    const b = extra.business;
    list.push({
      id: b.id,
      businessName: b.businessName,
      businessSlug: b.businessSlug,
      category: b.category,
      city: b.city || "Colombia",
      logoUrl: b.logoUrl,
    });
  });

  // 3. Negocios invitados activos
  const customInvited = getLocalItem("invited_tenants", []);
  customInvited.forEach(inv => {
    if (inv?.business) {
      const b = inv.business;
      list.push({
        id: b.id,
        businessName: b.businessName,
        businessSlug: b.businessSlug,
        category: b.category,
        city: b.city || "Colombia",
        logoUrl: b.logoUrl,
      });
    }
  });

  return list;
}

/* =========================================================================
   7. SISTEMA DE ANUNCIOS GLOBALES (BROADCAST SAAS)
   ========================================================================= */

const DEFAULT_BROADCAST = {
  id: "broadcast-default-1",
  title: "🚀 ¡Nueva Calculadora de Metros Cuadrados y Puntos!",
  message: "Ahora puedes cotizar pintura, drywall, instalaciones y puntos calculando el valor exacto en tiempo real desde tu pestaña de Trabajos.",
  type: "novedad", // 'novedad' | 'urgente' | 'mantenimiento'
  isActive: true,
  createdAt: new Date().toISOString(),
  author: "Dirección de Plataforma VitrinaPro",
};

export async function getGlobalBroadcastAnnouncement() {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, "system", "broadcast"));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.warn("Firestore broadcast fetch error:", e);
    }
  }
  return getLocalItem("global_broadcast", DEFAULT_BROADCAST);
}

export async function saveGlobalBroadcastAnnouncement(announcement) {
  const updated = {
    ...announcement,
    updatedAt: new Date().toISOString(),
  };

  setLocalItem("global_broadcast", updated);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, "system", "broadcast"), updated);
    } catch (e) {
      console.warn("Firestore broadcast save error:", e);
    }
  }

  return updated;
}

/* =========================================================================
   8. GESTIÓN GLOBAL DE CATEGORÍAS (SUPER ADMIN & PLATAFORMA)
   ========================================================================= */

export async function getPlatformCategories() {
  let customCategories = [];

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, "platform_categories"));
      if (!snap.empty) {
        customCategories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Firestore categories fetch error:", e);
    }
  }

  if (customCategories.length === 0) {
    customCategories = getLocalItem("platform_custom_categories", []);
  }

  // Fusionar las categorías base de TRADE_CATEGORIES con las categorías creadas por el usuario
  const mergedMap = new Map();
  TRADE_CATEGORIES.forEach((cat) => mergedMap.set(cat.id, cat));
  customCategories.forEach((cat) => mergedMap.set(cat.id, { ...mergedMap.get(cat.id), ...cat }));

  return Array.from(mergedMap.values());
}

export async function createPlatformCategory(categoryData) {
  const slug = (categoryData.id || categoryData.name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const newCat = {
    id: slug,
    name: categoryData.name.trim(),
    icon: categoryData.icon || "Tag",
    color: categoryData.color || "teal",
    description: categoryData.description || `Servicios profesionales de ${categoryData.name}`,
    services: categoryData.services || [],
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  // Guardar en local
  const currentLocal = getLocalItem("platform_custom_categories", []);
  const updated = [...currentLocal.filter((c) => c.id !== slug), newCat];
  setLocalItem("platform_custom_categories", updated);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, "platform_categories", slug), newCat);
    } catch (e) {
      console.warn("Firestore save category error:", e);
    }
  }

  try {
    window.dispatchEvent(new CustomEvent("vitrinapro_categories_updated", { detail: newCat }));
  } catch (err) {
    console.debug("Category event dispatch error:", err);
  }

  return newCat;
}

export async function deletePlatformCategory(categoryId) {
  const currentLocal = getLocalItem("platform_custom_categories", []);
  const updated = currentLocal.filter((c) => c.id !== categoryId);
  setLocalItem("platform_custom_categories", updated);

  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, "platform_categories", categoryId));
    } catch (e) {
      console.warn("Firestore delete category error:", e);
    }
  }

  try {
    window.dispatchEvent(new CustomEvent("vitrinapro_categories_updated", { detail: { id: categoryId, deleted: true } }));
  } catch (err) {
    console.debug("Category delete event dispatch error:", err);
  }

  return true;
}


