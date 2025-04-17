import Image from 'next/image'
import Link from 'next/link'

export default function HeroBanner({ banners }: { banners: Array<{
  id: number
  title: string
  subtitle?: string
  image: string
  cta?: { text: string; link: string }
}> }) {
  return (
    <section className="relative h-96 w-full">
      <div className="absolute inset-0 bg-black/30 z-10 flex items-center">
        <div className="container mx-auto px-4 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{banners[0]?.title}</h1>
          {banners[0]?.subtitle && (
            <p className="text-xl mb-6 max-w-2xl">{banners[0].subtitle}</p>
          )}
          {banners[0]?.cta && (
            <Link 
              href={banners[0].cta.link}
              className="bg-white text-black px-8 py-3 rounded-lg font-bold inline-block hover:bg-gray-100 transition"
            >
              {banners[0].cta.text}
            </Link>
          )}
        </div>
      </div>
      
      {banners[0]?.image && (
        <Image
          src={banners[0].image}
          alt={banners[0].title}
          fill
          className="object-cover"
          priority
        />
      )}
    </section>
  )
}