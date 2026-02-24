import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  
  // Explicitly typing token as string | null, which is what localStorage returns
  const token: string | null = localStorage.getItem('token');

  // Explicitly typing the return of the logout handler as void
  const handleLogout = (): void => {
    localStorage.removeItem('token');
    // We can just reload the page to reset the state and redirect.
    // Or navigate to a specific route.
    navigate('/login');
  };

  return (
    <nav className="bg-black/50 backdrop-blur-sm p-4 font-mono">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-green-400 text-2xl font-bold hover:text-green-300 transition-colors">
          [ SHORT-URL ]
        </Link>
        <div className="flex items-center space-x-4">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all text-sm font-semibold"
            >
              &gt;_ LOGOUT
            </button>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-green-400 hover:text-white transition-colors">
                &gt;_ Login
              </Link>
              <Link to="/signup" className="text-green-400 hover:text-white transition-colors">
                &gt;_ Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
