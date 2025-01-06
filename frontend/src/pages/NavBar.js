import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    height: 0,
    weight: 0,
    age: 0,
    caloriesToBeBurned: 0,
  });
  const [modifiedData, setModifiedData] = useState({ ...userData });

  useEffect(() => {
    // Fetch user data and goal data when the component mounts
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) return;

      try {
        const userResponse = await axios.get("http://localhost:3002/getUserData", {
          headers: { Authorization: token },
        });

        const goalResponse = await axios.get("http://localhost:3002/getUserGoal", {
          headers: { Authorization: token },
        });

        setUserData({
          username: userResponse.data.userName,
          height: userResponse.data.height,
          weight: userResponse.data.weight,
          age: userResponse.data.age,
          caloriesToBeBurned: goalResponse.data.caloriesToBeBurned,
        });

        setModifiedData({
          username: userResponse.data.userName,
          height: userResponse.data.height,
          weight: userResponse.data.weight,
          age: userResponse.data.age,
          caloriesToBeBurned: goalResponse.data.caloriesToBeBurned,
        });
      } catch (error) {
        console.error("Error fetching user data or goal data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handlePopupToggle = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModifiedData({
      ...modifiedData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) return;

    try {
      // Send PATCH request to update user data
      await axios.patch(
        "http://localhost:3002/updateUserData",
        modifiedData,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      alert("User data updated successfully!");
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data.");
    }
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo or App Name */}
        <h1 className="text-white text-2xl font-semibold">BeFit</h1>
        
        {/* Navigation Links */}
        <div className="space-x-6">
          <Link to="/dashboard" className="text-white hover:text-gray-200">
            Dashboard
          </Link>
          <Link to="/logfood" className="text-white hover:text-gray-200">
            Log Food
          </Link>
          <Link to="/logworkouts" className="text-white hover:text-gray-200">
            Log Workouts
          </Link>
          <Link
  to="/signin"
  className="text-white hover:text-gray-200"
  onClick={() => {
    localStorage.removeItem("authToken");
  }}
>
  Log Out
</Link>

        </div>

        {/* Profile Icon */}
        <FaUserCircle
          size={30}
          className="text-white cursor-pointer"
          onClick={handlePopupToggle}
        />
      </div>

      {/* Popup for user profile */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={modifiedData.username}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Height</label>
                <input
                  type="number"
                  name="height"
                  value={modifiedData.height}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight</label>
                <input
                  type="number"
                  name="weight"
                  value={modifiedData.weight}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={modifiedData.age}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Calories to be Burned</label>
                <input
                  type="number"
                  name="caloriesToBeBurned"
                  value={modifiedData.caloriesToBeBurned}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handlePopupToggle}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
