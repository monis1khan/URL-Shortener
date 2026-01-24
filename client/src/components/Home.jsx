import React, { useState } from 'react';
import api from '../api';

const Home = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/url', { url });
      setShortUrl(`http://localhost:8001/${response.data.id}`);
    } catch (error) {
      console.error('Shorten URL failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg shadow-green-500/20">
        <h1 className="text-4xl font-bold text-center text-green-400">URL Shortener</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Enter your URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 text-white bg-gray-800 border-2 border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 shadow-green-glow"
          />
          <button
            type="submit"
            className="w-full py-3 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 shadow-green-glow"
          >
            Shorten Now
          </button>
        </form>
        {shortUrl && (
          <div className="p-4 mt-6 text-center bg-gray-800 border border-green-400 rounded-md">
            <p className="text-lg">Shortened URL:</p>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-green-400 hover:underline">
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
