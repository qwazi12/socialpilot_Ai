#!/bin/bash

# Automated Archive & Update Script
# Runs every 12 hours to archive Posted videos and check for new ones

cd /Users/kwasiyeboah/Desktop/copy-of-socialpilot-ai

echo "🕐 $(date) - Running automated archive & update..."

# Run the smart update script
node update_sheet_smart.js

echo "✅ $(date) - Completed!"
echo ""
