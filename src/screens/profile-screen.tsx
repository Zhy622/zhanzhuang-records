import { Check, ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BottomTabs, GlassCard } from '../components/ui';
import { colors } from '../constants/theme';
import { getSetting, setSetting } from '../storage/database';
import { styles } from '../styles';
import type { RecordItem } from '../types/record';

const calendarPath = 'M1.80768 19.1153C1.30255 19.1153 0.874992 18.9403 0.524995 18.5903C0.174998 18.2403 0 17.8128 0 17.3076V3.92307C0 3.41795 0.174998 2.99039 0.524995 2.64039C0.874992 2.29039 1.30255 2.11539 1.80768 2.11539H3.19232V0H4.73075V2.11539H12.3076V0H13.8076V2.11539H15.1922C15.6974 2.11539 16.1249 2.29039 16.4749 2.64039C16.8249 2.99039 16.9999 3.41795 16.9999 3.92307V17.3076C16.9999 17.8128 16.8249 18.2403 16.4749 18.5903C16.1249 18.9403 15.6974 19.1153 15.1922 19.1153H1.80768V19.1153M1.80768 17.6154H15.1922C15.2692 17.6154 15.3397 17.5833 15.4038 17.5192C15.4679 17.4551 15.5 17.3846 15.5 17.3076V7.92307H1.49996V17.3076C1.49996 17.3846 1.53202 17.4551 1.59612 17.5192C1.66023 17.5833 1.73075 17.6154 1.80768 17.6154V17.6154M1.49996 6.42311H15.5V3.92307C15.5 3.84614 15.4679 3.77562 15.4038 3.71152C15.3397 3.64741 15.2692 3.61536 15.1922 3.61536H1.80768C1.73075 3.61536 1.66023 3.64741 1.59612 3.71152C1.53202 3.77562 1.49996 3.84614 1.49996 3.92307V6.42311V6.42311M8.49996 11.6923C8.25509 11.6923 8.04644 11.6061 7.87401 11.4336C7.70157 11.2612 7.61536 11.0525 7.61536 10.8077C7.61536 10.5628 7.70157 10.3542 7.87401 10.1817C8.04644 10.0093 8.25509 9.92307 8.49996 9.92307C8.74483 9.92307 8.95348 10.0093 9.12592 10.1817C9.29835 10.3542 9.38457 10.5628 9.38457 10.8077C9.38457 11.0525 9.29835 11.2612 9.12592 11.4336C8.95348 11.6061 8.74483 11.6923 8.49996 11.6923V11.6923M4.49996 11.6923C4.25509 11.6923 4.04644 11.6061 3.87401 11.4336C3.70157 11.2612 3.61536 11.0525 3.61536 10.8077C3.61536 10.5628 3.70157 10.3542 3.87401 10.1817C4.04644 10.0093 4.25509 9.92307 4.49996 9.92307C4.74483 9.92307 4.95348 10.0093 5.12592 10.1817C5.29835 10.3542 5.38457 10.5628 5.38457 10.8077C5.38457 11.0525 5.29835 11.2612 5.12592 11.4336C4.95348 11.6061 4.74483 11.6923 4.49996 11.6923V11.6923M12.5 11.6923C12.2551 11.6923 12.0464 11.6061 11.874 11.4336C11.7016 11.2612 11.6154 11.0525 11.6154 10.8077C11.6154 10.5628 11.7016 10.3542 11.874 10.1817C12.0464 10.0093 12.2551 9.92307 12.5 9.92307C12.7448 9.92307 12.9535 10.0093 13.1259 10.1817C13.2984 10.3542 13.3846 10.5628 13.3846 10.8077C13.3846 11.0525 13.2984 11.2612 13.1259 11.4336C12.9535 11.6061 12.7448 11.6923 12.5 11.6923V11.6923M8.49996 15.6154C8.25509 15.6154 8.04644 15.5291 7.87401 15.3567C7.70157 15.1843 7.61536 14.9756 7.61536 14.7307C7.61536 14.4859 7.70157 14.2772 7.87401 14.1048C8.04644 13.9324 8.25509 13.8461 8.49996 13.8461C8.74483 13.8461 8.95348 13.9324 9.12592 14.1048C9.29835 14.2772 9.38457 14.4859 9.38457 14.7307C9.38457 14.9756 9.29835 15.1843 9.12592 15.3567C8.95348 15.5291 8.74483 15.6154 8.49996 15.6154V15.6154M4.49996 15.6154C4.25509 15.6154 4.04644 15.5291 3.87401 15.3567C3.70157 15.1843 3.61536 14.9756 3.61536 14.7307C3.61536 14.4859 3.70157 14.2772 3.87401 14.1048C4.04644 13.9324 4.25509 13.8461 4.49996 13.8461C4.74483 13.8461 4.95348 13.9324 5.12592 14.1048C5.29835 14.2772 5.38457 14.4859 5.38457 14.7307C5.38457 14.9756 5.29835 15.1843 5.12592 15.3567C4.95348 15.5291 4.74483 15.6154 4.49996 15.6154V15.6154M12.5 15.6154C12.2551 15.6154 12.0464 15.5291 11.874 15.3567C11.7016 15.1843 11.6154 14.9756 11.6154 14.7307C11.6154 14.4859 11.7016 14.2772 11.874 14.1048C12.0464 13.9324 12.2551 13.8461 12.5 13.8461C12.7448 13.8461 12.9535 13.9324 13.1259 14.1048C13.2984 14.2772 13.3846 14.4859 13.3846 14.7307C13.3846 14.9756 13.2984 15.1843 13.1259 15.3567C12.9535 15.5291 12.7448 15.6154 12.5 15.6154V15.6154';
const clockPath = 'M12.9731 14.0269L14.0269 12.9731L10.2499 9.19589V4.49996H8.74998V9.8038L12.9731 14.0269V14.0269M9.50164 18.9999C8.18771 18.9999 6.95267 18.7506 5.79653 18.2519C4.64039 17.7533 3.63471 17.0765 2.77948 16.2217C1.92426 15.3668 1.2472 14.3616 0.748323 13.206C0.249441 12.0503 0 10.8156 0 9.50164C0 8.18771 0.24933 6.95267 0.74799 5.79653C1.24665 4.64039 1.9234 3.63471 2.77825 2.77948C3.6331 1.92426 4.63833 1.24721 5.79396 0.748323C6.94958 0.249441 8.18436 0 9.49829 0C10.8122 0 12.0473 0.24933 13.2034 0.74799C14.3595 1.24665 15.3652 1.9234 16.2204 2.77825C17.0757 3.6331 17.7527 4.63833 18.2516 5.79396C18.7505 6.94958 18.9999 8.18436 18.9999 9.49829C18.9999 10.8122 18.7506 12.0473 18.2519 13.2034C17.7533 14.3595 17.0765 15.3652 16.2217 16.2204C15.3668 17.0757 14.3616 17.7527 13.206 18.2516C12.0503 18.7505 10.8156 18.9999 9.50164 18.9999V18.9999M9.49996 17.5C11.7166 17.5 13.6041 16.7208 15.1625 15.1625C16.7208 13.6041 17.5 11.7166 17.5 9.49996C17.5 7.2833 16.7208 5.3958 15.1625 3.83746C13.6041 2.27913 11.7166 1.49996 9.49996 1.49996C7.2833 1.49996 5.3958 2.27913 3.83746 3.83746C2.27913 5.3958 1.49996 7.2833 1.49996 9.49996C1.49996 11.7166 2.27913 13.6041 3.83746 15.1625C5.3958 16.7208 7.2833 17.5 9.49996 17.5V17.5';
const bellPath = 'M0 16.3846V14.8846H1.80768V7.42303C1.80768 6.07817 2.22274 4.88907 3.05287 3.85574C3.883 2.82241 4.9487 2.16151 6.24998 1.87305V1.24998C6.24998 0.902765 6.3714 0.60763 6.61423 0.364578C6.85706 0.121526 7.15193 0 7.49883 0C7.84573 0 8.14098 0.121526 8.38457 0.364578C8.62815 0.60763 8.74994 0.902765 8.74994 1.24998V1.87305C10.0512 2.16151 11.1169 2.82241 11.9471 3.85574C12.7772 4.88907 13.1922 6.07817 13.1922 7.42303V14.8846H14.9999V16.3846H0V16.3846M7.49826 19.1922C7.00068 19.1922 6.57529 19.0152 6.22209 18.6612C5.86889 18.3072 5.69229 17.8817 5.69229 17.3846H9.30764C9.30764 17.8833 9.13047 18.3092 8.77614 18.6624C8.4218 19.0156 7.99584 19.1922 7.49826 19.1922V19.1922M3.30764 14.8846H11.6923V7.42303C11.6923 6.26534 11.283 5.27719 10.4644 4.4586C9.6458 3.64001 8.65766 3.23071 7.49996 3.23071C6.34227 3.23071 5.35412 3.64001 4.53553 4.4586C3.71694 5.27719 3.30764 6.26534 3.30764 7.42303V14.8846V14.8846';
const infoPath = 'M8.74998 14.2499H10.2499V8.49996H8.74998V14.2499V14.2499M9.49996 6.78845C9.7256 6.78845 9.91662 6.71072 10.073 6.55527C10.2294 6.39982 10.3076 6.20719 10.3076 5.97739C10.3076 5.7476 10.2306 5.5561 10.0764 5.40289C9.92225 5.24969 9.73122 5.17309 9.50334 5.17309C9.27545 5.17309 9.0833 5.25017 8.9269 5.40433C8.77049 5.55849 8.69229 5.74951 8.69229 5.97739C8.69229 6.20528 8.77049 6.39743 8.9269 6.55383C9.0833 6.71024 9.27433 6.78845 9.49996 6.78845V6.78845M9.50164 18.9999C8.18771 18.9999 6.95267 18.7506 5.79653 18.2519C4.64039 17.7533 3.63471 17.0765 2.77948 16.2217C1.92426 15.3668 1.2472 14.3616 0.748323 13.206C0.249441 12.0503 0 10.8156 0 9.50164C0 8.18771 0.24933 6.95267 0.74799 5.79653C1.24665 4.64039 1.9234 3.63471 2.77825 2.77948C3.6331 1.92426 4.63833 1.24721 5.79396 0.748323C6.94958 0.249441 8.18436 0 9.49829 0C10.8122 0 12.0473 0.24933 13.2034 0.74799C14.3595 1.24665 15.3652 1.9234 16.2204 2.77825C17.0757 3.6331 17.7527 4.63833 18.2516 5.79396C18.7505 6.94958 18.9999 8.18436 18.9999 9.49829C18.9999 10.8122 18.7506 12.0473 18.2519 13.2034C17.7533 14.3595 17.0765 15.3652 16.2217 16.2204C15.3668 17.0757 14.3616 17.7527 13.206 18.2516C12.0503 18.7505 10.8156 18.9999 9.50164 18.9999V18.9999M9.49996 17.5C11.7333 17.5 13.625 16.725 15.175 15.175C16.725 13.625 17.5 11.7333 17.5 9.49996C17.5 7.26663 16.725 5.37496 15.175 3.82496C13.625 2.27496 11.7333 1.49996 9.49996 1.49996C7.26663 1.49996 5.37496 2.27496 3.82496 3.82496C2.27496 5.37496 1.49996 7.26663 1.49996 9.49996C1.49996 11.7333 2.27496 13.625 3.82496 15.175C5.37496 16.725 7.26663 17.5 9.49996 17.5V17.5';

