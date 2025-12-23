# Scripts

This directory contains utility scripts for maintaining the Fictional News Generator application.

## backup-db.sh

Database backup script that creates timestamped backups of the SQLite database and automatically manages backup retention.

### Features

- Creates timestamped database backups in `./backups/` directory
- Automatically removes backups older than 7 days
- Displays backup status and file sizes
- Color-coded output for easy monitoring

### Usage

#### Manual Backup

Run the script manually:

```bash
./scripts/backup-db.sh
```

Or with a custom database path:

```bash
DATABASE_URL=file:./custom_path.db ./scripts/backup-db.sh
```

#### Automated Daily Backups

To run backups automatically every day at 2 AM, add this to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path to your project directory)
0 2 * * * cd /path/to/fakenews && ./scripts/backup-db.sh >> ./logs/backup.log 2>&1
```

#### Cron Schedule Examples

- Every day at 2 AM: `0 2 * * *`
- Every 6 hours: `0 */6 * * *`
- Every Sunday at 3 AM: `0 3 * * 0`
- Twice daily (2 AM and 2 PM): `0 2,14 * * *`

### Configuration

Edit the script to customize:

- `RETENTION_DAYS`: Number of days to keep backups (default: 7)
- `BACKUP_DIR`: Location for backup files (default: `./backups`)

### Backup Restoration

To restore from a backup:

```bash
# Stop the application first
npm stop

# Copy the backup file to the database location
cp backups/fictional_news_20250117_020000.db fictional_news.db

# Restart the application
npm start
```

### Monitoring

The script outputs:
- Backup creation status
- Backup file size
- Number of old backups removed
- List of remaining backups

For automated monitoring, redirect output to a log file (see crontab example above) and monitor `./logs/backup.log`.
