import { Bell, BookOpenText, Flame, Leaf, Menu, Play } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomTabs, GlassCard, TopBar } from '../components/ui';
import { colors } from '../constants/theme';
import { styles } from '../styles';
import type { RecordItem } from '../types/record';

export function HomeScreen({
  insetsTop,
  insetsBottom,
  latestRecord,
  recordsCount,
  totalSeconds,
  onStart,
  onSelectTab,
}: {
  insetsTop: number;
  insetsBottom: number;
  latestRecord?: RecordItem;
  recordsCount: number;
  totalSeconds: number;
  onStart: () => void;
  onSelectTab: (tab: 'home' | 'calendar') => void;
}) {
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <View style={styles.screen}>
      <TopBar
        top={insetsTop}
        title="Zhan Zhuang"
        left={<Menu color={colors.primary} size={24} strokeWidth={1.8} />}
        right={<Bell color={colors.primary} size={22} strokeWidth={1.8} />}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.homeScroll, { paddingBottom: 120 + insetsBottom }]}>
        <View style={styles.greeting}>
          <Text style={styles.homeHeadline}>今日，静静站一会儿</Text>
          <Text style={styles.homeQuote}>放松肩颈，脚下生根</Text>
        </View>

        <View style={styles.statusSection}>
          <View style={styles.statusAura} />
          <View style={styles.statusCircle}>
            <Text style={styles.statusLabel}>今日状态</Text>
            <Text style={styles.statusText}>{recordsCount ? '已打卡' : '尚未打卡'}</Text>
          </View>
          <Text style={styles.todayMinutes}>
            {totalMinutes} <Text style={styles.todayUnit}>分钟</Text>
          </Text>
          <Text style={styles.capsLabel}>今日已站桩时长</Text>
        </View>

        <Pressable onPress={onStart} style={({ pressed }) => [styles.ctaCard, pressed && styles.pressed]}>
          <View style={styles.ctaPlay}>
            <Play fill={colors.white} color={colors.white} size={32} strokeWidth={2} />
          </View>
          <Text style={styles.ctaTitle}>开始站桩</Text>
          <Text style={styles.ctaSub}>寻回内心的平静</Text>
        </Pressable>

        <View style={styles.bento}>
          <GlassCard style={styles.statCard}>
            <Flame color={colors.primary} size={24} strokeWidth={1.8} />
            <View>
              <Text style={styles.capsLabel}>连续修行</Text>
              <Text style={styles.statValue}>{recordsCount || 0} <Text style={styles.statUnit}>天</Text></Text>
            </View>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Leaf color={colors.secondary} size={24} strokeWidth={1.8} />
            <View>
              <Text style={styles.capsLabel}>累计时长</Text>
              <Text style={styles.statValue}>{totalMinutes} <Text style={styles.statUnit}>分</Text></Text>
            </View>
          </GlassCard>
        </View>

        <GlassCard style={styles.previewCard}>
          <View style={styles.previewTitleRow}>
            <BookOpenText color={colors.primary} size={16} strokeWidth={1.8} />
            <Text style={styles.previewTitle}>最近心得</Text>
          </View>
          <Text style={styles.previewText}>
            {latestRecord?.note || '“呼吸渐渐沉稳，杂念少了一些。双膝微弯时，能感觉到一股暖意从涌泉穴升起...”'}
          </Text>
          <Text style={styles.readMore}>阅读全部  →</Text>
        </GlassCard>
      </ScrollView>

      <BottomTabs bottom={insetsBottom} active="home" onSelect={onSelectTab} />
    </View>
  );
}
