import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  // 1. ADD THIS: State to hold the error message
  const [error, setError] = useState(""); 
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors before new request
    
    try {
      const response = await api.post('/user/login', formData);
      
      // Note: If your backend uses cookies (httpOnly), you might not need this line.
      // But if it sends a token, this is correct.
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      
      // 2. ADD THIS: Catch the error from the backend
      // This checks if the backend sent a specific message (e.g., "Invalid password")
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Invalid Email or Password"); // Fallback message
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg shadow-green-500/20">
        <h1 className="text-3xl font-bold text-center text-green-400">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-2 text-white bg-gray-800 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 text-white bg-gray-800 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* 3. ADD THIS: The Red Error Box */}
          {error && (
            <div className="p-3 text-sm text-center text-red-500 bg-red-900/20 border border-red-500 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
          >
            Login
          </button>
        </form>
        <p className="text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
