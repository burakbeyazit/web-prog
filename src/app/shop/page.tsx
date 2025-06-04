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
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartPopupMessage, setCartPopupMessage] = useState("");

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
    setCartPopupMessage("");
    setShowCartPopup(false);
    const username = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!username) {
      setCartPopupMessage("Lütfen giriş yapınız.");
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 1500);
      return;
    }
    try {
      const response = await fetch("http://localhost:5139/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, flowerId }),
      });
      if (response.ok) {
        setCartPopupMessage("Ürün sepete eklendi!");
        setShowCartPopup(true);
        setTimeout(() => setShowCartPopup(false), 1500);
      } else {
        const data = await response.json();
        setCartPopupMessage(data.message || "Sepete eklenirken hata oluştu.");
        setShowCartPopup(true);
        setTimeout(() => setShowCartPopup(false), 1500);
      }
    } catch {
      setCartPopupMessage("Sepete eklenirken hata oluştu.");
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-800">
          <img src="data:image/jpeg;base64,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" alt="Çiçek Dükkanı Logo" className="w-15 h-15" />
            Çiçek Sepeti        
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
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors relative" onClick={() => router.push('/orders')}>
            {/* Orders SVG */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>Siparişlerim</span>
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors relative" onClick={() => router.push('/cart')}>
            {/* Cart SVG */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Sepet</span>
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
          {/* Cart Popup */}
          {showCartPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
              <div className="bg-white rounded-xl shadow-xl px-8 py-6 text-center flex flex-col items-center">
                <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2" strokeWidth="4" />
                  <path d="M12 16l4-4-4-4m0 8V8" />
                </svg>
                <div className="text-lg font-semibold text-blue-700 mb-1">{cartPopupMessage}</div>
              </div>
            </div>
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