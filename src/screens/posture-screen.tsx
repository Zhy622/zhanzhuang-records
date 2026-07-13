import { Accessibility, ArrowLeft, CheckCircle, Circle as CircleIcon, Edit3, Leaf } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TopBar } from '../components/ui';
import { postureDescriptions, postures } from '../constants/options';
import { colors } from '../constants/theme';
import { styles } from '../styles';

export function PostureScreen({
  insetsTop,
  insetsBottom,
  selectedPosture,
  onBack,
  onSelectPosture,
  onStart,
}: {
  insetsTop: number;
  insetsBottom: number;
  selectedPosture: string;
  onBack: () => void;
  onSelectPosture: (value: string) => void;
  onStart: () => void;
}) {
  return (
    <View style={styles.screen}>
      <TopBar
        top={insetsTop}
        title="选择桩功"
        titleStyle={styles.postureTopTitle}
        left={<ArrowLeft color={colors.onSurface} size={30} strokeWidth={2} />}
        onLeftPress={onBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.postureScroll, { paddingBottom: 40 + insetsBottom }]}>
        {postures.map((posture) => (
          <PostureOption
            key={posture}
            active={selectedPosture === posture}
            posture={posture}
            onPress={() => {
              onSelectPosture(posture);
              onStart();
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function PostureOption({ posture, active, onPress }: { posture: string; active: boolean; onPress: () => void }) {
  const icon = posture === '无极桩'
    ? <CircleIcon color={colors.timerPrimary} size={28} strokeWidth={2.2} />
    : posture === '浑圆桩'
      ? <Leaf color={colors.timerPrimary} size={28} strokeWidth={2} />
      : posture === '抱球桩'
        ? <Accessibility color={colors.timerPrimary} size={30} strokeWidth={2} />
        : <Edit3 color={colors.timerPrimary} size={27} strokeWidth={2} />;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.postureOption, active && styles.postureOptionActive, pressed && styles.pressed]}>
      <View style={styles.postureIcon}>{icon}</View>
      <View style={styles.postureOptionText}>
        <Text style={styles.postureName}>{posture}</Text>
        <Text style={styles.postureDesc} numberOfLines={2}>{postureDescriptions[posture]}</Text>
      </View>
      {active && <CheckCircle color={colors.timerPrimary} size={31} strokeWidth={2.3} />}
    </Pressable>
  );
}

