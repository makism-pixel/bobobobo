export default function NewArrivals({ products }: { products: Array<{
    id: number
    name: string
    price: number
    image?: string
    isNew?: boolean
  }> }) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="group relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:opacity-90 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {product.isNew && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-gray-800 font-bold">${product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }