import * as SQLite from 'expo-sqlite';

import type { RecordItem } from '../types/record';
import { toDateKey } from '../utils/time';

type RecordRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  posture: string;
  mood: string;
  sensations: string;
  note: string;
  tags: string;
  created_at: string;
};

const dbPromise = SQLite.openDatabaseAsync('zhan-zhuang.db');

const parseJsonArray = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getRecordDate = (createdAt: string, fallback: string) => {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? fallback : toDateKey(date);
};

const toRecord = (row: RecordRow): RecordItem => ({
  id: row.id,
  date: getRecordDate(row.created_at, row.date),
  startTime: row.start_time,
  endTime: row.end_time,
  duration: row.duration,
  posture: row.posture,
  mood: row.mood,
  sensations: parseJsonArray(row.sensations),
  note: row.note,
  tags: parseJsonArray(row.tags),
  createdAt: new Date(row.created_at),
});

export const initDatabase = async () => {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      posture TEXT NOT NULL,
      mood TEXT NOT NULL,
      sensations TEXT NOT NULL,
      note TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
};

export const listRecords = async () => {
  const db = await dbPromise;
  const rows = await db.getAllAsync<RecordRow>('SELECT * FROM records ORDER BY created_at DESC');
  return rows.map(toRecord);
};

export const insertRecord = async (record: RecordItem) => {
  const db = await dbPromise;
  await db.runAsync(
    `INSERT OR REPLACE INTO records (
      id,
      date,
      start_time,
      end_time,
      duration,
      posture,
      mood,
      sensations,
      note,
      tags,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.date,
      record.startTime,
      record.endTime,
      record.duration,
      record.posture,
      record.mood,
      JSON.stringify(record.sensations),
      record.note,
      JSON.stringify(record.tags),
      record.createdAt.toISOString(),
    ],
  );
};

export const deleteRecord = async (id: string) => {
  const db = await dbPromise;
  await db.runAsync('DELETE FROM records WHERE id = ?', [id]);
};

export const replaceRecords = async (records: RecordItem[]) => {
  const db = await dbPromise;
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM records');
    for (const record of records) {
      await db.runAsync(
        `INSERT OR REPLACE INTO records (
          id,
          date,
          start_time,
          end_time,
          duration,
          posture,
          mood,
          sensations,
          note,
          tags,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.date,
          record.startTime,
          record.endTime,
          record.duration,
          record.posture,
          record.mood,
          JSON.stringify(record.sensations),
          record.note,
          JSON.stringify(record.tags),
          record.createdAt.toISOString(),
        ],
      );
    }
  });
};

export const getSetting = async (key: string) => {
  const db = await dbPromise;
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? '';
};

export const setSetting = async (key: string, value: string) => {
  const db = await dbPromise;
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};
