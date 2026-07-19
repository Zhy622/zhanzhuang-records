import { BookOpenText, Leaf, Timer } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { BottomTabs, GlassCard } from '../components/ui';
import { colors } from '../constants/theme';
import { styles } from '../styles';
import type { RecordItem } from '../types/record';

const calendarIcon = require('../../assets/figma-calendar-icon.png');
const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function buildCalendarDays(displayDate: Date) {
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstDay + 1;
    if (dayNumber < 1) return { date: new Date(year, month - 1, prevMonthDays + dayNumber), inMonth: false };
    if (dayNumber > daysInMonth) return { date: new Date(year, month + 1, dayNumber - daysInMonth), inMonth: false };
    return { date: new Date(year, month, dayNumber), inMonth: true };
  });
}

function getMonthRecords(records: RecordItem[], displayDate: Date) {
  return records.filter((record) => {
    const recordDate = parseLocalDate(record.date);
    return recordDate.getFullYear() === displayDate.getFullYear() && recordDate.getMonth() === displayDate.getMonth();
  });
}

function getLongestStreak(records: RecordItem[]) {
  const dates = Array.from(new Set(records.map((record) => record.date))).sort();
  let longest = 0;
  let current = 0;
  let previous: Date | undefined;

  dates.forEach((value) => {
    const date = parseLocalDate(value);
    const diff = previous ? Math.round((date.getTime() - previous.getTime()) / 86400000) : 0;
    current = !previous || diff === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = date;
  });

  return longest;
}

function formatMinutes(seconds: number) {
  return `${Math.round(seconds / 60)}分钟`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function CalendarScreen({
  insetsTop,
  insetsBottom,
  records,
  todayKey,
  onOpenRecord,
  onSelectTab,
}: {
  insetsTop: number;
  insetsBottom: number;
  records: RecordItem[];
  todayKey: string;
  onOpenRecord: (record: RecordItem) => void;
  onSelectTab: (tab: 'home' | 'calendar' | 'stats' | 'profile') => void;
}) {
  const [selectedDate, setSelectedDate] = useState(() => parseLocalDate(todayKey));
  const [displayDate, setDisplayDate] = useState(() => parseLocalDate(todayKey));

  useEffect(() => {
    const today = parseLocalDate(todayKey);
    setSelectedDate(today);
    setDisplayDate(today);
  }, [todayKey]);

  const selectedKey = dateKey(selectedDate);
  const selectedRecords = records.filter((record) => record.date === selectedKey);
  const recordDates = new Set(records.map((record) => record.date));
  const monthCells = buildCalendarDays(displayDate);
  const monthRecords = getMonthRecords(records, displayDate);
  const monthSeconds = monthRecords.reduce((sum, record) => sum + record.duration, 0);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.figmaCalendarScroll, { paddingBottom: 118 + insetsBottom }]}>
        <GlassCard style={styles.growthCard}>
          <View>
            <Text style={styles.growthLabel}>修行状态</Text>
            <Text style={styles.growthText}>{records.length ? '持续生长' : '等待发芽'}</Text>
          </View>
          <View style={styles.growthIconCircle}>
            <Leaf color={colors.primary} size={34} strokeWidth={1.6} />
          </View>
        </GlassCard>

        <View style={styles.monthStatsRow}>
          <GlassCard style={styles.monthStatCard}>
            <Text style={styles.monthStatLabel}>本月次数</Text>
            <Text style={styles.monthStatValue}>{monthRecords.length}次</Text>
          </GlassCard>
          <GlassCard style={styles.monthStatCard}>
            <Text style={styles.monthStatLabel}>总时长</Text>
            <Text style={styles.monthStatValue}>{Math.round(monthSeconds / 60)}分钟</Text>
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
            <View style={styles.streakDotDark}><Text style={styles.streakDotText}>+</Text></View>
          </View>
        </GlassCard>

        <GlassCard style={styles.monthCalendarCard}>
          <Image source={calendarIcon} style={styles.monthCalendarBg} />
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{displayDate.getFullYear()} 年 {displayDate.getMonth() + 1} 月</Text>
            <View style={styles.monthArrows}>
              <Pressable onPress={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1))}>
                <Text style={styles.monthArrow}>‹</Text>
              </Pressable>
              <Pressable onPress={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1))}>
                <Text style={styles.monthArrow}>›</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.weekRow}>
            {dayLabels.map((day) => <Text key={day} style={styles.weekLabel}>{day}</Text>)}
          </View>

          <View style={styles.calendarGrid}>
            {monthCells.map(({ date, inMonth }) => {
              const key = dateKey(date);
              const selected = key === selectedKey;
              const hasRecord = recordDates.has(key);

              return (
                <Pressable key={key} onPress={() => setSelectedDate(date)} style={styles.dayCell}>
                  <View style={[styles.dayBubble, selected && styles.dayBubbleSelected]}>
                    <Text style={[styles.dayText, !inMonth && styles.dayTextMuted, selected && styles.dayTextSelected]}>{date.getDate()}</Text>
                    {hasRecord && <View style={[styles.recordDot, selected && styles.recordDotSelected]} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {selectedRecords.length ? selectedRecords.map((record) => (
          <Pressable key={record.id} onPress={() => onOpenRecord(record)} style={({ pressed }) => [styles.selectedRecordCard, pressed && styles.pressed]}>
            <View style={styles.selectedDateBar}>
              <Text style={styles.selectedDateText}>{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 · 星期{dayLabels[selectedDate.getDay()]}</Text>
            </View>
            <View style={styles.selectedRecordBody}>
              <View style={styles.selectedRecordTop}>
                <View>
                  <View style={styles.selectedDurationRow}>
                    <Timer color={colors.outline} size={15} strokeWidth={1.8} />
                    <Text style={styles.selectedDuration}>{formatTime(record.startTime)} · {formatMinutes(record.duration)}</Text>
                  </View>
                </View>
                <View style={styles.selectedPostureIcon}>
                  <Leaf color={colors.primary} size={25} strokeWidth={1.6} />
                </View>
              </View>
              <View style={styles.noteBox}>
                <View style={styles.noteTitleRow}>
                  <BookOpenText color={colors.primary} size={14} strokeWidth={1.8} />
                  <Text style={styles.noteTitle}>心得笔记</Text>
                </View>
                <Text style={styles.selectedNote}>{record.note || '这次练习还没有留下文字心得。'}</Text>
              </View>
            </View>
          </Pressable>
        )) : (
          <GlassCard style={styles.emptyHistoryCard}>
            <Text style={styles.emptyHistoryTitle}>这一天还没有记录</Text>
            <Text style={styles.emptyHistoryText}>完成一次站桩后，会在这里生成修行笔记。</Text>
          </GlassCard>
        )}
      </ScrollView>

      <BottomTabs bottom={insetsBottom} active="calendar" onSelect={onSelectTab} />
    </View>
  );
}
