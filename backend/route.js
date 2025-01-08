const { Router } = require("express");
const LoginMiddleware = require("./middleware");
const { User, Workouts, Meal, Goal } = require("./db");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const router = Router();
const axios = require("axios");
const jwtSecret = process.env.JWT_SECRET;
const APP_ID = process.env.APP_ID;
const API_KEY = process.env.APP_KEY;
const { startOfDay, endOfDay } = require('date-fns');

// Helper: Fetch user from JWT
const fetchUserFromToken = async (token) => {
    try {
        const { userName } = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ userName });
        return user;
    } catch (error) {
        throw new Error("Invalid or expired token.");
    }
};

// Routes
router.post("/signup", async (req, res) => {
    const { userName, password, Age, Height, Weight, ActivityLevel, gender } = req.body;

    if (!userName || !password || !Age || !Height || !Weight || !ActivityLevel || !gender) {
        return res.status(400).json({ msg: "All fields are required." });
    }

    try {
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(409).json({ msg: "User already exists." });
        }

        await User.create({
            userName,
            password,
            Age,
            Height,
            Weight,
            ActivityLevel,
            gender,
        });

        res.status(200).json({ msg: "User created successfully." });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ msg: "Error creating user." });
    }
});

router.post("/signin", async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(400).json({ msg: "Username and password are required." });
    }

    try {
        const user = await User.findOne({ userName, password });
        if (!user) {
            return res.status(404).json({ msg: "Invalid credentials." });
        }

        const token = jwt.sign({ userName }, jwtSecret);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ msg: "Error signing in." });
    }
});

router.use(LoginMiddleware);

router.post("/logworkout", async (req, res) => {
    try {
        const user = await fetchUserFromToken(req.headers.authorization);
        const { workoutName, caloriesBurned, notes } = req.body;

        if (!workoutName || !caloriesBurned) {
            return res.status(400).json({ msg: "Workout name and calories burned are required." });
        }

        await Workouts.create({
            userName: user.userName,
            workoutName,
            caloriesBurned,
            notes,
            date: new Date(),
        });

        res.status(201).json({ msg: "Workout logged successfully." });
    } catch (error) {
        console.error("Error logging workout:", error);
        res.status(500).json({ msg: "Error logging workout." });
    }
});

router.get("/logworkout", async (req, res) => {
    try {
        const user = await fetchUserFromToken(req.headers.authorization);
        const workouts = await Workouts.find({ userName: user.userName });
        res.status(200).json({ workouts });
    } catch (error) {
        console.error("Error fetching workouts:", error);
        res.status(500).json({ msg: "Error fetching workouts." });
    }
});

