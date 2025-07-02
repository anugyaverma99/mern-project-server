const jwt = require('jsonwebtoken');
const Users=require('../model/users')
const authMiddleware={
    protect:async(request,response,next)=>{
        try{
            const token=request.cookies?.jwtToken;
            if(!token){
                return response.status(401)
                .json({error:'Not authorized'});
            }
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            const user = await Users.findById(decoded.id);

            if (!user) {
                return response.status(401).json({ error: 'User not found' });
            }
            request.user=user;
            next();
                    }
        catch(error){
            console.log(error);
            return response.status(500).json({error:'server error'});
        }
    }
};
module.exports=authMiddleware;