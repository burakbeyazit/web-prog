// FlowerResponse type
'use client';

interface FlowerResponse {
  flowerId: number;
  flowerName: string;
  price: number;
  stockQuantity: number;
  description: string;
  imageUrl: string;
  categoryId: number;
  category: string | null;
}

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Placeholder user (simulate logged in)
function getUserFromStorage() {
  if (typeof window !== 'undefined') {
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    if (firstName && lastName) {
      return {
        firstName,
        lastName,
        email: '',
        isLoggedIn: true,
      };
    }
  }
  return {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    isLoggedIn: false,
  };
}

// Placeholder cart items
const cartItems = [
  { id: 1, name: "Red Rose Bouquet", price: 29.99, quantity: 2 },
  { id: 2, name: "Yellow Tulip Mix", price: 24.99, quantity: 1 },
];
const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([
    { categoryId: 0, categoryName: "All" }
  ]);
  const [flowers, setFlowers] = useState<FlowerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  // Filter states
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);

  const router = useRouter();
  const user = getUserFromStorage();
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5139/api/flowers/categories');
        const data = await response.json();
        setCategories([
          { categoryId: 0, categoryName: "All" },
          ...data
        ]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFlowers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5139/api/flowers');
        const data = await response.json();
        setFlowers(data);
        // Set max price for slider
        const max = data.length > 0 ? Math.max(...data.map((f: FlowerResponse) => f.price)) : 1000;
        setMaxPrice(max);
        setPriceRange([0, max]);
      } catch (error) {
        console.error('Error fetching flowers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlowers();
  }, []);

  // Filtered flowers by category, search, in stock, and price
  const filteredFlowers = flowers.filter(flower =>
    (selectedCategory === 0 || flower.categoryId === selectedCategory) &&
    (flower.flowerName.toLowerCase().includes(search.toLowerCase()) || flower.description.toLowerCase().includes(search.toLowerCase())) &&
    (!inStockOnly || flower.stockQuantity > 0) &&
    flower.price >= priceRange[0] && flower.price <= priceRange[1]
  );

  // Sepete ekle fonksiyonu
  const handleAddToCart = async (flowerId: number) => {
    setCartMessage("");
    const username = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!username) {
      setCartMessage("Lütfen giriş yapınız.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5139/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, flowerId }),
      });
      if (response.ok) {
        setCartMessage("Ürün sepete eklendi!");
      } else {
        const data = await response.json();
        setCartMessage(data.message || "Sepete eklenirken hata oluştu.");
      }
    } catch {
      setCartMessage("Sepete eklenirken hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-800">
          <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Logo" className="w-10 h-10" />
          Çiçekçi
        </div>
        {/* Search Bar Centered */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Çiçek ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {/* Magnifying glass SVG */}
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        {/* Profile and Cart Buttons */}
        <div className="flex gap-4 items-center">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors">
            {/* User SVG */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
            {user.isLoggedIn ? (
              <span className="flex flex-col items-start text-left">
                <span className="font-semibold">{user.firstName} {user.lastName}</span>
                <span className="text-xs font-normal">{user.email}</span>
              </span>
            ) : (
              <span>Profilim</span>
            )}
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors relative" onClick={() => router.push('/cart')}>
            {/* Cart SVG */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Sepet</span>
            <span className="ml-2 bg-blue-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartTotal.toFixed(2)}₺</span>
          </button>
        </div>
      </header>
      {/* Category Bar */}
      <nav className="flex gap-4 px-8 py-3 bg-blue-50 border-b border-blue-100 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.categoryId}
            onClick={() => setSelectedCategory(cat.categoryId)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === cat.categoryId ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-100'}`}
          >
            {cat.categoryName}
          </button>
        ))}
      </nav>
      <div className="flex flex-1">
        {/* Filter Pane */}
        <aside className="hidden md:block w-64 bg-white border-r border-blue-100 p-6">
          <div className="mb-6">
            <div className="text-lg font-semibold text-blue-800 mb-4">Filtreler</div>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                />
                Sadece Stoktakiler
              </label>
              <div>
                <div className="text-sm text-blue-800 mb-1">Fiyat Aralığı</div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-xs text-gray-600">0₺ - {priceRange[1]}₺</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
        {/* Flower Grid */}
        <main className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {cartMessage && (
            <div className="col-span-full text-center text-base text-blue-700 font-semibold mb-4">{cartMessage}</div>
          )}
          {loading ? (
            <div className="col-span-full text-center text-gray-500 text-lg">Çiçekler yükleniyor...</div>
          ) : filteredFlowers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg">Çiçek bulunamadı.</div>
          ) : (
            filteredFlowers.map(flower => (
              <div key={flower.flowerId} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow">
                <img
                  src={flower.imageUrl}
                  alt={flower.flowerName}
                  className="w-full h-48 object-cover object-center"
                />
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-lg font-bold text-blue-800 mb-1">{flower.flowerName}</div>
                  <div className="text-sm text-gray-500 mb-2">{flower.category || ''}</div>
                  <div className="text-gray-700 mb-2 flex-1">{flower.description}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-bold text-blue-700">{flower.price}₺</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors" onClick={() => handleAddToCart(flower.flowerId)}>Sepete Ekle</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
} 