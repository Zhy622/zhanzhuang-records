import { ArrowLeft, CalendarDays, Clock3, Leaf, MoreVertical, NotebookPen, Waves } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { BottomTabs, GlassCard } from '../components/ui';
import { colors } from '../constants/theme';
import { styles } from '../styles';
import type { RecordItem } from '../types/record';
import { toDateKey } from '../utils/time';

const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const formatMinutes = (seconds: number) => `${Math.round(seconds / 60)}分钟`;
const formatHours = (seconds: number) => `${(seconds / 3600).toFixed(1)} 小时`;

const getMonthCount = (records: RecordItem[], date: Date) => {
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return records.filter((record) => record.date.startsWith(month)).length;
};

const getLongestStreak = (records: RecordItem[]) => {
  const days = [...new Set(records.map((record) => record.date))].sort();
  let longest = 0;
  let current = 0;
  let previous = '';

  days.forEach((day) => {
    const expected = previous ? toDateKey(addDays(new Date(`${previous}T00:00:00`), 1)) : '';
    current = !previous || day === expected ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  });

  return longest;
};

const buildCalendarCells = (selectedDate: Date, recordDates: Set<string>) => {
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const gridStart = addDays(firstDay, -firstDay.getDay());
  const cellCount = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = addDays(gridStart, index);
    const key = toDateKey(date);
    return {
      key,
      date,
      day: date.getDate(),
      muted: date.getMonth() !== selectedDate.getMonth(),
      selected: key === toDateKey(selectedDate),
      hasRecord: recordDates.has(key),
    };
  });
};

export function CalendarScreen({
  insetsTop,
  insetsBottom,
  records,
  onOpenRecord,
  onSelectTab,
}: {
  insetsTop: number;
  insetsBottom: number;
  records: RecordItem[];
  onOpenRecord: (record: RecordItem) => void;
  onSelectTab: (tab: 'home' | 'calendar') => void;
}) {
  const selectedRecord = records[0];
  const initialDate = selectedRecord ? new Date(`${selectedRecord.date}T00:00:00`) : startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    if (selectedRecord) setSelectedDate(new Date(`${selectedRecord.date}T00:00:00`));
  }, [selectedRecord?.id]);

  const changeMonth = (offset: number) => {
    setSelectedDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));
  };

  const recordDates = new Set(records.map((record) => record.date));
  const selectedDayRecords = records.filter((record) => record.date === toDateKey(selectedDate));
  const primaryRecord = selectedDayRecords[0];
  const calendarCells = buildCalendarCells(selectedDate, recordDates);
  const totalSeconds = records.reduce((sum, record) => sum + record.duration, 0);

  return (
    <View style={styles.screen}>
      <View style={[styles.calendarHeader, { paddingTop: insetsTop + 14 }]}>
        <ArrowLeft color={colors.primary} size={24} strokeWidth={1.9} />
        <Text style={styles.calendarHeaderTitle}>修行日历</Text>
        <MoreVertical color={colors.primary} size={24} strokeWidth={1.9} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.figmaCalendarScroll, { paddingBottom: 116 + insetsBottom }]}>
        <GlassCard style={styles.growthCard}>
          <View>
            <Text style={styles.growthLabel}>修行状态</Text>
            <Text style={styles.growthText}>{records.length ? '持续生长' : '等待发芽'}</Text>
          </View>
          <View style={styles.growthIconCircle}>
            <Leaf color={colors.primary} fill={colors.primary} size={26} strokeWidth={1.5} />
          </View>
        </GlassCard>

        <View style={styles.monthStatsRow}>
          <GlassCard style={styles.monthStatCard}>
            <Text style={styles.monthStatLabel}>本月次数</Text>
            <Text style={styles.monthStatValue}>{getMonthCount(records, selectedDate)}次</Text>
          </GlassCard>
          <GlassCard style={styles.monthStatCard}>
            <Text style={styles.monthStatLabel}>总时长</Text>
            <Text style={styles.monthStatValue}>{formatHours(totalSeconds)}</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.streakCard}>
          <View>
            <Text style={styles.monthStatLabel}>最长连续</Text>
            <Text style={styles.monthStatValue}>{getLongestStreak(records)} 天</Text>
          </View>
          <View style={styles.streakDots}>
            <View style={[styles.streakDot, styles.streakDotLight]} />
            <View style={styles.streakDot} />
            <View style={styles.streakDotDark}>
              <Text style={styles.streakDotText}>+12</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.monthCalendarCard}>
          <Image source={require('../../assets/figma-calendar-icon.png')} style={styles.monthCalendarBg} />
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{selectedDate.getFullYear()} 年 {selectedDate.getMonth() + 1} 月</Text>
            <View style={styles.monthArrows}>
              <Pressable onPress={() => changeMonth(-1)} hitSlop={10}>
                <Text style={styles.monthArrow}>‹</Text>
              </Pressable>
              <Pressable onPress={() => changeMonth(1)} hitSlop={10}>
                <Text style={styles.monthArrow}>›</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.weekRow}>
            {dayLabels.map((day) => (
              <Text key={day} style={styles.weekLabel}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarCells.map((cell) => (
              <View key={cell.key} style={styles.dayCell}>
                <Pressable
                  onPress={() => setSelectedDate(cell.date)}
                  style={({ pressed }) => [styles.dayBubble, cell.selected && styles.dayBubbleSelected, pressed && styles.pressed]}
                >
                  <Text style={[styles.dayText, cell.muted && styles.dayTextMuted, cell.selected && styles.dayTextSelected]}>{cell.day}</Text>
                  {cell.hasRecord && <View style={[styles.recordDot, cell.selected && styles.recordDotSelected]} />}
                </Pressable>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.selectedRecordCard}>
          <View style={styles.selectedDateBar}>
            <Text style={styles.selectedDateText}>
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 · 星期{dayLabels[selectedDate.getDay()]}
            </Text>
          </View>

          {primaryRecord ? (
            <Pressable onPress={() => onOpenRecord(primaryRecord)} style={({ pressed }) => [styles.selectedRecordBody, pressed && styles.pressed]}>
              <View style={styles.selectedRecordTop}>
                <View>
                  <Text style={styles.selectedPosture}>{primaryRecord.posture}</Text>
                  <View style={styles.selectedDurationRow}>
                    <Clock3 color={colors.variant} size={17} strokeWidth={1.7} />
                    <Text style={styles.selectedDuration}>{formatMinutes(primaryRecord.duration)}</Text>
                  </View>
                </View>
                <View style={styles.selectedPostureIcon}>
                  <Waves color={colors.primary} size={24} strokeWidth={2} />
                </View>
              </View>

              <View style={styles.noteBox}>
                <View style={styles.noteTitleRow}>
                  <NotebookPen color={colors.primary} size={14} strokeWidth={1.7} />
                  <Text style={styles.noteTitle}>心得笔记</Text>
                </View>
                <Text style={styles.selectedNote} numberOfLines={4}>{primaryRecord.note}</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.selectedRecordBody}>
              <Text style={styles.emptyHistoryTitle}>这一天还没有记录</Text>
              <Text style={styles.emptyHistoryText}>完成一次站桩后，会在这里生成修行笔记。</Text>
            </View>
          )}
        </GlassCard>
      </ScrollView>

      <BottomTabs bottom={insetsBottom} active="calendar" onSelect={onSelectTab} />
    </View>
  );
}
