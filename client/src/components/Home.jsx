import React, { useState, useEffect } from 'react';
import api from '../api';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [history, setHistory] = useState([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/url/history');
      setHistory(response.data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch URL history. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [navigate]);

  const handleShortenUrl = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      setError('Please enter a URL.');
      return;
    }
    setError(null);
    try {
      await api.post('/url', { url: originalUrl });
      setOriginalUrl(''); // Clear input field
      fetchHistory(); // Refresh the history table
    } catch (err) {
       if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to shorten URL. The server might be down or the URL is invalid.');
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <NavBar />
      <div className="container mx-auto p-4 md:p-8">
        <div className="bg-gray-900/50 border border-green-700 p-6 rounded-lg shadow-lg shadow-green-900/20">
          <h1 className="text-3xl mb-4 text-center">[ URL Shortener Dashboard ]</h1>
          
          <form onSubmit={handleShortenUrl} className="mb-8">
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Enter URL to shorten..."
                className="flex-grow bg-gray-800 border border-green-500 rounded-md p-2 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-green-600 text-black font-bold py-2 px-6 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
              >
                &gt;_ Shorten
              </button>
            </div>
          </form>

          <h2 className="text-2xl mb-4">[ Your Links ]</h2>
          {loading && <p>&gt; Loading history...</p>}
          {error && <p className="text-red-500">&gt; ERROR: {error}</p>}
          
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black/20 border border-green-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-3 text-left">Short ID</th>
                    <th className="p-3 text-left">Original URL</th>
                    <th className="p-3 text-left">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.shortId} className="border-t border-green-900 hover:bg-gray-800/50 transition-colors">
                      <td className="p-3">
                        <a 
                          href={`http://localhost:8001/${item.shortId}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-cyan-400 hover:underline"
                        >
                          {item.shortId}
                        </a>
                      </td>
                      <td className="p-3 max-w-sm truncate">
                        <a 
                          href={item.redirectURL} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline"
                          title={item.redirectURL}
                        >
                          {item.redirectURL}
                        </a>
                      </td>
                      <td className="p-3">{item.visitHistory.length}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                     <tr>
                        <td colSpan="3" className="p-3 text-center text-gray-500">
                           &gt;_ No links created yet.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;