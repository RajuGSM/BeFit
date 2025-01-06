require('dotenv').config();
const jwt=require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET;

function LoginMiddleware(req,res,next){
    const jwtToken=req.headers.authorization
    try{
        const decodedValue=jwt.verify(jwtToken,jwtSecret)
        if(decodedValue.userName){
            next()
        }
    }
    catch(e){
        res.status(403).json({
            msg:"Not valid token",
            err:e
        })
    }
}
module.exports=LoginMiddleware