router.post("/logfood", async (req, res) => {
    try {
        const user = await fetchUserFromToken(req.headers.authorization);
        const { mealType, mealName, quantity } = req.body;

        if (!mealType || !mealName || !quantity) {
            return res.status(400).json({ msg: "Meal type, name, and quantity are required." });
        }

        const nutritionixResponse = await axios.post(
            'https://trackapi.nutritionix.com/v2/natural/nutrients',
            { query: mealName },
            {
                headers: {
                    "x-app-id": APP_ID,
                    "x-app-key": API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        const calories = Math.round(nutritionixResponse.data.foods[0]?.nf_calories || 0,1);

        await Meal.create({
            userName: user.userName,
            mealType,
            mealName,
            calories,
            logged_at: new Date(),
            quantity,
            totalCal: calories * quantity,
        });

        res.status(200).json({ msg: "Meal logged successfully." });
    } catch (error) {
        console.error("Error logging food:", error);
        res.status(500).json({ msg: "Error logging food." });
    }
});
router.get("/getworkouts", async (req, res) => {
    try {
        const user = jwt.decode(req.headers.authorization).userName;
        const { date } = req.query; // Retrieve date from query parameters

        if (!date) {
            return res.status(400).json({ msg: "Date is required as a query parameter." });
        }

        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0); // Set to the beginning of the day (UTC)

        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day (UTC)

        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);

        const workouts = await Workouts.find({
            userName: user,
            Date: { $gte: startDate, $lte: endDate }, // Use the correct `Date` field name
        });

        console.log("Query Result:", workouts);

        if (workouts.length > 0) {
            const result = workouts.map(workout => ({
                workoutName: workout.workoutName,
                caloriesBurned: workout.caloriesBurned,
                notes: workout.notes,
            }));
            res.status(200).json({ workouts: result });
        } else {
            res.status(200).json({ msg: "No workouts on this day" });
        }
    } catch (err) {
        console.error("Error fetching workouts:", err);
        res.status(500).json({ msg: "Error fetching workouts." });
    }
});


router.get("/getfood", async (req, res) => {
    try {
        const user = jwt.decode(req.headers.authorization).userName;
        const { date } = req.query; // Retrieve date from query parameters

        if (!date) {
            return res.status(400).json({ msg: "Date is required as a query parameter." });
        }

        const startDate = new Date(`${date}T00:00:00Z`);
        const endDate = new Date(`${date}T23:59:59Z`);

        // console.log("Start Date:", startDate);
        // console.log("End Date:", endDate);

        const meals = await Meal.find({
            userName: user,
            logged_at: { $gte: startDate, $lte: endDate },
        });

        // console.log("Query Result:", meals);

        if (meals.length > 0) {
            const result = meals.map(meal => ({
                mealType: meal.mealType,
                mealName: meal.mealName,
                calories: meal.calories,
                quantity: meal.quantity,
                totalCal: meal.totalCal,
            }));
            res.status(200).json({ meals: result });
        } else {
            res.status(200).json({ msg: "No meals logged on this day" });
        }
    } catch (err) {
        console.error("Error fetching meals:", err);
        res.status(500).json({ msg: "Error fetching meals." });
    }
});


router.get("/getgoal", async (req, res) => {
    const user = jwt.decode(req.headers.authorization).userName;
    try {
        const data = await Goal.findOne({ userName: user });
        res.status(200).json(data);
    } catch (err) {
        res.status(404).json({ msg: "Error fetching goal data." });
    }
});

// Existing routes and middleware...

// 1. Get User Data
router.get("/getUserData", async (req, res) => {
    try {
        const user = await fetchUserFromToken(req.headers.authorization);
        const goal = await Goal.findOne({ userName: user.userName });
        const userData = {
            userName: user.userName,
            height: user.Height,
            weight: user.Weight,
            age: user.Age,
            // caloriesToBeBurned: goal.caloriesToBeBurned
            
        };
        res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ msg: "Error fetching user data." });
    }
});

// 2. Get User Goal Data
router.get("/getUserGoal", async (req, res) => {
    try {
        const user = await fetchUserFromToken(req.headers.authorization);
        const goal = await Goal.findOne({ userName: user.userName });

        if (!goal) {
            return res.status(404).json({ msg: "Goal data not found." });
        }

        res.status(200).json({ caloriesToBeBurned: goal.caloriesToBeBurned });
    } catch (error) {
        console.error("Error fetching user goal data:", error);
        res.status(500).json({ msg: "Error fetching user goal data." });
    }
});

// 3. Update User Data
router.patch("/updateUserData", async (req, res) => {
    const { username, height, weight, age, caloriesToBeBurned } = req.body;

    if (!username || !height || !weight || !age) {
        return res.status(400).json({ msg: "Username, height, weight, and age are required." });
    }

    try {
        const user = await fetchUserFromToken(req.headers.authorization);

        // Update user data
        user.userName = username;
        user.Height = height;
        user.Weight = weight;
        user.Age = age;
        await user.save();

        // Update goal data if caloriesToBeBurned is provided
        if (caloriesToBeBurned !== undefined) {
            let goal = await Goal.findOne({ userName: user.userName });
            if (!goal) {
                goal = new Goal({ userName: user.userName, caloriesToBeBurned });
            } else {
                goal.caloriesToBeBurned = caloriesToBeBurned;
            }
            await goal.save();
        }

        res.status(200).json({ msg: "User data updated successfully." });
    } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).json({ msg: "Error updating user data." });
    }
});

module.exports = router;
