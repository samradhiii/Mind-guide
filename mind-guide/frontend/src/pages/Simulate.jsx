import { useState } from 'react';
import { api } from '../services/api';
import { ArrowRight, RefreshCw, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

const HABITS = [
  { id: 'better sleep', label: 'Better Sleep', emoji: '😴', desc: '7-8 hours nightly' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘', desc: '10-15 mins daily' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃', desc: '30 mins, 3x/week' },
  { id: 'healthy eating', label: 'Healthy Eating', emoji: '🥗', desc: 'Balanced nutrition' },
  { id: 'less screen time', label: 'Less Screen Time', emoji: '📵', desc: '2+ hrs less daily' },
  { id: 'quit junk food', label: 'Quit Junk Food', emoji: '🚫', desc: 'No processed foods' },
];

export function Simulate() {
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [months, setMonths] = useState(6);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleHabit = (habitId) => {
    setSelectedHabits((prev) =>
      prev.includes(habitId) ? prev.filter((h) => h !== habitId) : [...prev, habitId]
    );
  };

  const handleSimulate = async () => {
    if (selectedHabits.length === 0) {
      setError('Please select at least one habit');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await api.simulate.run(selectedHabits, months);
      setResult(data.simulation);
    } catch (err) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (before, after) => {
    if (after > before + 2) return <TrendingUp className="text-green-500" size={16} />;
    if (after < before - 2) return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-400" size={16} />;
  };

  const MetricCard = ({ label, before, after, lowerIsBetter }) => {
    const change = after - before;
    const isImprovement = lowerIsBetter ? change < 0 : change > 0;
    const changeColor = change === 0 ? 'text-gray-500' : isImprovement ? 'text-green-600' : 'text-red-600';

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">{label}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">{Math.round(before)}</span>
            <ArrowRight size={16} className="text-gray-400" />
            <span className="text-2xl font-bold text-purple-600">{Math.round(after)}</span>
          </div>
          {getChangeIcon(before, after)}
        </div>
        <p className={`text-sm mt-1 ${changeColor}`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)} change
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🔮 Future Mirror</h1>
          <p className="text-gray-600 mt-1">
            See how your lifestyle changes could transform your wellbeing
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Habits to Adopt</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HABITS.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedHabits.includes(habit.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <span className="text-2xl mb-2 block">{habit.emoji}</span>
                <p className="font-medium text-gray-800">{habit.label}</p>
                <p className="text-xs text-gray-500 mt-1">{habit.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Simulation Period: {months} months
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 month</span>
              <span>12 months</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={handleSimulate}
            disabled={loading || selectedHabits.length === 0}
            className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="animate-spin mr-2" size={20} />
                Simulating...
              </span>
            ) : (
              'See Your Future'
            )}
          </button>
        </div>

        {result && (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
              <h3 className="font-semibold text-lg mb-2">Your Predicted Journey</h3>
              <p className="text-purple-100">{result.narrative}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {result.habits.map((h) => (
                  <span key={h} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">Before vs After</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <MetricCard
                label="Stress"
                before={result.before.stress}
                after={result.after.stress}
                lowerIsBetter
              />
              <MetricCard
                label="Focus"
                before={result.before.focus}
                after={result.after.focus}
                lowerIsBetter={false}
              />
              <MetricCard
                label="Happiness"
                before={result.before.happiness}
                after={result.after.happiness}
                lowerIsBetter={false}
              />
              <MetricCard
                label="Energy"
                before={result.before.energy}
                after={result.after.energy}
                lowerIsBetter={false}
              />
              <MetricCard
                label="Health Risk"
                before={result.before.health_risk}
                after={result.after.health_risk}
                lowerIsBetter
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-medium">
                💡 Consistency is key! Small daily improvements compound into significant life changes over time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
