import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Utensils, Bell, MessageCircle, Map, Sparkles } from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/dashboard/restaurant', icon: Utensils, label: 'Restaurant' },
    { to: '/dashboard/services', icon: Bell, label: 'Services' },
    { to: '/dashboard/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/dashboard/hotel-map', icon: Map, label: 'Map' },
    { to: '/dashboard/beauty-store', icon: Sparkles, label: 'Beauty' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 lg:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-500 hover:text-orange-400'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;