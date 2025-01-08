import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import { LuMessageCircleMore } from "react-icons/lu";

const DietChatbot = ({ token }) => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [goalCalories, setGoalCalories] = useState(null);
  const [goalType, setGoalType] = useState(null); // Track goal type (gain/lose)
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    try {
      // Check if the prompt is about weight loss or gain
      if (
        chatInput.toLowerCase().includes("lose") ||
        chatInput.toLowerCase().includes("gain")
      ) {
        // Call the backend to calculate the calories needed for the goal
        const response = await axios.get("http://localhost:3002/calculate-calories", {
          headers: { Authorization: token },
          params: { prompt: chatInput },
        });

        const { message, calorieGoal, goal, button } = response.data;

        // Update the chat history with the response
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { sender: "user", message: chatInput },
          {
            sender: "bot",
            message,
            calorieGoal,
            goalType: goal,
            button, // Add button data from backend
          },
        ]);
      } else {
        // Handle other general questions
        const generalResponse = await axios.get("http://localhost:3002/chatbot", {
          headers: { Authorization: token },
          params: { prompt: chatInput },
        });

        const { message, meals } = generalResponse.data;

        const newChatHistory = [
          { sender: "user", message: chatInput },
          { sender: "bot", message },
        ];

        // Check and handle meals being either an array or a string
        if (Array.isArray(meals) && meals.length > 0) {
          newChatHistory.push({
            sender: "bot",
            message: "Here are some meal suggestions based on your query:",
            meals: meals,
          });
        } else if (typeof meals === "string" && meals.trim().length > 0) {
          newChatHistory.push({
            sender: "bot",
            message: "Here is the meal plan as received from the response:",
            meals: meals.split("\n").filter((line) => line.trim() !== ""),
          });
        }

        setChatHistory((prevHistory) => [...prevHistory, ...newChatHistory]);
      }

      setChatInput(""); // Clear the input field
    } catch (error) {
      console.error("Error fetching chatbot response:", error.response?.data || error.message);
    }
  };

  const handlePredefinedClick = (text) => {
    setChatInput(text); // Set input
    handleChatSubmit(); // Submit the input
  };

  const addCaloriesToGoal = async (calories, goalType) => {
    try {
      const caloriesToBeTaken = calories;
      const goal = goalType === "gain" ? "Gain Weight" : "Lose Weight";

      const response = await axios.post(
        "http://localhost:3002/chatbot/goal",
        { goal, caloriesToBeTaken },
        { headers: { Authorization: token } }
      );

      if (response.status === 200) {
        alert(`Successfully added goal: ${goal} with ${calories} calories.`);
        setGoalCalories(calories); // Optionally update goalCalories state
      } else {
        alert("Failed to add calories to goal table.");
      }
    } catch (error) {
      console.error("Error adding calories to goal:", error.message);
      alert("An error occurred while adding calories to your goal.");
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-transform"
        onClick={() => setChatVisible((prev) => !prev)}
      >
        <LuMessageCircleMore size={38} />
      </button>

      {/* Chatbot Window */}
      {chatVisible && (
        <div className="fixed bottom-16 right-4 bg-white p-4 rounded-lg shadow-lg w-96 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="bg-green-100 p-3 rounded-lg text-center text-green-800 font-bold text-lg mb-4">
            Fuel Your Body Right!
            <p className="text-sm text-gray-600">Ask me about nutrition, meal plans, or healthy tips.</p>
          </div>

          {/* Predefined Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 overflow-y-auto max-h-24">
            {[
              "How many calories to lose 1 kg per week",
              "How many calories to gain 1 kg per week",
              "What is my BMI",
              "Can you estimate my body fat %",
              "Give meal suggestions",
            ].map((text, index) => (
              <button
                key={index}
                className="flex-grow bg-green-200 text-green-700 py-2 px-3 rounded-lg hover:bg-green-300 text-sm shadow"
                onClick={() => handlePredefinedClick(text)}
              >
                {text}
              </button>
            ))}
          </div>

          {/* Chat History */}
          <div
            ref={chatHistoryRef}
            className="flex-grow overflow-y-auto max-h-64 mb-4 bg-gray-50 rounded-lg p-2"
          >
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg shadow-sm ${
                  chat.sender === "user" ? "bg-green-200 text-right" : "bg-green-100 text-left"
                }`}
              >
                {chat.message}

                {/* Display Button to Add Goal if Available */}
                {chat.sender === "bot" && chat.calorieGoal && chat.goalType && (
                  <div className="mt-2">
                    <p className="text-sm text-green-700">
                      To {chat.goalType}, your calorie goal is {chat.calorieGoal} kcal/day.
                    </p>
                    <button
                      className="mt-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                      onClick={() => addCaloriesToGoal(chat.calorieGoal, chat.goalType)}
                    >
                      Add Goal to My Plan
                    </button>
                  </div>
                )}

                {/* If the message contains meals */}
                {chat.sender === "bot" && Array.isArray(chat.meals) && chat.meals.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-green-700">Here are some meal suggestions:</p>
                    <ul className="text-sm text-green-700">
                      {chat.meals.map((meal, idx) => (
                        <li key={idx} className="mt-1">
                          <strong>{meal.mealType || "Meal"}:</strong> {meal.dishName || meal} ({meal.calories || ""} kcal)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div className="flex">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-grow p-2 border rounded-l focus:outline-blue-500"
            />
            <button
              onClick={handleChatSubmit}
              className="bg-green-600 text-white p-2 rounded-r hover:bg-blue-700"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DietChatbot;
