import mongoose from 'mongoose';

const connectdb =async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("DB Connected");
        
    }catch(e){
        console.log(`error in connecting db ${e}`)
        process.exit(1)
    } 
}

export default connectdb