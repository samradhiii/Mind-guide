import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Send, AlertTriangle, Phone, Loader2 } from 'lucide-react';

export function Chat() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [helplines, setHelplines] = useState({});
  const [lastAdvice, setLastAdvice] = useState([]);
  const [lastQuote, setLastQuote] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const loadHistory = async () => {
    try {
      const data = await api.chat.history();
      setHistory(data.history || []);
      setIsCrisis(data.is_crisis || false);
      setHelplines(data.helplines || {});
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const data = await api.chat.send(userMessage);
      setHistory(data.history || []);
      setIsCrisis(data.is_crisis || false);
      setHelplines(data.helplines || {});
      setLastAdvice(data.assistant?.advice || []);
      setLastQuote(data.assistant?.quote || '');
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (role) => {
    if (role === 'user') return '👤';
    return '🤖';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI Counselor</h1>
            <p className="text-sm text-gray-500">Your supportive wellness companion</p>
          </div>
          {isCrisis && (
            <div className="flex items-center text-red-600">
              <AlertTriangle size={18} className="mr-1" />
              <span className="text-sm font-medium">Crisis Support Active</span>
            </div>
          )}
        </div>
      </div>

      {isCrisis && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">If you're in crisis, please reach out for immediate help:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {Object.entries(helplines).map(([code, info]) => (
                    <div key={code} className="bg-white rounded-lg p-3 border border-red-200">
                      <p className="font-medium text-red-700">{info.name}</p>
                      {info.numbers?.map((num, i) => (
                        <p key={i} className="text-sm text-red-600">
                          {num.label}: <span className="font-bold">{num.value}</span>
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {history.length === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="text-4xl mb-3">💭</div>
              <h3 className="font-semibold text-gray-800 mb-2">How are you feeling today?</h3>
              <p className="text-gray-600 text-sm">
                Share what's on your mind. I'm here to listen and help you navigate your thoughts and emotions.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['I feel stressed', "I'm anxious", 'Feeling down', 'Need motivation', 'Just checking in'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setMessage(suggestion)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {history.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-purple-100 text-purple-600 ml-2' : 'bg-blue-100 text-blue-600 mr-2'
                  }`}
                >
                  {getMoodEmoji(msg.role)}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                  🤖
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {lastAdvice.length > 0 && !loading && (
        <div className="bg-purple-50 border-t border-purple-100 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <h4 className="font-semibold text-purple-800 mb-2">💡 Suggestions for you:</h4>
            <ul className="space-y-1">
              {lastAdvice.map((advice, i) => (
                <li key={i} className="text-purple-700 text-sm flex items-start">
                  <span className="mr-2">•</span>
                  {advice}
                </li>
              ))}
            </ul>
            {lastQuote && (
              <p className="mt-3 text-purple-600 italic text-sm">"{lastQuote}"</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border-t px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share what's on your mind..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
