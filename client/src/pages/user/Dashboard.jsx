import React from 'react';
import Header from '../../components/Header';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome, {user?.name || 'User'} 👋
          </h2>
          <p className="text-gray-600">You are now logged in!</p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
