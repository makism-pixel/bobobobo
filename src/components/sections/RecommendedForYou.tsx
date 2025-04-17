import Image from 'next/image';

export default function RecommendedForYou({ products }: { products: Array<{
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image?: string;
  rating: number;
}> }) {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Recommended For You</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="p-2">
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                <div className="flex items-center mt-1">
                  {product.discountPrice ? (
                    <>
                      <span className="text-red-500 font-bold">
                        ${product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-sm line-through ml-2">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold">${product.price.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <button className="absolute top-2 right-2 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}