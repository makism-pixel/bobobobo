'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteConfig } from '@/config/site'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

export function MegaMenu() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  return (
    <nav className="border-b">
      <div className="container">
        <div className="hidden md:flex">
          {SiteConfig.categories.map((category) => (
            <div key={category.id} className="relative group">
              <Link
                href={category.link}
                className="flex items-center px-4 py-3 font-medium hover:text-primary"
              >
                {category.name}
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </Link>

              {/* Выпадающее меню */}
              <div className="absolute left-0 z-10 hidden group-hover:block w-full bg-white shadow-lg rounded-b-lg">
                <div className="grid grid-cols-4 gap-6 p-6">
                  <div className="col-span-1">
                    <h3 className="font-bold mb-4">Popular in {category.name}</h3>
                    <ul className="space-y-2">
                      {category.subcategories?.slice(0, 5).map((sub) => (
                        <li key={sub.id}>
                          <Link href={sub.link} className="hover:text-primary">
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-3">
                    <h3 className="font-bold mb-4">Featured Brands</h3>
                    {/* Промо-блоки брендов */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Мобильное меню */}
        <div className="md:hidden">
          <Collapsible>
            <CollapsibleTrigger className="w-full flex justify-between items-center px-4 py-3 font-medium">
              <span>Categories</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-2 space-y-2">
              {SiteConfig.categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.link}
                  className="block py-2"
                >
                  {category.name}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </nav>
  )
}