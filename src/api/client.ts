import { Platform } from 'react-native';

import type { NewRecordInput, RecordItem } from '../types/record';
import { toDateKey } from '../utils/time';

type ApiUser = {
  id: string;
  phone: string;
  name: string;
};

type ApiRecord = Omit<RecordItem, 'createdAt'> & {
  updatedAt: string;
  createdAt: string;
};

export type AuthSession = {
  token: string;
  user: ApiUser;
};

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

const apiRequest = async <T,>(path: string, token?: string, init: RequestInit = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new Error(message || '请求失败，请稍后再试');
  }
  return data as T;
};

const toRecord = (record: ApiRecord): RecordItem => ({
  ...record,
  createdAt: new Date(record.createdAt),
});

const toRecordBody = (record: NewRecordInput & Pick<RecordItem, 'date' | 'startTime' | 'endTime'>) => ({
  date: record.date,
  startTime: record.startTime,
  endTime: record.endTime,
  duration: record.duration,
  posture: record.posture,
  mood: record.mood,
  sensations: record.sensations,
  note: record.note,
  tags: record.tags,
});

export const api = {
  login: (phone: string, password: string) =>
    apiRequest<AuthSession>('/auth/login', undefined, { method: 'POST', body: JSON.stringify({ phone, password }) }),

  register: (name: string, phone: string, password: string) =>
    apiRequest<AuthSession>('/auth/register', undefined, { method: 'POST', body: JSON.stringify({ name, phone, password }) }),

  me: (token: string) => apiRequest<{ user: ApiUser }>('/me', token),

  logout: (token: string) => apiRequest<{ ok: true }>('/auth/logout', token, { method: 'POST' }),

  listRecords: async (token: string) => {
    const data = await apiRequest<{ records: ApiRecord[] }>('/records', token);
    return data.records.map(toRecord);
  },

  createRecord: async (token: string, input: NewRecordInput, startedAt: Date, endedAt: Date) => {
    const data = await apiRequest<{ record: ApiRecord }>('/records', token, {
      method: 'POST',
      body: JSON.stringify(toRecordBody({ ...input, date: toDateKey(endedAt), startTime: startedAt.toISOString(), endTime: endedAt.toISOString() })),
    });
    return toRecord(data.record);
  },

  updateRecord: async (token: string, current: RecordItem, input: NewRecordInput) => {
    const data = await apiRequest<{ record: ApiRecord }>(`/records/${current.id}`, token, {
      method: 'PUT',
      body: JSON.stringify(toRecordBody({ ...current, ...input })),
    });
    return toRecord(data.record);
  },

  deleteRecord: (token: string, id: string) => apiRequest<{ ok: true }>(`/records/${id}`, token, { method: 'DELETE' }),
};
