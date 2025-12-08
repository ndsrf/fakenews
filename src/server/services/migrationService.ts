import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';
import { readFile } from 'fs/promises';


interface MigrationFile {
  version: string;
  filename: string;
  path: string;
}

export class MigrationService {
  private db: Database.Database;
  private migrationsDir: string;
  private appVersion: string;

  constructor(databasePath: string, appVersion: string) {
    this.db = new Database(databasePath);
    this.migrationsDir = join(process.cwd(), 'migrations');
    this.appVersion = appVersion;
  }

  /**
   * Main entry point - checks and applies all pending migrations
   */
  async checkAndApplyMigrations(): Promise<void> {
    console.log('🔄 Starting migration check...');

    try {
      // Ensure AppVersion table exists
      this.ensureAppVersionTable();

      const currentVersion = this.getCurrentDatabaseVersion();
      console.log(`📊 Current database version: ${currentVersion || 'none'}`);
      console.log(`📦 Application version: ${this.appVersion}`);

      if (currentVersion && this.compareVersions(currentVersion, this.appVersion) >= 0) {
        console.log('✅ Database is up to date. No migrations needed.');
        return;
      }

      const pendingMigrations = this.getPendingMigrations(currentVersion);

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found.');
        return;
      }

      console.log(`📝 Found ${pendingMigrations.length} pending migration(s)`);

      for (const migration of pendingMigrations) {
        await this.applyMigration(migration);
      }

      console.log('✅ All migrations applied successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Ensure AppVersion table exists (for fresh databases)
   */
  private ensureAppVersionTable(): void {
    const tableExists = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='AppVersion'")
      .get();

    if (!tableExists) {
      console.log('📋 Creating AppVersion table...');
      this.db.exec(`
        CREATE TABLE AppVersion (
          id TEXT PRIMARY KEY,
          version TEXT UNIQUE NOT NULL,
          appliedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          description TEXT NOT NULL,
          migrations TEXT NOT NULL
        )
      `);
    }
  }

  /**
   * Get current database version from AppVersion table
   */
  private getCurrentDatabaseVersion(): string | null {
    try {
      const result = this.db
        .prepare('SELECT version FROM AppVersion ORDER BY appliedAt DESC LIMIT 1')
        .get() as { version: string } | undefined;

      return result?.version || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get list of pending migrations that need to be applied
   */
  private getPendingMigrations(currentVersion: string | null): MigrationFile[] {
    const allMigrations: MigrationFile[] = [];

    try {
      const versionDirs = readdirSync(this.migrationsDir)
        .filter(dir => /^\d+\.\d+\.\d+$/.test(dir))
        .sort(this.compareVersions.bind(this));

      for (const versionDir of versionDirs) {
        // Skip if this version is already applied
        if (currentVersion && this.compareVersions(versionDir, currentVersion) <= 0) {
          continue;
        }

        // Skip if this version is higher than app version
        if (this.compareVersions(versionDir, this.appVersion) > 0) {
          continue;
        }

        const versionPath = join(this.migrationsDir, versionDir);
        const files = readdirSync(versionPath)
          .filter(file => file.endsWith('.sql'))
          .sort();

        for (const file of files) {
          allMigrations.push({
            version: versionDir,
            filename: file,
            path: join(versionPath, file),
          });
        }
      }
    } catch (error) {
      console.error('Error reading migrations directory:', error);
      throw error;
    }

    return allMigrations;
  }

  /**
   * Apply a single migration file
   */
  private async applyMigration(migration: MigrationFile): Promise<void> {
    console.log(`  ⚙️  Applying ${migration.version}/${migration.filename}...`);

    try {
      const sql = await readFile(migration.path, 'utf-8');

      // Execute migration in a transaction
      this.db.exec('BEGIN TRANSACTION');

      try {
        this.db.exec(sql);

        // Update AppVersion if this is the last migration for this version
        const allMigrationsForVersion = this.getPendingMigrations(null)
          .filter(m => m.version === migration.version);

        const isLastMigration =
          allMigrationsForVersion[allMigrationsForVersion.length - 1]?.filename === migration.filename;

        if (isLastMigration) {
          const migrationFiles = allMigrationsForVersion.map(m => m.filename);

          // Check if version already exists
          const existingVersion = this.db
            .prepare('SELECT version FROM AppVersion WHERE version = ?')
            .get(migration.version);

          if (!existingVersion) {
            this.db.prepare(`
              INSERT INTO AppVersion (id, version, description, migrations)
              VALUES (?, ?, ?, ?)
            `).run(
              this.generateUUID(),
              migration.version,
              `Migration to version ${migration.version}`,
              JSON.stringify(migrationFiles)
            );
          }
        }

        this.db.exec('COMMIT');
        console.log(`    ✓ Successfully applied ${migration.filename}`);
      } catch (error) {
        this.db.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error(`    ✗ Failed to apply ${migration.filename}:`, error);
      throw error;
    }
  }

  /**
   * Compare two semantic versions
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }

    return 0;
  }

  /**
   * Generate a simple UUID for SQLite
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}

export default MigrationService;
