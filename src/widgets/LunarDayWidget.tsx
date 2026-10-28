import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, lineLimit, containerBackground, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, WidgetEnvironment } from 'expo-widgets';
export type DayWidgetProps = { solar: string; day: string; lunar: string; quote: string; chapter: number; stale?: boolean };
const Layout = (props: DayWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  if (props.stale) return <VStack modifiers={[widgetURL('lichamduong://today')]}><Text>Mở Lịch Âm Dương để cập nhật lịch</Text></VStack>;
  const accessory = environment.widgetFamily.startsWith('accessory');
  const color = environment.colorScheme === 'dark' ? '#EAF0DF' : '#24543E';
  if (environment.widgetFamily === 'accessoryInline') return <Text modifiers={[widgetURL('lichamduong://today')]}>Âm lịch {props.lunar}</Text>;
  if (accessory) return <VStack modifiers={[widgetURL('lichamduong://today')]}><Text modifiers={[font({ weight: 'bold', size: 15 }), lineLimit(1)]}>Âm lịch {props.lunar}</Text><Text modifiers={[font({ size: 11 }), lineLimit(2)]}>{props.quote}</Text></VStack>;
  return <VStack alignment="leading" spacing={7} modifiers={[containerBackground(environment.colorScheme === 'dark' ? '#173E34' : '#FAF4E5', 'widget'), widgetURL('lichamduong://today')]}>
    <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(color)]}>LỊCH ÂM DƯƠNG</Text>
    <HStack spacing={10}><Text modifiers={[font({ size: 44, weight: 'light' }), foregroundStyle(color)]}>{props.day}</Text><VStack alignment="leading"><Text modifiers={[font({ size: 12 }), foregroundStyle(color)]}>{props.solar}</Text><Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(color)]}>Âm {props.lunar}</Text></VStack></HStack>
    {environment.widgetFamily !== 'systemSmall' && <Text modifiers={[font({ size: 13 }), lineLimit(3), foregroundStyle(color)]}>{props.quote}</Text>}
    <Text modifiers={[font({ size: 9 }), foregroundStyle(color)]}>Đạo Đức Kinh · Chương {props.chapter}</Text>
  </VStack>;
};
export default createWidget('LichAmDuongWidget', Layout);
