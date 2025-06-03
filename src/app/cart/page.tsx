'use client';
import React, { useEffect, useState } from "react";

interface CartViewResponse {
  flowerId: number;
  flowerName: string;
  price: number;
  stockQuantity: number;
  description: string;
  imageUrl: string;
  categoryId: number;
  category: string;
  quantity: number;
  cartId: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartViewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError("");
      const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      if (!email) {
        setError("Lütfen giriş yapınız.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5139/api/cart/get-by-username?username=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error("Sepet alınamadı.");
        const data = await response.json();
        setCart(data);
        setTotal(data.reduce((sum: number, item: CartViewResponse) => sum + item.price * item.quantity, 0));
      } catch (err: any) {
        setError(err.message || "Sepet alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white/90 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Sepetim</h1>
        {loading ? (
          <div className="text-center text-blue-700">Sepet yükleniyor...</div>
        ) : error ? (
          <div className="text-center text-red-600 font-semibold">{error}</div>
        ) : !cart || cart.length === 0 ? (
          <div className="text-center text-gray-500">Sepetinizde ürün yok.</div>
        ) : (
          <div>
            <table className="w-full mb-6">
              <thead>
                <tr className="text-left border-b text-blue-800">
                  <th className="py-2">Ürün</th>
                  <th className="py-2">Adet</th>
                  <th className="py-2">Fiyat</th>
                  <th className="py-2">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.flowerId} className="border-b last:border-b-0">
                    <td className="py-2 flex items-center gap-2">
                      <img src={item.imageUrl} alt={item.flowerName} className="w-12 h-12 object-cover rounded" />
                      <span>{item.flowerName}</span>
                    </td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{item.price}₺</td>
                    <td className="py-2 font-semibold">{(item.price * item.quantity).toFixed(2)}₺</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Sepet Toplamı:</span>
              <span className="font-bold text-2xl text-blue-700">{total.toFixed(2)}₺</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-lg">Satın Al</button>
          </div>
        )}
      </div>
    </div>
  );
} 