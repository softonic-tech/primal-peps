import { Link, Navigate } from 'react-router-dom'
import { LEGAL_NAV, getLegalPage } from '../data/legalPages'
import { useSettings } from '../context/SettingsContext'
import Footer from './Footer'

export default function LegalPage({ slug }) {
  const page = getLegalPage(slug)
  const { contact } = useSettings()

  if (!page) return <Navigate to="/" replace />

  return (
    <>
      <main className="legal-page">
        <div className="wrap legal-page-wrap">
          <header className="legal-page-hero">
            <span className="eyebrow">Legal policies</span>
            <h1>{page.title}</h1>
            <p className="legal-page-updated">Last updated: {page.updated}</p>
          </header>

          <nav className="legal-page-nav" aria-label="Legal policies">
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.slug}
                to={`/${item.slug}`}
                className={item.slug === slug ? 'active' : undefined}
                aria-current={item.slug === slug ? 'page' : undefined}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <article className="legal-page-body">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((text, i) => (
                  <p key={`${section.heading}-${i}`}>{text}</p>
                ))}
              </section>
            ))}

            {(contact.email || contact.phone) && (
              <section className="legal-page-contact">
                <h2>Support</h2>
                <p>
                  {contact.email ? (
                    <>
                      Email{' '}
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </>
                  ) : null}
                  {contact.email && contact.phone ? ' · ' : null}
                  {contact.phone ? (
                    <>
                      Phone{' '}
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </>
                  ) : null}
                </p>
              </section>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}
