import React, { useState ,useEffect} from "react";
import axios from "axios";

const LogFood = () => {
  const [mealType, setMealType] = useState("");
  const [mealName, setMealName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mealType || !mealName || !quantity || !loggedAt) {
      setErrorMessage("All fields are required.");
      setSuccessMessage("");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setErrorMessage("You are not logged in.");
        setSuccessMessage("");
        return;
      }

      const response = await axios.post(
        "http://localhost:3002/logfood",
        {
          mealType,
          mealName,
          quantity,
          logged_at: loggedAt, // Send logged_at as the selected date
        },
        {
          headers: {
            Authorization: token, // Correct Authorization header
          },
        }
      );

      if (response.status === 200) {
        alert("Food logged successfully!"); 
        setSuccessMessage("Meal logged successfully!");
        setErrorMessage("");
        setMealType("");
        setMealName("");
        setQuantity("");
        setLoggedAt(new Date().toISOString().slice(0, 10)); // Reset to today's date
      }
    } catch (err) {
      console.error("Error logging food:", err.response?.data || err.message);
      setErrorMessage("An error occurred while logging the meal.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-6">Log Food</h1>

        {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
        {successMessage && <div className="text-green-500 text-center mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mealType" className="block text-lg font-semibold text-gray-700 mb-2">
              Meal Type
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Meal Type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          <div>
            <label htmlFor="mealName" className="block text-lg font-semibold text-gray-700 mb-2">
              Meal Name
            </label>
            <input
              type="text"
              id="mealName"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter meal name"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-lg font-semibold text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label htmlFor="loggedAt" className="block text-lg font-semibold text-gray-700 mb-2">
              Logged At
            </label>
            <input
              type="date"
              id="loggedAt"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogFood;
