import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { BarChart3, Users, Image, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/artists', label: 'Artists', icon: Users },
    { path: '/admin/artworks', label: 'Artworks', icon: Image },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-6 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        {/* Logout removed: use Navbar profile dropdown for logout */}
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
