import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {

    mongoose.set('strictQuery',false);
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Database connected:", connect.connection.host, connect.connection.name);
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
