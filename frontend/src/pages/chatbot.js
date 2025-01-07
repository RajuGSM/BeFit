import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import { LuMessageCircleMore } from "react-icons/lu";

const DietChatbot = ({ token }) => {
    const [chatVisible, setChatVisible] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [goalCalories, setGoalCalories] = useState(null);
    const chatHistoryRef = useRef(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleChatSubmit = async () => {
        if (!chatInput.trim()) return;

        try {
            // Call the backend
            const response = await axios.get("http://localhost:3002/chatbot", {
                headers: { Authorization: token },
                params: { prompt: chatInput },
            });

            const { caloriesToEat, response: botResponse, userDetails, goalType } = response.data;

            const formattedResponse = caloriesToEat
                ? `${botResponse}\n\n**Calories to Eat Daily:** ${caloriesToEat} kcal\n\n**Your Details:**\n- Age: ${userDetails.Age}\n- Height: ${userDetails.Height} cm\n- Weight: ${userDetails.Weight} kg\n- Activity Level: ${userDetails.ActivityLevel}`
                : botResponse;

            setChatHistory((prevHistory) => [
                ...prevHistory,
                { sender: "user", message: chatInput },
                { sender: "bot", message: formattedResponse, caloriesToEat, goalType },
            ]);

            setChatInput(""); // Clear input field
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
            // Determine calories to be burned based on goal type
            const caloriesToBeBurned = goalType === "gain" ? 0 : calories;  // Assuming burn for "lose" and 0 for "gain"
            const caloriesToBeTaken = goalType === "gain" ? calories : 0;  // Assuming taken for "gain" and 0 for "lose"
            const goal = goalType === "gain" ? "Gain Weight" : "Lose Weight";

            // Send the goal and calories to the backend to save to the goal table
            const response = await axios.post(
                "http://localhost:3002/chatbot/goal", 
                { calorieGoal: calories, goalType, caloriesToBeBurned, caloriesToBeTaken, goal }, 
                { headers: { Authorization: token } }
            );

            if (response.status === 200) {
                alert(`Successfully added goal: ${goal} with ${calories} calories.`);
                setGoalCalories(calories);  // Optionally update goalCalories state
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
                className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-transform"
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
                            "How many calories a day to lose 1kg per week",
                            "How many calories to gain 1 kg per week",
                            "What is my BMI",
                            "Can you estimate my body fat%",
                            "How many calories a day to lose",
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
                        ref={chatHistoryRef} // Reference for scrolling
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
                                {chat.sender === "bot" && chat.caloriesToEat && (
                                    <button
                                        className="mt-2 bg-green-600 text-white py-1 px-3 rounded-lg text-sm hover:bg-green-700"
                                        onClick={() => addCaloriesToGoal(chat.caloriesToEat, chat.goalType)}
                                    >
                                        Add {chat.caloriesToEat} kcal to Goal Table
                                    </button>
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
