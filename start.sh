#!/bin/sh
set -e

# Apply any pending database migrations before starting services
echo "Running Prisma db push..."
node node_modules/prisma/build/index.js db push --skip-generate
echo "Prisma db push complete."

# Start all services via supervisord
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
