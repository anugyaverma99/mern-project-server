require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const authRoutes=require('./src/routes/authRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const linksRoutes=require("./src/routes/linkRoutes");
const userRoutes=require("./src/routes/userRoutes");
const paymentRoutes=require('./src/routes/paymentRoutes');
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('Database connected'))
.catch(error=> console.log(error));

const app=express();

app.use(express.json());
app.use(cookieParser());
const corsOptions={
    origin:process.env.CLIENT_ENDPOINT,
    credentials:true
};

app.use(cors(corsOptions));

app.use('/auth',authRoutes);
app.use('/links',linksRoutes);
app.use('/users',userRoutes);
app.use('/payments',paymentRoutes);
const PORT=5000;
app.listen(PORT,(error)=>{
    if(error){
        console.log('server not started:',error);
    }
    console.log(`Server is running at port ${PORT}`)
});