const { Router } = require("express");
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User, Goal } = require("./db");

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.gemini_api_key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to calculate BMR and TDEE
const calculateBMRandTDEE = (Age, Height, Weight, gender, ActivityLevel, weightChangePerWeek = 0) => {
    let bmr;
    if (gender.toLowerCase() === "male") {
        bmr = 10 * Weight + 6.25 * Height - 5 * Age + 5; // For men
    } else {
        bmr = 10 * Weight + 6.25 * Height - 5 * Age - 161; // For women
    }

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
            tdee = bmr * 1.2; // Default to sedentary if unknown activity level
            break;
    }

    // Adjust calories for weight gain or loss
    const calorieAdjustment = weightChangePerWeek * 7700 / 7; // Daily calorie adjustment
    const adjustedCalories = tdee + calorieAdjustment;

    return { bmr, tdee, adjustedCalories };
};
// In-memory object to hold the user's meal plan for the session (you could use a database in a production environment)
const userMealPlans = {};  // key: userName, value: meal plan
router.get("/calculate-calories",async(req,res)=>{
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

        // Fetch user details from the database
        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user has a goal in the Goal table
        let goal = await Goal.findOne({ userName });
    if (prompt.toLowerCase().includes("lose") || prompt.toLowerCase().includes("gain")) {
        const match = prompt.match(/(lose|gain)\s(\d+)\s(kg|pounds)/i);

        if (match) {
            const action = match[1]; // 'lose' or 'gain'
            const weightChangeAmount = parseInt(match[2]);

            // Use the calculateBMRandTDEE function
            const { tdee } = calculateBMRandTDEE(
                user.Age,
                user.Height,
                user.Weight,
                user.gender,
                user.ActivityLevel,
                0
            );

            let calorieGoal;
            if (action === "lose") {
                calorieGoal = tdee - (weightChangeAmount * 7700) / 7; // Subtract daily calories to lose weight
            } else {
                calorieGoal = tdee + (weightChangeAmount * 7700) / 7; // Add daily calories to gain weight
            }

            return res.status(200).json({
                message: `To ${action} ${weightChangeAmount} kg per week, you need ${calorieGoal.toFixed(
                    0
                )} kcal per day.`,
                calorieGoal: calorieGoal.toFixed(0),
                goal: action,
                button: "Click here to add this goal.",
            });
        }
    }
}
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong.", error });
    }
})
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

        // Fetch user details from the database
        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user has a goal in the Goal table
        let goal = await Goal.findOne({ userName });

        // Handle BMI calculation
        if (prompt.toLowerCase().includes("bmi")) {
            const heightInMeters = user.Height / 100;
            const bmi = (user.Weight / (heightInMeters * heightInMeters)).toFixed(2);

            return res.status(200).json({
                message: `Your BMI is ${bmi}.`,
                bmi: parseFloat(bmi),
                category: 
                    bmi < 18.5
                        ? "Underweight"
                        : bmi < 24.9
                        ? "Normal weight"
                        : bmi < 29.9
                        ? "Overweight"
                        : "Obesity",
            });
        }

        

        // Existing code for meal suggestions, modification, and general responses
        if (prompt.toLowerCase().includes("meal suggestions")) {
            if (!goal) {
                return res.status(200).json({
                    message:
                        "It seems you don't have a goal set. Do you want to lose or gain weight, and by how much?",
                    suggestions: ["Lose 1 kg per week", "Gain 2 kg per month"],
                });
            }

            const { caloriesToBeTaken, goal: weightGoal } = goal;

            const mealInput = `
Please generate a daily Indian meal plan for a calorie goal of ${caloriesToBeTaken} kcal. 
The plan should include:
- Breakfast, lunch, dinner, and two snacks.
- Specific dish names with approximate calorie counts.
- Focus on Indian dishes using ingredients like lentils, rice, chapati, vegetables, chicken, and fish.
- Assume the person is non-vegetarian and has no allergies.
- The meals should be tailored to the goal of ${weightGoal} weight (e.g., weight loss or gain).
Provide the output in a structured format as follows:
- Breakfast: Dish name (Calories)
- Snack: Dish name (Calories)
- Lunch: Dish name (Calories)
- Snack: Dish name (Calories)
- Dinner: Dish name (Calories)
`;

            const mealResponse = await model.generateContent(mealInput);
            let mealSuggestions = mealResponse.response.text();
            const meals = extractMeals(mealSuggestions);

            userMealPlans[userName] = meals;

            return res.status(200).json({
                message: "Here are your meal suggestions based on your goal.",
                meals,
                calorieGoal: `${caloriesToBeTaken} kcal per day`,
            });
        }

        if (prompt.toLowerCase().includes("modify") && userMealPlans[userName]) {
            if (!goal) {
                return res.status(400).json({ message: "No goal found. Please set a goal first." });
            }

            const { caloriesToBeTaken } = goal;
            const currentMealPlan = userMealPlans[userName];

            const modifiedMealInput = `
I have the following meal plan:
${
    Array.isArray(currentMealPlan)
        ? currentMealPlan.map(
              (meal) => `${meal.mealType}: ${meal.dishName} (${meal.calories} kcal)`
          ).join("\n")
        : "No valid meal plan available"
}

The user wants to modify the meal plan. Here's the modification request:
${prompt}

Please adjust the meal plan accordingly and return the modified version.
`;

            const mealResponse = await model.generateContent(modifiedMealInput);
            const modifiedMealPlan = mealResponse.response.text();
            userMealPlans[userName] = modifiedMealPlan;

            return res.status(200).json({
                message: "Here is your modified meal plan.",
                meals: modifiedMealPlan,
                calorieGoal: `${caloriesToBeTaken} kcal per day`,
            });
        }

        const generalResponse = await model.generateContent(prompt);
        return res.status(200).json({ message: generalResponse.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong.", error });
    }
});

// Extract meal names and calories from the meal suggestions text
const extractMeals = (mealSuggestions) => {
    const meals = [];
    const lines = mealSuggestions.split("\n");

    lines.forEach((line) => {
        const match = line.match(/-\s\*\*(.+?):\*\*\s(.+?)\((\d+)\skcal\)/);
        if (match) {
            const mealType = match[1]; // e.g., Breakfast, Snack, Lunch
            const dishName = match[2].trim(); // e.g., Moong Dal Cheela
            const calories = match[3]; // e.g., 250
            meals.push({ mealType, dishName, calories });
        }
    });

    return meals;
};


// POST /chatbot/goal
router.post("/chatbot/goal", async (req, res) => {
    const jwtToken = req.headers.authorization;

    if (!jwtToken) {
        return res.status(403).json({ message: "Token is missing" });
    }

    try {
        const decodedToken = jwt.decode(jwtToken);

        if (!decodedToken || !decodedToken.userName) {
            return res.status(403).json({ message: "Invalid token or user not found in token" });
        }

        const userName = decodedToken.userName;
        const { goal, caloriesToBeTaken } = req.body;

        if (!goal || !caloriesToBeTaken) {
            return res.status(400).json({ message: "Goal and caloriesToBeTaken are required." });
        }

        // Add or update goal in the database
        let goalRecord = await Goal.findOne({ userName });

        if (!goalRecord) {
            goalRecord = new Goal({ userName, goal, caloriesToBeTaken });
            await goalRecord.save();
        } else {
            goalRecord.goal = goal;
            goalRecord.caloriesToBeTaken = caloriesToBeTaken;
            await goalRecord.save();
        }

        res.status(200).json({
            message: "Goal added/updated successfully.",
            goal,
            caloriesToBeTaken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong.", error });
    }
});

module.exports = router;
