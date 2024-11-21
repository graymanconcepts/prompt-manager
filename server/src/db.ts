import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Prompt, UploadHistory } from '../../src/types';
import { mockPrompts, mockHistory } from '../../src/data/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  private db: sqlite3.Database;
  private initialized: boolean = false;
  private readonly dbPath: string;

  constructor() {
    // Create the data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = path.join(dataDir, 'prompts.db');
    const dbExists = fs.existsSync(this.dbPath);

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log(`Connected to SQLite database at ${this.dbPath}`);
      }
    });

    // Initialize the database if it's newly created
    if (!dbExists) {
      console.log('New database created, will initialize with schema and seed data');
    }
  }

  private async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  private async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  private async checkColumnExists(table: string, column: string): Promise<boolean> {
    try {
      const result = await this.get<{ name: string }>(`PRAGMA table_info(${table})`);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  private async migrateDatabase(): Promise<void> {
    try {
      // Start a transaction for the migration
      await this.run('BEGIN TRANSACTION');

      // Add rating column if it doesn't exist
      const hasRating = await this.checkColumnExists('prompts', 'rating');
      if (!hasRating) {
        await this.run('ALTER TABLE prompts ADD COLUMN rating INTEGER CHECK (rating >= 0 AND rating <= 5)');
        await this.run('UPDATE prompts SET rating = 0');
      }

      // Add ratingCount column if it doesn't exist
      const hasRatingCount = await this.checkColumnExists('prompts', 'ratingCount');
      if (!hasRatingCount) {
        await this.run('ALTER TABLE prompts ADD COLUMN ratingCount INTEGER NOT NULL DEFAULT 0');
      }

      // Add isFavorite column if it doesn't exist
      const hasIsFavorite = await this.checkColumnExists('prompts', 'isFavorite');
      if (!hasIsFavorite) {
        await this.run('ALTER TABLE prompts ADD COLUMN isFavorite INTEGER NOT NULL DEFAULT 0');
      }

      // Commit the transaction
      await this.run('COMMIT');
      console.log('Database migration completed successfully');
    } catch (error) {
      // Rollback the transaction if there's an error
      await this.run('ROLLBACK');
      console.error('Error during database migration:', error);
      throw error;
    }
  }

  async init(): Promise<void> {
    if (this.initialized) {
      console.log('Database already initialized, skipping initialization');
      return;
    }

    try {
      // First create the upload_history table since it's referenced by prompts
      await this.run(`
        CREATE TABLE IF NOT EXISTS upload_history (
          id TEXT PRIMARY KEY,
          fileName TEXT NOT NULL,
          uploadDate TEXT NOT NULL,
          status TEXT NOT NULL,
          isActive INTEGER NOT NULL,
          promptCount INTEGER NOT NULL,
          errorMessage TEXT
        )
      `);

      // Then create the prompts table with all columns included
      await this.run(`
        CREATE TABLE IF NOT EXISTS prompts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          content TEXT NOT NULL,
          tags TEXT,
          created TEXT NOT NULL,
          lastModified TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          historyId TEXT,
          rating INTEGER CHECK (rating >= 0 AND rating <= 5),
          ratingCount INTEGER NOT NULL DEFAULT 0,
          isFavorite INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (historyId) REFERENCES upload_history(id)
        )
      `);

      // Run migrations for existing databases
      await this.migrateDatabase();

      // Check if we need to seed data
      const promptCount = await this.get<{ count: number }>('SELECT COUNT(*) as count FROM prompts');
      if (!promptCount || promptCount.count === 0) {
        console.log('No existing data found, seeding initial data...');
        await this.seedData();
      } else {
        console.log(`Database already contains ${promptCount.count} prompts, skipping seed`);
      }

      this.initialized = true;
      console.log('Database initialization completed successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async seedData(): Promise<void> {
    try {
      // Begin transaction for atomic seeding
      await this.run('BEGIN TRANSACTION');

      // Seed prompts
      for (const prompt of mockPrompts) {
        await this.run(
          'INSERT INTO prompts (id, title, description, content, tags, created, lastModified, isActive, historyId, rating, ratingCount, isFavorite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            prompt.id,
            prompt.title,
            prompt.description,
            prompt.content,
            Array.isArray(prompt.tags) ? prompt.tags.join(',') : '',
            prompt.created,
            prompt.lastModified,
            prompt.isActive ? 1 : 0,
            prompt.historyId,
            prompt.rating || 0,
            prompt.ratingCount || 0,
            prompt.isFavorite ? 1 : 0
          ]
        );
      }

      // Seed history
      for (const history of mockHistory) {
        await this.run(
          'INSERT INTO upload_history (id, fileName, uploadDate, status, isActive, promptCount, errorMessage) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            history.id,
            history.fileName,
            history.uploadDate,
            history.status,
            history.isActive ? 1 : 0,
            history.promptCount,
            history.errorMessage
          ]
        );
      }

      // Commit transaction
      await this.run('COMMIT');
      console.log('Initial data seeded successfully');
    } catch (error) {
      // Rollback transaction on error
      await this.run('ROLLBACK');
      console.error('Error seeding data:', error);
      throw error;
    }
  }

  async getAllPrompts(): Promise<Prompt[]> {
    type DBPrompt = Omit<Prompt, 'tags'> & { tags: string; historyIsActive?: number; rating: number; isFavorite: number; ratingCount: number };
    const prompts = await this.all<DBPrompt>(`
      SELECT 
        p.*,
        h.isActive as historyIsActive
      FROM prompts p 
      LEFT JOIN upload_history h ON p.historyId = h.id 
      ORDER BY p.created DESC
    `);
    return prompts.map(prompt => ({
      ...prompt,
      tags: prompt.tags ? prompt.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      isActive: Boolean(prompt.isActive),
      historyIsActive: prompt.historyId ? Boolean(prompt.historyIsActive) : true,
      rating: prompt.rating,
      isFavorite: Boolean(prompt.isFavorite),
      ratingCount: prompt.ratingCount
    }));
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    type DBPrompt = Omit<Prompt, 'tags'> & { tags: string; rating: number; isFavorite: number; ratingCount: number };
    const prompt = await this.get<DBPrompt>('SELECT * FROM prompts WHERE id = ?', [id]);
    if (!prompt) return null;
    return {
      ...prompt,
      tags: prompt.tags ? prompt.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      isActive: Boolean(prompt.isActive),
      rating: prompt.rating,
      isFavorite: Boolean(prompt.isFavorite),
      ratingCount: prompt.ratingCount
    };
  }

  async createPrompt(prompt: Prompt): Promise<Prompt[]> {
    try {
      const tags = Array.isArray(prompt.tags) ? prompt.tags.join(',') : '';
      await this.run(
        'INSERT INTO prompts (id, title, description, content, tags, created, lastModified, isActive, historyId, rating, ratingCount, isFavorite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          prompt.id,
          prompt.title,
          prompt.description,
          prompt.content,
          tags,
          prompt.created,
          prompt.lastModified,
          prompt.isActive ? 1 : 0,
          prompt.historyId,
          prompt.rating || 0,
          prompt.ratingCount || 0,
          prompt.isFavorite ? 1 : 0
        ]
      );
      return this.getAllPrompts();
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  }

  async updatePrompt(prompt: Prompt): Promise<Prompt[]> {
    try {
      const tags = Array.isArray(prompt.tags) ? prompt.tags.join(',') : '';
      await this.run(
        'UPDATE prompts SET title = ?, description = ?, content = ?, tags = ?, lastModified = ?, isActive = ?, historyId = ?, rating = ?, ratingCount = ?, isFavorite = ? WHERE id = ?',
        [
          prompt.title,
          prompt.description,
          prompt.content,
          tags,
          prompt.lastModified,
          prompt.isActive ? 1 : 0,
          prompt.historyId,
          prompt.rating || 0,
          prompt.ratingCount || 0,
          prompt.isFavorite ? 1 : 0,
          prompt.id
        ]
      );
      return this.getAllPrompts();
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  async deletePrompt(id: string): Promise<void> {
    const exists = await this.getPromptById(id);
    if (!exists) {
      throw new Error(`Prompt with id ${id} not found`);
    }
    
    await this.run('DELETE FROM prompts WHERE id = ?', [id]);
  }

  async getAllHistory(): Promise<UploadHistory[]> {
    return this.all<UploadHistory>('SELECT * FROM upload_history ORDER BY uploadDate DESC');
  }

  async createHistory(history: UploadHistory): Promise<void> {
    await this.run(
      'INSERT INTO upload_history (id, fileName, uploadDate, status, isActive, promptCount, errorMessage) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [history.id, history.fileName, history.uploadDate, history.status, history.isActive ? 1 : 0, history.promptCount, history.errorMessage]
    );
  }

  async toggleHistoryActive(id: string): Promise<UploadHistory[]> {
    await this.run(
      'UPDATE upload_history SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END WHERE id = ?',
      [id]
    );
    // Return the updated history list
    return this.getAllHistory();
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const db = new Database();
