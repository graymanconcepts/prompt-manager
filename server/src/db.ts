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

  async init(): Promise<void> {
    if (this.initialized) {
      console.log('Database already initialized, skipping initialization');
      return;
    }

    try {
      // First, check if the isActive column exists in the prompts table
      const tableInfo = await this.all<{ name: string }>(
        "PRAGMA table_info(prompts)"
      );
      const hasIsActiveColumn = tableInfo.some(col => col.name === 'isActive');

      // Create tables if they don't exist
      await this.run(`
        CREATE TABLE IF NOT EXISTS prompts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          content TEXT NOT NULL,
          tags TEXT,
          created TEXT NOT NULL,
          lastModified TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1
        )
      `);

      // Add isActive column if it doesn't exist
      if (!hasIsActiveColumn) {
        console.log('Adding isActive column to prompts table...');
        await this.run(`
          ALTER TABLE prompts 
          ADD COLUMN isActive INTEGER NOT NULL DEFAULT 1
        `);
      }

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
      console.error('Error during database initialization:', error);
      throw error;
    }
  }

  private async seedData(): Promise<void> {
    try {
      // Begin transaction for atomic seeding
      await this.run('BEGIN TRANSACTION');

      // Seed prompts
      for (const prompt of mockPrompts) {
        await this.createPrompt(prompt);
      }

      // Seed history
      for (const history of mockHistory) {
        await this.createHistory(history);
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
    const prompts = await this.all<Prompt>('SELECT * FROM prompts ORDER BY created DESC');
    return prompts.map(prompt => ({
      ...prompt,
      tags: prompt.tags ? JSON.parse(prompt.tags) : [],
      isActive: Boolean(prompt.isActive)
    }));
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    const prompt = await this.get<Prompt>('SELECT * FROM prompts WHERE id = ?', [id]);
    if (!prompt) return null;
    return {
      ...prompt,
      tags: prompt.tags ? JSON.parse(prompt.tags) : [],
      isActive: Boolean(prompt.isActive)
    };
  }

  async createPrompt(prompt: Prompt): Promise<void> {
    const tags = JSON.stringify(prompt.tags);
    await this.run(
      'INSERT INTO prompts (id, title, description, content, tags, created, lastModified, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [prompt.id, prompt.title, prompt.description, prompt.content, tags, prompt.created, prompt.lastModified, prompt.isActive ? 1 : 0]
    );
  }

  async updatePrompt(prompt: Prompt): Promise<void> {
    const tags = JSON.stringify(prompt.tags);
    const exists = await this.getPromptById(prompt.id);
    if (!exists) {
      throw new Error(`Prompt with id ${prompt.id} not found`);
    }
    
    await this.run(
      'UPDATE prompts SET title = ?, description = ?, content = ?, tags = ?, lastModified = ?, isActive = ? WHERE id = ?',
      [prompt.title, prompt.description, prompt.content, tags, prompt.lastModified, prompt.isActive ? 1 : 0, prompt.id]
    );
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

  async toggleHistoryActive(id: string): Promise<void> {
    await this.run(
      'UPDATE upload_history SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END WHERE id = ?',
      [id]
    );
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
