import { ArrowLeft, Leaf, LockKeyhole, Phone, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { colors } from '../constants/theme';
import { styles } from '../styles';

const isValidPhone = (value: string) => /^1[3-9]\d{9}$/.test(value);
const cleanPhone = (value: string) => value.replace(/\D/g, '').slice(0, 11);

export function AuthScreen({
  mode,
  insetsTop,
  insetsBottom,
  onSubmit,
  onSwitchMode,
}: {
  mode: 'login' | 'register';
  insetsTop: number;
  insetsBottom: number;
  onSubmit: (name: string, phone: string, password: string) => Promise<string | void>;
  onSwitchMode: () => void;
}) {
  const register = mode === 'register';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const phoneError = phone.length > 0 && !isValidPhone(phone);
  const disabled = !isValidPhone(phone) || !password.trim() || (register && !name.trim());
  const updatePhone = (value: string) => {
    setPhone(cleanPhone(value));
    setSubmitError('');
  };
  const submit = async () => {
    const message = await onSubmit(register ? name.trim() : '', phone, password);
    setSubmitError(message || '');
  };

  return (
    <View style={styles.screen}>
      {register && (
        <Pressable onPress={onSwitchMode} style={[styles.authBack, { top: insetsTop + 12 }]}>
          <ArrowLeft color={colors.primary} size={22} strokeWidth={1.8} />
        </Pressable>
      )}
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          bounces={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.authScroll, { paddingTop: insetsTop + 44, paddingBottom: insetsBottom + 36 }]}
        >

        <View style={styles.authHero}>
          <View style={styles.authMark}>
            <Leaf color={colors.primary} size={34} strokeWidth={1.7} />
          </View>
          <Text style={styles.authTitle}>{register ? '创建账号' : '欢迎回来'}</Text>
          <Text style={styles.authSubtitle}>{register ? '从今天开始，安静记录自己的变化。' : '给自己一点安静的时间。'}</Text>
        </View>

        <View style={styles.authCard}>
          {register && (
            <View style={styles.authField}>
              <View style={styles.authFieldLabelRow}>
                <UserRound color={colors.outline} size={16} strokeWidth={1.8} />
                <Text style={styles.authFieldLabel}>昵称</Text>
              </View>
              <TextInput value={name} onChangeText={(value) => { setName(value); setSubmitError(''); }} style={styles.authInput} placeholder="例如：默白" placeholderTextColor="rgba(115,121,111,0.45)" />
            </View>
          )}

          <View style={styles.authField}>
            <View style={styles.authFieldLabelRow}>
              <Phone color={colors.outline} size={16} strokeWidth={1.8} />
              <Text style={styles.authFieldLabel}>手机号</Text>
            </View>
            <TextInput value={phone} onChangeText={updatePhone} style={styles.authInput} keyboardType="phone-pad" maxLength={11} placeholder="请输入手机号" placeholderTextColor="rgba(115,121,111,0.45)" />
            {phoneError && <Text style={styles.authError}>请输入正确的 11 位手机号</Text>}
          </View>

          <View style={styles.authField}>
            <View style={styles.authFieldLabelRow}>
              <LockKeyhole color={colors.outline} size={16} strokeWidth={1.8} />
              <Text style={styles.authFieldLabel}>密码</Text>
            </View>
            <TextInput value={password} onChangeText={(value) => { setPassword(value); setSubmitError(''); }} style={styles.authInput} secureTextEntry placeholder="请输入密码" placeholderTextColor="rgba(115,121,111,0.45)" />
          </View>

          {submitError && <Text style={styles.authSubmitError}>{submitError}</Text>}

          <Pressable disabled={disabled} onPress={submit} style={({ pressed }) => [styles.authButton, disabled && styles.disabled, pressed && styles.pressed]}>
            <Text style={styles.authButtonText}>{register ? '注册并进入' : '登录'}</Text>
          </Pressable>

          <View style={styles.authSwitchRow}>
            <Text style={styles.authSwitchText}>{register ? '已经有账号？' : '还没有账号？'}</Text>
            <Pressable onPress={onSwitchMode} hitSlop={8}>
              <Text style={styles.authSwitchButton}>{register ? '去登录' : '创建账号'}</Text>
            </Pressable>
          </View>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
