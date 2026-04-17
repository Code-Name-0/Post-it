#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Board = require('./models/Board');
const PostIt = require('./models/PostIt');

async function seed() {
    try {
        console.log('🌱 Starting seed...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Board.deleteMany({});
        await PostIt.deleteMany({});

        // Create boards
        console.log('📋 Creating boards...');
        const defaultBoard = await Board.create({
            slug: 'default',
            name: 'Tableau principal'
        });
        console.log(`✅ Created board: ${defaultBoard.name}`);

        const teamBoard = await Board.create({
            slug: 'team',
            name: 'Tableau Équipe'
        });
        console.log(`✅ Created board: ${teamBoard.name}`);

        // Create users
        console.log('👥 Creating users...');

        const adminUser = await User.create({
            username: 'admin',
            password: await bcrypt.hash('admin123', 12),
            role: 'admin'
        });
        console.log(`✅ Created admin user: ${adminUser.username}`);

        const normalUser = await User.create({
            username: 'john',
            password: await bcrypt.hash('john123', 12),
            role: 'creator'
        });
        console.log(`✅ Created normal user: ${normalUser.username}`);

        const guestUser = await User.create({
            username: 'guest',
            password: await bcrypt.hash('guest_system_account', 12),
            role: 'guest'
        });
        console.log(`✅ Created guest user: ${guestUser.username}`);

        // Create sample posts
        console.log('📝 Creating sample posts...');

        const posts = [
            {
                text: 'Welcome to Post-it! 🎉',
                x: 50,
                y: 50,
                author: adminUser._id,
                board: defaultBoard._id
            },
            {
                text: 'This is an admin post',
                x: 200,
                y: 100,
                author: adminUser._id,
                board: defaultBoard._id
            },
            {
                text: 'John is working on this feature',
                x: 350,
                y: 150,
                author: normalUser._id,
                board: defaultBoard._id
            },
            {
                text: 'Great idea for the project',
                x: 500,
                y: 200,
                author: normalUser._id,
                board: teamBoard._id
            },
            {
                text: 'Admin approved ✓',
                x: 100,
                y: 250,
                author: adminUser._id,
                board: teamBoard._id
            },
            {
                text: 'Team meeting at 3 PM',
                x: 250,
                y: 300,
                author: normalUser._id,
                board: teamBoard._id
            }
        ];

        for (const postData of posts) {
            await PostIt.create(postData);
        }
        console.log(`✅ Created ${posts.length} sample posts`);

        console.log('\n✨ Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`  - Users: 3 (admin, john, guest)`);
        console.log(`  - Boards: 2 (default, team)`);
        console.log(`  - Posts: ${posts.length}`);
        console.log('\n🔑 Login credentials:');
        console.log(`  Admin: admin / admin123`);
        console.log(`  User: john / john123`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
