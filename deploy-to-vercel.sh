#!/bin/bash

# Deploy McGraw Dashboard to Vercel
echo "Deploying McGraw Dashboard to Vercel..."

# Run vercel deploy in production mode
vercel --prod --yes

echo "Deployment complete!"
