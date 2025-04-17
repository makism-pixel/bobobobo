"use client";
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { IProduct } from '@/types'

interface FlashSalesProps {
  products: IProduct[]
}

export default function FlashSales({ products }: FlashSalesProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const seconds = prev.seconds - 1
        const minutes = seconds < 0 ? prev.minutes - 1 : prev.minutes
        const hours = minutes < 0 ? prev.hours - 1 : prev.hours

        return {
          hours: hours < 0 ? 23 : hours,
          minutes: minutes < 0 ? 59 : minutes,
          seconds: seconds < 0 ? 59 : seconds
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-12 bg-orange-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Flash Sale{' '}
            <span className="text-red-500">
              {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </h2>
          <Link href="/flash-sale">
            <Button variant="link">View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              showDiscount 
            />
          ))}
        </div>
      </div>
    </section>
  )
}