let express = require("express");
let cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
let jwt=require("jsonwebtoken")
let secrete="mysecrete";
const token = require('./middleware/verify');
mongoose.connect("mongodb+srv://ruby07:8074662205s@cluster0.97u8x.mongodb.net/hostelDb",{useNewUrlParser:true});
const schedule = require('node-schedule');

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

var bf=0;
var lunch=0;
var dinner=0;


const tempSchema = {
        username:String,
        password:String,
        mobile:Number,
        roomNo:Number,
        submit:Boolean
}; 

const todaySchema = {
    today : String,
    bfm : Number,
    luncha : Number,
    dinnern : Number
}



const Temp = mongoose.model("Temp",tempSchema);
const User = mongoose.model("User",tempSchema);
 const Today = mongoose.model("today",todaySchema);


function generatetoken(user){
    return jwt.sign({data:user},secrete,{expiresIn:'24h'})
}


const reset = schedule.scheduleJob('* * * * *',()=>{
    const t = new Date();
    const tdate = t.getDate()+'-'+(t.getMonth()+1)+'-'+t.getFullYear();
    // console.log(tdate);
    // const today1 = new Today({
    //     date : tdate,
    //     bfm : bf,
    //     luncha : lunch,
    //     dinnern : dinner
    // });
    // today1.save().then(res=>{
    //     console.log(res);
    // }).catch(err=>{
    //     alert("Check form");
    // });

});



app.get("/",(req,res)=>{
    res.send("Server Set");
});

app.get("/admin/get",(req,res)=>{
    Temp.find({}).then(result=>{
        res.json({users: result,message : "ok"});
    });
});

app.get("/main",(req,res)=>{
    // console.log(req.headers);
    res.json({message :"Token sent"});
})
app.post("/check",(req,res)=>{
    User.findOne({username : req.body.usname},{}).then(result=>{
        // console.log(result.submit);
        res.json({submitted : result.submit});
    }).catch(err=>{
        console.log(err);
    });
})
app.post("/checkUpdate",(req,res)=>{
    // console.log(req);
    const updateDoc = {
        $set: {
          submit: true
        },
      };
    User.findOne({username : req.body.usname},{}).then(result=>{
        // console.log(result.submit);
        User.findOneAndUpdate({username : req.body.usname},updateDoc).then(resl=>{
            // console.log(resl);
            res.json({submitted : resl.submit});
        });
    }).catch(err=>{
        console.log(err);
    });
});


app.post("/admin/add",(req,res)=>{
        console.log(req.body);
        const user1 = new User({
            username : req.body.username,
            password : req.body.password,
            mobile : req.body.mobile,
            roomNo : req.body.roomNo,
            submit : false
        });

        Temp.findOneAndDelete({mobile:req.body.mobile},{}).then((result,err)=>{
            if(err){
                console.log(err);
            }
            else if(result===null){
                console.log("access denied");
            }
            else{
                user1.save();
                console.log(result)
            }
        });
        res.json({message : "posted"});

})

// app.post("/admin/change",(req,res)=>{
//     // Temp.find({}).then(result=>{res.json(result)}).catch(error=>{console.log(error)});
//     Temp.updateOne({mobile:8074}).then(result=>{
        
       
//     }).catch(error=>{console.log(error)});
// })


app.post("/user/signup",(req,res)=>{
    var salt=bcrypt.genSaltSync(10);
    var password=bcrypt.hashSync(req.body.password,salt);
    const temp1= new Temp({
        username:req.body.username,
        password:password,
        mobile:req.body.mobile,
        roomNo:req.body.rno,
    })
    temp1.save().then(user=>res.status(200).json({message : "User successfully created"}));
});



app.post("/user/signin",(req,res)=>{
    const password = req.body.password;
    const uname = req.body.username;
    User.findOne({username:uname},{}).then(result=>{
        bcrypt.compare(password,result.password,function(err,data){
        if(err)
        {
            console.log(err)
        }
        if(data)
        {
            // console.log(data)

            const tk = generatetoken(result);
            // console.log(tk);
            res.status(200).json({token: tk, username:result.username,mobile : result.mobile, message : "login successful"});
        }

        else
        {

            console.log(data);
            res.status(400).json({message : "login unsuccessful"});
        }
    });
                   
    }).catch(error=>console.log(error));
});

app.post("/user/submit",(req,res)=>{
    console.log(req.body);
    if(req.body.bf==="1"){
        bf++;
    }
    if(req.body.lunch==="1"){
        lunch++;
    }
    if(req.body.dinner==="1"){
        dinner++;
    }

    console.log(bf,lunch,dinner);
    res.json({message : "updated", bfm : bf, lna : lunch, dn : dinner});

});

app.get("/count",(req,res)=>{
    res.json({
        breakfast : bf,
        lunch : lunch,
        dinner : dinner
    });
});



app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
  });
