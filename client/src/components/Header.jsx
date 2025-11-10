import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user from localStorage and keep updated
  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);
    return () => window.removeEventListener('storage', updateUser);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/user/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* Left - Logo / Brand */}
      <div
        onClick={() => navigate('/')}
        className="text-2xl font-bold text-blue-600 cursor-pointer select-none">
        SkillSync
      </div>

      {/* Middle - Navigation */}
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
      <div
        className="relative flex items-center space-x-4"
        ref={dropdownRef}>
        {user ? (
          <>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 cursor-pointer">
              <img
                src={
                  user.profilePhoto ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                }
                alt="User"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              />
              <span className="text-gray-800 font-medium hidden sm:inline-block">
                {user.name?.split(' ')[0]}
              </span>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-14 bg-white border rounded-xl shadow-lg w-56 py-3 z-50">
                <div className="flex flex-col items-center text-center border-b pb-3">
                  <img
                    src={
                      user.profilePhoto ||
                      'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                    }
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-blue-400 object-cover"
                  />
                  <h3 className="mt-2 text-gray-900 font-semibold">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <div className="mt-3 px-4 space-y-2">
                  <button
                    onClick={() => {
                      navigate('/user/dashboard');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition">
                    🧭 Dashboard
                  </button>

                  <button
                    onClick={() => {
                      navigate('/user/profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition">
                    👤 View Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition">
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
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
