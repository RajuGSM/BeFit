import React, { useState } from "react";
import axios from "axios";

const Workouts = () => {
  const [workoutName, setWorkout] = useState("");
  const [caloriesBurned, setCalories] = useState(0);
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [date,setDate]=useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    if (!token) {
      setErrorMessage("You are not logged in.");
      return;
    }

    // const today = new Date();

    try {
      await axios.post(
        "https://befit-backend-pll5.onrender.com/logWorkout", // Replace with your actual endpoint
        {
          workoutName,
          caloriesBurned,
          notes,
          Date: Date,
        },
        {
          headers: {
            Authorization: token, // No "Bearer" prefix
          },
        }
      );

      alert("Workout logged successfully!");
      setSuccessMessage("Workout logged successfully!");
      setWorkout("");
      setCalories(0);
      setNotes("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error logging workout:", error);
      setSuccessMessage("");
      setErrorMessage("Failed to log workout.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6">Log Your Workout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="workoutName" className="block text-sm font-medium text-gray-700">
              Workout Name
            </label>
            <input
              id="workoutName"
              type="text"
              value={workoutName}
              onChange={(e) => setWorkout(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workout name"
              required
            />
          </div>
          <div>
            <label htmlFor="caloriesBurned" className="block text-sm font-medium text-gray-700">
              Calories Burned
            </label>
            <input
              id="caloriesBurned"
              type="number"
              value={caloriesBurned}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter calories burned"
              required
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any notes"
            ></textarea>
          </div>
          <div>
            <label htmlFor="Date" className="block text-lg font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="loggedAt"
              value={Date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Log Workout
          </button>
        </form>
        {successMessage && <div className="text-green-500 text-center mt-4">{successMessage}</div>}
        {errorMessage && <div className="text-red-500 text-center mt-4">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default Workouts;
