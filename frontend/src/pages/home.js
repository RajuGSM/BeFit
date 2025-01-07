import React from 'react';
import pic from "../assets/home.jpg"; // Example hero image

function Home() {
  return (
    <>
      {/* Main Wrapper */}
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to BeFit</h1>
            <p className="text-lg text-gray-600 mb-6">
              Take control of your health journey. Track your activities, monitor your habits, and achieve your fitness goals with ease.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/signin"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg shadow hover:bg-gray-300 transition"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
          {/* Hero Slice */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img src={pic} alt="Track Progress" className="w-full md:w-1/2 rounded-lg shadow-lg" />
            <div>
              <h2 className="text-3xl font-bold mb-4">Effortless Meal Logging</h2>
              <p className="text-gray-600">
                Access a comprehensive database of products to view calories, nutrients, and portion sizes. Understand how each choice contributes to your progress.
              </p>
            </div>
          </div>

          {/* Search Slice */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Tools to Match Your Objectives</h2>
              <p className="text-gray-600">
                Whether you're aiming to lose weight, improve endurance, or maintain a balanced lifestyle, our tools are designed to support your unique needs.
              </p>
            </div>
            <img src={pic} alt="Tools for Goals" className="w-full md:w-1/2 rounded-lg shadow-lg" />
          </div>

          {/* Journal Slice */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img src={pic} alt="Meal Diary" className="w-full md:w-1/2 rounded-lg shadow-lg" />
            <div>
              <h2 className="text-3xl font-bold mb-4">Track Your Journey</h2>
              <p className="text-gray-600">
                Keep a personalized log of your meals and activities. Gain insights into your habits and stay motivated toward achieving your wellness goals.
              </p>
            </div>
          </div>

          {/* Personal Diet Bot Section */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Your Personal Diet Companion</h2>
              <p className="text-gray-600">
                Meet your AI-powered diet bot. Get personalized meal suggestions, nutrition tips, and diet plans tailored to your preferences and goals. It's like having a dietitian in your pocket!
              </p>
              <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition">
                Learn More
              </button>
            </div>
            <img src={pic} alt="Diet Bot" className="w-full md:w-1/2 rounded-lg shadow-lg" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
