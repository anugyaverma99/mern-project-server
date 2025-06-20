const express=require('express');

const authRoutes=require('./src/routes/authRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app=express();

app.use(express.json());
app.use(cookieParser());

const corsOptions={
    origin:'http://localhost:3000',
    credentials:true
};

app.use(cors(corsOptions));

app.use('/auth',authRoutes);

const PORT=5000;
app.listen(PORT,(error)=>{
    if(error){
        console.log('server not started:',error);
    }
    console.log(`Server is running at port ${PORT}`)
});