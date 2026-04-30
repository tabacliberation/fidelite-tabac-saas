import Link from 'next/link'

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur flex items-center gap-4">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Retour
        </Link>
        <h1 className="text-base sm:text-lg font-black text-white">Conditions Générales de Vente</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 text-sm sm:text-base leading-relaxed text-gray-300">

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente régissent les relations contractuelles entre Ring&apos;s Shop (SIRET : 793 550 989 00024), ci-après dénommé « le Prestataire », et toute personne physique ou morale souscrivant à l&apos;offre TabacFrance, ci-après dénommée « le Client ».
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">2. Description des services</h2>
          <p>TabacFrance est une solution SaaS (Software as a Service) proposant :</p>
          <ul className="mt-2 ml-4 space-y-1 list-disc list-inside">
            <li>Une application web de fidélité personnalisée au nom du buraliste</li>
            <li>Un tableau de bord d&apos;administration (gestion clients, offres, notifications)</li>
            <li>Un système de tampons numériques avec code PIN</li>
            <li>Une roue des cadeaux quotidienne</li>
            <li>L&apos;envoi de notifications push aux clients inscrits</li>
            <li>La génération automatique d&apos;une affiche A4 imprimable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">3. Tarifs et facturation</h2>
          <div className="space-y-3">
            <div className="bg-white/3 rounded-2xl p-4 border border-white/8">
              <p className="font-bold text-white">Offre Flex</p>
              <p className="text-cyan-400 font-black text-lg">29,90 € TTC / mois</p>
              <p className="text-xs text-gray-500 mt-1">Sans engagement — résiliable à tout moment</p>
            </div>
            <div className="bg-cyan-500/8 rounded-2xl p-4 border border-cyan-500/25">
              <p className="font-bold text-white">Offre Engagement 12 mois</p>
              <p className="text-cyan-400 font-black text-lg">19,90 € TTC / mois</p>
              <p className="text-xs text-gray-500 mt-1">Engagement annuel — soit 238,80 € TTC/an</p>
            </div>
          </div>
          <p className="mt-3">
            La facturation est mensuelle, par prélèvement automatique ou par virement bancaire. Tout mois entamé est dû. Les tarifs sont susceptibles d&apos;évoluer, avec un préavis de 30 jours envoyé par email.
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">4. Durée et résiliation</h2>
          <p>
            L&apos;offre Flex peut être résiliée à tout moment avec un préavis de 30 jours. L&apos;offre Engagement est conclue pour 12 mois ; toute résiliation anticipée donne lieu à la facturation des mois restants.
          </p>
          <p className="mt-2">
            En cas de non-paiement, le Prestataire se réserve le droit de suspendre l&apos;accès au service sans préavis.
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">5. Obligations du Client</h2>
          <ul className="ml-4 space-y-1 list-disc list-inside">
            <li>Fournir des informations exactes lors de l&apos;inscription</li>
            <li>Ne pas utiliser le service à des fins illicites ou frauduleuses</li>
            <li>Respecter la vie privée de ses clients (RGPD)</li>
            <li>Maintenir la confidentialité de ses identifiants d&apos;accès</li>
          </ul>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">6. Responsabilité</h2>
          <p>
            Ring&apos;s Shop s&apos;engage à assurer la disponibilité du service avec un objectif de 99 % de temps de fonctionnement. Le Prestataire ne saurait être tenu responsable des interruptions liées à des opérations de maintenance, à des incidents techniques chez les hébergeurs, ou à des cas de force majeure.
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">7. Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section>
          <h2 className="text-cyan-400 font-black text-base sm:text-lg mb-3 uppercase tracking-widest">8. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGV :{' '}
            <a href="mailto:tahardjamel22@gmail.com" className="text-cyan-400 underline hover:text-cyan-300">
              tahardjamel22@gmail.com
            </a>
          </p>
        </section>

        <p className="text-xs text-gray-600 pt-4 border-t border-white/8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </main>
    </div>
  )
}
