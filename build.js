#!/usr/bin/env node

/**
 * Build script for Railway deployment
 * Handles building frontend and backend with proper error handling
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

console.log('Building Post-it application for Railway...\n');

try {
    // Step 1: Build frontend
    if (!fs.existsSync(frontendDir)) {
        throw new Error('Frontend directory not found: ' + frontendDir);
    }

    console.log('Installing frontend dependencies...');
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

    console.log('\nBuilding frontend...');
    execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

    // Step 2: Install backend dependencies
    if (!fs.existsSync(backendDir)) {
        throw new Error('Backend directory not found: ' + backendDir);
    }

    console.log('\nInstalling backend dependencies...');
    execSync('npm install', { cwd: backendDir, stdio: 'inherit' });

    console.log('\nBuild completed successfully!');
    console.log('Frontend dist: ' + path.join(frontendDir, 'dist'));
    console.log('Backend ready to start');

} catch (error) {
    console.error('\nBuild failed:');
    console.error(error.message);
    process.exit(1);
}
