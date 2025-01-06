import React, { useState, useEffect } from "react";
import axios from "axios";
import Chatbot from "./chatbot";  // Import the Chatbot component

const Dashboard = () => {
    const token = localStorage.getItem("authToken");
    const [goal, setGoal] = useState(null);
    const [meals, setMeals] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    // Fetch goal data
    useEffect(() => {
        const fetchGoal = async () => {
            try {
                const response = await axios.get("http://localhost:3002/getgoal", {
                    headers: { Authorization: token },
                });
                if (response.data) {
                    setGoal(response.data);
                }
            } catch (error) {
                console.error("Error fetching goal:", error.response?.data || error.message);
            }
        };

        fetchGoal();
    }, [token]);

    // Fetch meals data
    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const response = await axios.get("http://localhost:3002/getfood", {
                    headers: { Authorization: token },
                    params: { date },
                });
                if (response.data.meals) {
                    setMeals(response.data.meals);
                    const totalCalories = response.data.meals.reduce(
                        (acc, meal) => acc + (meal.totalCal || 0),
                        0
                    );
                    setGoal((prevGoal) => ({
                        ...prevGoal,
                        caloriesEaten: totalCalories,
                    }));
                } else {
                    setMeals([]);
                    setGoal((prevGoal) => ({
                        ...prevGoal,
                        caloriesEaten: 0,
                    }));
                }
            } catch (error) {
                console.error("Error fetching meals:", error.response?.data || error.message);
            }
        };

        if (date) fetchMeals();
    }, [token, date]);

    // Fetch workouts data
    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const response = await axios.get("http://localhost:3002/getworkouts", {
                    headers: { Authorization: token },
                    params: { date },
                });
                if (response.data.workouts) {
                    setWorkouts(response.data.workouts);
                    const totalBurned = response.data.workouts.reduce(
                        (acc, workout) => acc + (workout.caloriesBurned || 0),
                        0
                    );
                    setGoal((prevGoal) => ({
                        ...prevGoal,
                        caloriesBurned: totalBurned,
                    }));
                } else {
                    setWorkouts([]);
                }
            } catch (error) {
                console.error("Error fetching workouts:", error.response?.data || error.message);
            }
        };

        if (date) fetchWorkouts();
    }, [token, date]);

    const calculateProgress = (value, goal) => {
        return Math.min(Math.floor((value / (goal || 1)) * 100), 100);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    return (
        <div className="relative">
            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Calories Eaten Goal */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">🍴 Goal: Calories Eaten</h3>
                    {goal ? (
                        <>
                            <div className="w-full bg-gray-200 h-4 mb-4 rounded-full">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{
                                        width: `${calculateProgress(
                                            goal.caloriesEaten || 0,
                                            goal.caloriesToBeTaken || 1
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                            <p className="text-center text-lg">
                                {goal.caloriesEaten || 0} / {goal.caloriesToBeTaken || 0} kcal{" "}
                                ({calculateProgress(
                                    goal.caloriesEaten || 0,
                                    goal.caloriesToBeTaken || 1
                                )}%)
                            </p>
                        </>
                    ) : (
                        <p>Loading Goal...</p>
                    )}
                </div>

                {/* Calories Burned Goal */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">🔥 Goal: Calories Burned</h3>
                    {goal ? (
                        <>
                            <div className="w-full bg-gray-200 h-4 mb-4 rounded-full">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{
                                        width: `${calculateProgress(
                                            goal.caloriesBurned || 0,
                                            goal.caloriesToBeBurned || 1
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                            <p className="text-center text-lg">
                                {goal.caloriesBurned || 0} / {goal.caloriesToBeBurned || 0} kcal{" "}
                                ({calculateProgress(
                                    goal.caloriesBurned || 0,
                                    goal.caloriesToBeBurned || 1
                                )}%)
                            </p>
                        </>
                    ) : (
                        <p>Loading Goal...</p>
                    )}
                </div>

                {/* Meals and Workouts */}
                <div className="bg-white p-6 rounded-lg shadow-md col-span-1 sm:col-span-2 lg:col-span-3">
                    <h3 className="text-xl font-semibold mb-4">Logs for {date}</h3>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        className="mb-4 p-2 border rounded"
                    />

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-1/2">
                            <h4 className="text-lg font-medium mb-2">🥗 Meals</h4>
                            {meals.length > 0 ? (
                                meals.map((meal, index) => (
                                    <div key={index} className="border-b pb-2 mb-2">
                                        <p>
                                            {meal.mealType}: {meal.mealName} -{" "}
                                            <strong>{meal.totalCal} kcal</strong>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No meals logged for this date.</p>
                            )}
                        </div>

                        <div className="w-full lg:w-1/2">
                            <h4 className="text-lg font-medium mb-2">🏋️ Workouts</h4>
                            {workouts.length > 0 ? (
                                workouts.map((workout, index) => (
                                    <div key={index} className="border-b pb-2 mb-2">
                                        <p>
                                            {workout.workoutName} -{" "}
                                            <strong>{workout.caloriesBurned} kcal</strong>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No workouts logged for this date.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Chatbot at the bottom */}
            <Chatbot token={token} />
        </div>
    );
};

export default Dashboard;
