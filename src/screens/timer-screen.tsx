import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Pause, Play, Square } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import { GlassCard, TopBar } from '../components/ui';
import { colors } from '../constants/theme';
import { styles } from '../styles';
import { formatClock } from '../utils/time';

export function TimerScreen({
  elapsed,
  insetsTop,
  insetsBottom,
  posture,
  running,
  onBack,
  onFinish,
  onPause,
}: {
  elapsed: number;
  insetsTop: number;
  insetsBottom: number;
  posture: string;
  running: boolean;
  onBack: () => void;
  onFinish: () => void;
  onPause: () => void;
}) {
  const circumference = 2 * Math.PI * 152;
  const progress = (elapsed % 3600) / 3600;
  const dashOffset = circumference - progress * circumference;

  return (
    <View style={styles.screen}>
      <TopBar
        top={insetsTop}
        title="站桩计时"
        titleStyle={styles.recordTopTitle}
        left={<ArrowLeft color={colors.primary} size={24} strokeWidth={1.8} />}
        onLeftPress={onBack}
      />

      <View style={[styles.timerContent, { paddingBottom: 24 + insetsBottom }]}>
        <View style={styles.poseInfo}>
          <Text style={styles.timerPose}>志守一井 力求汲泉</Text>
          <Text style={styles.capsLabel}>先完成再完美</Text>
        </View>

        <View style={styles.timerCenter}>
          <Svg width={328} height={328} style={styles.timerSvg}>
            <SvgCircle cx={164} cy={164} r={152} stroke="rgba(0,108,82,0.10)" strokeWidth={1.2} fill="none" />
            <SvgCircle
              cx={164}
              cy={164}
              r={152}
              stroke={colors.timerPrimary}
              strokeWidth={1.8}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              rotation="-90"
              origin="164, 164"
            />
          </Svg>
          <View style={styles.timerReadout}>
            <Text style={styles.timerDigits}>{formatClock(elapsed)}</Text>
            <Text style={styles.timerPrompt}>{running ? '深呼吸，感受气息下沉' : '已暂停，保持松静'}</Text>
          </View>
        </View>

        <View style={styles.controlPanel}>
          <Pressable onPress={onFinish} style={styles.sideControl}>
            <GlassCard style={[styles.sideControlIcon, styles.finishControlIcon]}>
              <Square color={colors.variant} size={23} strokeWidth={1.8} />
            </GlassCard>
            <Text style={styles.controlLabel}>结束</Text>
          </Pressable>

          <Pressable onPress={onPause} style={({ pressed }) => [styles.sideControl, pressed && styles.pressed]}>
            <GlassCard style={styles.sideControlIcon}>
              {running ? (
                <Pause color={colors.variant} size={25} strokeWidth={1.8} />
              ) : (
                <Play color={colors.variant} size={25} strokeWidth={1.8} />
              )}
            </GlassCard>
            <Text style={styles.controlLabel}>{running ? '暂停' : '开始'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={onBack}>
          <Text style={styles.exitPractice}>退出练习</Text>
        </Pressable>
      </View>
    </View>
  );
}
