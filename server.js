const express=require('express');

const authRoutes=require('./src/routes/authRoutes');

const app=express();

app.use(express.json());

app.use('/auth',authRoutes);

const PORT=5000;
app.listen(PORT,(error)=>{
    if(error){
        console.log('server not started:',error);
    }
    console.log(`Server is running at port ${PORT}`)
});