export default function Collections({ collections }: { collections: any[] }) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="relative group rounded-lg overflow-hidden">
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  {collection.image ? (
                    <img 
                      src={collection.image} 
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">Collection Image</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-white text-xl font-bold">{collection.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }