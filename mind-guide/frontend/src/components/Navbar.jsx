import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, MessageCircle, BarChart3, Sparkles, User, LogOut } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/checkin', icon: Sparkles, label: 'Check-in' },
  { to: '/chat', icon: MessageCircle, label: 'AI Counselor' },
  { to: '/simulate', icon: BarChart3, label: 'Future Mirror' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MG</span>
            </div>
            <span className="font-bold text-gray-800 hidden sm:block">MindGuide</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              Hello, {user?.name?.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-100">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center px-3 py-1 ${
                location.pathname === to ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
