import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, Camera, Check, ArrowRight, Zap, Image as ImageIcon } from 'lucide-react';
import { formatRupiah, cn } from '../lib/utils';

const PRODUCT = {
  name: "Gantungan NFC FinTag",
  price: 15000,
  customPrice: 2000,
  description: "Gantungan kunci akrilik premium dengan chip NFC NTAG213. Tahan air, awet, dan estetik.",
  images: [
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800"
  ]
};

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeProductIdx, setActiveProductIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    address: '',
    quantity: 1,
    notes: '',
    customPhoto: false
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold">Memuat Katalog Produk...</p>
      </div>
    );
  }

  const activeProduct = products[activeProductIdx] || { name: 'Produk Kosong', price: 0, image: '', description: '' };
  const customPrice = 2000;
  const totalPrice = (activeProduct.price * form.quantity) + (form.customPhoto ? customPrice * form.quantity : 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Maksimal file 5MB!");
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirming(true);
  };

  const executeOrder = async () => {
    const message = `Halo Admin FinTag! Saya ingin memesan:\n\n*Produk:* ${activeProduct.name}\n*Jumlah:* ${form.quantity}\n*Custom Foto:* ${form.customPhoto ? 'Ya' : 'Tidak'}\n*Total:* ${formatRupiah(totalPrice)}\n\n*Nama:* ${form.name}\n*WA:* ${form.whatsapp}\n*Alamat:* ${form.address}\n*Catatan:* ${form.notes}`;
    
    const waUrl = `https://wa.me/${(import.meta as any).env.VITE_CONTACT_WHATSAPP || '6281234567890'}?text=${encodeURIComponent(message)}`;
    
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, totalPrice, productName: activeProduct.name }),
    });

    setIsConfirming(false);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-12">
      {/* Product Selection */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((p, i) => (
          <button 
            key={p.id} 
            onClick={() => setActiveProductIdx(i)}
            className={cn(
              "flex-shrink-0 flex items-center gap-4 p-4 rounded-3xl transition-all border",
              activeProductIdx === i ? "bg-secondary dark:bg-primary text-white border-secondary dark:border-primary shadow-xl shadow-secondary/10 dark:shadow-primary/20" : "bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
            )}
          >
            <img src={p.image} className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-sm font-bold whitespace-nowrap">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12 pb-20">
        <div className="space-y-6">
          <motion.div 
            key={activeProduct.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-square bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-white dark:border-white/5 relative shadow-sm"
          >
            <img src={activeProduct.image} className="w-full h-full object-cover" alt={activeProduct.name} />
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest leading-none">Terbaru</span>
              <span className="px-3 py-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-secondary dark:text-white text-[10px] font-bold rounded-full shadow-sm uppercase tracking-widest border border-white dark:border-white/10 leading-none">NFC Ready</span>
            </div>
          </motion.div>
          
          <div className="bento-card space-y-6 dark:bg-slate-900/40">
              <h3 className="font-heading font-bold text-xl leading-none dark:text-white">Deskripsi Produk</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{activeProduct.description}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                {["Kualitas Premium", "Chip NFC Original", "Gantungan Estetik", "Custom Foto"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
          </div>
        </div>

        <div className="space-y-8 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="space-y-1">
               <h1 className="text-4xl lg:text-5xl font-heading font-bold text-secondary dark:text-white tracking-tighter leading-none mb-2">{activeProduct.name}</h1>
               <div className="flex items-center gap-3">
                 <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">NFC Powered • Best Quality</span>
               </div>
            </div>
            <p className="text-4xl font-heading font-bold text-primary tracking-tight">{formatRupiah(activeProduct.price)}</p>
          </div>

          <form onSubmit={handleOrder} className="space-y-6 bento-card border-white/50 dark:bg-slate-900/40 dark:border-white/5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Nama Lengkap</label>
                <input required type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white dark:placeholder:text-slate-600" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Nomor WhatsApp</label>
                <input required type="tel" value={form.whatsapp} onChange={e => setForm(prev => ({ ...prev, whatsapp: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white dark:placeholder:text-slate-600" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Alamat Pengiriman</label>
              <textarea required value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none dark:text-white dark:placeholder:text-slate-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <label className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-white/5 cursor-pointer group hover:border-primary/50 transition-all">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-primary" />
                 </div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-secondary dark:text-white">Custom Foto</p>
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">+ Rp2.000</p>
                 </div>
                 <input type="checkbox" checked={form.customPhoto} onChange={e => setForm(prev => ({ ...prev, customPhoto: e.target.checked }))} className="w-5 h-5 accent-primary rounded-lg" />
               </label>

               <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-white/5">
                 <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold dark:text-slate-400">Qty</div>
                 <div className="flex-1 flex items-center justify-between gap-4">
                   <button type="button" onClick={() => setForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">-</button>
                   <span className="font-bold text-sm w-4 text-center dark:text-white">{form.quantity}</span>
                   <button type="button" onClick={() => setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))} className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">+</button>
                 </div>
               </div>
            </div>


            {form.customPhoto && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <label className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl cursor-pointer hover:border-primary/50 transition-all">
                  {previewImage ? <img src={previewImage} className="w-24 h-24 object-cover rounded-2xl shadow-md" /> : <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">{previewImage ? 'Ganti Foto' : 'Klik untuk Upload'}</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </motion.div>
            )}

            <div className="flex items-center justify-between p-2 pl-6 bg-secondary dark:bg-slate-900 text-white rounded-[32px] border border-white/10 shadow-xl overflow-hidden">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Total Bayar</p>
                <p className="text-xl font-heading font-bold">{formatRupiah(totalPrice)}</p>
              </div>
              <button type="submit" className="bg-primary hover:bg-emerald-400 p-5 rounded-[28px] shadow-lg transition-all active:scale-95 group">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfirming(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 glass p-8 rounded-[40px] border border-white dark:border-white/10 shadow-2xl space-y-6 text-center">
              <div className="w-20 h-20 bg-primary/10 border border-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto transition-all">
                <ShoppingBag className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Konfirmasi Pesanan</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Pesan <span className="font-bold text-slate-900 dark:text-white">{form.quantity}x {activeProduct.name}</span> dengan total <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(totalPrice)}</span>?</p>
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={() => setIsConfirming(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Batal</button>
                <button onClick={executeOrder} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-emerald-400 shadow-xl shadow-primary/20 transition-all font-bold">Pesan Sekarang</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
