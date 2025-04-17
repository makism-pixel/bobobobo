export default function AppPromo() {
    return (
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Download Our App</h2>
          <p className="mb-6">Get 10% off your first order when you shop via app</p>
          <div className="flex justify-center gap-4">
            <button className="bg-black text-white px-6 py-2 rounded-lg">
              App Store
            </button>
            <button className="bg-black text-white px-6 py-2 rounded-lg">
              Google Play
            </button>
          </div>
        </div>
      </section>
    )
  }