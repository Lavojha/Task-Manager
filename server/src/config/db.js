import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = await mongoose.connect(process.env.MONGODB_URI);

    console.log(` MongoDB Connected: ${mongoUri.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;