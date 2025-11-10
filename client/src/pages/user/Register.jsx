import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import API from '../../services/api';
import Header from '../../components/Header';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    profilePhoto: null,
  });

  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle text inputs
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file upload
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, profilePhoto: file });
    setPreview(URL.createObjectURL(file)); // Preview image
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, password, mobile, profilePhoto } = formData;

    // Basic validation
    if (!name || !email || !password) {
      toast.error('Name, Email, and Password are required!');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number!');
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      fd.append('mobile', mobile);
      if (profilePhoto) {
        fd.append('profilePhoto', profilePhoto);
      }

      const { data } = await API.post('/user/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Registration successful! Redirecting...');
      setTimeout(() => navigate('/user/login'), 1500);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-3">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create an Account
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mobile Number (Optional)
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="Enter your 10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
              />
            </div>

            {/* Profile Photo Upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Profile Photo (Optional)
              </label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-2 py-1 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 w-20 h-20 rounded-full object-cover border border-gray-300 mx-auto"
                />
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min 8 chars)"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Login Redirect */}
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/user/login')}
              className="text-blue-600 hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
