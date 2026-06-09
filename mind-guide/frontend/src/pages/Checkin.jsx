import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function Checkin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    stress: 50,
    focus: 50,
    happiness: 50,
    energy: 50,
    sleep_hours: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : null,
      };
      await api.checkin.create(payload);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  const SliderField = ({ label, value, field, emoji, color }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <label className="font-medium text-gray-700">
          {emoji} {label}
        </label>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => handleChange(field, parseInt(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${getSliderColor(field)} 0%, ${getSliderColor(field)} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  const getSliderColor = (field) => {
    const colors = {
      stress: '#ef4444',
      focus: '#3b82f6',
      happiness: '#10b981',
      energy: '#f59e0b',
    };
    return colors[field] || '#8b5cf6';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check-in Saved!</h2>
          <p className="text-gray-600">Your wellness data has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Daily Check-in</h1>
          <p className="text-gray-600 mt-1">How are you feeling today?</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SliderField
              label="Stress Level"
              value={formData.stress}
              field="stress"
              emoji="😰"
              color="text-red-600"
            />
            <SliderField
              label="Focus"
              value={formData.focus}
              field="focus"
              emoji="🎯"
              color="text-blue-600"
            />
            <SliderField
              label="Happiness"
              value={formData.happiness}
              field="happiness"
              emoji="😊"
              color="text-green-600"
            />
            <SliderField
              label="Energy"
              value={formData.energy}
              field="energy"
              emoji="⚡"
              color="text-yellow-600"
            />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="font-medium text-gray-700 block mb-3">🌙 Hours of Sleep</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.sleep_hours}
              onChange={(e) => handleChange('sleep_hours', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 7.5"
            />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="font-medium text-gray-700 block mb-3">📝 Notes (optional)</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="What's on your mind today?"
              maxLength="300"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.note.length}/300</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Check-in'}
          </button>
        </form>
      </div>
    </div>
  );
}
