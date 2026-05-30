import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.models.js';
import DB_NAME from './constant.js';

dotenv.config({ path: './.env' });

const check = async () => {
  try {
    const baseUri = (process.env.MONGODB_URI ?? '').replace(/\/+$/, '');
    const connectionUri = `${baseUri}/${DB_NAME}`;
    console.log('Connecting to database:', connectionUri);
    await mongoose.connect(connectionUri);

    console.log('Attempting to update customer@mock.com to seller...');
    const result = await User.findOneAndUpdate(
      { email: 'customer@mock.com' },
      {
        $set: {
          role: 'seller',
          panNumber: 'ABCDE1234F',
          gstNumber: '29AAAAA1111A1Z1',
          bankAccountNumber: 123456789012,
          ifscCode: 'SBIN0001234',
          addressProof: 'https://drive.google.com/proof',
          businessAddress: '123 Store Lane',
          kycStatus: 'approved'
        }
      },
      { new: true }
    );

    console.log('Update Result:', result);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

check();
