import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, FileText, Save, AlertCircle, CheckCircle } from 'lucide-react';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    intro: user?.intro || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateProfile({
        ...formData,
        age: parseInt(formData.age),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-6 pb-6 border-b">
            <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mr-4">
              <span className="text-3xl text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center">
              <CheckCircle size={18} className="mr-2" />
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User size={16} className="inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={16} className="inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline mr-1" />
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="10"
                max="120"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText size={16} className="inline mr-1" />
                About You
              </label>
              <textarea
                value={formData.intro}
                onChange={(e) => handleChange('intro', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
                maxLength="240"
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.intro.length}/240</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="font-semibold text-purple-800 mb-2">💡 Tips for Your Profile</h3>
          <ul className="text-purple-700 text-sm space-y-1">
            <li>• Keep your name updated so your counselor can address you personally</li>
            <li>• Your intro helps the AI understand your background</li>
            <li>• Regular profile updates help track your growth journey</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
