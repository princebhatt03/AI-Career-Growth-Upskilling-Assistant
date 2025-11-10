import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Get user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/user/login');
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* Left - Logo / Brand */}
      <Link
        to="/"
        className="text-2xl font-bold text-blue-600">
        MyApp
      </Link>

      {/* Middle - Navigation (Demo links for now) */}
      <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
        <Link
          to="/"
          className="hover:text-blue-600 transition">
          Home
        </Link>
        <Link
          to="/about"
          className="hover:text-blue-600 transition">
          About
        </Link>
        <Link
          to="/contact"
          className="hover:text-blue-600 transition">
          Contact
        </Link>
      </nav>

      {/* Right - User Section */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-800 font-medium">
                {user.name?.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/user/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
