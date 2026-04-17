#!/bin/bash
set -e

echo "=========================================="
echo "BUILD SCRIPT STARTED"
echo "Current directory: $(pwd)"
echo "=========================================="

echo ""
echo "STEP 1: Checking frontend directory..."
ls -la frontend/ | head -5
echo ""

echo "STEP 2: Building frontend..."
echo "Entering frontend directory..."
cd frontend
echo "Current directory: $(pwd)"
echo "Running: npm install"
npm install
echo "Running: npm run build"
npm run build
echo "Frontend build completed!"
echo "Checking dist folder..."
ls -la dist/ 2>/dev/null | head -10 || echo "ERROR: dist folder not found!"
echo ""

echo "STEP 3: Going back to root..."
cd ..
echo "Current directory: $(pwd)"
echo ""

echo "STEP 4: Installing backend dependencies..."
cd backend
echo "Current directory: $(pwd)"
npm install
cd ..
echo ""

echo "=========================================="
echo "BUILD SCRIPT COMPLETED SUCCESSFULLY!"
echo "Frontend dist location: $(pwd)/frontend/dist"
ls -la frontend/dist 2>/dev/null | head -5 || echo "WARNING: dist not found"
echo "=========================================="
