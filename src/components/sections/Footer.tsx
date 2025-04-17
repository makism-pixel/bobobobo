import { ReactNode } from 'react'

export default function FlashSales({ children }: { children: ReactNode }) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Flash Sales</h2>
        {children}
      </div>
    </section>
  )
}