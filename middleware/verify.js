let jwt=require("jsonwebtoken")
let secrete="mysecrete"

exports.verify=(req,res,next)=>
{
    // console.log(req.headers['authorization'])
   
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    // console.log(token);
    if(token===undefined)
    {
        res.status(403).json({error:"please provide token"})
    }
    else{
        
        // console.log(token)      
        jwt.verify(token,secrete,(err,value)=>{
            if(err){
                console.log(err)
            }
            if(value)
            {
            next()
            }
    })
    
}
}