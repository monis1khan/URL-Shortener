import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

// --- Type Definitions ---

interface SignupResponse {
  // Add fields here if your backend returns specific data on signup success (like a message or user object)
  message?: string;
}

// --- Component ---

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      // FIX: Change '/user' to '/user/signup'
      await api.post<SignupResponse>('/user/signup', formData); 
      navigate('/login');
    } catch (error: unknown) {
      // Typed as unknown to follow strict TypeScript safety rules for catch blocks
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg shadow-green-500/20">
        <h1 className="text-3xl font-bold text-center text-green-400">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Name"
            onChange={handleChange}
            className="w-full px-4 py-2 text-white bg-gray-800 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-2 text-white bg-gray-800 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 text-white bg-gray-800 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <button
            type="submit"
            className="w-full py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;