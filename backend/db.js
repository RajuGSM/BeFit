const mongoose=require('mongoose')
const { string } = require('zod')
mongoose.connect("YOUR_URL")

const UserSchema=new mongoose.Schema({
    userName:String,
    password:String,
    Age:Number,
    Height:Number,
    Weight:Number,
    gender:String,
    ActivityLevel:String
})
const WorkoutSchema=new mongoose.Schema({
    userName:String,
    workoutName:String,
    caloriesBurned:Number,
    notes:String,
    Date:{type:Date,default:Date.now}

})
const MealSchema=new mongoose.Schema({
    userName:String,
    mealType:String,
    mealName:String,
    calories:Number,
    quantity:Number,
    logged_at:{type:Date,default:Date.now},
    totalCal:Number

})
const GoalSchema=new mongoose.Schema({
    userName:String,
    goal:String,
    caloriesToBeBurned:Number,
    caloriesToBeTaken:Number
})

const User=mongoose.model('User',UserSchema)
const Workouts=mongoose.model('Workouts',WorkoutSchema)
const Meal=mongoose.model('Meal',MealSchema)
const Goal=mongoose.model('Goal',GoalSchema)

module.exports={
    User,
    Workouts,
    Meal,
    Goal
}
