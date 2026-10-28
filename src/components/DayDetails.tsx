import { Text } from './Typography';
import React from 'react';
import { View } from 'react-native';
import { CivilDate } from '../lib/calendar';
import { almanac } from '../lib/almanac';
import { Card, C, Chip, Icon, s } from './UI';

export function DayDetails({ date }: { date: CivilDate }) {
  const a = almanac(date);
  return <>
    <Card style={{ backgroundColor: '#EDF2E8', borderColor: '#DDE6D5' }}>
      <View style={s.row}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}><View style={{ padding: 9, borderRadius: 13, backgroundColor: '#DDE8D5' }}><Icon name="sparkles-outline" /></View><View style={{ flex: 1 }}><Text style={[s.sectionTitle, { fontSize: 18 }]}>{a.label}</Text><Text style={s.small}>Tiết {a.term.toLowerCase()} · Trực {a.officer.name}</Text></View></View></View>
      <View style={s.divider} />
      <Text style={[s.eyebrow, { color: C.green }]}>GỢI Ý NÊN LÀM</Text>
      <View style={s.wrap}>{a.officer.do.map(x => <Chip key={x} bg="#fff">{x}</Chip>)}</View>
      <Text style={s.small}>Nên cân nhắc: {a.officer.avoid.join(', ').toLowerCase()}.</Text>
      <Text style={[s.small, { fontSize: 11 }]}>Theo quan niệm dân gian, chỉ mang tính tham khảo.</Text>
    </Card>
    <View style={[s.row, { marginTop: 5 }]}><Text style={s.sectionTitle}>Giờ hoàng đạo</Text><Icon name="time-outline" size={20} color={C.muted} /></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{a.hours.map(h => <View key={h.name} style={{ width: '31.7%', flexGrow: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 12, gap: 5 }}><Text style={s.bodyStrong}>{h.name}</Text><Text style={[s.small, { fontSize: 11 }]}>{h.time}</Text></View>)}</View>
    <Text style={[s.small, { fontSize: 10 }]}>Giờ Việt Nam (UTC+7). Giờ Tý đi qua nửa đêm.</Text>
  </>;
}
