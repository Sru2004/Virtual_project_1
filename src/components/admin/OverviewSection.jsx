import React, { useMemo } from 'react';
import {
  Users,
  Image,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from './StatCard';

const OverviewSection = ({ stats, userGrowth, salesTrend, artworkStatus }) => {
  const userGrowthData = useMemo(
    () => userGrowth.map((row) => ({ month: row.month, users: row.users })),
    [userGrowth]
  );

  const salesData = useMemo(
    () => salesTrend.map((row) => ({ month: row.month, sales: row.revenue })),
    [salesTrend]
  );

  const artworkStatusData = useMemo(() => {
    const data = [
      { name: 'Approved', value: artworkStatus.approved, color: '#10B981' },
      { name: 'Pending', value: artworkStatus.pending, color: '#F59E0B' },
      { name: 'Rejected', value: artworkStatus.rejected, color: '#EF4444' },
    ];
    return data.filter((item) => item.value > 0);
  }, [artworkStatus]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-50" />
        <StatCard title="Total Artists" value={stats.totalArtists} icon={Users} color="bg-purple-50" />
        <StatCard title="Total Artworks" value={stats.totalArtworks} icon={Image} color="bg-green-50" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="bg-orange-50" />
        <StatCard title="Total Revenue" value={`₹${Number(stats.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} color="bg-yellow-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Artwork Status Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Artwork Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={artworkStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {artworkStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OverviewSection;
