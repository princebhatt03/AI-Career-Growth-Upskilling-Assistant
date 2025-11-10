import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import About from './pages/AboutPage';
import ErrorPage from './pages/ErrorPage';
import Register from './pages/user/Register';
import Login from './pages/user/Login';
import Dashboard from './pages/user/Dashboard';

export default function App() {
  return (
    <Router>
      <div>
        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/about"
            element={<About />}
          />
          <Route
            path="/user/register"
            element={<Register />}
          />
          <Route
            path="/user/login"
            element={<Login />}
          />
          <Route
            path="/user/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="*"
            element={<ErrorPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}
