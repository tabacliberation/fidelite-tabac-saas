import Link from 'next/link'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur flex items-center gap-4">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Retour
        </Link>
        <h1 className="text-base sm:text-lg font-black text-white">Mentions Légales</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 text-sm sm:text-base leading-relaxed text-gray-300">

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">1. Éditeur du site</h2>
          <div className="space-y-1 bg-white/3 rounded-2xl p-4 border border-white/8">
            <p><span className="text-white font-semibold">Raison sociale :</span> Ring&apos;s Shop</p>
            <p><span className="text-white font-semibold">SIRET :</span> 793 550 989 00024</p>
            <p><span className="text-white font-semibold">Responsable de la publication :</span> Tahar Djamel</p>
            <p><span className="text-white font-semibold">Email :</span>{' '}
              <a href="mailto:contact@tabacfrance.fr" className="text-cyan-400 underline hover:text-cyan-300">
                contact@tabacfrance.fr
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">2. Hébergement</h2>
          <div className="bg-white/3 rounded-2xl p-4 border border-white/8 space-y-1">
            <p><span className="text-white font-semibold">Hébergeur :</span> Vercel Inc.</p>
            <p><span className="text-white font-semibold">Adresse :</span> 340 Pine Street, Suite 701, San Francisco, CA 94104, USA</p>
            <p><span className="text-white font-semibold">Site :</span>{' '}
              <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
                vercel.com
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, images, graphismes, logiciels, code source) est la propriété exclusive de Ring&apos;s Shop ou de ses partenaires, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
          <p className="mt-2">
            Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">4. Données personnelles</h2>
          <p>
            Les données collectées (nom, prénom, numéro de téléphone, date de naissance) sont utilisées exclusivement dans le cadre du programme de fidélité du buraliste partenaire. Elles ne sont ni vendues, ni cédées à des tiers.
          </p>
          <p className="mt-2">
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous à{' '}
            <a href="mailto:contact@tabacfrance.fr" className="text-cyan-400 underline hover:text-cyan-300">
              contact@tabacfrance.fr
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">5. Cookies</h2>
          <p>
            Ce site n&apos;utilise pas de cookies de traçage ou de publicité. Le stockage local (<em>localStorage</em>) est utilisé uniquement pour maintenir votre session dans l&apos;application.
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">6. Limitation de responsabilité</h2>
          <p>
            Ring&apos;s Shop ne pourra être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du site ou de l&apos;inaccessibilité temporaire du service.
          </p>
        </section>

        <p className="text-xs text-gray-600 pt-4 border-t border-white/8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </main>
    </div>
  )
}