const iconViews = {
  calendar: { width: 17, height: 20, viewBox: '0 0 17 20', path: calendarPath },
  clock: { width: 19, height: 19, viewBox: '0 0 19 19', path: clockPath },
  bell: { width: 15, height: 20, viewBox: '0 0 15 20', path: bellPath },
  info: { width: 19, height: 19, viewBox: '0 0 19 19', path: infoPath },
};

function ProfileIcon({ name, size = 20 }: { name: keyof typeof iconViews; size?: number }) {
  const icon = iconViews[name];

  return (
    <Svg width={size} height={size} viewBox={icon.viewBox}>
      <Path d={icon.path} fill={colors.primary} />
    </Svg>
  );
}

const uniquePracticeDays = (records: RecordItem[]) => new Set(records.map((record) => record.date)).size;
const reminderSettingKey = 'dailyReminderTime';
const L = {
  cannotEnable: '无法开启提醒',
  allowNotification: '请在系统设置中允许通知权限。',
  channelName: '每日修行提醒',
  notificationTitle: '该站桩了',
  notificationBody: '给自己一点安静的时间。',
  savedTitle: '提醒已设置',
  savedBody: '每天 ',
  days: '天',
  hours: '小时',
  totalPractice: '累计修行',
  reminderTitle: '每日修行提醒',
  reminderUnset: '设置每日站桩提醒时间',
  everyDay: '每天 ',
  about: '关于',
  version: '当前版本 v1.4.0',
  logout: '退出登录',
  hour: '小时',
  minute: '分钟',
  disable: '关闭提醒',
  save: '保存',
};

