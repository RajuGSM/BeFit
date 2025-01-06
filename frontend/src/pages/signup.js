import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../assets/BeFit.jpg"; // Ensure the image path is correct
import { Link } from 'react-router-dom';
const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    Age: 0,
    Height: 0,
    Weight: 0,
    gender: '',
    ActivityLevel: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3002/signup', formData);
      if (response.status === 200) {
        alert('Signup successful. Please log in.');
        navigate('/signin'); // Redirect to login page after successful signup
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.msg || 'Signup failed.');
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
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6 text-center">Sign Up</h2>
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
                value={formData.userName}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="Age"
                className="block text-gray-700 font-medium mb-2"
              >
                Age
              </label>
              <input
                type="number"
                id="Age"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your age"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="Height"
                className="block text-gray-700 font-medium mb-2"
              >
                Height (in cm)
              </label>
              <input
                type="number"
                id="Height"
                name="Height"
                value={formData.Height}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your height"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="Weight"
                className="block text-gray-700 font-medium mb-2"
              >
                Weight (in kg)
              </label>
              <input
                type="number"
                id="Weight"
                name="Weight"
                value={formData.Weight}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your weight"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="gender"
                className="block text-gray-700 font-medium mb-2"
              >
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="ActivityLevel"
                className="block text-gray-700 font-medium mb-2"
              >
                Activity Level
              </label>
              <select
                name="ActivityLevel"
                value={formData.ActivityLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Activity Level</option>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Moderately Active">Moderately Active</option>
                <option value="Very Active">Very Active</option>
                <option value="Super Active">Super Active</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600">Already have an account? 
              <Link to="/signin" className="text-blue-500 hover:text-blue-600 ml-1">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
