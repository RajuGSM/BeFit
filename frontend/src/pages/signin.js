import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../assets/BeFit.jpg";
import { Link } from "react-router-dom";
const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3002/signin', { userName, password });
      if (response.status === 200) {
        const token=response.data.token
        localStorage.setItem('authToken',token)
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.msg || 'Login failed.');
      } else {
        setError('Server error. Please try again later.');
      }
    }
  };

  return (
   
    <div className="min-h-screen flex">
      {/* Left Image Section */}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${logo})`
        }}
      ></div>

      {/* Right Form Section */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
        <p className="text-2xl font-semibold text-gray-700 mb-4 text-center">
  Welcome to BeFit! Track your goals and achieve your fitness dreams.
</p>

          <h2 className="text-3xl font-semibold text-gray-700 mb-6 text-center">Login</h2>
          {error && (
            <div className="mb-4 text-red-600 text-center">{error}</div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="userName"
                className="block text-gray-700 font-medium mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
          <p className="text-center mt-4">
  Don't have an account?  
  <Link to="/signup" className="text-blue-500 hover:underline">
     Sign up
  </Link>
</p>

        </div>
      </div>
    </div>
  );
};

export default Login;