const formatReminder = (hour: number, minute: number) => String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');

async function ensureReminderChannel() {
  // expo-notifications is disabled for Expo Go debugging.
}

async function scheduleReminder(time: string) {
  await ensureReminderChannel();
  console.log('Reminder saved locally for Expo Go debug:', time);
  return true;
}

export function ProfileScreen({
  insetsTop,
  insetsBottom,
  records,
  profileName,
  onLogout,
  onSelectTab,
}: {
  insetsTop: number;
  insetsBottom: number;
  records: RecordItem[];
  profileName: string;
  onLogout: () => void;
  onSelectTab: (tab: 'home' | 'calendar' | 'stats' | 'profile') => void;
}) {
  const practiceDays = uniquePracticeDays(records);
  const totalHours = Math.round(records.reduce((sum, record) => sum + record.duration, 0) / 3600);
  const [reminderTime, setReminderTime] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerHour, setPickerHour] = useState(7);
  const [pickerMinute, setPickerMinute] = useState(0);

  useEffect(() => {
    ensureReminderChannel().catch(console.error);
    getSetting(reminderSettingKey).then((value) => {
      if (!value) return;
      const [hour, minute] = value.split(':').map(Number);
      setReminderTime(value);
      setPickerHour(Number.isFinite(hour) ? hour : 7);
      setPickerMinute(Number.isFinite(minute) ? minute : 0);
    });
  }, []);

  const openReminderPicker = () => {
    if (reminderTime) {
      const [hour, minute] = reminderTime.split(':').map(Number);
      setPickerHour(Number.isFinite(hour) ? hour : 7);
      setPickerMinute(Number.isFinite(minute) ? minute : 0);
    }
    setPickerOpen(true);
  };

  const saveReminder = async () => {
    const time = formatReminder(pickerHour, pickerMinute);
    const scheduled = await scheduleReminder(time);
    if (!scheduled) return;
    await setSetting(reminderSettingKey, time);
    setReminderTime(time);
    setPickerOpen(false);
    Alert.alert(L.savedTitle, L.savedBody + time);
  };

  const disableReminder = async () => {
    await setSetting(reminderSettingKey, '');
    setReminderTime('');
    setPickerOpen(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.profileScroll, { paddingBottom: 112 + insetsBottom }]}>
        <View style={styles.profileHero}>
          <View style={styles.avatarRing}>
            <Image source={require('../../assets/profile-avatar.png')} style={styles.profileAvatar} />
          </View>
          <View style={styles.profileBadge}>
            <Check color={colors.white} size={14} strokeWidth={2.4} />
          </View>
          <Text style={styles.profileName}>{profileName}</Text>
        </View>

        <View style={styles.profileStatsRow}>
          <GlassCard style={styles.profileStatCard}>
            <ProfileIcon name="calendar" size={22} />
            <Text style={styles.profileStatValue}>{practiceDays || 0} {L.days}</Text>
            <Text style={styles.profileStatLabel}>{L.totalPractice}</Text>
          </GlassCard>

          <GlassCard style={styles.profileStatCard}>
            <ProfileIcon name="clock" size={22} />
            <Text style={styles.profileStatValue}>{totalHours || 0} {L.hours}</Text>
            <Text style={styles.profileStatLabel}>{L.totalPractice}</Text>
          </GlassCard>
        </View>

        <Text style={styles.profileSectionTitle}>设置</Text>
        <View style={styles.settingsCard}>
          <Pressable onPress={openReminderPicker} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
            <View style={styles.settingIconBox}><ProfileIcon name="bell" size={20} /></View>
            <View style={styles.settingTextBlock}>
              <Text style={styles.settingTitle}>{L.reminderTitle}</Text>
              <Text style={styles.settingSub}>{reminderTime ? L.everyDay + reminderTime : L.reminderUnset}</Text>
            </View>
            <ChevronRight color={colors.outlineSoft} size={22} strokeWidth={1.8} />
          </Pressable>

          <View style={styles.settingDivider} />

          <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
            <View style={styles.settingIconBox}><ProfileIcon name="info" size={20} /></View>
            <View style={styles.settingTextBlock}>
              <Text style={styles.settingTitle}>{L.about}</Text>
              <Text style={styles.settingSub}>{L.version}</Text>
            </View>
            <ChevronRight color={colors.outlineSoft} size={22} strokeWidth={1.8} />
          </Pressable>
        </View>

        <Pressable onPress={onLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <Text style={styles.logoutText}>{L.logout}</Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.reminderBackdrop}>
          <View style={styles.reminderSheet}>
            <Text style={styles.reminderTitle}>{L.reminderTitle}</Text>
            <Text style={styles.reminderTime}>{formatReminder(pickerHour, pickerMinute)}</Text>
            <View style={styles.reminderStepperRow}>
              <View style={styles.reminderStepperGroup}>
                <Pressable style={styles.reminderStepperButton} onPress={() => setPickerHour((value) => (value + 23) % 24)}>
                  <Text style={styles.reminderStepperText}>-</Text>
                </Pressable>
                <Text style={styles.reminderStepperLabel}>{L.hour}</Text>
                <Pressable style={styles.reminderStepperButton} onPress={() => setPickerHour((value) => (value + 1) % 24)}>
                  <Text style={styles.reminderStepperText}>+</Text>
                </Pressable>
              </View>
              <View style={styles.reminderStepperGroup}>
                <Pressable style={styles.reminderStepperButton} onPress={() => setPickerMinute((value) => (value + 55) % 60)}>
                  <Text style={styles.reminderStepperText}>-</Text>
                </Pressable>
                <Text style={styles.reminderStepperLabel}>{L.minute}</Text>
                <Pressable style={styles.reminderStepperButton} onPress={() => setPickerMinute((value) => (value + 5) % 60)}>
                  <Text style={styles.reminderStepperText}>+</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.reminderActions}>
              <Pressable onPress={disableReminder} style={styles.reminderGhostButton}>
                <Text style={styles.reminderGhostText}>{L.disable}</Text>
              </Pressable>
              <Pressable onPress={saveReminder} style={styles.reminderSaveButton}>
                <Text style={styles.reminderSaveText}>{L.save}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabs bottom={insetsBottom} active="profile" onSelect={onSelectTab} />
    </View>
  );
}
