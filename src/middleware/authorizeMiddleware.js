const permissions=require("../constants/permissions");
const authorize=(requiredPermission)=>{
    return (request,response,next)=>{
        const user=request.user; //auth Middleware will run before this middleware

        if(!user){
            return response.status(401).json({
                message:'Unauthorized'
            });
        }

        const userPermissions=permissions[user.role]||[];
        if(!userPermissions.includes(requiredPermission)){
            return response.status(403).json({
                message:'Forbidden: Insufficient Permission'
            });
        }
        next();


    };



};
module.exports=authorize;