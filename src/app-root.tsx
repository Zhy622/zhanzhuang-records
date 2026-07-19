import { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { postures } from './constants/options';
import { colors } from './constants/theme';
import { AuthScreen } from './screens/auth-screen';
import { CalendarScreen } from './screens/calendar-screen';
import { HomeScreen } from './screens/home-screen';
import { PostureScreen } from './screens/posture-screen';
import { ProfileScreen } from './screens/profile-screen';
import { RecordScreen } from './screens/record-screen';
import { StatsScreen } from './screens/stats-screen';
import { TimerScreen } from './screens/timer-screen';
import { deleteRecord, initDatabase, insertRecord, listRecords } from './storage/database';
import { styles } from './styles';
import type { NewRecordInput, RecordItem, Screen } from './types/record';
import { toDateKey } from './utils/time';

export function ZhanZhuangApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [profileName, setProfileName] = useState('修行者 默白');
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selectedPosture, setSelectedPosture] = useState(postures[1]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(45 * 60);
  const [sessionStartedAt, setSessionStartedAt] = useState(new Date());
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const elapsedRef = useRef(0);
  const elapsedBaseRef = useRef(0);
  const runStartedAtRef = useRef<number | null>(null);
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
    const timer = setInterval(() => {
      setSyncedElapsed(getCurrentElapsed());
    }, 1000);
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
  const primaryScreen = screen === 'home' || screen === 'calendar' || screen === 'stats' || screen === 'profile';
  const getCurrentElapsed = () => {
    if (!runStartedAtRef.current) return elapsedRef.current;
    return elapsedBaseRef.current + Math.floor((Date.now() - runStartedAtRef.current) / 1000);
  };
  const setSyncedElapsed = (value: number) => {
    elapsedRef.current = value;
    setElapsed(value);
  };

  const startPractice = () => {
    const now = new Date();
    setSessionStartedAt(now);
    elapsedBaseRef.current = 0;
    runStartedAtRef.current = now.getTime();
    setSyncedElapsed(0);
    setRunning(true);
    setScreen('timer');
  };

  const finishPractice = () => {
    const finalElapsed = Math.max(getCurrentElapsed(), 1);
    setSyncedElapsed(finalElapsed);
    setRunning(false);
    runStartedAtRef.current = null;
    elapsedBaseRef.current = finalElapsed;
    setSessionDuration(Math.max(finalElapsed, 60));
    setScreen('record');
  };

  const togglePractice = () => {
    if (running) {
      const currentElapsed = getCurrentElapsed();
      setSyncedElapsed(currentElapsed);
      elapsedBaseRef.current = currentElapsed;
      runStartedAtRef.current = null;
      setRunning(false);
      return;
    }

    elapsedBaseRef.current = elapsedRef.current;
    runStartedAtRef.current = Date.now();
    setRunning(true);
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
  const enterApp = (name?: string) => {
    setRecords([]);
    setSelectedRecordId(null);
    if (name) {
      setProfileName(name);
      setScreen('home');
      return;
    }
    setProfileName('修行者 默白');
    setScreen('home');
  };
  const logout = () => {
    setRecords([]);
    setSelectedRecordId(null);
    setScreen('login');
  };
  const leaveTimer = () => {
    setSyncedElapsed(getCurrentElapsed());
    setRunning(false);
    runStartedAtRef.current = null;
    setScreen('home');
  };
  const leaveSecondary = () => {
    if (screen === 'timer') {
      leaveTimer();
      return true;
    }
    if (screen === 'recordDetail') {
      setScreen('calendar');
      return true;
    }
    if (screen === 'register') {
      setScreen('login');
      return true;
    }
    if (screen === 'posture' || screen === 'record') {
      setScreen('home');
      return true;
    }
    return false;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', leaveSecondary);
    return () => subscription.remove();
  }, [screen]);

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      {primaryScreen && Platform.OS !== 'web' && (
        <View pointerEvents="none" style={[styles.nativeTopCleanStrip, { height: Math.min(insets.top + 24, 52) }]} />
      )}
      {screen === 'login' && (
        <AuthScreen
          mode="login"
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          onSubmit={enterApp}
          onSwitchMode={() => setScreen('register')}
        />
      )}
      {screen === 'register' && (
        <AuthScreen
          mode="register"
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          onSubmit={enterApp}
          onSwitchMode={() => setScreen('login')}
        />
      )}
      {screen === 'home' && (
        <HomeScreen
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          latestRecord={latestRecord}
          recordsCount={records.length}
          todayRecordsCount={todayRecords.length}
          todaySeconds={todaySeconds}
          totalSeconds={totalSeconds}
          onStart={startPractice}
          onOpenLatest={() => {
            if (!latestRecord) {
              setScreen('calendar');
              return;
            }
            setSelectedRecordId(latestRecord.id);
            setScreen('recordDetail');
          }}
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
      {screen === 'stats' && (
        <StatsScreen
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          records={records}
          todayKey={todayKey}
          onSelectTab={setScreen}
        />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          insetsTop={insets.top}
          insetsBottom={insets.bottom}
          records={records}
          profileName={profileName}
          onLogout={logout}
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
          onBack={leaveTimer}
          onFinish={finishPractice}
          onPause={togglePractice}
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
