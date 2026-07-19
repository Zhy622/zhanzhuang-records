import { CalendarDays, Sparkles, Timer } from 'lucide-react-native';
import { ImageBackground, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { BottomTabs, GlassCard } from '../components/ui';
import { colors } from '../constants/theme';
import { styles } from '../styles';
import type { RecordItem } from '../types/record';

const insightImage = require('../../assets/stats-insight.png');
const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];
const trendColor = '#7E9B9A';

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getCurrentStreak(records: RecordItem[], todayKey: string) {
  const dateSet = new Set(records.map((record) => record.date));
  let cursor = startOfDay(new Date(`${todayKey}T00:00:00`));
  let streak = 0;

  while (dateSet.has(dateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }

  return streak;
}

function getLastSevenDays(records: RecordItem[], todayKey: string) {
  const today = startOfDay(new Date(`${todayKey}T00:00:00`));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index));
    const key = dateKey(date);
    const seconds = records.filter((record) => record.date === key).reduce((sum, record) => sum + record.duration, 0);
    return { key, label: dayLabels[(date.getDay() + 6) % 7], minutes: Math.round(seconds / 60) };
  });
}

function getTopList(records: RecordItem[], field: 'sensations' | 'tags') {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    record[field].forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([value]) => value);
}

function TrendChart({ points }: { points: { key: string; label: string; minutes: number }[] }) {
  const width = 300;
  const height = 128;
  const bottom = 108;
  const max = Math.max(...points.map((point) => point.minutes), 10);
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: 16 + (index * (width - 32)) / Math.max(points.length - 1, 1),
    y: 16 + (1 - point.minutes / max) * 74,
  }));
  const path = chartPoints.reduce((line, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = chartPoints[index - 1];
    const midX = (previous.x + point.x) / 2;
    return `${line} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
  const areaPath = `${path} L ${chartPoints[chartPoints.length - 1].x} ${bottom} L ${chartPoints[0].x} ${bottom} Z`;

  return (
    <View>
      <View style={styles.trendChart}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <SvgGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={trendColor} stopOpacity="0.14" />
              <Stop offset="1" stopColor={trendColor} stopOpacity="0.01" />
            </SvgGradient>
          </Defs>
          {[0, 1, 2].map((line) => (
            <Line key={line} x1="16" x2="284" y1={24 + line * 32} y2={24 + line * 32} stroke="rgba(112,126,103,0.14)" strokeWidth="1" strokeDasharray="3 7" />
          ))}
          <Path d={areaPath} fill="url(#trendFill)" />
          <Path d={path} fill="none" stroke={trendColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          {chartPoints.map((point, index) => (
            <Circle
              key={point.key}
              cx={point.x}
              cy={point.y}
              r={index === chartPoints.length - 1 ? 5.6 : 3.8}
              fill={index === chartPoints.length - 1 ? colors.surface : trendColor}
              stroke={trendColor}
              strokeWidth={index === chartPoints.length - 1 ? 2.4 : 1.2}
            />
          ))}
        </Svg>
      </View>
      <View style={styles.trendLabels}>
        {points.map((point, index) => (
          <Text key={point.key} style={[styles.trendDayLabel, index === points.length - 1 && styles.trendDayLabelActive]}>{point.label}</Text>
        ))}
      </View>
    </View>
  );
}

export function StatsScreen({
  insetsTop,
  insetsBottom,
  records,
  todayKey,
  onSelectTab,
}: {
  insetsTop: number;
  insetsBottom: number;
  records: RecordItem[];
  todayKey: string;
  onSelectTab: (tab: 'home' | 'calendar' | 'stats' | 'profile') => void;
}) {
  const totalSeconds = records.reduce((sum, record) => sum + record.duration, 0);
  const trend = getLastSevenDays(records, todayKey);
  const keywords = [...getTopList(records, 'sensations'), ...getTopList(records, 'tags')].slice(0, 3);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.statsScroll, { paddingBottom: 118 + insetsBottom }]}>
        <Text style={styles.statsEyebrow}>本周总结</Text>
        <GlassCard style={styles.weeklyInsightCard}>
          <View style={styles.weeklyInsightLine} />
          <Text style={styles.weeklyInsightText}>“这一周，你更容易进入平静状态，身体僵硬感明显减轻。”</Text>
        </GlassCard>

        <View style={styles.statsMetricRow}>
          <GlassCard style={styles.statsMetricCard}>
            <Timer color={colors.primary} size={20} strokeWidth={1.7} />
            <Text style={styles.statsMetricLabel}>总时长</Text>
            <Text style={styles.statsMetricValue}>{(totalSeconds / 3600).toFixed(1)}<Text style={styles.statsMetricUnit}> 小时</Text></Text>
          </GlassCard>
          <GlassCard style={styles.statsMetricCard}>
            <CalendarDays color={colors.primary} size={20} strokeWidth={1.7} />
            <Text style={styles.statsMetricLabel}>连续天数</Text>
            <Text style={styles.statsMetricValue}>{getCurrentStreak(records, todayKey)}<Text style={styles.statsMetricUnit}> 天</Text></Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>站桩时长趋势 (MIN)</Text>
            <Text style={styles.trendRange}>过去7天</Text>
          </View>
          <TrendChart points={trend} />
        </GlassCard>

        <Text style={styles.keywordTitle}>高频关键词</Text>
        <View style={styles.keywordWrap}>
          {(keywords.length ? keywords : ['等待记录']).map((keyword, index) => (
            <View key={keyword} style={styles.keywordChip}>
              <View style={[styles.keywordDot, index === 0 ? styles.keywordDotHot : styles.keywordDotMood]} />
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>

        <ImageBackground source={insightImage} resizeMode="cover" imageStyle={styles.adviceImage} style={styles.adviceCard}>
          <View style={styles.adviceOverlay} />
          <View style={styles.adviceContent}>
            <View style={styles.adviceTitleRow}>
              <Sparkles color={colors.white} size={14} strokeWidth={1.8} />
              <Text style={styles.adviceLabel}>精选建议</Text>
            </View>
            <Text style={styles.adviceText}>下周尝试在黄昏时刻增加 5 分钟的微调。静听风声，一气沉丹田。</Text>
          </View>
        </ImageBackground>
      </ScrollView>

      <BottomTabs bottom={insetsBottom} active="stats" onSelect={onSelectTab} />
    </View>
  );
}
