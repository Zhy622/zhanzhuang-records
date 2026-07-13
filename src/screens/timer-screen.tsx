import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Pause, Play, Square, Volume2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import { GlassCard, TopBar } from '../components/ui';
import { postureNames } from '../constants/options';
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
    <LinearGradient colors={['rgba(74,103,65,0.08)', colors.surface, colors.surface]} style={styles.timerScreen}>
      <TopBar
        top={insetsTop}
        title="SESSION IN PROGRESS"
        titleStyle={styles.sessionTitle}
        left={<ArrowLeft color={colors.timerPrimary} size={24} strokeWidth={1.8} />}
        onLeftPress={onBack}
      />

      <View style={[styles.timerContent, { paddingBottom: 24 + insetsBottom }]}>
        <View style={styles.poseInfo}>
          <Text style={styles.timerPose}>当前姿势：{posture}</Text>
          <Text style={styles.capsLabel}>{postureNames[posture] || postureNames.自定义}</Text>
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
            <GlassCard style={styles.sideControlIcon}>
              <Square color={colors.variant} size={23} fill={colors.variant} strokeWidth={1.5} />
            </GlassCard>
            <Text style={styles.controlLabel}>结束</Text>
          </Pressable>

          <Pressable onPress={onPause} style={({ pressed }) => [styles.mainControl, pressed && styles.pressed]}>
            {running ? (
              <Pause color={colors.white} size={38} fill={colors.white} />
            ) : (
              <Play color={colors.white} size={38} fill={colors.white} />
            )}
          </Pressable>

          <View style={styles.sideControl}>
            <GlassCard style={styles.sideControlIcon}>
              <Volume2 color={colors.variant} size={24} strokeWidth={1.6} />
            </GlassCard>
            <Text style={styles.controlLabel}>氛围</Text>
          </View>
        </View>

        <Pressable onPress={onBack}>
          <Text style={styles.exitPractice}>退出练习</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

