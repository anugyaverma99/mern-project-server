const jwt=require('jsonwebtoken');
const Users = require('../model/users');
const { request } = require('express');
const bcrypt = require('bcryptjs');
const secret="97f7fe51log-9abf-4550-9ba7-35563b03a3e7";
const authController={
    login:async(request,response)=>{
        console.log('Request Body:', request.body);
//these vlues are here beacause of express.json() middleware in the form of javascript object
try{
    const {username,password}=request.body;
    console.log('Recieved request for username: ',username);
    const data =await Users.findOne({email:username});
    if(!data){
        return response.status(401).json({message:'Invalid Credentials'});
    }
    const isMatch=bcrypt.compare(password,data.password);
     
    if(!isMatch){
        return response.status(401).json({message:'Invalid Credentials'});
    }

    const userDetails={
        id:data._id,
        name:data.name,
        email:data.email
    };

    const token=jwt.sign(userDetails,secret,{expiresIn: '1h'});
    response.cookie('jwtToken',token,{
        httpOnly:true,   //httpoly means only server can make the changes
        secure:true,
        domain:'localhost',
        path:'/'      //means cookie will be avilble on your whole application you can use particaular route to store on particular webpage
    });
    response.json({message:'User authenticated', userDetails:userDetails});

}
catch(error){
    console.log(error);
    response.tatus(500).json({error:'Internal Server error'});
}

    },
    logout:(request,response)=>{
        response.clearCookie('jwtToken');
        response.json({message: 'User logged out successfully'});
    },
    isUserLoggedIn:(request,response)=>{
        const token=request.cookies.jwtToken;
        if(!token){
            return response.status(401).json({message: 'Unauthorized access'});
        }
        jwt.verify(token,secret,(error,userDetails)=>{
            if(error){
                return response.status(401).json({message: 'Unauthorized access'});
            }
            else{
            return response.json({userDetails});
        }

        });
        
    },
    register:async(request,response)=>{
        try{
            const {username,password,name}=request.body;
           
            const data=await Users.findOne({email:username});
            if(data){
                return response.status(401).json({message:"user exist with the given mail"});

            }
            const encryptedPassword=await bcrypt.hash(password,10);
            
            const user=new Users({
                email:username,
                password:encryptedPassword,
                name:name
            });
            await user.save();
            console.log('User saved successfully to MongoDB!');
            response.status(200).json({message:'user registered'});
                    }
        catch(error){
            console.log(error);
            return response.status(500).json({message: 'internal server error'});
        }
    }

};
module.exports=authController;