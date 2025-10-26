#!/bin/bash

echo "🚀 Setting up Suicket Email Server..."

# Navigate to server directory
cd server

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
PORT=3001
EOF
    echo "⚠️  Please update server/.env with your SendGrid credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your SendGrid API key and email"
echo "2. Start the server: cd server && npm run dev"
echo "3. The frontend will automatically use the backend for emails"
echo ""
echo "If the backend is not running, the frontend will fall back to console logging."
