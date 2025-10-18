import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { apiService } from '../../services/api';

const AdminStatistics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 15420,
    totalOrders: 156,
    totalGuests: 89,
    totalReservations: 67,
    revenueChange: 12.5,
    ordersChange: -3.2,
    guestsChange: 8.7,
    reservationsChange: 15.3
  });

  const revenueData = [
    { name: 'Jan', revenue: 4000, orders: 45, guests: 23 },
    { name: 'Fév', revenue: 3000, orders: 38, guests: 19 },
    { name: 'Mar', revenue: 5000, orders: 52, guests: 31 },
    { name: 'Avr', revenue: 4500, orders: 48, guests: 28 },
    { name: 'Mai', revenue: 6000, orders: 61, guests: 35 },
    { name: 'Jun', revenue: 5500, orders: 56, guests: 32 },
    { name: 'Jul', revenue: 7000, orders: 68, guests: 42 },
  ];

  const serviceDistribution = [
    { name: 'Restaurant', value: 45, color: '#f97316' },
    { name: 'Spa', value: 25, color: '#8b5cf6' },
    { name: 'Activités', value: 20, color: '#10b981' },
    { name: 'Services', value: 10, color: '#3b82f6' },
  ];

  const hourlyData = [
    { hour: '6h', orders: 2 },
    { hour: '8h', orders: 8 },
    { hour: '10h', orders: 15 },
    { hour: '12h', orders: 25 },
    { hour: '14h', orders: 20 },
    { hour: '16h', orders: 18 },
    { hour: '18h', orders: 30 },
    { hour: '20h', orders: 35 },
    { hour: '22h', orders: 12 },
  ];

  const topServices = [
    { name: 'Miso Black Cod', orders: 45, revenue: 2025 },
    { name: 'Spa Massage', orders: 38, revenue: 5700 },
    { name: 'Yoga Session', orders: 32, revenue: 1440 },
    { name: 'Yellowtail Sashimi', orders: 28, revenue: 784 },
    { name: 'Cooking Class', orders: 25, revenue: 2125 },
  ];

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      const data = await apiService.getStatsByPeriod(selectedPeriod);
      // Update stats with API data
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {change > 0 ? (
              <TrendingUp size={14} className="text-green-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600">Analyse détaillée des performances</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((period) => (
            <Button
              key={period}
              size="sm"
              variant={selectedPeriod === period ? 'primary' : 'outline'}
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'day' ? 'Jour' : 
               period === 'week' ? 'Semaine' :
               period === 'month' ? 'Mois' : 'Année'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus"
          value={`${stats.totalRevenue.toLocaleString()}€`}
          change={stats.revenueChange}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          change={stats.ordersChange}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Clients"
          value={stats.totalGuests}
          change={stats.guestsChange}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Réservations"
          value={stats.totalReservations}
          change={stats.reservationsChange}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, 'Revenus']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Service Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Services</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Hour */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commandes par Heure</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Multi-metric Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances Multiples</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} />
              <Line type="monotone" dataKey="guests" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Services Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services les Plus Populaires</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Commandes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Revenus</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Moyenne</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((service, index) => (
                <tr key={service.name} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {service.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">{service.orders}</td>
                  <td className="py-3 px-4 font-medium">{service.revenue}€</td>
                  <td className="py-3 px-4">{Math.round(service.revenue / service.orders)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminStatistics;