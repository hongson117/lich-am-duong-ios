import { Text, systemFontFamily } from './Typography';
import React, { PropsWithChildren } from 'react';
import { View, Pressable, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform, TextInput, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const C = { bg: '#FAF7EF', paper: '#FFFFFF', ink: '#183F36', muted: '#747E70', green: '#2E6B50', pale: '#EAF0E5', line: '#E6E8DD', coral: '#C56B43', peach: '#FAEBDC', gold: '#B78738', dark: '#173E34' };
export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export function Icon({ name, size = 22, color = C.ink }: { name: IconName; size?: number; color?: string }) { return <Ionicons name={name} size={size} color={color} accessible={false} aria-hidden={true} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />; }
export function IconButton({ name, label, onPress, disabled = false }: { name: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.iconButton, pressed && { backgroundColor: C.pale }, disabled && { opacity: .25 }]}><Icon name={name} /></Pressable>;
}
export function Button({ children, onPress, icon, secondary = false, disabled = false }: PropsWithChildren<{ onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean }>) {
  const label = React.Children.toArray(children).map(c => typeof c === 'string' || typeof c === 'number' ? String(c) : '').join('');
  return <Pressable accessibilityRole="button" accessibilityLabel={label || undefined} onPress={onPress} disabled={disabled} style={({ pressed }) => [s.button, secondary && s.secondary, disabled && { opacity: .4 }, pressed && { opacity: .75, transform: [{ scale: .99 }] }]}>{icon && <Icon name={icon} size={19} color={secondary ? C.ink : '#fff'} />}<Text style={[s.buttonText, secondary && { color: C.ink }]}>{children}</Text></Pressable>;
}
export function Chip({ children, color = C.green, bg = C.pale }: PropsWithChildren<{ color?: string; bg?: string }>) { return <View style={[s.chip, { backgroundColor: bg }]}><Text style={{ color, fontSize: 12, fontWeight: '600' }}>{children}</Text></View>; }
export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) { return <View style={[s.card, style]}>{children}</View>; }
export function Section({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) { return <View style={s.section}><Text style={s.sectionTitle}>{title}</Text>{action && <Pressable accessibilityRole="button" onPress={onPress} style={{ paddingVertical: 10, paddingLeft: 10 }}><Text style={s.link}>{action}  ›</Text></Pressable>}</View>; }
export function Sheet({ visible, title, onClose, children }: PropsWithChildren<{ visible: boolean; title: string; onClose: () => void }>) {
  const insets = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng cửa sổ" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 20), marginTop: insets.top + 20 }]} accessibilityViewIsModal>
        <View style={s.handle} /><View style={[s.row, { paddingHorizontal: 22, marginBottom: 10 }]}><Text style={s.sectionTitle}>{title}</Text><IconButton name="close" label="Đóng" onPress={onClose} /></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 12, gap: 16 }}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
export function Field({ label, value, onChangeText, placeholder, numeric, multiline, maxLength }: { label: string; value: string; onChangeText: (s: string) => void; placeholder?: string; numeric?: boolean; multiline?: boolean; maxLength?: number }) {
  return <View style={{ flex: 1, gap: 8 }}><Text style={s.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#92998C" value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={numeric ? 'number-pad' : 'default'} multiline={multiline} maxLength={maxLength} style={[s.input, multiline && { minHeight: 95, textAlignVertical: 'top' }]} /></View>;
}
export function Choice({ title, description, selected, onPress }: { title: string; description?: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} aria-checked={selected} onPress={onPress} style={[s.choice, selected && { borderColor: C.green, backgroundColor: C.pale }]}><Icon name={selected ? 'radio-button-on' : 'radio-button-off'} color={selected ? C.green : C.muted} size={21} /><View style={{ flex: 1, gap: 3 }}><Text style={s.bodyStrong}>{title}</Text>{description && <Text style={s.small}>{description}</Text>}</View></Pressable>;
}
export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  card: { backgroundColor: C.paper, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: C.line, gap: 12 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  button: { backgroundColor: C.green, borderRadius: 16, paddingHorizontal: 18, minHeight: 50, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  secondary: { backgroundColor: C.pale }, buttonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  chip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6, alignSelf: 'flex-start' },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.ink, letterSpacing: -.5, flexShrink: 1 },
  link: { fontSize: 13, fontWeight: '600', color: C.green },
  title: { fontSize: 29, fontWeight: '700', color: C.ink, letterSpacing: -.9 },
  eyebrow: { color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  body: { fontSize: 14, color: C.muted, lineHeight: 22 },
  bodyStrong: { fontSize: 14, color: C.ink, fontWeight: '600', lineHeight: 21 },
  small: { fontSize: 12, color: C.muted, lineHeight: 19 },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 2 },
  overlay: { flex: 1, backgroundColor: '#102A2666', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 540, maxHeight: '92%', backgroundColor: C.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  handle: { height: 4, width: 38, backgroundColor: '#CED5C7', borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.ink },
  input: { fontFamily: systemFontFamily, borderWidth: 1, borderColor: '#D9DFD2', backgroundColor: '#fff', padding: 14, borderRadius: 13, fontSize: 16, color: C.ink, minHeight: 49 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.line, padding: 12, borderRadius: 14, backgroundColor: '#fff' },
  error: { color: '#AE402F', fontSize: 13, lineHeight: 20 },
});
