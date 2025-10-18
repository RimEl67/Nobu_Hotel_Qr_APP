import React, { useEffect, useState, useRef } from 'react';
import { Plus, Minus, ShoppingCart, Star, RefreshCw, Loader2, Calendar, Clock, Lightbulb, Mic, Search } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import type { MenuItem, Order } from '../../types';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import BackButton from '../../components/UI/BackButton';
import Modal from '../../components/UI/Modal';
import Navigation from '../../components/Layout/Navigation';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Restaurant: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search input
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<MenuItem[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const { items, addItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersRefreshing, setOrdersRefreshing] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const categories = ['all', 'appetizers', 'mains', 'desserts', 'beverages'];

  // Speech recognition setup
  const recognition = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.trim();
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition failed. Please try again.');
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startSpeechRecognition = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    } else {
      toast.error('Speech recognition is not supported in this browser.');
    }
  };

  // Fallback images
  const fallbackByCat: Record<string, string> = {
    appetizers: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=900&h=600&fit=crop',
    mains: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&h=600&fit=crop',
    desserts: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900&h=600&fit=crop',
    beverages: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900&h=600&fit=crop',
  };
  const getFallbackImage = (cat: string) => fallbackByCat[cat] || fallbackByCat.mains;
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, cat: string) => {
    e.currentTarget.src = getFallbackImage(cat);
  };

  // Fetch menu items
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiService.getMenu();
        setMenuItems(data);
      } catch {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Client-side AI-like recommendation logic
  const generateRecommendations = () => {
    setRecommendationsLoading(true);
    try {
      let recommendations: MenuItem[] = [];
      const cartCategories = new Set(items.map((item) => item.menuItem.category));

      // Rule 1: If cart has mains, recommend beverages or desserts
      if (cartCategories.has('mains')) {
        recommendations = menuItems.filter(
          (item) => (item.category === 'beverages' || item.category === 'desserts') && 
          !items.some((cartItem) => cartItem.menuItem.id === item.id)
        ).slice(0, 3);
      }
      // Rule 2: If cart has appetizers, recommend mains
      else if (cartCategories.has('appetizers')) {
        recommendations = menuItems.filter(
          (item) => item.category === 'mains' && 
          !items.some((cartItem) => cartItem.menuItem.id === item.id)
        ).slice(0, 3);
      }
      // Rule 3: If cart is empty, recommend popular items in selected category
      else if (items.length === 0) {
        recommendations = menuItems
          .filter((item) => selectedCategory === 'all' || item.category === selectedCategory)
          .sort(() => Math.random() - 0.5) // Simulate "popularity" with random sort
          .slice(0, 3);
      }
      // Rule 4: Fallback - random items not in cart
      if (recommendations.length === 0) {
        recommendations = menuItems
          .filter((item) => !items.some((cartItem) => cartItem.menuItem.id === item.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
      }

      setRecommendedItems(recommendations);
    } catch {
      toast.error('Failed to generate recommendations');
      setRecommendedItems([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Trigger recommendations when modal opens
  useEffect(() => {
    if (showRecommendations) {
      generateRecommendations();
    }
  }, [showRecommendations, items, menuItems, selectedCategory]);

  // Filter menu items based on category and search query
  const filtered = menuItems
    .filter((item) => selectedCategory === 'all' || item.category === selectedCategory)
    .filter((item) =>
      searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  // Place order
  const handlePlaceOrder = async () => {
    if (items.length === 0) return toast.error('Your cart is empty');
    if (!user?.id) return toast.error('User not authenticated');

    try {
      const payload = {
        guestId: user.id,
        items: items.map((i) => ({
          menuItemId: Number(i.menuItem.id),
          quantity: i.quantity,
          price: i.menuItem.price,
        })),
        total: getTotalPrice(),
        notes: '',
      };
      await apiService.createOrder(payload);
      toast.success('Order placed successfully!');
      clearCart();
      setShowCart(false);
      await loadOrders();
    } catch {
      toast.error('Failed to place order');
    }
  };

  // Load orders
  const loadOrders = async () => {
    try {
      setOrdersRefreshing(true);
      const data = user?.id ? await apiService.getGuestOrders(String(user.id)) : await apiService.getOrders();
      const sorted = [...(data || [])].sort((a, b) => {
        const ta = new Date((a as any).createdAt || 0).getTime();
        const tb = new Date((b as any).createdAt || 0).getTime();
        return tb - ta;
      });
      setOrders(sorted);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load your orders');
    } finally {
      setOrdersLoading(false);
      setOrdersRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const id = setInterval(loadOrders, 30000);
    return () => clearInterval(id);
  }, [user?.id]);

  const statusChip = (status?: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'CONFIRMED' || s === 'PREPARING') return 'bg-blue-100 text-blue-800';
    if (s === 'DELIVERED') return 'bg-green-100 text-green-800';
    if (s === 'CANCELLED') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant</h1>
              <p className="text-gray-600">Experience culinary excellence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            {/* Audio Search Button */}
            <Button
              onClick={startSpeechRecognition}
              variant="outline"
              className={`relative ${isListening ? 'bg-orange-100' : ''}`}
              title="Search by voice"
              disabled={isListening}
            >
              <Mic size={20} className={isListening ? 'text-orange-500' : ''} />
            </Button>
            {/* AI Recommendation Button */}
            <Button
              onClick={() => setShowRecommendations(true)}
              variant="outline"
              className="relative"
              title="Get personalized recommendations"
            >
              <Lightbulb size={20} />
            </Button>
            {/* Cart Button */}
            <Button onClick={() => setShowCart(true)} variant="primary" className="relative">
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === c ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'
              }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid menu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-600">
                No items found matching your search.
              </div>
            ) : (
              filtered.map((item) => (
                <Card key={item.id} padding={false} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.image || getFallbackImage(item.category)}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => handleImgError(e, item.category)}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <Star className="text-yellow-500 fill-current" size={14} />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                      <Button onClick={() => addItem(item)} size="sm" className="flex items-center gap-2">
                        <Plus size={16} />
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* RIGHT: Orders list */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
              <Button variant="outline" size="sm" onClick={loadOrders} disabled={ordersRefreshing}>
                {ordersRefreshing ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCw className="mr-2" size={16} />}
                Refresh
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-gray-600 text-center py-10">No orders yet. Add items and place your first order.</div>
            ) : (
              <div ref={listRef} className="max-h-[560px] overflow-auto pr-2">
                <ul className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <li key={String((o as any).id)} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">Order #{String((o as any).id)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusChip((o as any).status)}`}>
                              {String((o as any).status || 'PENDING').toUpperCase()}
                            </span>
                            {typeof (o as any).total === 'number' && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-100">
                                ${(o as any).total}
                              </span>
                            )}
                          </div>
                          {(o as any).items?.length ? (
                            <p className="text-gray-600 mt-1 text-sm truncate">
                              {(o as any).items.map((it: any) => `${it.quantity}× ${it.name || it.menuItemId}`).join(' • ')}
                            </p>
                          ) : null}
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <Calendar size={14} />
                            {(o as any).createdAt ? new Date((o as any).createdAt).toLocaleDateString() : '-'}
                            {(o as any).createdAt && (
                              <>
                                <Clock size={14} />
                                {new Date((o as any).createdAt).toLocaleTimeString()}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Cart Modal */}
        <Modal isOpen={showCart} onClose={() => setShowCart(false)} title="Your Order" maxWidth="max-w-lg">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <div>
              <div className="space-y-4 mb-6">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={it.menuItem.image || getFallbackImage(it.menuItem.category)}
                      alt={it.menuItem.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => handleImgError(e, it.menuItem.category)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{it.menuItem.name}</h4>
                      <p className="text-orange-600 font-semibold">${it.menuItem.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(it.id, it.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{it.quantity}</span>
                      <button
                        onClick={() => updateQuantity(it.id, it.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">${getTotalPrice()}</span>
                </div>
              </div>
              <Button onClick={handlePlaceOrder} variant="primary" size="lg" className="w-full">
                Place Order
              </Button>
            </div>
          )}
        </Modal>

        {/* Recommendations Modal */}
        <Modal isOpen={showRecommendations} onClose={() => setShowRecommendations(false)} title="Recommended for You" maxWidth="max-w-lg">
          {recommendationsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto animate-spin text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Loading recommendations...</p>
            </div>
          ) : recommendedItems.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No recommendations available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.image || getFallbackImage(item.category)}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => handleImgError(e, item.category)}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <p className="text-orange-600 font-semibold">${item.price}</p>
                  </div>
                  <Button
                    onClick={() => {
                      addItem(item);
                      toast.success(`${item.name} added to cart!`);
                    }}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>
      <Navigation />
    </div>
  );
};

export default Restaurant;