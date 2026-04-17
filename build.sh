#!/bin/bash
set -e

echo "Post-it Build Script for Railway"
echo "================================"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "Script directory: $SCRIPT_DIR"
echo "Frontend: $FRONTEND_DIR"
echo "Backend: $BACKEND_DIR"

# Build Frontend
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "ERROR: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

echo ""
echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

echo ""
echo "Building frontend..."
npm run build

echo "Frontend build complete: dist/ created"

# Install Backend
if [ ! -d "$BACKEND_DIR" ]; then
    echo "ERROR: Backend directory not found at $BACKEND_DIR"
    exit 1
fi

echo ""
echo "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

echo ""
echo "Build process complete!"
echo "Frontend: $FRONTEND_DIR/dist"
echo "Backend: Ready to start"
