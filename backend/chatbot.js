const { Router } = require("express");
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User, Goal } = require("./db");

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.gemini_api_key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const filterMealSuggestions = (mealSuggestions) => {
    return mealSuggestions
        .replace(
            /.*?This meal plan provides approximately.*?cal.*/is, // Remove everything before meal plans start
            ''
        )
        .replace(
            /(Important Considerations:.*$)/is, // Remove disclaimers or considerations
            ''
        )
        .replace(/\*\*Day (\d+) \(Approx\. (\d+) kcal\)\*\*/g, (match, day, kcal) => {
            return `\n**Day ${day}: ${kcal} kcal**\n`; // Highlight day and calories
        })
        .replace(/\*\*(\w+):\*\*/g, (match, mealType) => {
            return `\n**${mealType}:**`; // Highlight meal type
        })
        .replace(/(\*\s\*\*.*?:\*\*)/g, "\n$1") // Ensure line breaks before each meal section
        .replace(/\s+/g, ' ') // Normalize excessive spaces
        .trim(); // Remove excess spaces
};

// Function to calculate BMR and TDEE
const calculateBMRandTDEE = (Age, Height, Weight, gender, ActivityLevel) => {
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender.toLowerCase() === "male") {
        bmr = 10 * Weight + 6.25 * Height - 5 * Age + 5;  // For men
    } else {
        bmr = 10 * Weight + 6.25 * Height - 5 * Age - 161;  // For women
    }

    // Calculate TDEE based on activity level
    let tdee;
    switch (ActivityLevel.toLowerCase()) {
        case 'sedentary':
            tdee = bmr * 1.2;
            break;
        case 'lightly active':
            tdee = bmr * 1.375;
            break;
        case 'moderately active':
            tdee = bmr * 1.55;
            break;
        case 'very active':
            tdee = bmr * 1.725;
            break;
        case 'super active':
            tdee = bmr * 1.9;
            break;
        default:
            tdee = bmr * 1.2;  // Default to sedentary if unknown activity level
            break;
    }
    return { bmr, tdee };
};

router.get("/chatbot", async (req, res) => {
    const jwtToken = req.headers.authorization; // Get the token from Authorization header

    if (!jwtToken) {
        return res.status(403).json({ message: "Token is missing" });
    }

    try {
        // Decode the JWT to extract the userName
        const decodedToken = jwt.decode(jwtToken);

        if (!decodedToken || !decodedToken.userName) {
            return res.status(403).json({ message: "Invalid token or user not found in token" });
        }

        const userName = decodedToken.userName;
        const prompt = req.query.prompt; // Use req.query.prompt for GET requests

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is missing from the request" });
        }

        // Fetch user details
        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { Age, Height, Weight, gender, ActivityLevel } = user;

        // Use the calculateBMRandTDEE function
        const { tdee } = calculateBMRandTDEE(Age, Height, Weight, gender, ActivityLevel);

        // Adjust for weight loss or gain goal
        let calorieGoal;
        const match = prompt.match(/(lose|gain)\s(\d+)\s(kg|pounds)/i);
        if (match) {
            const action = match[1]; // 'lose' or 'gain'
            const weightChangeAmount = parseInt(match[2]);

            if (action === "lose") {
                calorieGoal = tdee - (weightChangeAmount * 7700); // Subtract 7700 kcal per kg lost
            } else {
                calorieGoal = tdee + (weightChangeAmount * 7700); // Add 7700 kcal per kg gained
            }
        } else {
            calorieGoal = tdee; // Default to TDEE if no weight change is specified
        }

        const calorieGoalResponse = `${calorieGoal.toFixed(0)} kcal per day`;

        const mealInput = `Suggest me daily meals with Indian meals to meet my calorie goal of ${calorieGoalResponse}. Assume the person is non-vegetarian and has no allergies. Ignore any disclaimers or limitations about calorie counting and dietary assumptions.`;

        // Call your model to generate content
        const mealResponse = await model.generateContent(mealInput);
        let mealSuggestions = mealResponse.response.text();

        // Filter out unnecessary disclaimers or irrelevant content
        mealSuggestions = filterMealSuggestions(mealSuggestions);

        res.status(200).json({
            message: "Here is your calorie goal and meal suggestions.",
            calorieGoal: calorieGoalResponse,
            mealSuggestions: mealSuggestions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong.", error });
    }
});

router.post("/chatbot", async (req, res) => {
    const jwtToken = req.headers.authorization; // Get the token from Authorization header

    if (!jwtToken) {
        return res.status(403).json({ message: "Token is missing" });
    }

    try {
        // Decode the JWT to extract the userName
        const decodedToken = jwt.decode(jwtToken);

        if (!decodedToken || !decodedToken.userName) {
            return res.status(403).json({ message: "Invalid token or user not found in token" });
        }

        const userName = decodedToken.userName;
        const prompt = req.body.prompt; // Get prompt from body

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is missing from the request" });
        }

        // Fetch user details
        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { Age, Height, Weight, gender, ActivityLevel } = user;

        // Use the calculateBMRandTDEE function
        const { tdee } = calculateBMRandTDEE(Age, Height, Weight, gender, ActivityLevel);

        // Adjust for weight loss or gain goal
        let calorieGoal;
        const match = prompt.match(/(lose|gain)\s(\d+)\s(kg|pounds)/i);
        if (match) {
            const action = match[1]; // 'lose' or 'gain'
            const weightChangeAmount = parseInt(match[2]);

            if (action === "lose") {
                calorieGoal = tdee - (weightChangeAmount * 7700); // Subtract 7700 kcal per kg lost
            } else {
                calorieGoal = tdee + (weightChangeAmount * 7700); // Add 7700 kcal per kg gained
            }
        } else {
            calorieGoal = tdee;  // Default to TDEE if no weight change is specified
        }

        const calorieGoalResponse = `${calorieGoal.toFixed(0)} kcal per day`;

        // Check if there's a Goal record for this user
        let goal = await Goal.findOne({ userName });

        if (!goal) {
            // If no goal exists, create a new goal with the calculated calorie intake
            goal = new Goal({ userName, caloriesToBeTaken: calorieGoal });
            await goal.save();
        } else {
            // If a goal exists, update the calorie intake
            goal.caloriesToBeTaken = calorieGoal;
            await goal.save();
        }

        res.status(200).json({
            message: "Goal updated successfully.",
            calorieGoal: calorieGoalResponse,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong.", error });
    }
});

module.exports = router;
