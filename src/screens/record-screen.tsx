import { LinearGradient } from 'expo-linear-gradient';
import { Activity, ArrowLeft, BookOpenText, Check, Save, Smile, Tags } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ChipRow, FormSection, TopBar, toggleIn } from '../components/ui';
import { moods, sensations, tags } from '../constants/options';
import { colors } from '../constants/theme';
import { styles } from '../styles';
import type { NewRecordInput, RecordItem } from '../types/record';

const detailImage = require('../../assets/record-detail-image.png');
const lotusImage = require('../../assets/record-detail-lotus.png');
const editPath = 'M1.49996 15.5H2.76149L12.9981 5.26339L11.7365 4.00186L1.49996 14.2384V15.5V15.5M0 16.9999V13.6154L13.1904 0.430759C13.3416 0.293415 13.5086 0.187286 13.6913 0.112372C13.874 0.0374573 14.0656 0 14.2661 0C14.4666 0 14.6608 0.0355759 14.8488 0.106728C15.0367 0.177879 15.2032 0.291018 15.348 0.446143L16.5692 1.68267C16.7243 1.82754 16.8349 1.99423 16.9009 2.18275C16.9669 2.37127 16.9999 2.55979 16.9999 2.74831C16.9999 2.9494 16.9656 3.1413 16.8969 3.32402C16.8282 3.50674 16.719 3.67371 16.5692 3.82493L3.38455 16.9999H0V16.9999M15.5096 2.74611V2.74611L14.2538 1.49035V1.49035L15.5096 2.74611V2.74611M12.3562 4.64369L11.7365 4.00186V4.00186L12.9981 5.26339V5.26339L12.3562 4.64369V4.64369';
const deletePath = 'M2.80768 16.8845C2.30896 16.8845 1.88301 16.7079 1.5298 16.3547C1.1766 16.0015 1 15.5756 1 15.0769V2.38457H0V0.884607H4.49996V0H10.5V0.884607H14.9999V2.38457H13.9999V15.0769C13.9999 15.582 13.8249 16.0095 13.4749 16.3595C13.1249 16.7095 12.6974 16.8845 12.1922 16.8845H2.80768V16.8845M12.5 2.38457H2.49996V15.0769C2.49996 15.1666 2.52881 15.2403 2.58651 15.298C2.6442 15.3557 2.71793 15.3846 2.80768 15.3846H12.1922C12.2692 15.3846 12.3397 15.3525 12.4038 15.2884C12.4679 15.2243 12.5 15.1538 12.5 15.0769V2.38457V2.38457M4.90384 13.3846H6.4038V4.38457H4.90384V13.3846V13.3846M8.59612 13.3846H10.0961V4.38457H8.59612V13.3846V13.3846M2.49996 2.38457V2.38457V15.0769C2.49996 15.1666 2.49996 15.2403 2.49996 15.298C2.49996 15.3557 2.49996 15.3846 2.49996 15.3846V15.3846C2.49996 15.3846 2.49996 15.3557 2.49996 15.298C2.49996 15.2403 2.49996 15.1666 2.49996 15.0769V2.38457V2.38457';

function DetailIcon({ type }: { type: 'edit' | 'delete' }) {
  return (
    <Svg width={type === 'edit' ? 17 : 15} height={17} viewBox={type === 'edit' ? '0 0 17 17' : '0 0 15 17'}>
      <Path d={type === 'edit' ? editPath : deletePath} fill={type === 'edit' ? '#3C4A43' : 'rgba(186,26,26,0.7)'} />
    </Svg>
  );
}

function formatRecordDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月${date.getDate()}日`;
}

export function RecordScreen({
  duration,
  insetsTop,
  insetsBottom,
  posture,
  record,
  onBack,
  onDelete,
  onSave,
}: {
  duration: number;
  insetsTop: number;
  insetsBottom: number;
  posture: string;
  record?: RecordItem;
  onBack: () => void;
  onDelete?: () => void;
  onSave: (record: NewRecordInput) => void;
}) {
  const [minutes, setMinutes] = useState(String(Math.round(duration / 60)));
  const [mood, setMood] = useState(record?.mood ?? moods[0]);
  const [selectedSensations, setSelectedSensations] = useState<string[]>(record?.sensations ?? [sensations[0]]);
  const [selectedTags, setSelectedTags] = useState<string[]>(record?.tags ?? [tags[2]]);
  const [note, setNote] = useState(record?.note ?? '');
  const [editing, setEditing] = useState(!record);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const saveDisabled = !Number(minutes);
  const title = record ? '站桩详情' : '记录修行';
  const saveLabel = record ? '保存修改' : '保存本次修行';
  const summaryLabel = record?.date ?? 'Session Duration';
  const confirmDelete = () => {
    Alert.alert('删除记录', '确定删除这次站桩记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };
  const toggleAndDismiss = (toggle: (value: string) => void) => (value: string) => {
    Keyboard.dismiss();
    toggle(value);
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (record && !editing) {
    const recordMinutes = Math.round(record.duration / 60);
    const detailTags = [...record.sensations.slice(0, 2), record.mood];

    return (
      <View style={styles.screen}>
        <TopBar
          top={insetsTop}
          title="站桩详情"
          titleStyle={styles.recordTopTitle}
          left={<ArrowLeft color={colors.primary} size={24} strokeWidth={1.8} />}
          onLeftPress={onBack}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.detailScroll, { paddingBottom: 112 + insetsBottom }]}>
          <View style={styles.detailDurationWrap}>
            <View style={styles.detailDurationOuter}>
              <View style={styles.detailDurationInner}>
                <Text style={styles.detailDurationLabel}>时长</Text>
                <Text style={styles.detailDurationValue}>{recordMinutes}</Text>
                <Text style={styles.detailDurationUnit}>分钟</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailTagRow}>
            {detailTags.map((tag) => (
              <Text key={tag} style={styles.detailTag}># {tag}</Text>
            ))}
          </View>

          <View style={styles.detailNoteCard}>
            <View style={styles.detailNoteLine} />
            <Text style={styles.detailNoteText}>{record.note || '今日在窗边站桩，微风徐徐。心境非常平和。'}</Text>
            <Image source={lotusImage} style={styles.detailLotus} />
            <Text style={styles.detailDate}>— {formatRecordDate(record.date)}</Text>
          </View>

          <Image source={detailImage} style={styles.detailImage} />
        </ScrollView>

        <View style={[styles.detailBottomBar, { paddingBottom: 18 + insetsBottom }]}>
          <View style={styles.detailLeftActions}>
            <Pressable onPress={() => setEditing(true)} style={({ pressed }) => [styles.detailIconButton, pressed && styles.pressed]}>
              <DetailIcon type="edit" />
            </Pressable>
            {onDelete && (
              <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.detailIconButton, pressed && styles.pressed]}>
                <DetailIcon type="delete" />
              </Pressable>
            )}
          </View>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.detailDoneButton, pressed && styles.pressed]}>
            <Check color={colors.white} size={24} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar
        top={insetsTop}
        title={title}
        titleStyle={styles.recordTopTitle}
        left={<ArrowLeft color={colors.primary} size={24} strokeWidth={1.8} />}
        onLeftPress={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.recordScroll, { paddingBottom: 116 + insetsBottom }]}
      >
        <View style={styles.recordSummary}>
          <View style={styles.recordHeroRow}>
            <Text style={styles.recordHeroText}>本次站桩</Text>
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
              style={styles.inlineMinutes}
            />
            <Text style={styles.recordHeroText}>分钟</Text>
          </View>
          <View style={styles.summaryLine} />
        </View>

        <FormSection icon={<Activity color={colors.outline} size={18} strokeWidth={1.8} />} title="身体感受">
          <ChipRow options={sensations} selected={selectedSensations} onToggle={toggleAndDismiss(toggleIn(selectedSensations, setSelectedSensations))} tone="sensation" />
        </FormSection>

        <FormSection icon={<Smile color={colors.outline} size={18} />} title="情绪状态">
          <ChipRow options={moods} selected={[mood]} onToggle={toggleAndDismiss(setMood)} tone="mood" />
        </FormSection>

        <FormSection icon={<BookOpenText color={colors.outline} size={18} />} title="心得体会">
          <TextInput
            value={note}
            onChangeText={setNote}
            style={styles.noteInput}
            multiline
            textAlignVertical="top"
            placeholder="此刻的心得体会..."
            placeholderTextColor="rgba(115,121,111,0.45)"
          />
        </FormSection>

        <FormSection icon={<Tags color={colors.outline} size={18} />} title="关注点">
          <ChipRow options={tags} selected={selectedTags} onToggle={toggleAndDismiss(toggleIn(selectedTags, setSelectedTags))} tag />
        </FormSection>
      </ScrollView>

      {!keyboardOpen && (
        <LinearGradient colors={['rgba(253,249,242,0)', 'rgba(253,249,242,0.94)', colors.surface]} style={[styles.saveBar, { paddingBottom: 10 + insetsBottom }]}>
          <View style={styles.saveBarActions}>
            <Pressable
              disabled={saveDisabled}
              style={({ pressed }) => [styles.saveButton, saveDisabled && styles.disabled, pressed && styles.pressed]}
              onPress={() =>
                onSave({
                  duration: Math.max(1, Number(minutes)) * 60,
                  posture,
                  mood,
                  sensations: selectedSensations,
                  tags: selectedTags,
                  note: note.trim() || '完成了一次安静的站桩。',
                })
              }
            >
              <Save color={colors.white} size={20} fill={colors.white} />
              <Text style={styles.saveText}>{saveLabel}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      )}
    </KeyboardAvoidingView>
  );
}
