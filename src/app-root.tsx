import { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { postures } from './constants/options';
import { colors } from './constants/theme';
import { CalendarScreen } from './screens/calendar-screen';
import { HomeScreen } from './screens/home-screen';
import { PostureScreen } from './screens/posture-screen';
import { RecordScreen } from './screens/record-screen';
import { TimerScreen } from './screens/timer-screen';
import { deleteRecord, initDatabase, insertRecord, listRecords } from './storage/database';
import { styles } from './styles';
import type { NewRecordInput, RecordItem, Screen } from './types/record';
import { toDateKey } from './utils/time';

export function ZhanZhuangApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selectedPosture, setSelectedPosture] = useState(postures[1]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(45 * 60);
  const [sessionStartedAt, setSessionStartedAt] = useState(new Date());
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let mounted = true;
    initDatabase()
      .then(listRecords)
      .then((items) => {
        if (mounted) setRecords(items);
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (screen !== 'timer' || !running) return;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [running, screen]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextTodayKey = toDateKey(new Date());
      setTodayKey((current) => (current === nextTodayKey ? current : nextTodayKey));
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSeconds = records.reduce((sum, item) => sum + item.duration, 0);
  const todayRecords = records.filter((record) => record.date === todayKey);
  const todaySeconds = todayRecords.reduce((sum, item) => sum + item.duration, 0);
  const latestRecord = records[0];
  const selectedRecord = records.find((record) => record.id === selectedRecordId);

  const startPractice = () => {
    setSessionStartedAt(new Date());
    setElapsed(0);
    setRunning(true);
    setScreen('timer');
  };

  const finishPractice = () => {
    setRunning(false);
    setSessionDuration(Math.max(elapsed, 60));
    setScreen('record');
  };

  const saveRecord = async (record: NewRecordInput) => {
    const createdAt = new Date();
    const savedRecord: RecordItem = {
      ...record,
      id: String(Date.now()),
      date: toDateKey(createdAt),
      startTime: sessionStartedAt.toISOString(),
      endTime: createdAt.toISOString(),
      createdAt,
    };

    setRecords((items) => [savedRecord, ...items]);
    await insertRecord(savedRecord);
    setScreen('home');
  };

  const updateRecord = async (record: NewRecordInput) => {
    if (!selectedRecord) return;
    const updatedRecord: RecordItem = { ...selectedRecord, ...record };

    setRecords((items) => items.map((item) => (item.id === updatedRecord.id ? updatedRecord : item)));
    await insertRecord(updatedRecord);
    setScreen('calendar');
  };

  const removeRecord = async () => {
    if (!selectedRecord) return;

    setRecords((items) => items.filter((item) => item.id !== selectedRecord.id));
    await deleteRecord(selectedRecord.id);
    setSelectedRecordId(null);
    setScreen('calendar');
  };

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      {screen === 'home' && (
        <HomeScreen
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          latestRecord={latestRecord}
          recordsCount={records.length}
          todayRecordsCount={todayRecords.length}
          todaySeconds={todaySeconds}
          totalSeconds={totalSeconds}
          onStart={() => setScreen('posture')}
          onSelectTab={setScreen}
        />
      )}
      {screen === 'calendar' && (
        <CalendarScreen
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          records={records}
          todayKey={todayKey}
          onOpenRecord={(record) => {
            setSelectedRecordId(record.id);
            setScreen('recordDetail');
          }}
          onSelectTab={setScreen}
        />
      )}
      {screen === 'posture' && (
        <PostureScreen
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          selectedPosture={selectedPosture}
          onBack={() => setScreen('home')}
          onSelectPosture={setSelectedPosture}
          onStart={startPractice}
        />
      )}
      {screen === 'timer' && (
        <TimerScreen
          elapsed={elapsed}
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          posture={selectedPosture}
          running={running}
          onBack={() => {
            setRunning(false);
            setScreen('home');
          }}
          onFinish={finishPractice}
          onPause={() => setRunning((value) => !value)}
        />
      )}
      {screen === 'record' && (
        <RecordScreen
          duration={sessionDuration}
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          posture={selectedPosture}
          onBack={() => setScreen('home')}
          onSave={saveRecord}
        />
      )}
      {screen === 'recordDetail' && selectedRecord && (
        <RecordScreen
          duration={selectedRecord.duration}
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          posture={selectedRecord.posture}
          record={selectedRecord}
          onBack={() => setScreen('calendar')}
          onDelete={removeRecord}
          onSave={updateRecord}
        />
      )}
    </View>
  );
}
