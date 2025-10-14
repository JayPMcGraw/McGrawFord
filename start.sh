#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║   Starting McGraw Motors Dashboard        ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Start backend
cd backend
node server.js &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Dashboard is starting..."
echo ""
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
