#!/bin/bash
# Start PostgreSQL service
brew services start postgresql

# Wait for it to start
sleep 3

# Create the packproof database
createdb packproof

# Create a 'postgres' user with password 'postgres' for universal compatibility
psql packproof -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;"
psql packproof -c "GRANT ALL PRIVILEGES ON DATABASE packproof TO postgres;"

echo "PostgreSQL setup complete!"
