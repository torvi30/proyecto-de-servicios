/**
 * Utilidad para generar y descargar tarjetas de contacto digitales (vCard .vcf)
 * Compatible con iPhone (iOS Contacts), Android (Google Contacts) y Windows/Mac.
 */
export function generateVCardString(business) {
  if (!business) return "";

  const name = (business.businessName || "Profesional de Servicios").trim();
  const rawPhone = (business.whatsappNumber || "").replace(/\D/g, "");
  // Formatear teléfono con código de país si es de 10 dígitos (Colombia: 57)
  const phone = rawPhone.length === 10 && rawPhone.startsWith("3")
    ? `+57${rawPhone}`
    : rawPhone ? `+${rawPhone}` : "";

  const category = (business.categoryLabel || "Servicios Técnicos").trim();
  const city = (business.city || "").trim();
  const slug = (business.businessSlug || "").trim();
  const url = slug ? `${window.location.origin}/b/${slug}` : window.location.href;
  const bio = (business.bio || "Servicios profesionales garantizados.").trim();
  const note = `${bio}${city ? ` | Ubicación: ${city}` : ""}`;

  const vCardLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `ORG:${name}`,
    `TITLE:${category}`,
    phone ? `TEL;TYPE=CELL,VOICE:${phone}` : "",
    url ? `URL:${url}` : "",
    `NOTE:${note.replace(/[\r\n]+/g, " ")}`,
    "END:VCARD",
  ].filter(Boolean);

  return vCardLines.join("\r\n");
}

export function downloadBusinessVCard(business) {
  const vCardString = generateVCardString(business);
  if (!vCardString) return;

  const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const fileSlug = (business.businessSlug || business.businessName || "contacto")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");

  link.href = url;
  link.setAttribute("download", `${fileSlug}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
