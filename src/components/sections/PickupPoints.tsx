export default function PickupPoints({ points }: { points: Array<{
    id: number
    name: string
    address: string
    distance: string
    hours: string
  }> }) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Pickup Points Nearby</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {points.map(point => (
              <div key={point.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-2">{point.name}</h3>
                <p className="text-gray-600 mb-2">{point.address}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">{point.distance} away</span>
                  <span className="text-gray-500">Open {point.hours}</span>
                </div>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Select This Location
                </button>
              </div>
            ))}
          </div>
  
          <div className="mt-8 text-center">
            <button className="text-blue-600 font-medium hover:underline">
              View All Pickup Points on Map
            </button>
          </div>
        </div>
      </section>
    )
  }