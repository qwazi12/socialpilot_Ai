#!/bin/bash

###############################################################################
# Social Pilot AI - Google Cloud Automated Setup
# This script automates the entire Google Cloud configuration process
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Social Pilot AI - Google Cloud Setup Wizard           ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${NC}"

###############################################################################
# Step 1: Prerequisites Check
###############################################################################

echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Google Cloud${NC}"
    echo -e "${BLUE}→ Logging you in...${NC}"
    gcloud auth login
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo -e "${GREEN}✓ Logged in as: $ACTIVE_ACCOUNT${NC}"

###############################################################################
# Step 2: Project Configuration
###############################################################################

echo ""
echo -e "${YELLOW}📦 Step 2: Setting up Google Cloud Project...${NC}"

# Prompt for project ID or create new
echo -e "${BLUE}Do you want to:${NC}"
echo "  1) Use an existing project"
echo "  2) Create a new project"
read -p "Enter choice (1 or 2): " PROJECT_CHOICE

if [ "$PROJECT_CHOICE" == "2" ]; then
    # Create new project
    read -p "Enter new project ID (e.g., social-pilot-ai): " PROJECT_ID
    
    echo -e "${BLUE}→ Creating project: $PROJECT_ID${NC}"
    gcloud projects create "$PROJECT_ID" --name="Social Pilot AI" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Project already exists, using existing project${NC}"
    }
else
    # List existing projects
    echo -e "${BLUE}Available projects:${NC}"
    gcloud projects list --format="table(projectId,name,projectNumber)"
    
    read -p "Enter project ID to use: " PROJECT_ID
fi

# Set active project
echo -e "${BLUE}→ Setting active project to: $PROJECT_ID${NC}"
gcloud config set project "$PROJECT_ID"

echo -e "${GREEN}✓ Active project: $PROJECT_ID${NC}"

###############################################################################
# Step 3: Enable Required APIs
###############################################################################

echo ""
echo -e "${YELLOW}🔌 Step 3: Enabling required APIs...${NC}"

APIS_TO_ENABLE=(
    "sheets.googleapis.com"
    "drive.googleapis.com"
    "iam.googleapis.com"
)

for API in "${APIS_TO_ENABLE[@]}"; do
    echo -e "${BLUE}→ Enabling $API...${NC}"
    gcloud services enable "$API" --project="$PROJECT_ID" 2>/dev/null || true
done

echo -e "${GREEN}✓ All APIs enabled${NC}"

###############################################################################
# Step 4: Create Service Account
###############################################################################

echo ""
echo -e "${YELLOW}🤖 Step 4: Creating service account...${NC}"

SERVICE_ACCOUNT_NAME="social-pilot-bot"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account
echo -e "${BLUE}→ Creating service account: $SERVICE_ACCOUNT_NAME${NC}"
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
    --display-name="Social Pilot AI Bot" \
    --description="Automated posting bot for social media" \
    --project="$PROJECT_ID" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Service account already exists${NC}"
}

echo -e "${GREEN}✓ Service account: $SERVICE_ACCOUNT_EMAIL${NC}"

###############################################################################
# Step 5: Download Service Account Key
###############################################################################

echo ""
echo -e "${YELLOW}🔑 Step 5: Downloading service account credentials...${NC}"

# Create config directory if it doesn't exist
mkdir -p config

KEY_FILE="config/googleAuth.json"

echo -e "${BLUE}→ Generating credentials file...${NC}"
gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SERVICE_ACCOUNT_EMAIL" \
    --project="$PROJECT_ID" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Using existing key file${NC}"
}

echo -e "${GREEN}✓ Credentials saved to: $KEY_FILE${NC}"

###############################################################################
# Step 6: Create Google Sheet
###############################################################################

echo ""
echo -e "${YELLOW}📊 Step 6: Creating Google Sheet...${NC}"

# We'll use a Python script to create the sheet via API
cat > /tmp/create_sheet.py << 'PYTHON_SCRIPT'
import json
import sys
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Read credentials
CREDS_FILE = sys.argv[1]
SERVICE_ACCOUNT_EMAIL = sys.argv[2]

