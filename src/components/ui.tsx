import React from 'react';
import { BarChart3, CalendarDays, Home, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { styles } from '../styles';

export function TopBar({
  top,
  title,
  titleStyle,
  left,
  right,
  onLeftPress,
}: {
  top: number;
  title: string;
  titleStyle?: object;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onLeftPress?: () => void;
}) {
  return (
    <View style={[styles.topBar, { height: top + 64, paddingTop: top + 8 }]}>
      <Pressable onPress={onLeftPress} style={styles.topIcon}>
        {left}
      </Pressable>
      <Text style={[styles.topTitle, titleStyle]}>{title}</Text>
      <View style={styles.topIcon}>{right}</View>
    </View>
  );
}

export function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

export function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.formSection}>
      <View style={styles.sectionLabelRow}>
        {icon}
        <Text style={styles.formLabel}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function ChipRow({
  options,
  selected,
  onToggle,
  tag,
  tone,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  tag?: boolean;
  tone?: 'sensation' | 'mood';
}) {
  return (
    <View style={tag ? styles.tagWrap : styles.chipWrap}>
      {options.map((item) => {
        const active = selected.includes(item);
        const activeChip = tag ? styles.tagActive : tone === 'sensation' ? styles.sensationChipActive : tone === 'mood' ? styles.moodChipActive : styles.chipActive;
        const activeText = tag ? styles.tagTextActive : tone === 'sensation' ? styles.sensationChipTextActive : tone === 'mood' ? styles.moodChipTextActive : styles.chipTextActive;
        return (
          <Pressable key={item} onPress={() => onToggle(item)} style={[tag ? styles.tagChip : styles.chip, active && activeChip]}>
            <Text style={[tag ? styles.tagText : styles.chipText, active && activeText]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const toggleIn = (items: string[], setItems: (value: string[]) => void) => (value: string) => {
  setItems(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
};

export function BottomTabs({
  bottom,
  active,
  onSelect,
}: {
  bottom: number;
  active: 'home' | 'calendar' | 'stats' | 'profile';
  onSelect: (tab: 'home' | 'calendar' | 'stats' | 'profile') => void;
}) {
  return (
    <View style={[styles.bottomTabs, { paddingBottom: Math.max(bottom, 10) }]}>
      <Tab active={active === 'home'} icon={<Home size={24} />} label="首页" onPress={() => onSelect('home')} />
      <Tab active={active === 'calendar'} icon={<CalendarDays size={24} />} label="日历" onPress={() => onSelect('calendar')} />
      <Tab active={active === 'stats'} icon={<BarChart3 size={24} />} label="统计" onPress={() => onSelect('stats')} />
      <Tab active={active === 'profile'} icon={<User size={24} />} label="我的" onPress={() => onSelect('profile')} />
    </View>
  );
}

function Tab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ReactElement<{ color?: string; strokeWidth?: number; fill?: string }>;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const color = active ? colors.primary : 'rgba(67,72,64,0.5)';
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      {icon && (
        <View>
          {React.cloneElement(icon, {
            color,
            strokeWidth: 1.9,
            fill: 'transparent',
          })}
        </View>
      )}
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}
