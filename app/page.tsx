import { getSiteConfig } from '@/lib/content'
import HeroSection from '@/components/HeroSection'

export default async function HomePage() {
  const siteConfig = await getSiteConfig()

  return <HeroSection data={siteConfig} />
}