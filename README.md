# ⚡ VitrinaPro — SaaS Móvil Premium para Prestadores de Servicios

**VitrinaPro** es una plataforma móvil-first de grado profesional diseñada para contratistas, técnicos independientes y maestros de obra (electricistas, instaladores de obra blanca, pintores, paseadores y entrenadores caninos, carpinteros, plomeros, cerrajeros, etc.). 

Resuelve de punta a punta:
1. **Vitrina Digital Personalizada** (`/b/:businessSlug`) con catálogo de servicios ordenado, insignia de disponibilidad en tiempo real, portafolio Antes vs Después interactivo y botón flotante de WhatsApp.
2. **Personalizador Pro en Vivo:** Editor visual estructurado en 4 tarjetas (*Identidad, Cobertura, Cuentas de Cobro Nequi/Bancolombia y Garantías*) con previsualización en tiempo real.
3. **Calculadora Asistida de Presupuestos:** Cálculo por metros cuadrados (m²), cantidad de puntos eléctricos o planes semanales recurrentes, insertando la memoria de cálculo en la cotización.
4. **Generador y Descargador de Cotizaciones Oficiales en PDF:** Membretadas con consecutivo, desglose de costos, 50% de anticipo, garantía escrita y firmas.
5. **Emisor Oficial de Recibos de Caja y Comprobantes de Abono (PDF + WhatsApp):** Constatando el valor recibido, saldo restante por cobrar y paz y salvo formal.
6. **Panel de Rentabilidad y Pipeline Comercial:** Con tasa de cierre (%), ticket promedio facturado y barra de distribución de contratos.
7. **Directorio CRM de Clientes:** Métricas de valor de por vida (LTV), historial de trabajos y botón de reactivación directa por WhatsApp.
8. **Banco de Fotos Profesionales Sugeridas:** Biblioteca de imágenes HD curadas por oficio para enriquecer el catálogo en 1 clic.
9. **Kanban de Estados de 1-Toque** (🟡 Pendiente, 🔵 En Obra, 🟢 Cobrado) con celebración háptica de confeti.
10. **Marketing Offline:** Generador de Código QR en PNG de alta resolución listo para imprimir en camionetas, uniformes y tarjetas.
11. **Captador Interactivo de Cotizaciones en Vitrina Pública:** Calculadora en vivo por m² o puntos con captura de nombre, barrio, urgencia y generación de mensaje estructurado por WhatsApp.
12. **Torre de Control Master / Super Admin SaaS (`/superadmin`):** Panel exclusivo para los dueños de la plataforma con métricas macro (GMV total transaccionado, MRR de suscripciones, directorio multi-tenant, feed global en tiempo real, modo "God Mode / Impersonar", gestor de facturación y cobro por WhatsApp, alta rápida de empresas y emisión de invitaciones oficiales con código de afiliación).
13. **Sistema de Comunicados Globales (Broadcast SaaS):** Canal de avisos en tiempo real para emitir novedades, recordatorios o mantenimientos desde el Super Admin directamente hacia los paneles de todos los contratistas.

---

## 🏛️ Stack Tecnológico

- **Frontend:** React 18 + Vite + Tailwind CSS v3 (diseño ultra-limpio, paleta slate/emerald/amber, dock inferior móvil, simulador de marco de celular para presentaciones en PC).
- **Backend (BaaS):**
  - **Firebase Auth:** Google Sign-In y Email/Password.
  - **Cloud Firestore:** Base de Datos NoSQL multi-tenant (`businesses`, subcolecciones `services` y `quotes`).
  - **Firebase Storage:** Almacenamiento seguro de fotos y portafolios.
  - **Motor de Respaldo Local:** Fallback offline automático en LocalStorage para demostraciones y pruebas instantáneas.
- **Librerías Premium:** `jspdf` (PDFs vectoriales membretados de cotización y recibos), `canvas-confetti` (celebración al cobrar), `qrcode.react` (QR para camionetas), `lucide-react` (iconografía de herramientas).

---

## 📂 Arquitectura del Proyecto

