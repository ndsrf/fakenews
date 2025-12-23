#!/bin/bash

# Database Backup Script
# This script creates timestamped backups of the SQLite database
# and automatically removes backups older than 7 days

# Configuration
DB_PATH="${DATABASE_URL:-file:./fictional_news.db}"
DB_PATH="${DB_PATH#file:}"  # Remove 'file:' prefix if present
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fictional_news_$TIMESTAMP.db"
RETENTION_DAYS=7

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Check if database file exists
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}Error: Database file not found at $DB_PATH${NC}"
    exit 1
fi

# Create backup
echo -e "${GREEN}Creating backup of database...${NC}"
echo "Source: $DB_PATH"
echo "Destination: $BACKUP_FILE"

cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup created successfully${NC}"

    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Remove old backups
echo -e "${YELLOW}Removing backups older than $RETENTION_DAYS days...${NC}"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "fictional_news_*.db" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Removed $DELETED_COUNT old backup(s)${NC}"
else
    echo "No old backups to remove"
fi

# List remaining backups
echo -e "${GREEN}Current backups:${NC}"
ls -lh "$BACKUP_DIR"/fictional_news_*.db 2>/dev/null || echo "No backups found"

echo -e "${GREEN}Backup completed successfully!${NC}"
