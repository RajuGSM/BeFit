
const express = require("express");
const authRoutes = require("./route");  
const chatbot=require("./chatbot")
const app = express();
const cors = require('cors');
const port = 3002;
app.use(express.json());
app.use(cors());
app.use(authRoutes); 
app.use(chatbot)
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
