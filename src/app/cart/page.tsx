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
  const [removeMessage, setRemoveMessage] = useState("");
  const [orderPopup, setOrderPopup] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false });

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

  const handleRemove = async (flowerId: number) => {
    setRemoveMessage("");
    const username = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!username) {
      setRemoveMessage("Lütfen giriş yapınız.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5139/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, flowerId }),
      });
      if (response.ok) {
        setRemoveMessage("Ürün sepetten çıkarıldı!");
        // Refresh cart
        const cartRes = await fetch(`http://localhost:5139/api/cart/get-by-username?username=${encodeURIComponent(username)}`);
        const data = await cartRes.json();
        setCart(data);
        setTotal(data.reduce((sum: number, item: CartViewResponse) => sum + item.price * item.quantity, 0));
      } else {
        const data = await response.json();
        setRemoveMessage(data.message || "Çıkarma işlemi başarısız.");
      }
    } catch {
      setRemoveMessage("Çıkarma işlemi başarısız.");
    }
  };

  const handleOrder = async () => {
    const username = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!username || cart.length === 0) {
      setOrderPopup({ show: true, message: 'Sipariş oluşturmak için giriş yapın ve sepetinizde ürün olsun.', success: false });
      setTimeout(() => setOrderPopup({ show: false, message: '', success: false }), 1800);
      return;
    }
    const cartId = cart[0].cartId;
    try {
      const response = await fetch('http://localhost:5139/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, cartId }),
      });
      if (response.ok) {
        setOrderPopup({ show: true, message: 'Siparişiniz başarıyla oluşturuldu!', success: true });
        setCart([]);
        setTotal(0);
        setTimeout(() => {
          setOrderPopup({ show: false, message: '', success: false });
          window.location.href = '/shop';
        }, 1800);
      } else {
        const data = await response.json();
        setOrderPopup({ show: true, message: data.message || 'Sipariş oluşturulamadı.', success: false });
        setTimeout(() => setOrderPopup({ show: false, message: '', success: false }), 1800);
      }
    } catch {
      setOrderPopup({ show: true, message: 'Sipariş oluşturulamadı.', success: false });
      setTimeout(() => setOrderPopup({ show: false, message: '', success: false }), 1800);
    }
  };

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
                  <th className="py-2">İşlem</th>
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
                    <td className="py-2">
                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" onClick={() => handleRemove(item.flowerId)}>Kaldır</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {removeMessage && (
              <tr><td colSpan={5} className="text-center text-red-600 font-semibold py-2">{removeMessage}</td></tr>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Sepet Toplamı:</span>
              <span className="font-bold text-2xl text-blue-700">{total.toFixed(2)}₺</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-lg" onClick={handleOrder}>Satın Al</button>
            {/* Order Popup */}
            {orderPopup.show && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                <div className={`bg-white rounded-xl shadow-xl px-8 py-6 text-center flex flex-col items-center ${orderPopup.success ? 'border-green-400' : 'border-red-400'}`}>
                  <svg className={`w-12 h-12 mb-2 ${orderPopup.success ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {orderPopup.success ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" strokeWidth="4" />
                    )}
                  </svg>
                  <div className={`text-lg font-semibold mb-1 ${orderPopup.success ? 'text-green-700' : 'text-red-700'}`}>{orderPopup.message}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 