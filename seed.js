import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/user.models.js';
import Category from './models/category.models.js';
import Product from './models/product.models.js';
import DB_NAME from './constant.js';

dotenv.config({ path: './.env' });

const seed = async () => {
  try {
    const baseUri = (process.env.MONGODB_URI ?? "").replace(/\/+$/, "");
    if (!baseUri) {
      throw new Error("MONGODB_URI is not set in environment");
    }
    const connectionUri = `${baseUri}/${DB_NAME}`;
    console.log("Connecting to:", connectionUri);
    await mongoose.connect(connectionUri);
    console.log("Database connected successfully.");

    // 1. Clear existing data (optional, but clean for seeding)
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({ email: { $in: ['seller@mock.com', 'customer@mock.com'] } });
    console.log("Existing seed data cleared.");

    // 2. Create a default seller user
    const sellerPassword = await bcrypt.hash('mockpassword', 10);
    const seller = await User.create({
      name: 'Elite Store Owner',
      email: 'seller@mock.com',
      password: sellerPassword,
      role: 'seller',
      location: 'Silicon Valley, CA',
      panNumber: 'ABCDE1234F',
      gstNumber: '29AAAAA1111A1Z1',
      bankAccountNumber: 123456789012,
      ifscCode: 'SBIN0001234',
      addressProof: 'https://mockproof.com/address.pdf',
      businessAddress: '101 Tech Parkway, Suite A',
      kycStatus: 'approved',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    });
    console.log("Mock seller created:", seller.name);

    // 3. Create a default customer user
    const customerPassword = await bcrypt.hash('mockpassword', 10);
    const customer = await User.create({
      name: 'Rehan Bhai',
      email: 'customer@mock.com',
      password: customerPassword,
      role: 'customer',
      location: 'Kathmandu, Nepal',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      wallet: 1500,
    });
    console.log("Mock customer created:", customer.name);

    // 4. Create default categories
    const audioCategory = await Category.create({
      name: 'Audio Gear',
      slug: 'audio-gear',
      description: 'Futuristic ANC headphones and surround capsules.',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    });

    const wearablesCategory = await Category.create({
      name: 'Wearables',
      slug: 'wearables',
      description: 'Quantum smart watches and biometric optics.',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400',
    });

    const smartLivingCategory = await Category.create({
      name: 'Smart Living',
      slug: 'smart-living',
      description: 'Intelligent spatial utilities for home and office.',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
    });

    console.log("Categories seeded successfully.");

    // 5. Create default products
    const productsData = [
      {
        owner: seller._id,
        title: 'Futuristic ANC Headphones X-1',
        description: 'Immersive hybrid active noise-canceling headphones with spatial audio tracking, custom graphene drivers, and 60 hours of active play time.',
        price: 299,
        stock: 12,
        category: audioCategory._id,
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        ],
      },
      {
        owner: seller._id,
        title: 'Quantum Smart Watch S-4',
        description: 'Advanced lifestyle timepiece featuring AMOLED variable display, blood-oxygen monitoring, integrated GPS tracker, and custom glassmorphic watchfaces.',
        price: 189,
        stock: 8,
        category: wearablesCategory._id,
        rating: 4.5,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
        ],
      },
      {
        owner: seller._id,
        title: 'Neo-Light Biometric Eyewear',
        description: 'Futuristic blue-light filtering frames with subtle micro-display HUD indicators, bone-conduction audio temple pads, and anti-glare lenses.',
        price: 145,
        stock: 15,
        category: wearablesCategory._id,
        rating: 4.2,
        images: [
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
          'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800',
        ],
      },
      {
        owner: seller._id,
        title: 'Hover Sound Capsule Speaker',
        description: 'Compact 360-degree wireless bluetooth speaker with deep ambient subwoofers, IPX7 water-resistant enclosure, and customizable LED pulsing neon lights.',
        price: 99,
        stock: 25,
        category: audioCategory._id,
        rating: 4.6,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
        ],
      },
      {
        owner: seller._id,
        title: 'Intelligent Ambient Desk Lamp',
        description: 'Minimalist smart LED desk light offering natural daylight spectrum emulation, automatic mood adjustment sensor, and wireless charging surface integration.',
        price: 79,
        stock: 3,
        category: smartLivingCategory._id,
        rating: 4.0,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
        ],
      },
    ];

    await Product.create(productsData);
    console.log("Mock products seeded successfully.");

    console.log("Database seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding operation failed:", err);
    process.exit(1);
  }
};

seed();
