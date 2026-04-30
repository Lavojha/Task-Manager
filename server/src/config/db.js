import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager';

  try {
    const connection = await mongoose.connect(mongoUri);

    console.log(` MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    console.error(
      'Please set MONGODB_URI in server/.env or start local MongoDB at mongodb://127.0.0.1:27017'
    );
    process.exit(1);
  }
};

export default connectDB;