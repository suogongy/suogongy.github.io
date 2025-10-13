import { SiteConfig } from '@/lib/content'

interface HeroSectionProps {
  data: SiteConfig
}

export default function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="section hero-section">
      <div className="hero-avatar">
        <i className="fas fa-user" />
      </div>
      <h1 className="hero-name">{data.name || 'Your Name'}</h1>
      <p className="hero-bio">{data.bio || 'Your bio here...'}</p>
      <div className="hero-social">
        {data.social?.map(social => (
          <a
            key={social.name}
            href={social.url}
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className={social.icon} />
          </a>
        ))}
      </div>
    </section>
  )
}