const jwt=require('jsonwebtoken');
const secret="97f7fe51-9abf-4550-9ba7-35563b03a3e7";
const authController={
    login:(request,response)=>{
        console.log('Request Body:', request.body);
//these vlues are here beacause of express.json() middleware in the form of javascript object
const {username,password}=request.body;
if(username ==='admin' && password==='admin'){
    const userDetails={
        name:'John Cena',
        email:"john@cena.com"
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
else{
    response.status(401).json({message:'invalid credentials'});
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
        
    }

};
module.exports=authController;