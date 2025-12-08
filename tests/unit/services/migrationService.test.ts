import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MigrationService } from '../../../src/server/services/migrationService';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { join } from 'path';

// Mock dependencies
jest.mock('fs');
jest.mock('fs/promises');

// Mock better-sqlite3
const mockPrepare = jest.fn();
const mockExec = jest.fn();
const mockClose = jest.fn();
const mockGet = jest.fn();
const mockRun = jest.fn();

// Setup chainable mock for prepare().get() and prepare().run()
mockPrepare.mockReturnValue({
  get: mockGet,
  run: mockRun,
});

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    prepare: mockPrepare,
    exec: mockExec,
    close: mockClose,
  }));
});

describe('MigrationService', () => {
  let migrationService: MigrationService;
  const mockAppVersion = '1.0.0';
  const mockMigrationsDir = '/mock/migrations';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockGet.mockReset();
    mockRun.mockReset();

    // Mock fs.readdirSync to return empty initially
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    
    // Initialize service (uses mocked Database)
    migrationService = new MigrationService(':memory:', mockAppVersion);
    
    // Hack: Override the private migrationsDir property to point to our mock path
    (migrationService as any).migrationsDir = mockMigrationsDir;
  });

  afterEach(() => {
    try {
      migrationService.close();
    } catch (e) {
      // ignore
    }
  });

  describe('checkAndApplyMigrations', () => {
    it('should create AppVersion table if it does not exist', async () => {
      mockGet.mockReturnValueOnce(undefined); // for table check
      mockGet.mockReturnValueOnce(undefined); // for current version

      await migrationService.checkAndApplyMigrations();

      expect(mockExec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE AppVersion'));
    });

    it('should apply pending migrations', async () => {
      mockGet.mockReturnValueOnce({ name: 'AppVersion' });
      mockGet.mockReturnValueOnce(undefined);

      const versionDir = '1.0.0';
      const migrationFile = '001_initial.sql';
      const sqlContent = 'CREATE TABLE Test (id INTEGER PRIMARY KEY);';

      (fs.readdirSync as jest.Mock).mockImplementation((path: any) => {
        if (path === mockMigrationsDir) return [versionDir];
        if (path === join(mockMigrationsDir, versionDir)) return [migrationFile];
        return [];
      });

      (fsPromises.readFile as jest.Mock).mockResolvedValue(sqlContent);

      await migrationService.checkAndApplyMigrations();

      expect(mockExec).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(mockExec).toHaveBeenCalledWith(sqlContent);
      expect(mockExec).toHaveBeenCalledWith('COMMIT');
    });

    it('should not apply migrations if version is higher than app version', async () => {
      mockGet.mockReturnValueOnce({ name: 'AppVersion' });
      mockGet.mockReturnValueOnce({ version: '1.0.0' });

      const higherVersion = '2.0.0';
      const migrationFile = '001_future.sql';
      
      (fs.readdirSync as jest.Mock).mockImplementation((path: any) => {
        if (path === mockMigrationsDir) return [higherVersion];
        if (path === join(mockMigrationsDir, higherVersion)) return [migrationFile];
        return [];
      });

      await migrationService.checkAndApplyMigrations();

      expect(fsPromises.readFile).not.toHaveBeenCalled();
    });
  });
});
