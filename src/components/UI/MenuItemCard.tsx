import React from 'react';
import { Plus, Star } from 'lucide-react';
import { MenuItem } from '../../types';
import Button from './Button';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'appetizers': return 'Appetizer';
      case 'mains': return 'Main Course';
      case 'desserts': return 'Dessert';
      case 'beverages': return 'Beverage';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appetizers': return 'bg-green-100 text-green-700';
      case 'mains': return 'bg-orange-100 text-orange-700';
      case 'desserts': return 'bg-pink-100 text-pink-700';
      case 'beverages': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-1 shadow-lg">
          <Star className="text-yellow-500 fill-current" size={14} />
          <span className="text-sm font-bold">4.8</span>
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
          {item.price} $
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
              {item.name}
            </h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {item.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
            {getCategoryLabel(item.category)}
          </span>
          
          <Button
            onClick={() => onAddToCart(item)}
            variant="primary"
            size="sm" 
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={16} />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;