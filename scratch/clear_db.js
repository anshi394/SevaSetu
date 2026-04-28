const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sevasetu');
        console.log('Connected to MongoDB');

        const collections = Object.keys(mongoose.connection.collections);
        for (const collectionName of collections) {
            await mongoose.connection.collections[collectionName].deleteMany({});
            console.log(`Cleared collection: ${collectionName}`);
        }

        console.log('✅ Database cleared successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing database:', err);
        process.exit(1);
    }
};

clearDB();
