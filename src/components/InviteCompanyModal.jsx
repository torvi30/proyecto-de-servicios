import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Send,
  Building2,
  User,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  Copy,
  LogIn,
  Crown,
  ShieldCheck,
  Mail,
  KeyRound,
} from "lucide-react";
import { TRADE_CATEGORIES } from "../data/tradePresets";
import {
  createAndInviteNewBusiness,
  getPlatformCategories,
  addSuperAdmin,
} from "../services/firestoreService";

export default function InviteCompanyModal({
  isOpen,
  onClose,
  onCompanyCreated,
  onImpersonate,
  initialRole = "service_admin", // 'service_admin' | 'superadmin'
}) {
  const [targetRole, setTargetRole] = useState(initialRole); // 'service_admin' | 'superadmin'
  const [step, setStep] = useState("form"); // 'form' | 'success'

  // Formulario: Empresa / Prestador (Admin de Servicio)
  const [businessName, setBusinessName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("Medellín / Valle de Aburrá");
  const [category, setCategory] = useState("electricidad");
  const [subscriptionPlan, setSubscriptionPlan] = useState("pro");
  const [customSlug, setCustomSlug] = useState("");
  const [categoriesList, setCategoriesList] = useState(TRADE_CATEGORIES);

  // Formulario: Nuevo Super Admin (Socio / Torre de Control)
  const [saName, setSaName] = useState("");
  const [saEmail, setSaEmail] = useState("");
  const [saPhone, setSaPhone] = useState("");
  const [saRoleTitle, setSaRoleTitle] = useState("Socio Co-fundador");

  const [createdResult, setCreatedResult] = useState(null);
  const [saResult, setSaResult] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setTargetRole(initialRole || "service_admin");
      getPlatformCategories().then((cats) => {
        if (cats && cats.length > 0) {
          setCategoriesList(cats);
        }
      });
    }
  }, [isOpen, initialRole]);

  // Generar slug automático cuando cambia el nombre de la empresa
  const handleNameChange = (val) => {
    setBusinessName(val);
    const auto = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setCustomSlug(auto);
  };

  const cleanPhone = (phone) => {
    let clean = (phone || "").replace(/\D/g, "");
    if (clean.length === 10 && clean.startsWith("3")) {
      clean = "57" + clean;
    }
    return clean;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (targetRole === "superadmin") {
        if (!saEmail.trim() || !saName.trim()) return;

        const res = await addSuperAdmin({
          name: saName.trim(),
          email: saEmail.trim(),
          whatsapp: cleanPhone(saPhone),
          roleTitle: saRoleTitle.trim(),
        });

        setSaResult(res);
        setStep("success");
        if (onCompanyCreated) onCompanyCreated();
      } else {
        // Empresa / Prestador
        if (!businessName.trim() || !whatsappNumber.trim()) return;

        const payload = {
          businessName: businessName.trim(),
          adminName: adminName.trim() || "Administrador",
          whatsappNumber: cleanPhone(whatsappNumber),
          city: city.trim(),
          category,
          subscriptionPlan,
          businessSlug: customSlug || businessName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        };

        const res = await createAndInviteNewBusiness(payload);
        setCreatedResult(res);
        setStep("success");
        if (onCompanyCreated) onCompanyCreated();
      }
    } catch (err) {
      console.error("Error creating invitation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mensaje para Prestador / Empresa
  const getCompanyInvitationMessage = () => {
    if (!createdResult) return "";
    const biz = createdResult.newTenant.business;
    const origin = window.location.origin;
    const publicUrl = `${origin}/b/${biz.businessSlug}`;
    const adminUrl = `${origin}/admin`;

    return `¡Hola ${biz.ownerName}! 👋
Te damos la bienvenida formal a *VitrinaPro*.

Tu empresa *${biz.businessName}* ha sido dada de alta exitosamente en nuestra plataforma de servicios:

🌐 *Tu Vitrina Digital Pública:*
${publicUrl}

🔑 *Tu Enlace de Acceso al Panel de Control:*
${adminUrl}

📋 *Tu Código de Afiliación:* ${createdResult.invitationCode}
💼 *Plan Activado:* ${biz.subscriptionPlan === "pro" ? "Plan PRO Ilimitado (30 días de vigencia)" : "Plan Básico"}

⚡ *Beneficios habilitados:*
• Catálogo con fotos HD curadas de tu oficio
• Cotizador asistido por metros cuadrados y puntos
• Emisión de cotizaciones y recibos oficiales de anticipo en PDF
• Notificaciones directas a tu WhatsApp

Haz clic en el enlace para entrar y explorar tu panel. ¡Muchos éxitos en tus proyectos!`;
  };

  // Mensaje para Nuevo Super Admin
  const getSuperAdminInvitationMessage = () => {
    if (!saResult) return "";
    const sa = saResult.newAdmin;
    const origin = window.location.origin;
    const superAdminUrl = `${origin}/superadmin`;
    const loginUrl = `${origin}/login`;

    return `👑 *INVITACIÓN OFICIAL: SUPER ADMINISTRADOR VITRINAPRO*

¡Hola ${sa.name}! 👋
Has sido formalmente acreditado con el rol de *Super Administrador* de la plataforma de servicios VitrinaPro.

🔑 *Tu Enlace a la Torre de Control SaaS:*
${superAdminUrl}

📋 *Código de Credencial Directiva:* ${saResult.inviteCode}
💼 *Cargo:* ${sa.roleTitle}
📧 *Correo Autorizado:* ${sa.email}

⚡ *Privilegios Habilitados:*
• Supervisión global de todas las empresas y contratistas
• Acceso a ingresos por suscripción (MRR) y volumen transaccionado
• Barra Master (Modo Super Admin) para auditoría de vitrinas
• Alta y nombramiento de nuevos Super Administradores y empresas

Para ingresar, entra con tu cuenta de Google o regístrate con tu correo autorizado en:
${loginUrl}

¡Bienvenido a la mesa directiva de VitrinaPro! 🚀`;
  };

  const handleSendWhatsApp = () => {
    let phone = "";
    let msg = "";

    if (targetRole === "superadmin" && saResult) {
      phone = saResult.newAdmin.whatsapp;
      msg = getSuperAdminInvitationMessage();
    } else if (createdResult) {
      phone = createdResult.newTenant.business.whatsappNumber;
      msg = getCompanyInvitationMessage();
    }

    if (!msg) return;
    const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyMessage = () => {
    const msg = targetRole === "superadmin" ? getSuperAdminInvitationMessage() : getCompanyInvitationMessage();
    navigator.clipboard.writeText(msg);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Conmutador de Roles */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                targetRole === "superadmin"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-brand-500/10 text-brand-400 border-brand-500/30"
              }`}
            >
              {targetRole === "superadmin" ? <Crown className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
              {targetRole === "superadmin" ? "Jerarquía de Plataforma" : "Onboarding SaaS"}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
            {step === "form" ? "Invitar & Asignar Rol en la Plataforma" : "¡Invitación Generada con Éxito!"}
          </h2>
          <p className="text-xs text-slate-400">
            {step === "form"
              ? "Selecciona el nivel de acceso para asegurar que nadie vea datos que no le corresponden"
              : "La acreditación ha sido registrada. Comparte el acceso oficial de forma segura"}
          </p>

          {/* Selector de Rol (Solo visible en paso de formulario) */}
          {step === "form" && (
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setTargetRole("service_admin")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  targetRole === "service_admin"
                    ? "bg-brand-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Empresa / Prestador</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetRole("superadmin")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  targetRole === "superadmin"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Nuevo Super Admin</span>
              </button>
            </div>
          )}
        </div>

        {/* PASO 1: FORMULARIOS */}
        {step === "form" ? (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200">
            {/* =========================================
                CASO A: NUEVO SUPER ADMIN (SOCIO)
                ========================================= */}
            {targetRole === "superadmin" ? (
              <div className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                  🛡️ <strong>Privilegios de Super Admin:</strong> Tendrá acceso total a la Torre de Control (`/superadmin`), visualización de todos los ingresos de la plataforma, métricas SaaS y barra master para entrar a cualquier vitrina.
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Nombre Completo del Socio / Directivo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Gómez"
                    value={saName}
                    onChange={(e) => setSaName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    Correo Electrónico (Google o Cuenta de Acceso) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo.socio@gmail.com"
                    value={saEmail}
                    onChange={(e) => setSaEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500">
                    Al iniciar sesión con este correo, el sistema lo reconocerá automáticamente como Super Admin.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      WhatsApp / Celular de Contacto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 300 123 4567"
                      value={saPhone}
                      onChange={(e) => setSaPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      Cargo / Título Directivo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Co-fundador / Socio"
                      value={saRoleTitle}
                      onChange={(e) => setSaRoleTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{loading ? "Registrando Super Admin..." : "Nombrar & Generar Acceso Super Admin"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* =========================================
                  CASO B: EMPRESA / PRESTADOR (ADMIN SERVICIO)
                  ========================================= */
              <div className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-200/90 leading-relaxed">
                  🔒 <strong>Aislamiento Total:</strong> El prestador solo podrá ver y administrar <em>su propio negocio</em>. Jamás tendrá acceso a la Torre de Control, ni verá finanzas, ni otros negocios ajenos.
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-400" />
                    Nombre Comercial de la Empresa / Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carpintería & Diseños Roble"
                    value={businessName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" />
                      Nombre del Dueño
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Ing. Roberto Gómez"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      WhatsApp del Administrador *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 314 888 7766"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Oficio / Categoría Comercial
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      Ciudad / Municipio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Cali / Palmira"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">
                      Enlace público de vitrina que tendrá:
                    </label>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                      <span className="text-slate-500">/b/</span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="nombre-empresa"
                        className="bg-transparent text-brand-400 font-bold focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">
                      Plan Inicial Asignado:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSubscriptionPlan("pro")}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                          subscriptionPlan === "pro"
                            ? "bg-purple-950/50 border-purple-500 text-purple-200"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="block font-black text-purple-400">Plan PRO Ilimitado</span>
                        <span className="text-[10px] text-slate-400">30 días de cortesía</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubscriptionPlan("basico")}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                          subscriptionPlan === "basico"
                            ? "bg-slate-800 border-brand-500 text-slate-200"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="block font-black text-slate-300">Plan Básico</span>
                        <span className="text-[10px] text-slate-400">Gratuito</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-500 hover:bg-brand-400 active:scale-95 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{loading ? "Creando empresa..." : "Crear Empresa & Generar Invitación"}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* PASO 2: ÉXITO & ENVIAR INVITACIÓN */
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200 animate-fade-in">
            {targetRole === "superadmin" ? (
              /* Éxito Super Admin */
              <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300">
                    {saResult?.newAdmin?.name}
                  </h3>
                  <p className="text-xs text-amber-400/80">
                    Rol: <strong className="text-amber-200">{saResult?.newAdmin?.roleTitle}</strong> • Código:{" "}
                    <strong className="font-mono text-amber-200">{saResult?.inviteCode}</strong>
                  </p>
                </div>
              </div>
            ) : (
              /* Éxito Empresa */
              <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-300">
                    {createdResult?.newTenant?.business?.businessName}
                  </h3>
                  <p className="text-xs text-emerald-400/80">
                    Empresa registrada con código:{" "}
                    <strong className="font-mono text-emerald-200">{createdResult?.invitationCode}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Vista Previa del Mensaje Oficial */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Invitación Lista para Compartir
                </span>
                <span className="text-[10px] text-slate-400">
                  {targetRole === "superadmin" ? saResult?.newAdmin?.email : createdResult?.newTenant?.business?.whatsappNumber}
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {targetRole === "superadmin" ? getSuperAdminInvitationMessage() : getCompanyInvitationMessage()}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Invitación Directa por WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-brand-400" />
                  <span>{copyFeedback ? "¡Copiado!" : "Copiar Texto"}</span>
                </button>

                {targetRole === "service_admin" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onImpersonate && createdResult) {
                        onImpersonate(createdResult.newTenant.business.businessSlug);
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar al Panel (Modo Super Admin)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Listo / Cerrar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
