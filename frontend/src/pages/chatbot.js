import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import { LuMessageCircleMore } from "react-icons/lu";

const Chatbot = ({ token }) => {
    const [chatVisible, setChatVisible] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    const handleChatSubmit = async () => {
        if (!chatInput.trim()) return;

        try {
            // Send the prompt as a URL parameter using params instead of query
            const response = await axios.get("http://localhost:3002/chatbot", {
                headers: { Authorization: token },
                params: { prompt: chatInput },  // send prompt as 'params' instead of 'query'
            });

            // Update chat history with the user's message and the chatbot's response
            setChatHistory((prevHistory) => [
                ...prevHistory,
                { sender: "user", message: chatInput },
                { sender: "bot", message: response.data.reply || "No response." },
            ]);

            setChatInput(""); // Clear input field after submission
        } catch (error) {
            console.error("Error fetching chatbot response:", error.response?.data || error.message);
        }
    };

    return (
        <>
            <button
                className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
                onClick={() => setChatVisible((prev) => !prev)}
            >
                <LuMessageCircleMore size={38} />
            </button>

            {chatVisible && (
                <div className="fixed bottom-16 right-4 bg-white p-4 rounded-lg shadow-lg w-80">
                    <div className="overflow-y-auto max-h-64">
                        {chatHistory.map((chat, index) => (
                            <div
                                key={index}
                                className={`mb-2 p-2 rounded ${
                                    chat.sender === "user" ? "bg-gray-200 text-right" : "bg-blue-100"
                                }`}
                            >
                                {chat.message}
                            </div>
                        ))}
                    </div>
                    <div className="flex mt-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask something..."
                            className="flex-grow p-2 border rounded-l"
                        />
                        <button
                            onClick={handleChatSubmit}
                            className="bg-blue-600 text-white p-2 rounded-r"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
