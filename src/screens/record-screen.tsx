import { LinearGradient } from 'expo-linear-gradient';
import { Accessibility, ArrowLeft, BookOpenText, Save, Smile, Tags, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ChipRow, FormSection, TopBar, toggleIn } from '../components/ui';
import { moods, sensations, tags } from '../constants/options';
import { colors } from '../constants/theme';
import { styles } from '../styles';
import type { NewRecordInput, RecordItem } from '../types/record';

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
  const saveDisabled = !Number(minutes);
  const title = record ? '修行详情' : '记录修行';
  const saveLabel = record ? '保存修改' : '保存本次修行';
  const summaryLabel = record?.date ?? 'Session Duration';
  const confirmDelete = () => {
    Alert.alert('删除记录', '确定删除这次站桩记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

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
        contentContainerStyle={[styles.recordScroll, { paddingBottom: 116 + insetsBottom }]}
      >
        <View style={styles.recordSummary}>
          <Text style={styles.capsLabel}>{summaryLabel}</Text>
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
          <Text style={styles.recordPosture}>{posture}</Text>
          <View style={styles.summaryLine} />
        </View>

        <FormSection icon={<Accessibility color={colors.outline} size={18} />} title="身体感受">
          <ChipRow options={sensations} selected={selectedSensations} onToggle={toggleIn(selectedSensations, setSelectedSensations)} />
        </FormSection>

        <FormSection icon={<Smile color={colors.outline} size={18} />} title="情绪状态">
          <ChipRow options={moods} selected={[mood]} onToggle={setMood} />
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
          <ChipRow options={tags} selected={selectedTags} onToggle={toggleIn(selectedTags, setSelectedTags)} tag />
        </FormSection>
      </ScrollView>

      <LinearGradient colors={['rgba(253,249,242,0)', 'rgba(253,249,242,0.94)', colors.surface]} style={[styles.saveBar, { paddingBottom: 10 + insetsBottom }]}>
        <View style={styles.saveBarActions}>
          {onDelete && (
            <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
              <Trash2 color={colors.primary} size={20} strokeWidth={1.8} />
              <Text style={styles.deleteText}>删除</Text>
            </Pressable>
          )}
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
    </KeyboardAvoidingView>
  );
}