```text
├── firestore.rules                 # Reglas de seguridad Multi-Tenant (lectura pública, mutaciones solo dueño)
├── storage.rules                   # Reglas de subida a Storage (máx 5MB, solo imágenes)
├── .env.example                    # Variables de entorno Firebase
├── PRESENTACION_EJECUTIVA.md       # Dossier ejecutivo y guion de demostración en 5 minutos para el jefe
├── src/
│   ├── firebase.js                 # Inicialización Firebase + Fallback demo interactivo
│   ├── context/
│   │   └── AuthContext.jsx         # Proveedor de sesión y estado reactivo del negocio
│   ├── data/
│   │   └── tradePresets.js         # Catálogo de 8 oficios técnicos y banco de fotos HD curadas
│   ├── utils/
│   │   └── pdfGenerator.js         # Generador de Cotizaciones oficiales y Recibos de Caja en PDF
│   ├── services/
│   │   └── firestoreService.js     # Capa de datos con ordenamiento, visibilidad y CRUD multi-tenant
│   ├── components/
│   │   ├── AdminDashboard.jsx             # Panel con métricas de facturación, pipeline y simulador móvil
│   │   ├── SuperAdminDashboard.jsx        # Torre de Control SaaS: KPIs macro, MRR, GMV y Directorio Multi-tenant
│   │   ├── SuperAdminGodBar.jsx           # Barra Flotante God Mode para navegación master entre empresas
│   │   ├── SubscriptionBillingModal.jsx   # Gestor de suscripciones, cobros y mensajes WhatsApp
│   │   ├── InviteCompanyModal.jsx         # Alta rápida de empresas y emisión de invitaciones oficiales
│   │   ├── BroadcastAnnouncementModal.jsx # Sistema de comunicados y notificaciones SaaS globales
│   │   ├── GlobalBroadcastBanner.jsx      # Banner reactivo de novedades en panel de inquilinos
│   │   ├── BusinessVisualEditorModal.jsx  # Personalizador Pro de 4 tarjetas con vista previa en vivo
│   │   ├── CleanBusinessSetupModal.jsx    # Selector de 3 oficios reales o lienzo limpio en 1 clic
│   │   ├── ServiceManager.jsx             # Catálogo ilimitado, reordenamiento (▲/▼) y fotos sugeridas
│   │   ├── QuoteManager.jsx               # Cotizaciones WhatsApp, calculadora m², PDF, recibos y Kanban
│   │   ├── ClientDirectory.jsx            # Directorio CRM con métricas por cliente y seguimiento
│   │   ├── BeforeAfterGallery.jsx         # Portafolio interactivo con slider antes vs después
│   │   ├── BusinessQRCode.jsx             # QR para marketing offline y descarga PNG de alta resolución
│   │   ├── BusinessPublicView.jsx         # Vitrina pública (/b/:slug) cinemática, catálogo y FAQ
│   │   └── MobileBottomNav.jsx            # Dock inferior flotante estilo app móvil nativa
│   ├── pages/
│   │   └── Login.jsx                      # Acceso con Google, email o 1 Clic Demo
│   ├── App.jsx                     # Rutas con Code-Splitting (React.lazy + Suspense)
│   └── index.css                   # Tokens Tailwind, animaciones y guardas responsive mobile
```

---

## 🚀 Puesta en Marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

- **Panel Administrativo:** [http://localhost:5173/admin](http://localhost:5173/admin) *(cuenta con demo de 1 clic y botón "✏️ Personalizar" para editar todo en vivo)*.
- **Vitrinas Públicas Listas para Mostrar:**
  - ⚡ **Electricista:** [http://localhost:5173/b/electrovolt](http://localhost:5173/b/electrovolt)
  - 🏗️ **Obra Blanca & Drywall:** [http://localhost:5173/b/acabados-obra-blanca](http://localhost:5173/b/acabados-obra-blanca)
  - 🐕 **Adiestramiento & Paseo de Perros:** [http://localhost:5173/b/huellas-canino](http://localhost:5173/b/huellas-canino)
- **➕ Creación de Nuevos Negocios:** Desde el botón *"Cambiar Oficio"* en el panel, cualquier persona puede crear su vitrina desde cero para cualquier oficio en menos de 1 minuto.