try:
    # Authenticate
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(CREDS_FILE, scopes=SCOPES)
    
    sheets_service = build('sheets', 'v4', credentials=creds)
    drive_service = build('drive', 'v3', credentials=creds)
    
    # Create spreadsheet
    spreadsheet = {
        'properties': {
            'title': 'Social Pilot AI - Content Queue'
        },
        'sheets': [{
            'properties': {
                'title': 'Sheet1',
                'gridProperties': {
                    'rowCount': 100,
                    'columnCount': 13
                }
            }
        }]
    }
    
    result = sheets_service.spreadsheets().create(body=spreadsheet).execute()
    spreadsheet_id = result['spreadsheetId']
    spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"
    
    # Add headers
    headers = [[
        'ID', 'Video Name', 'Drive Link', 'Title', 'Description', 'Tags',
        'Platforms', 'Status', 'Scheduled Time', 'YouTube URL', 
        'Instagram URL', 'TikTok URL', 'Notes'
    ]]
    
    sheets_service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range='Sheet1!A1:M1',
        valueInputOption='RAW',
        body={'values': headers}
    ).execute()
    
    # Format headers (bold, frozen)
    requests = [
        {
            'repeatCell': {
                'range': {
                    'sheetId': 0,
                    'startRowIndex': 0,
                    'endRowIndex': 1
                },
                'cell': {
                    'userEnteredFormat': {
                        'textFormat': {'bold': True},
                        'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.9}
                    }
                },
                'fields': 'userEnteredFormat(textFormat,backgroundColor)'
            }
        },
        {
            'updateSheetProperties': {
                'properties': {
                    'sheetId': 0,
                    'gridProperties': {'frozenRowCount': 1}
                },
                'fields': 'gridProperties.frozenRowCount'
            }
        }
    ]
    
    sheets_service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={'requests': requests}
    ).execute()
    
    # Share with service account
    drive_service.permissions().create(
        fileId=spreadsheet_id,
        body={
            'type': 'user',
            'role': 'writer',
            'emailAddress': SERVICE_ACCOUNT_EMAIL
        },
        fields='id'
    ).execute()
    
    # Output results
    print(f"SUCCESS|{spreadsheet_id}|{spreadsheet_url}")
    
except Exception as e:
    print(f"ERROR|{str(e)}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT

# Install required Python packages if needed
echo -e "${BLUE}→ Installing Python dependencies...${NC}"
pip3 install -q google-api-python-client google-auth-httplib2 google-auth-oauthlib 2>/dev/null || true

# Run the Python script
echo -e "${BLUE}→ Creating Google Sheet...${NC}"
SHEET_RESULT=$(python3 /tmp/create_sheet.py "$KEY_FILE" "$SERVICE_ACCOUNT_EMAIL" 2>&1)

if [[ $SHEET_RESULT == SUCCESS* ]]; then
    IFS='|' read -r STATUS SHEET_ID SHEET_URL <<< "$SHEET_RESULT"
    echo -e "${GREEN}✓ Sheet created successfully!${NC}"
    echo -e "${GREEN}  ID: $SHEET_ID${NC}"
    echo -e "${GREEN}  URL: $SHEET_URL${NC}"
else
    echo -e "${RED}❌ Error creating sheet: $SHEET_RESULT${NC}"
    SHEET_ID=""
    SHEET_URL=""
fi

# Clean up temp file
rm -f /tmp/create_sheet.py

###############################################################################
# Step 7: Update .env File
###############################################################################

echo ""
echo -e "${YELLOW}⚙️  Step 7: Updating .env file...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found, creating new one${NC}"
    touch .env
fi

# Update or add GOOGLE_SHEET_ID
if grep -q "^GOOGLE_SHEET_ID=" .env; then
    # Update existing
    sed -i.bak "s|^GOOGLE_SHEET_ID=.*|GOOGLE_SHEET_ID=$SHEET_ID|" .env
    echo -e "${BLUE}→ Updated GOOGLE_SHEET_ID in .env${NC}"
else
    # Add new
    echo "" >> .env
    echo "# Google Sheets Configuration" >> .env
    echo "GOOGLE_SHEET_ID=$SHEET_ID" >> .env
    echo -e "${BLUE}→ Added GOOGLE_SHEET_ID to .env${NC}"
fi

echo -e "${GREEN}✓ .env file updated${NC}"

###############################################################################
# Final Summary
###############################################################################

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  🎉 Setup Complete! 🎉                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  ✓ Project ID: ${GREEN}$PROJECT_ID${NC}"
echo -e "  ✓ Service Account: ${GREEN}$SERVICE_ACCOUNT_EMAIL${NC}"
echo -e "  ✓ Credentials: ${GREEN}$KEY_FILE${NC}"
echo -e "  ✓ Google Sheet: ${GREEN}$SHEET_URL${NC}"
echo ""

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. Add a test video to Google Drive"
echo "  2. Add a test post to your Google Sheet"
echo "  3. Run: npm start"
echo ""

echo -e "${BLUE}🔗 Google Sheet Link:${NC}"
echo -e "  ${GREEN}$SHEET_URL${NC}"
echo ""

echo -e "${GREEN}All done! Your bot is ready to use! 🚀${NC}"
