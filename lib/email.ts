import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'tahardjamel22@gmail.com'
const FROM = 'TabacFrance <noreply@tabacfrance.fr>'

export async function sendNewShopNotification(shop: {
  name: string
  slug: string
  adminEmail: string
  plan: string
}) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🆕 Nouvelle inscription — ${shop.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#06061a;color:#e2e8f0;padding:32px;border-radius:16px;border:1px solid rgba(34,211,238,0.3)">
        <h2 style="color:#22d3ee;margin-top:0">Nouvelle inscription TabacFrance</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:#64748b;padding:6px 0">Boutique</td><td style="font-weight:bold">${shop.name}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">URL</td><td><a href="https://tabacfrance.fr/${shop.slug}" style="color:#22d3ee">tabacfrance.fr/${shop.slug}</a></td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Email</td><td>${shop.adminEmail}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Plan</td><td>${shop.plan}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Date</td><td>${new Date().toLocaleString('fr-FR')}</td></tr>
        </table>
        <a href="https://tabacfrance.fr/superadmin" style="display:inline-block;margin-top:24px;background:rgba(34,211,238,0.15);color:#22d3ee;border:1px solid rgba(34,211,238,0.4);padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:bold">
          Voir dans le Super Admin →
        </a>
      </div>
    `,
  })
}

export async function sendEmailToBuraliste(to: string, subject: string, message: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#06061a;color:#e2e8f0;padding:32px;border-radius:16px;border:1px solid rgba(34,211,238,0.3)">
        <h2 style="color:#22d3ee;margin-top:0">Message de TabacFrance</h2>
        <p style="white-space:pre-line;line-height:1.6">${message}</p>
        <hr style="border-color:rgba(34,211,238,0.2);margin:24px 0">
        <p style="color:#64748b;font-size:12px">TabacFrance — La fidélité digitale pour les buralistes</p>
      </div>
    `,
  })
}
