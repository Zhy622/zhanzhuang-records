export type Screen = 'home' | 'calendar' | 'posture' | 'timer' | 'record' | 'recordDetail';

export type RecordItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  posture: string;
  mood: string;
  sensations: string[];
  note: string;
  tags: string[];
  createdAt: Date;
};

export type NewRecordInput = Omit<RecordItem, 'id' | 'date' | 'startTime' | 'endTime' | 'createdAt'>;
