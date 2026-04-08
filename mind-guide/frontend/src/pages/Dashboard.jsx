import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Sparkles, MessageCircle, TrendingUp, Moon, Sun, Target, Heart, ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function Dashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentCheckins, setRecentCheckins] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.insights.get();
      setInsights(data.summary);
      setRecentCheckins(data.recent_checkins || []);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodLabel = (mood) => {
    const labels = {
      happy: 'Happy',
      neutral: 'Okay',
      sad: 'Sad',
      stressed: 'Stressed',
      anxious: 'Anxious',
      burnout: 'Burned Out',
    };
    return labels[mood] || 'Unknown';
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'bg-green-100 text-green-700',
      neutral: 'bg-gray-100 text-gray-700',
      sad: 'bg-blue-100 text-blue-700',
      stressed: 'bg-yellow-100 text-yellow-700',
      anxious: 'bg-orange-100 text-orange-700',
      burnout: 'bg-red-100 text-red-700',
    };
    return colors[mood] || colors.neutral;
  };

  const chartData = {
    labels: recentCheckins.slice(-7).map((c) => {
      const d = new Date(c.timestamp);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        label: 'Stress',
        data: recentCheckins.slice(-7).map((c) => c.stress),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Happiness',
        data: recentCheckins.slice(-7).map((c) => c.happiness),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Energy',
        data: recentCheckins.slice(-7).map((c) => c.energy),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's your wellness snapshot</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <QuickStatCard
            icon={<Heart className="text-red-500" />}
            label="Avg Stress"
            value={insights?.avg_stress ? `${insights.avg_stress}%` : '--'}
            color="red"
          />
          <QuickStatCard
            icon={<Sun className="text-yellow-500" />}
            label="Best Mood"
            value={insights?.best_mood ? getMoodLabel(insights.best_mood.happiness > 70 ? 'happy' : insights.best_mood.happiness > 40 ? 'neutral' : 'sad') : '--'}
            color="green"
          />
          <QuickStatCard
            icon={<Moon className="text-purple-500" />}
            label="Sleep Trend"
            value={insights?.sleep_trend?.length > 0 ? `${insights.sleep_trend.length} days` : '--'}
            color="purple"
          />
          <QuickStatCard
            icon={<Target className="text-blue-500" />}
            label="Counseling"
            value={insights?.last_counseling_mood ? getMoodLabel(insights.last_counseling_mood) : '--'}
            color="blue"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-purple-500" />
              Weekly Trends
            </h2>
            <div className="h-64">
              {recentCheckins.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No check-in data yet. Start tracking your wellness!
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/checkin"
                className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:shadow-lg transition-all"
              >
                <Sparkles size={20} className="mr-3" />
                <span className="font-medium">Daily Check-in</span>
              </Link>
              <Link
                to="/chat"
                className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white hover:shadow-lg transition-all"
              >
                <MessageCircle size={20} className="mr-3" />
                <span className="font-medium">Talk to AI Counselor</span>
              </Link>
              <Link
                to="/simulate"
                className="flex items-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white hover:shadow-lg transition-all"
              >
                <TrendingUp size={20} className="mr-3" />
                <span className="font-medium">Future Mirror</span>
              </Link>
            </div>
          </div>
        </div>

        {insights?.best_mood && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">🏆 Your Best Moment</h3>
            <p className="text-green-700">
              You rated your happiness at <span className="font-bold">{insights.best_mood.happiness}%</span> on{' '}
              {new Date(insights.best_mood.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              {insights.best_mood.note && <span className="block mt-1 text-green-600">"{insights.best_mood.note}"</span>}
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/insights"
            className="inline-flex items-center text-purple-600 font-medium hover:underline"
          >
            View all insights <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickStatCard({ icon, label, value, color }) {
  const borderColors = {
    red: 'border-red-200',
    green: 'border-green-200',
    purple: 'border-purple-200',
    blue: 'border-blue-200',
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${borderColors[color]}`}>
      <div className="flex items-center mb-2">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
