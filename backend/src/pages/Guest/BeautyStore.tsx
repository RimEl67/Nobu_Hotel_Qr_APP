// src/pages/Guest/BeautyStore.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ShoppingCart, Star, Sparkles, Heart, Leaf, Droplets, Plus, Minus,
  CreditCard, Building2, SmartphoneNfc, CheckCircle2, ArrowLeft,
  Search, Mic, MicOff, X, Receipt, Eye
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import BackButton from '../../components/UI/BackButton';
import Modal from '../../components/UI/Modal';
import Navigation from '../../components/Layout/Navigation';
import toast from 'react-hot-toast';

interface BeautyProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'essential-oils' | 'creams' | 'serums' | 'masks';
  image: string;
  rating: number;
  benefits: string[];
  ingredients: string[];
  size: string;
  inStock: boolean;
}
interface CartItem { product: BeautyProduct; quantity: number; }
type PaymentMethod = 'card' | 'applepay' | 'bank';

// ===== NEW: types pour commandes =====
type OrderStatus = 'Processed' | 'Delivered' | 'Cancelled' | 'Pending';

interface OrderCustomer {
  fullName: string;
  roomNumber: string;
  phone: string;
  email?: string;
  notes?: string;
}
interface OrderItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}
interface Order {
  id: string;
  createdAt: string; // ISO
  status: OrderStatus;
  vatRate: number;   // ex 0.2
  items: OrderItem[];
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const VAT_DEFAULT = 0.2;
const money = (n: number) => `$${n.toFixed(2)}`;

const BeautyStore: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<BeautyProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // ====== Recherche (texte + voix)
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceAvailable(!!SR);
    if (!SR) return;
    const rec = new SR();
    rec.lang = navigator.language || 'fr-FR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const t = e.results?.[0]?.[0]?.transcript ?? '';
      setQuery(t);
      toast.success(`Search: “${t}”`);
    };
    rec.onerror = () => { setIsRecording(false); };
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
  }, []);

  const toggleVoice = () => {
    if (!voiceAvailable || !recognitionRef.current) {
      toast('Voice search not supported', { icon: '🎤' });
      return;
    }
    if (isRecording) { try { recognitionRef.current.stop(); } catch {} ; setIsRecording(false); }
    else { try { recognitionRef.current.start(); setIsRecording(true); } catch {} }
  };

  // ====== Checkout flow
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [payLoading, setPayLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('card');

  const [guestForm, setGuestForm] = useState({
    fullName: '',
    roomNumber: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [cardForm, setCardForm] = useState({ number: '', name: '', exp: '', cvc: '' });

  const categories = [
    { id: 'all', name: 'All Products', icon: Sparkles },
    { id: 'essential-oils', name: 'Essential Oils', icon: Droplets },
    { id: 'creams', name: 'Luxury Creams', icon: Heart },
    { id: 'serums', name: 'Face Serums', icon: Leaf },
    { id: 'masks', name: 'Face Masks', icon: Sparkles },
  ];

  const products: BeautyProduct[] = [
    // --- images pro (Pexels)
    { id: '1', name: 'Moroccan Argan Oil', description: 'Pure organic argan oil from the Atlas Mountains, perfect for hair and skin nourishment.', price: 85, category: 'essential-oils', image: 'https://bioaqua.com.pk/cdn/shop/files/Sadoer_Morocco_Argan_Oil_Hair_Care_Hair_Oil_80ml_1200x.jpg?v=1724889256', rating: 4.9, benefits: ['Deep moisturizing', 'Anti-aging properties', 'Hair strengthening', 'Skin repair'], ingredients: ['100% Pure Argan Oil', 'Vitamin E', 'Essential Fatty Acids'], size: '50ml', inStock: true },
    { id: '2', name: 'Lavender Essential Oil', description: 'Calming lavender oil from French Provence, ideal for relaxation and aromatherapy.', price: 65, category: 'essential-oils', image: 'https://assets.myntassets.com/w_412,q_30,dpr_3,fl_progressive,f_webp/assets/images/2024/AUGUST/30/yTsoL3W9_5181dd6823674e419a3542821617bd87.jpg', rating: 4.8, benefits: ['Stress relief', 'Better sleep', 'Skin soothing', 'Aromatherapy'], ingredients: ['Pure Lavender Oil', 'Natural Linalool', 'Lavandyl Acetate'], size: '30ml', inStock: true },
    { id: '3', name: 'Rose Hip Seed Oil', description: 'Premium rose hip oil rich in vitamins and antioxidants for radiant skin.', price: 95, category: 'essential-oils', image: 'https://m.media-amazon.com/images/I/71wo7CX5vKL._UF1000,1000_QL80_.jpg', rating: 4.7, benefits: ['Skin regeneration', 'Scar healing', 'Anti-aging', 'Hydration'], ingredients: ['Rose Hip Seed Oil', 'Vitamin C', 'Omega Fatty Acids'], size: '30ml', inStock: true },
    { id: '4', name: 'Eucalyptus Oil', description: 'Refreshing eucalyptus oil for respiratory wellness and muscle relief.', price: 55, category: 'essential-oils', image: 'https://media6.ppl-media.com//tr:h-235,w-235,c-at_max,dpr-2,q-40/static/img/product/305313/aravi-organic-nilgiri-eucalyptus-essential-oil-100-percentage-pure-oil-for-cold-and-cough-steam-inhalation_1_display_1715580137_887c382e.jpg', rating: 4.6, benefits: ['Respiratory support', 'Muscle relief', 'Mental clarity', 'Antimicrobial'], ingredients: ['Pure Eucalyptus Oil', 'Eucalyptol', 'Natural Terpenes'], size: '30ml', inStock: true },

    { id: '5', name: 'Gold Infused Night Cream', description: 'Luxurious anti-aging night cream infused with 24k gold particles.', price: 180, category: 'creams', image: 'https://img.grouponcdn.com/deal/3PgSoSMwKGpvc5GNc46CYe3xjMrj/3P-2048x1229/v1/t600x362.webp', rating: 4.9, benefits: ['Anti-aging', 'Skin firming', 'Deep hydration', 'Luxury experience'], ingredients: ['24k Gold', 'Hyaluronic Acid', 'Peptides', 'Shea Butter'], size: '50ml', inStock: true },
    { id: '6', name: 'Moroccan Clay Face Cream', description: 'Nourishing face cream with authentic Moroccan clay and argan oil.', price: 120, category: 'creams', image: 'https://i.etsystatic.com/22544825/r/il/af638a/5923253269/il_570xN.5923253269_qiju.jpg', rating: 4.8, benefits: ['Pore cleansing', 'Oil control', 'Skin purification', 'Natural glow'], ingredients: ['Moroccan Clay', 'Argan Oil', 'Aloe Vera', 'Rose Water'], size: '75ml', inStock: true },
    { id: '7', name: 'Intensive Hand Cream', description: 'Rich hand cream with shea butter and vitamin E for soft, smooth hands.', price: 45, category: 'creams', image: 'https://www.plantsbypost.co.uk/cdn/shop/files/Royal_Botanical_Gardens.jpg?v=1745236455&width=900', rating: 4.7, benefits: ['Deep moisturizing', 'Hand protection', 'Quick absorption', 'Long-lasting'], ingredients: ['Shea Butter', 'Vitamin E', 'Glycerin', 'Coconut Oil'], size: '100ml', inStock: true },
    { id: '8', name: 'Body Butter Cream', description: 'Ultra-rich body cream with cocoa butter and natural oils.', price: 75, category: 'creams', image: 'https://sc04.alicdn.com/kf/Hd6a7d29b874145e1aba3966c1ba5db7eW.jpg', rating: 4.8, benefits: ['Intense hydration', 'Skin softening', 'Long-lasting moisture', 'Natural fragrance'], ingredients: ['Cocoa Butter', 'Coconut Oil', 'Vitamin E', 'Natural Fragrance'], size: '200ml', inStock: true },

    { id: '9', name: 'Vitamin C Brightening Serum', description: 'Powerful vitamin C serum for brighter, more radiant skin.', price: 110, category: 'serums', image: 'https://www.cultbeauty.com/images?url=https://static.thcdn.com/productimg/original/15213895-1095270720968485.jpg&format=webp&auto=avif&width=1200&height=1200&fit=cover', rating: 4.9, benefits: ['Skin brightening', 'Dark spot reduction', 'Antioxidant protection', 'Collagen boost'], ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Niacinamide', 'Vitamin E'], size: '30ml', inStock: true },
    { id: '10', name: 'Hyaluronic Acid Serum', description: 'Intensive hydrating serum with multiple types of hyaluronic acid.', price: 95, category: 'serums', image: 'https://static.sweetcare.pt/img/prd/488/v-638608684173837976/garnier-017911xg-1.webp', rating: 4.8, benefits: ['Deep hydration', 'Plumping effect', 'Fine line reduction', 'Skin barrier repair'], ingredients: ['Hyaluronic Acid', 'Sodium Hyaluronate', 'Glycerin', 'Aloe Vera'], size: '30ml', inStock: true },
    { id: '11', name: 'Retinol Anti-Aging Serum', description: 'Advanced retinol serum for mature skin and anti-aging benefits.', price: 135, category: 'serums', image: 'https://www.mamaorganic.pk/cdn/shop/files/RetinolAntiAgeingKit_60f95c55-7bcd-4f47-99dd-1a1e9ffde46b.jpg?v=1728026644', rating: 4.7, benefits: ['Anti-aging', 'Wrinkle reduction', 'Skin renewal', 'Texture improvement'], ingredients: ['Retinol', 'Vitamin E', 'Squalane', 'Peptides'], size: '30ml', inStock: true },

    { id: '12', name: 'Dead Sea Mud Mask', description: 'Purifying mud mask with minerals from the Dead Sea.', price: 65, category: 'masks', image: 'https://http2.mlstatic.com/D_NQ_NP_629107-CBT77824641723_072024-O.webp', rating: 4.8, benefits: ['Deep cleansing', 'Pore tightening', 'Oil control', 'Mineral nourishment'], ingredients: ['Dead Sea Mud', 'Kaolin Clay', 'Aloe Vera', 'Tea Tree Oil'], size: '100ml', inStock: true },
    { id: '13', name: 'Gold Collagen Face Mask', description: 'Luxury sheet mask infused with gold and collagen for instant glow.', price: 25, category: 'masks', image: 'https://neutriherbs.com/cdn/shop/files/Gold_facial_mask-20_1fdc011d-2875-4ee3-8f55-5fed7e3c17dd.jpg?v=1737603532&width=1600', rating: 4.9, benefits: ['Instant glow', 'Skin firming', 'Hydration boost', 'Luxury treatment'], ingredients: ['24k Gold', 'Marine Collagen', 'Hyaluronic Acid', 'Vitamin E'], size: '1 sheet', inStock: true },
    { id: '14', name: 'Charcoal Detox Mask', description: 'Deep cleansing charcoal mask for oily and acne-prone skin.', price: 55, category: 'masks', image: 'https://okokocosmetiques.com/cdn/shop/files/DSC_0326-1.jpg?v=1742893693', rating: 4.6, benefits: ['Deep detox', 'Blackhead removal', 'Oil control', 'Pore cleansing'], ingredients: ['Activated Charcoal', 'Bentonite Clay', 'Tea Tree Oil', 'Salicylic Acid'], size: '75ml', inStock: true },
  ];

  // Filtre cat + recherche
  const filteredProducts = useMemo(() => {
    const base = selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(p => (`${p.name} ${p.description} ${p.category}`).toLowerCase().includes(q));
  }, [products, selectedCategory, query]);

  const addToCart = (product: BeautyProduct) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) setCart(prev => prev.filter(i => i.product.id !== productId));
    else setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };
  const getTotalPrice = () => cart.reduce((t, i) => t + i.product.price * i.quantity, 0);
  const getTotalItems = () => cart.reduce((t, i) => t + i.quantity, 0);
  const handleViewProduct = (product: BeautyProduct) => { setSelectedProduct(product); setShowProductModal(true); };

  // Checkout
  const startCheckout = () => {
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    setShowCartModal(false);
    setCheckoutStep(1);
    setShowCheckout(true);
  };
  const canGoStep2 = !!guestForm.fullName && !!guestForm.roomNumber && !!guestForm.phone;
  const canPay = method !== 'card' ||
    (cardForm.number.replace(/\s/g, '').length >= 15 &&
     cardForm.name.trim().length > 2 &&
     /\d{2}\/\d{2}/.test(cardForm.exp) &&
     cardForm.cvc.length >= 3);

  // ===== NEW: commandes mock + modal détail
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'NB-2025-00123',
      createdAt: new Date().toISOString(),
      status: 'Processed',
      vatRate: VAT_DEFAULT,
      paymentMethod: 'card',
      customer: { fullName: 'RIM', roomNumber: '85', phone: '+212685968569', email: 'rim01@gmail.com.com' },
      items: [
        { id: '1', name: 'Moroccan Argan Oil', unitPrice: 85, quantity: 1 },
        { id: '10', name: 'Hyaluronic Acid Serum', unitPrice: 95, quantity: 2 },
      ],
    },
    {
      id: 'NB-2025-00105',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'Delivered',
      vatRate: 0.2,
      paymentMethod: 'applepay',
      customer: { fullName: 'ibrahim mjd', roomNumber: '85', phone: '+212616024585', email: 'ibrahim123@gmail.com' },
      items: [{ id: '5', name: 'Gold Infused Night Cream', unitPrice: 180, quantity: 1 }],
    },
  ]);
  const [orderView, setOrderView] = useState<Order | null>(null);

  const orderTotals = (o: Order) => {
    const sub = o.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const vat = sub * o.vatRate;
    const total = sub + vat;
    return { sub, vat, total };
  };

  const simulatePay = async () => {
    setPayLoading(true);
    await new Promise(res => setTimeout(res, 1300));
    setPayLoading(false);
    setCheckoutStep(4);

    // NEW: créer une "commande traitée" à partir du panier + infos client
    const newOrder: Order = {
      id: `NB-${new Date().getFullYear()}-${Math.floor(Math.random()*90000 + 10000)}`,
      createdAt: new Date().toISOString(),
      status: 'Processed',
      vatRate: VAT_DEFAULT,
      paymentMethod: method,
      customer: {
        fullName: guestForm.fullName,
        roomNumber: guestForm.roomNumber,
        phone: guestForm.phone,
        email: guestForm.email,
        notes: guestForm.notes,
      },
      items: cart.map(ci => ({
        id: ci.product.id,
        name: ci.product.name,
        unitPrice: ci.product.price,
        quantity: ci.quantity,
      })),
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Nobu Beauty Store</h1>
                  <p className="text-purple-600 font-medium">Luxury Skincare & Wellness</p>
                </div>
              </div>
              <p className="text-gray-600">Discover our exclusive collection of premium beauty products</p>
            </div>
          </div>

          <Button
            onClick={() => setShowCartModal(true)}
            variant="primary"
            className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <ShoppingCart size={20} />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Button>
        </div>

        {/* Search + categories */}
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Search products (name, description, category)…"
            />
            {!!query && (
              <button onClick={() => setQuery('')} className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear">
                <X size={18} />
              </button>
            )}
            <button
              onClick={toggleVoice}
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}
              title={voiceAvailable ? (isRecording ? 'Stop voice search' : 'Voice search') : 'Voice not supported'}
            >
              {voiceAvailable ? (isRecording ? <Mic size={18} /> : <MicOff size={18} />) : <MicOff size={18} />}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all font-medium ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-gray-600">
              No product found for <span className="font-semibold">“{query}”</span>
              {selectedCategory !== 'all' && <> in <span className="font-semibold">{selectedCategory}</span></>}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} padding={false} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-1 shadow-lg">
                    <Star className="text-yellow-500 fill-current" size={14} />
                    <span className="text-sm font-bold">{product.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    ${product.price}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{product.size}</span>
                      {product.inStock ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">In Stock</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleViewProduct(product)} variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button
                      onClick={() => addToCart(product)}
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      disabled={!product.inStock}
                    >
                      <Plus size={16} className="mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ===== NEW: Orders (commandes traitées) ===== */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="text-purple-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          </div>

          {orders.length === 0 ? (
            <Card className="py-10 text-center text-gray-600">No orders yet.</Card>
          ) : (
            <Card padding>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-4">Order #</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Subtotal</th>
                      <th className="py-2 pr-4">VAT</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const t = orderTotals(o);
                      return (
                        <tr key={o.id} className="border-t">
                          <td className="py-3 pr-4 font-medium text-gray-900">{o.id}</td>
                          <td className="py-3 pr-4">{new Date(o.createdAt).toLocaleString()}</td>
                          <td className="py-3 pr-4">
                            <div className="text-gray-900">{o.customer.fullName}</div>
                            <div className="text-xs text-gray-500">Room {o.customer.roomNumber}</div>
                          </td>
                          <td className="py-3 pr-4">{money(t.sub)}</td>
                          <td className="py-3 pr-4">{money(t.vat)}</td>
                          <td className="py-3 pr-4 font-semibold text-purple-700">{money(t.total)}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              o.status === 'Processed' ? 'bg-blue-100 text-blue-700' :
                              o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                              o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>{o.status}</span>
                          </td>
                          <td className="py-3">
                            <Button size="sm" variant="outline" onClick={() => setOrderView(o)}>
                              <Eye size={14} className="mr-1" /> View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="Product Details" maxWidth="max-w-2xl">
        {selectedProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-lg" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current" size={16} />
                    <span className="font-medium">{selectedProduct.rating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{selectedProduct.size}</span>
                </div>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                <div className="text-3xl font-bold text-purple-600 mb-4">${selectedProduct.price}</div>
                <Button
                  onClick={() => { addToCart(selectedProduct); setShowProductModal(false); }}
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={!selectedProduct.inStock}
                >
                  <Plus size={20} className="mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal isOpen={showCartModal} onClose={() => setShowCartModal(false)} title="Your Beauty Cart" maxWidth="max-w-lg">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-2">Add some beauty products to get started</p>
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-6 border border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-600" size={20} />
                <span className="font-semibold text-purple-900">Nobu Beauty Store</span>
              </div>
              <p className="text-sm text-purple-700">Room delivery • Estimated time: 30-45 min</p>
            </div>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-purple-600 font-semibold">${item.product.price}</p>
                    <p className="text-xs text-gray-500">{item.product.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">{money(getTotalPrice())}</span></div>
              <div className="flex justify-between items-center mt-2"><span className="text-gray-600">Room delivery:</span><span className="font-semibold">Free</span></div>
              <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t">
                <span>Total:</span><span className="text-purple-600">{money(getTotalPrice())}</span>
              </div>
            </div>

            <Button onClick={startCheckout} variant="primary" size="lg" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <ShoppingCart size={20} className="mr-2" />
              Place Order
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">Products will be delivered to your room within 30-45 minutes</p>
          </div>
        )}
      </Modal>

      {/* CHECKOUT MODAL */}
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title={checkoutStep === 4 ? 'Payment Successful' : 'Checkout'} maxWidth="max-w-2xl">
        {checkoutStep !== 4 && (
          <div className="flex items-center justify-between mb-6">
            {[1,2,3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${checkoutStep >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{s}</div>
                {s < 3 && <div className={`w-20 h-1 rounded ${checkoutStep > s ? 'bg-purple-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {checkoutStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-600">Full name *</label><input className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={guestForm.fullName} onChange={(e) => setGuestForm({ ...guestForm, fullName: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Room number *</label><input className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={guestForm.roomNumber} onChange={(e) => setGuestForm({ ...guestForm, roomNumber: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Phone *</label><input className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={guestForm.phone} onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Email</label><input className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm text-gray-600">Notes</label><textarea rows={3} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none" value={guestForm.notes} onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => { setShowCheckout(false); setShowCartModal(true); }}><ArrowLeft size={16} className="mr-2" /> Back to cart</Button>
              <Button variant="primary" onClick={() => setCheckoutStep(2)} disabled={!canGoStep2} className={!canGoStep2 ? 'opacity-60 cursor-not-allowed' : ''}>Continue</Button>
            </div>
          </div>
        )}

        {checkoutStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2">Choose payment method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={() => setMethod('card')} className={`p-4 rounded-xl border text-left hover:bg-purple-50 transition ${method === 'card' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}><CreditCard className="text-purple-600 mb-2" /><div className="font-medium">Credit / Debit</div><div className="text-xs text-gray-600">Visa, MasterCard</div></button>
              <button onClick={() => setMethod('applepay')} className={`p-4 rounded-xl border text-left hover:bg-purple-50 transition ${method === 'applepay' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}><SmartphoneNfc className="text-purple-600 mb-2" /><div className="font-medium">Apple / Google Pay</div><div className="text-xs text-gray-600">Fast & secure</div></button>
              <button onClick={() => setMethod('bank')} className={`p-4 rounded-xl border text-left hover:bg-purple-50 transition ${method === 'bank' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}><Building2 className="text-purple-600 mb-2" /><div className="font-medium">Bank transfer</div><div className="text-xs text-gray-600">Manual confirmation</div></button>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setCheckoutStep(1)}><ArrowLeft size={16} className="mr-2" /> Back</Button>
              <Button variant="primary" onClick={() => setCheckoutStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2">{method === 'card' ? 'Card payment' : method === 'applepay' ? 'Apple / Google Pay' : 'Bank transfer'}</h3>
            {method === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="text-sm text-gray-600">Card number</label><input placeholder="4242 4242 4242 4242" className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} /></div>
                <div><label className="text-sm text-gray-600">Name on card</label><input placeholder="JOHN DOE" className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm text-gray-600">Exp.</label><input placeholder="MM/YY" className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={cardForm.exp} onChange={(e) => setCardForm({ ...cardForm, exp: e.target.value })} /></div>
                  <div><label className="text-sm text-gray-600">CVC</label><input placeholder="123" className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={cardForm.cvc} onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })} /></div>
                </div>
              </div>
            ) : method === 'applepay' ? (
              <div className="p-4 rounded-lg border bg-gray-50 text-sm text-gray-700">This is a demo. Trigger your Apple/Google Pay sheet here via your PSP.</div>
            ) : (
              <div className="p-4 rounded-lg border bg-gray-50 text-sm text-gray-700">Bank transfer instructions (demo): IBAN XX00 0000 0000 0000 • Ref: #{Math.floor(Math.random()*99999)}</div>
            )}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setCheckoutStep(2)}><ArrowLeft size={16} className="mr-2" /> Back</Button>
              <Button variant="primary" onClick={simulatePay} disabled={method === 'card' && !canPay} className={`${method === 'card' && !canPay ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {payLoading ? 'Processing…' : `Pay ${money(getTotalPrice())}`}
              </Button>
            </div>
          </div>
        )}

        {checkoutStep === 4 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Payment successful</h3>
            <p className="text-gray-600">Your order is confirmed and will be delivered to your room shortly.</p>
            <div className="pt-2">
              <Button variant="primary" onClick={() => { setShowCheckout(false); toast.success('Order confirmed'); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== NEW: Order Details Modal ===== */}
      <Modal
        isOpen={!!orderView}
        onClose={() => setOrderView(null)}
        title={orderView ? `Order ${orderView.id}` : 'Order'}
        maxWidth="max-w-3xl"
      >
        {orderView && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                <div className="text-sm text-gray-700">
                  <div>{orderView.customer.fullName}</div>
                  <div>Room {orderView.customer.roomNumber}</div>
                  <div>{orderView.customer.phone}</div>
                  {orderView.customer.email && <div>{orderView.customer.email}</div>}
                  {orderView.customer.notes && <div className="text-gray-500 mt-1">{orderView.customer.notes}</div>}
                </div>
              </Card>
              <Card>
                <h4 className="font-semibold text-gray-900 mb-2">Order</h4>
                <div className="text-sm text-gray-700">
                  <div>Date: {new Date(orderView.createdAt).toLocaleString()}</div>
                  <div>Status: <span className="font-medium">{orderView.status}</span></div>
                  <div>Payment: {orderView.paymentMethod}</div>
                  <div>VAT rate: {(orderView.vatRate * 100).toFixed(0)}%</div>
                </div>
              </Card>
            </div>

            <Card>
              <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Unit</th>
                      <th className="py-2 pr-4">Qty</th>
                      <th className="py-2 pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderView.items.map(it => (
                      <tr key={it.id} className="border-t">
                        <td className="py-2 pr-4">{it.name}</td>
                        <td className="py-2 pr-4">{money(it.unitPrice)}</td>
                        <td className="py-2 pr-4">{it.quantity}</td>
                        <td className="py-2 pr-4">{money(it.unitPrice * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(() => {
                const t = orderTotals(orderView);
                return (
                  <div className="mt-4 border-t pt-3 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{money(t.sub)}</span></div>
                    <div className="flex justify-between"><span>VAT ({(orderView.vatRate*100).toFixed(0)}%)</span><span>{money(t.vat)}</span></div>
                    <div className="flex justify-between font-semibold text-purple-700 text-base mt-1">
                      <span>Total</span><span>{money(t.total)}</span>
                    </div>
                  </div>
                );
              })()}
            </Card>
          </div>
        )}
      </Modal>

      <Navigation />
    </div>
  );
};

export default BeautyStore;