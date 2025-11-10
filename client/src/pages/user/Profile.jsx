import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Header from '../../components/Header';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    newPassword: '',
    profilePhoto: null,
  });
  const [preview, setPreview] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/user/profile');
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          newPassword: '',
          profilePhoto: null,
        });
        setPreview(data.profilePhoto || '');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image change preview
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Update Profile
  const handleUpdateProfile = async () => {
    if (!confirmPassword) {
      toast.error('Please enter your current password to confirm.');
      return;
    }

    const form = new FormData();
    form.append('currentPassword', confirmPassword);
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('mobile', formData.mobile);
    if (formData.newPassword) form.append('newPassword', formData.newPassword);
    if (formData.profilePhoto)
      form.append('profilePhoto', formData.profilePhoto);

    try {
      setLoading(true);
      const { data } = await API.put('/user/profile', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Profile updated successfully!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setShowModal(false);
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Profile (with navigate)
  const handleDeleteProfile = async () => {
    if (!confirmPassword) {
      toast.error('Please enter your current password to confirm deletion.');
      return;
    }

    try {
      setLoading(true);
      await API.delete('/user/profile', {
        data: { currentPassword: confirmPassword },
      });

      toast.success('Account deleted successfully!');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setShowModal(false);

      // ✅ Smooth React Router navigation
      setTimeout(() => navigate('/user/login'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <>
        <Header />
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <div className="text-center py-20 text-gray-600 text-lg">
          Loading your profile...
        </div>
      </>
    );

  return (
    <>
      <Header />
      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          My Profile
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={preview || user.profilePhoto}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-md"
            />
            <label className="mt-3 cursor-pointer text-indigo-600 hover:underline">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                Mobile
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Leave empty to keep current password"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => {
                setIsDeleting(false);
                setShowModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-5 rounded-lg shadow-md">
              Update Profile
            </button>

            <button
              onClick={() => {
                setIsDeleting(true);
                setShowModal(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded-lg shadow-md">
              Delete Account
            </button>
          </div>
        </div>

        {/* Password Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                {isDeleting
                  ? 'Confirm Account Deletion'
                  : 'Confirm Profile Update'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                Please enter your current password to confirm.
              </p>

              <input
                type="password"
                placeholder="Enter current password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-4"
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded-lg">
                  Cancel
                </button>

                <button
                  onClick={
                    isDeleting ? handleDeleteProfile : handleUpdateProfile
                  }
                  disabled={loading}
                  className={`${
                    isDeleting
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white py-2 px-4 rounded-lg shadow-md`}>
                  {loading
                    ? 'Processing...'
                    : isDeleting
                    ? 'Delete'
                    : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
