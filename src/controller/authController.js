const jwt=require('jsonwebtoken');
const Users = require('../model/users');
const { request } = require('express');
const bcrypt = require('bcryptjs');
const secret=process.env.JWT_SECRET;
const {OAuth2Client}=require('google-auth-library');
const {validationResult}=require('express-validator');

const authController={
    login:async(request,response)=>{
        const errors=validationResult(request);
        if(!errors.isEmpty()){
            return response.status(401).json({errors:errors.array()});
        }
//these vlues are here beacause of express.json() middleware in the form of javascript object
try{
    const {username,password}=request.body;
    console.log('Recieved request for username: ',username);
    const data =await Users.findOne({email:username});
    
    if(!data){
        
        return response.status(401).json({message:'Invalid Credentials'});
    }
    const isMatch=await bcrypt.compare(password,data.password);
     
    if(!isMatch){
        return response.status(401).json({message:'Invalid Credentials'});
    }

    const userDetails={
        id:data._id,
        name:data.name,
        email:data.email
    };

    const token=jwt.sign(userDetails,process.env.JWT_SECRET,{expiresIn: '1h'});
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
    response.status(500).json({error:'Internal Server error'});
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
            const userDetails={
                id:user._id,
                name:user.name,
                email:user.email
            };
            const token = jwt.sign(userDetails,secret, { expiresIn: '1h' });
            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: true,
                 domain: 'localhost',
                  path: '/'
                 });
                 response.json({ message: 'User authenticatted', userDetails: userDetails });
                       
                    }
        catch(error){
            console.log(error);
            return response.status(500).json({message: 'internal server error'});
        }
    },
    googleAuth:async(request,response)=>{
        const {idToken}=request.body;
        if(!idToken){
            return response.status(400).json({message:'Invalid Request'});
        }
        try{
            const googleClient=new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const googleResponse=await googleClient.verifyIdToken({
                idToken:idToken,
                audience:process.env.GOOGLE_CLIENT_ID
            });
            const payload=googleResponse.getPayload();
            const {sub:googleId,email,name}=payload;
            let data=await Users.findOne({email:email});
            if(!data){
                data=new Users({
                    email:email,
                    name:name,
                    isGoogleUser:true,
                    googleId:googleId,
                });
                await data.save();
            }
            const user={
                id:data._id?data._id: googleId,
                username:email,
                name:name
            };
            const token=jwt.sign(user,secret,{expiresIn:'1h'});
            response.cookie('jwtToken',token,{
            httpOnly:true,
            secure:true,
            domain:'localhost',
            path:'/'

            });
            response.json({message:"User authenticated",userDetails:user});
        }
        catch(error){
            console.log(error);
            return response.status(500).json({error:"Internal server error"});
        }

    },

};
module.exports=authController;