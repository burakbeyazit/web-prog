'use client';
import React, { useEffect, useState } from "react";

interface OrderFlower {
  flowerId: number;
  flowerName: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  flowers: OrderFlower[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      if (!email) {
        setError("Lütfen giriş yapınız.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5139/api/order/user/${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error("Siparişler alınamadı.");
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Siparişler alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white/90 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-3xl">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Siparişlerim</h1>
        {loading ? (
          <div className="text-center text-blue-700">Siparişler yükleniyor...</div>
        ) : error ? (
          <div className="text-center text-red-600 font-semibold">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500">Henüz bir siparişiniz yok.</div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order.orderId} className="border rounded-xl shadow p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-blue-700">Sipariş No: {order.orderId}</span>
                  <span className="text-sm text-gray-600">Tarih: {new Date(order.orderDate).toLocaleString('tr-TR')}</span>
                  <span className="font-bold text-lg text-blue-800">Toplam: {order.totalAmount.toFixed(2)}₺</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-blue-800 border-b">
                      <th className="py-2">Ürün</th>
                      <th className="py-2">Adet</th>
                      <th className="py-2">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.flowers.map(flower => (
                      <tr key={flower.flowerId} className="border-b last:border-b-0">
                        <td className="py-2 flex items-center gap-2">
                          <img src={flower.imageUrl} alt={flower.flowerName} className="w-10 h-10 object-cover rounded" />
                          <span>{flower.flowerName}</span>
                        </td>
                        <td className="py-2">{flower.quantity}</td>
                        <td className="py-2">{flower.price}₺</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 