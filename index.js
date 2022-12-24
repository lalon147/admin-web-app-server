const express = require('express');
const cors=require("cors");
const jwt=require("jsonwebtoken")







const app=express();
app.use(cors());
app.use(express.json());

const port =process.env.PORT || 5000;


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); //here in the uri we will use dotenv package to hide the information about the database 
const uri = "mongodb+srv://tirtha:tirtha@cluster0.gw8hef2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const usersCollection=client.db("med-tech").collection("users");
const cartCollection=client.db("med-tech").collection("cart");
const productsCollection=client.db("med-tech").collection("products")





const verifyJwt=(req,res,next)=>{
    // console.log(req.body)
    const authHeader=req.headers.authorization;
    // console.log(authHeader);
    if(!authHeader){
        return res.status(401).send({message:"UNAUTHORIZED USER"})
    }
    const token=authHeader.split(" ")[1];
    // console.log(token)
    //verify ing the token
    jwt.verify(token,"jkrowling521",function(err,decoded){
        if(err){
            return res.status(401).send({message:"UNAUTHORIZED ACCESS"})
        }
        req.decoded=decoded;
        next()
    })
}









app.get("/",(req,res)=>{
    res.send("THE server is Running ")
})

app.get("/jwt",(req,res)=>{
    const phone=req.query.phone;
    if(phone){
        const token =jwt.sign({phone},"jkrowling521",{expiresIn:"5h"})
        return res.send({token:token})            
    }
    else{
        res.send({message:"SOMETHING WENT WRONG"})
    }
})

app.post("/users",async(req,res)=>{
    const user=req.body;
    const result =await usersCollection.insertOne(user)
    res.send(result);
})
app.get("/users",async(req,res)=>{
     const phone=`+88${req.query.phone}`
     console.log("phone",phone)
     const result=await usersCollection.findOne({phone:phone});
     res.send(result);
})
app.get("/products",async(req,res)=>{
    const result=await productsCollection.find({}).toArray()
    res.send(result);
})
app.post("/products",verifyJwt,async(req,res)=>{
    const product=req.body;
    const result=await productsCollection.insertOne(product);
    res.send(result);
})
app.get("/all-users",verifyJwt,async(req,res)=>{
    const result=await usersCollection.find({}).toArray();
    res.send(result);
})
app.post("/verify-user",async(req,res)=>{
    const user=req.body;
    const phoneNumber=user.phone;
    const user1=await  usersCollection.findOne({phone:phoneNumber});
    if(user.password===user1.password){
        res.send({message:"AUTHORIZED"})
    }
    else{
        res.send({message:"UNAUTHORIZED"})
    }
})
app.post("/add-to-cart",(req,res)=>{
    const cart=req.body;
    const result=cartCollection.insertOne(cart);
    res.send(result);

})
app.get("/cart",async(req,res)=>{
    const phoneNumber=req.query.phone;console.log(phoneNumber)
    const result=await cartCollection.find({phone:phoneNumber}).toArray();
    res.send(result);
})
app.delete("/cart",async(req,res)=>{
    const id=req.query.id;
    const result=await cartCollection.deleteOne({_id:ObjectId(id)})
    res.send(result);
    console.log(id);
    
})
app.listen(port,()=>{
    console.log("Server is Running on port 5000")
})


