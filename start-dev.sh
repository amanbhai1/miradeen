#!/bin/bash
cd /home/z/my-project

# Kill any existing Next.js processes
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
sleep 1

# Clear cache to reduce memory usage
rm -rf .next/cache 2>/dev/null

# Start server in a new session so it persists
setsid bash -c 'exec ./node_modules/.bin/next dev -p 3000 > /tmp/next-server.log 2>&1' </dev/null &
disown

echo "MIRADEEN dev server starting on port 3000..."
echo "Logs: /tmp/next-server.log"

# Wait for server to be ready
for i in $(seq 1 40); do
  if curl -s -m 3 -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
    echo "✅ Server ready after ${i}s"
    break
  fi
  sleep 1
done
