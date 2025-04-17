export default function TopBar() {
    return (
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">MyMarket</div>
            <nav className="flex gap-6">
              <button className="hover:text-blue-500">Cart</button>
              <button className="hover:text-blue-500">Login</button>
            </nav>
          </div>
        </div>
      </header>
    )
  }