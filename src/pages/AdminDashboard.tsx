import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Plus, CheckCircle2, Trash2, Edit3,
  Package, TrendingUp, ShieldCheck, LogIn, ArrowRight, Users
} from 'lucide-react';
import { formatRupiah, cn } from '../lib/utils';
import { useAuth, handleFirestoreError, OperationType } from '../lib/auth';
import { db } from '../lib/firebase';
import { 
  collection, query, onSnapshot, addDoc, deleteDoc, 
  doc, updateDoc, serverTimestamp, orderBy 
} from 'firebase/firestore';

export default function AdminDashboard() {
  const { user, login, loginAsGuest, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: '' });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ 
    type: 'delete' | 'save' | 'add', 
    id?: string, 
    data?: any,
    name?: string,
    subType?: 'order' | 'product',
    title: string,
    message: string,
    icon: any,
    confirmText: string,
    color: string
  } | null>(null);

  // Admin access check - Based on the email verified in Firebase setup
  const isAdmin = user?.email === 'mhdalfinaja@mhs.unimed.ac.id';

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // Fetch Products
    const qProducts = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [isAdmin]);

  const tabs = [
    { id: 'orders', label: 'Pesanan', icon: ShoppingBag },
    { id: 'products', label: 'Produk Shop', icon: Package },
  ];

  if (authLoading) {
     return (
       <div className="h-[60vh] flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
       </div>
     );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bento-card p-10 space-y-8 dark:bg-slate-900/40 text-center"
        >
          <div className="space-y-4">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-[40px] flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/10">
               <ShieldCheck className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="text-3xl font-heading font-bold dark:text-white transition-colors">Admin Only</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Hanya akun administrator yang dapat mengakses panel kontrol ini.</p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={login}
              className="w-full bg-slate-900 dark:bg-primary text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LogIn className="w-5 h-5" />
              Login sebagai Admin
            </button>

            <button 
              onClick={loginAsGuest}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Users className="w-5 h-5" />
              Lanjutkan sebagai Tamu
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'pending' ? 'selesai' : 'pending';
      await updateDoc(doc(db, 'orders', id), { status: nextStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
      setConfirmAction(null);
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { type, subType, id } = confirmAction;

    if (type === 'delete') {
      if (subType === 'order') deleteOrder(id!);
      else if (subType === 'product') deleteProduct(id!);
    } else if (type === 'save') {
      if (subType === 'order') executeEditOrder();
      else if (subType === 'product') executeEditProduct();
    } else if (type === 'add') {
      if (subType === 'product') executeAddProduct();
    }
  };

  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setConfirmAction({
      type: 'save',
      subType: 'order',
      title: 'Simpan Perubahan',
      message: `Konfirmasi perubahan data pesanan untuk ${editingOrder.name}?`,
      icon: Edit3,
      confirmText: 'Simpan',
      color: 'bg-secondary'
    });
  };

  const executeEditOrder = async () => {
    try {
      await updateDoc(doc(db, 'orders', editingOrder.id), { 
        ...editingOrder, 
        totalPrice: Number(editingOrder.totalPrice) 
      });
      setEditingOrder(null);
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${editingOrder.id}`);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setConfirmAction({
      type: 'save',
      subType: 'product',
      title: 'Simpan Produk',
      message: `Update data produk "${editingProduct.name}"?`,
      icon: Edit3,
      confirmText: 'Simpan',
      color: 'bg-secondary'
    });
  };

  const executeEditProduct = async () => {
    try {
      await updateDoc(doc(db, 'products', editingProduct.id), { 
        ...editingProduct, 
        price: Number(editingProduct.price) 
      });
      setEditingProduct(null);
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${editingProduct.id}`);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmAction({
      type: 'add',
      subType: 'product',
      title: 'Tambah Produk',
      message: `Tambahkan "${newProduct.name}" ke katalog shop?`,
      icon: Plus,
      confirmText: 'Tambah',
      color: 'bg-primary'
    });
  };

  const executeAddProduct = async () => {
    try {
      await addDoc(collection(db, 'products'), { 
        ...newProduct, 
        price: Number(newProduct.price),
        createdAt: serverTimestamp()
      });
      setIsAddingProduct(false);
      setNewProduct({ name: '', price: '', description: '', image: '' });
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="space-y-12 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Admin Control</h1>
            <p className="text-slate-500 dark:text-slate-400">Kelola operasional FinTag dalam satu dashboard terpadu.</p>
          </div>
          <div className="flex gap-2">
              {activeTab !== 'orders' && (
                <button 
                  onClick={() => {
                    if (activeTab === 'products') setIsAddingProduct(true);
                  }} 
                  className="px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk</span>
                </button>
              )}
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatItem label="Revenue" value={formatRupiah(totalRevenue)} icon={TrendingUp} trend="+12% bulan ini" />
          <StatItem label="Total Pesanan" value={orders.length.toString()} icon={ShoppingBag} trend="+5 hari ini" />
          <StatItem label="Total Produk" value={products.length.toString()} icon={Package} trend="Active" />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-2">
             {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all font-bold",
                    activeTab === tab.id 
                       ? "bg-secondary dark:bg-primary text-white shadow-xl shadow-secondary/10 dark:shadow-primary/20" 
                       : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
             ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8 min-w-0">
              <motion.div 
                 key={activeTab}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="glass rounded-[40px] border border-white dark:border-white/5 p-4 sm:p-8 shadow-xl min-h-[500px] overflow-hidden bg-white/40 dark:bg-slate-900/40"
              >
                 {activeTab === 'orders' && (
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2 sm:px-0">
                          <h3 className="text-lg sm:text-xl font-heading font-bold dark:text-white">Daftar Pesanan</h3>
                      </div>
                      
                      <div className="overflow-x-auto -mx-4 sm:-mx-8 px-4 sm:px-8">
                          <table className="w-full text-left min-w-[600px] hidden sm:table">
                               <thead className="border-b border-slate-100 dark:border-white/5">
                                   <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                       <th className="pb-4 px-4 font-bold">Customer</th>
                                       <th className="pb-4 px-4 font-bold">Status</th>
                                       <th className="pb-4 px-4 font-bold">Total</th>
                                       <th className="pb-4 px-1 font-bold text-right">Aksi</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50 dark:divide-white/5 transition-colors">
                                   {orders.length === 0 ? (
                                       <tr>
                                           <td colSpan={4} className="py-20 text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest opacity-40">Belum ada log pesanan</td>
                                       </tr>
                                   ) : (
                                       orders.map((order) => (
                                           <tr key={order.id} className="group hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors text-sm">
                                               <td className="py-4 px-4">
                                                   <p className="font-bold text-slate-900 dark:text-white">{order.name}</p>
                                                   <p className="text-[10px] text-slate-400 dark:text-slate-500">{order.whatsapp}</p>
                                               </td>
                                               <td className="py-4 px-4">
                                                   <div 
                                                       className={cn(
                                                           "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                                                           order.status === 'selesai' ? "bg-green-100 text-green-600" : 
                                                           order.status === 'dibatalkan' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                                                       )}
                                                   >
                                                       {order.status || 'pending'}
                                                   </div>
                                               </td>
                                               <td className="py-4 px-4 font-bold dark:text-white">{formatRupiah(order.totalPrice)}</td>
                                               <td className="py-4 px-4 text-right space-x-1">
                                                   {order.status !== 'selesai' && (
                                                     <button 
                                                       onClick={(e) => { e.stopPropagation(); toggleStatus(order.id, order.status); }} 
                                                       className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                                       title="Tandai Selesai"
                                                     >
                                                       <CheckCircle2 className="w-4 h-4" />
                                                     </button>
                                                   )}
                                                   <button onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                                                     <Edit3 className="w-4 h-4" />
                                                   </button>
                                                   <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: order.id, type: 'delete', subType: 'order', name: order.name, title: 'Hapus Pesanan', message: `Hapus log pesanan ${order.name}?`, icon: Trash2, confirmText: 'Hapus', color: 'bg-rose-500' }); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors">
                                                     <Trash2 className="w-4 h-4" />
                                                   </button>
                                               </td>
                                           </tr>
                                       ))
                                   )}
                               </tbody>
                          </table>

                          <div className="flex flex-col gap-4 sm:hidden pb-10">
                             {orders.map((order) => (
                                <div key={order.id} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4">
                                   <div className="flex justify-between items-start">
                                      <div>
                                         <p className="font-bold text-slate-900 dark:text-white">{order.name}</p>
                                         <p className="text-[10px] text-slate-400">{order.whatsapp}</p>
                                      </div>
                                      <div className={cn(
                                         "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase",
                                         order.status === 'selesai' ? "bg-green-100 text-green-600" : 
                                         order.status === 'dibatalkan' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                                      )}>
                                         {order.status || 'pending'}
                                      </div>
                                   </div>
                                   <div className="flex justify-between items-center text-sm">
                                      <p className="font-bold dark:text-white">{formatRupiah(order.totalPrice)}</p>
                                      <div className="flex gap-1">
                                         <button onClick={() => toggleStatus(order.id, order.status)} className="p-2.5 bg-emerald-500 text-white rounded-xl">
                                            <CheckCircle2 className="w-4 h-4" />
                                         </button>
                                         <button onClick={() => setEditingOrder(order)} className="p-2.5 bg-primary text-white rounded-xl">
                                            <Edit3 className="w-4 h-4" />
                                         </button>
                                         <button onClick={() => setConfirmAction({ id: order.id, type: 'delete', subType: 'order', name: order.name, title: 'Hapus Pesanan', message: `Hapus log pesanan ${order.name}?`, icon: Trash2, confirmText: 'Hapus', color: 'bg-rose-500' })} className="p-2.5 bg-rose-500 text-white rounded-xl">
                                            <Trash2 className="w-4 h-4" />
                                         </button>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'products' && (
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <h3 className="text-xl font-heading font-bold dark:text-white">Katalog Produk Shop</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {products.map((p) => (
                           <div key={p.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-white/5">
                              <img src={p.image} className="w-16 h-16 rounded-xl object-cover bg-slate-200 dark:bg-slate-800" referrerPolicy="no-referrer" />
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-bold truncate dark:text-white">{p.name}</p>
                                 <p className="text-primary font-bold text-xs">{formatRupiah(p.price)}</p>
                              </div>
                               <div className="flex gap-1 self-start">
                                <button onClick={() => setEditingProduct(p)} className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:text-primary border border-slate-100 dark:border-white/10">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setConfirmAction({ id: p.id, type: 'delete', subType: 'product', name: p.name, title: 'Hapus Produk', message: `Hapus "${p.name}" dari katalog?`, icon: Trash2, confirmText: 'Hapus', color: 'bg-rose-500' })} className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:text-rose-500 border border-slate-100 dark:border-white/10">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                           </div>
                        ))}
                      </div>
                   </div>
                 )}
              </motion.div>
          </div>
        </div>
      </div>

       <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmAction(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm glass p-8 rounded-[40px] border border-white dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl space-y-6 text-center">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border transition-all",
                confirmAction.type === 'delete' ? "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-900/20 text-rose-500" : "bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/20 text-primary"
              )}>
                <confirmAction.icon className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">{confirmAction.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{confirmAction.message}</p>
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={() => setConfirmAction(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300">Batal</button>
                <button onClick={handleConfirmAction} className={cn("flex-1 py-4 text-white rounded-2xl font-bold shadow-xl transition-all", confirmAction.color)}>
                  {confirmAction.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals for Add/Edit would go here, kept for implementation */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingOrder(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass p-8 rounded-[40px] border border-white dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl">
              <h3 className="text-2xl font-heading font-bold mb-6 dark:text-white">Edit Pesanan</h3>
              <form onSubmit={handleEditOrder} className="space-y-4">
                <input placeholder="Nama" required className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white" value={editingOrder.name} onChange={e => setEditingOrder({...editingOrder, name: e.target.value})} />
                <input placeholder="WhatsApp" required className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white" value={editingOrder.whatsapp} onChange={e => setEditingOrder({...editingOrder, whatsapp: e.target.value})} />
                <input placeholder="Total Harga" type="number" required className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white" value={editingOrder.totalPrice} onChange={e => setEditingOrder({...editingOrder, totalPrice: e.target.value})} />
                <select className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white" value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditingOrder(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold dark:text-white">Batal</button>
                  <button type="submit" className="flex-1 py-4 bg-secondary dark:bg-primary text-white rounded-2xl font-bold">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingProduct(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass p-8 rounded-[40px] border border-white dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl">
              <h3 className="text-2xl font-heading font-bold mb-6 dark:text-white">Tambah Produk Shop</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input placeholder="Nama Produk" required className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input placeholder="Harga" type="number" required className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <textarea placeholder="Deskripsi" required className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none min-h-[100px] dark:text-white" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <input placeholder="Image URL" required className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddingProduct(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold dark:text-white">Batal</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold">Tambah</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ label, value, icon: Icon, trend }: any) {
  return (
    <div className="p-6 glass rounded-[32px] border border-white dark:border-white/10 space-y-4 shadow-sm bg-white dark:bg-slate-900/40">
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full">{trend}</span>
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-heading font-bold truncate dark:text-white transition-colors">{value}</p>
        </div>
    </div>
  );
}
