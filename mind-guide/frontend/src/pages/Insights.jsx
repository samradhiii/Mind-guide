import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Calendar, Heart, Moon, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await api.insights.get();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!insights || insights.recent_checkins?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Yet</h2>
          <p className="text-gray-600">
            Start tracking your wellness with daily check-ins to see your insights here.
          </p>
        </div>
      </div>
    );
  }

  const { summary, recent_checkins } = insights;
  const checkins = recent_checkins || [];

  const stressData = {
    labels: checkins.slice(-14).map((c) =>
      new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Stress Level',
        data: checkins.slice(-14).map((c) => c.stress),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const moodData = {
    labels: checkins.slice(-14).map((c) =>
      new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Happiness',
        data: checkins.slice(-14).map((c) => c.happiness),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Energy',
        data: checkins.slice(-14).map((c) => c.energy),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const sleepData = {
    labels: checkins.slice(-14).map((c) =>
      new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Sleep Hours',
        data: checkins.slice(-14).map((c) => c.sleep_hours || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  const sleepChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 12 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Insights</h1>
          <p className="text-gray-600 mt-1">Your wellness journey at a glance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <InsightCard
            icon={<Activity className="text-red-500" />}
            label="Average Stress"
            value={summary.avg_stress ? `${summary.avg_stress}%` : '--'}
            trend={summary.avg_stress > 60 ? 'high' : summary.avg_stress < 40 ? 'low' : 'normal'}
          />
          <InsightCard
            icon={<Heart className="text-green-500" />}
            label="Best Mood"
            value={summary.best_mood ? `${summary.best_mood.happiness}%` : '--'}
            trend="up"
          />
          <InsightCard
            icon={<Moon className="text-purple-500" />}
            label="Sleep Records"
            value={summary.sleep_trend?.length || 0}
            trend={summary.sleep_trend?.length > 5 ? 'up' : 'normal'}
          />
          <InsightCard
            icon={<Calendar className="text-blue-500" />}
            label="Total Check-ins"
            value={checkins.length}
            trend="neutral"
          />
        </div>

        {summary.best_mood && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-100">
            <div className="flex items-start">
              <span className="text-4xl mr-4">🏆</span>
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Your Best Day</h3>
                <p className="text-green-700 mt-1">
                  You felt <span className="font-bold">{summary.best_mood.happiness}%</span> happy on{' '}
                  {new Date(summary.best_mood.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {summary.best_mood.note && (
                  <p className="text-green-600 italic mt-2">"{summary.best_mood.note}"</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Stress Trend (14 days)</h3>
            <div className="h-64">
              <Line data={stressData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Mood & Energy (14 days)</h3>
            <div className="h-64">
              <Line data={moodData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Sleep Pattern (14 days)</h3>
          <div className="h-64">
            <Bar data={sleepData} options={sleepChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Check-ins</h3>
          <div className="space-y-3">
            {checkins.slice(-7).reverse().map((checkin, i) => (
              <div
                key={checkin.id || i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(checkin.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {checkin.note && <p className="text-sm text-gray-500 mt-1">{checkin.note}</p>}
                </div>
                <div className="flex space-x-4 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Stress</p>
                    <p className="font-bold text-red-600">{checkin.stress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Happy</p>
                    <p className="font-bold text-green-600">{checkin.happiness}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Energy</p>
                    <p className="font-bold text-yellow-600">{checkin.energy}</p>
                  </div>
                  {checkin.sleep_hours && (
                    <div>
                      <p className="text-xs text-gray-400">Sleep</p>
                      <p className="font-bold text-purple-600">{checkin.sleep_hours}h</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, label, value, trend }) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    normal: 'text-gray-600',
    high: 'text-red-600',
    low: 'text-green-600',
  };

  const borderColors = {
    up: 'border-green-200',
    down: 'border-red-200',
    normal: 'border-gray-200',
    high: 'border-red-200',
    low: 'border-green-200',
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${borderColors[trend]}`}>
      <div className="flex items-center mb-2">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${trendColors[trend]}`}>{value}</p>
    </div>
  );
}
