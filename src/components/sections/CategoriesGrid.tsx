export default function CategoriesGrid({ categories }: { categories: any[] }) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  {/* Иконка или изображение категории */}
                  <div className="text-3xl mb-2">{category.icon}</div>
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }