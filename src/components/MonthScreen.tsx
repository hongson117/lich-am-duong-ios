import { Text } from './Typography';
import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { CivilDate, monthGrid, solarToLunar, dateKey, formatDate, isValidDate, moveMonth, weekday, WEEKDAYS, canChiDay } from '../lib/calendar';
import { almanac, holidays } from '../lib/almanac';
import { Memorial, nextOccurrence } from '../lib/memorials';
import { TabArtwork } from './TabArtwork';
import { C, Card, Button, Chip, IconButton, s } from './UI';
export function MonthScreen({ date, today, onDate, onViewDay, onJump, onConvert, memorials }: { date: CivilDate; today: CivilDate; onDate: (d: CivilDate) => void; onViewDay: () => void; onJump: () => void; onConvert: () => void; memorials: Memorial[] }) {
  const [month, setMonth] = useState(date);
  const grid = useMemo(() => monthGrid(month.month, month.year), [month.month, month.year]);
  const lunar = solarToLunar(date), a = almanac(date);
  const marks = useMemo(() => new Set(memorials.map(m => nextOccurrence(m, { day: 1, month: month.month, year: month.year })).filter(Boolean).map(o => dateKey(o!.date))), [memorials, month.month, month.year]);
  return <>
    <View style={{ gap: 7 }}><Text style={s.eyebrow}>MỘT THÁNG, NHIỀU ĐIỀU ĐẸP</Text><Text style={s.title}>Lịch của bạn.</Text><Text style={s.body}>Ngày dương rõ ràng, ngày âm ngay bên dưới.</Text></View>
    <TabArtwork date={month} offset={0} />
    <Card style={{ padding: 14 }}><View style={s.row}><IconButton name="chevron-back" label="Tháng trước" disabled={!isValidDate(moveMonth(month, -1))} onPress={() => setMonth(moveMonth(month, -1))} /><Pressable accessibilityRole="button" onPress={onJump} style={{ padding: 9 }}><Text style={[s.sectionTitle, { fontSize: 19 }]}>Tháng {month.month}, {month.year}</Text></Pressable><IconButton name="chevron-forward" label="Tháng sau" disabled={!isValidDate(moveMonth(month, 1))} onPress={() => setMonth(moveMonth(month, 1))} /></View>
      <View style={ms.grid}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => <Text key={d} style={[ms.weekday, i === 6 && { color: C.coral }]}>{d}</Text>)}</View>
      <View style={ms.grid}>{grid.map(d => {
        const valid = isValidDate(d), l = valid ? solarToLunar(d) : null;
        const selected = dateKey(d) === dateKey(date), current = dateKey(d) === dateKey(today), isMonth = d.month === month.month;
        const good = valid && almanac(d).quality === 'good';
        const holiday = valid && holidays(d).length > 0;
        const memorial = marks.has(dateKey(d));
        return <Pressable accessibilityRole="button" accessibilityLabel={`Ngày ${formatDate(d)}${l ? `, âm lịch ${l.day}/${l.month}${l.leap ? ' nhuận' : ''}` : ''}`} accessibilityState={{ selected, disabled: !valid }} aria-pressed={selected} disabled={!valid} onPress={() => { onDate(d); if (!isMonth) setMonth(d); }} key={dateKey(d)} style={[ms.cell, selected && ms.selected, current && !selected && ms.current, !isMonth && { opacity: .32 }]}><Text style={[ms.day, (weekday(d) === 0 || holiday) && { color: C.coral }, selected && { color: '#fff' }]}>{d.day}</Text><Text style={[ms.lunar, selected && { color: '#D8E8CE' }]}>{l ? l.day === 1 ? `${l.day}/${l.month}${l.leap ? 'n' : ''}` : l.day : ''}</Text><View style={{ flexDirection: 'row', gap: 3, height: 5 }}>{good && <View style={[ms.dot, { backgroundColor: selected ? '#E4CBA4' : '#70936C' }]} />}{memorial && <View style={[ms.dot, { backgroundColor: selected ? '#fff' : C.coral }]} />}</View></Pressable>;
      })}</View>
      <View style={[s.row, { justifyContent: 'center', gap: 16, marginTop: 7 }]}><Text style={s.small}>🟢 Hoàng đạo</Text><Text style={s.small}>🟠 Ngày giỗ</Text></View>
    </Card>
    <View style={s.row}><View style={{ flex: 1 }}><Button secondary onPress={() => { setMonth(today); onDate(today); }}>Về hôm nay</Button></View><View style={{ flex: 1 }}><Button secondary icon="swap-horizontal" onPress={onConvert}>Đổi âm dương</Button></View></View>
    <Card><View style={s.row}><View style={{ gap: 4 }}><Text style={s.sectionTitle}>{WEEKDAYS[weekday(date)]}, {date.day}/{date.month}</Text><Text style={s.body}>Âm lịch {lunar.day}/{lunar.month}{lunar.leap ? ' nhuận' : ''}/{lunar.year}</Text></View><View style={ms.dateBlock}><Text style={{ fontSize: 32, fontWeight: '600', color: C.green }}>{date.day}</Text></View></View><View style={s.wrap}><Chip>{a.label}</Chip><Chip color={C.coral} bg={C.peach}>{canChiDay(date)}</Chip></View>{holidays(date).map(x => <Text key={x} style={s.bodyStrong}>{x}</Text>)}<Text style={s.small}>Trực {a.officer.name} · Tiết {a.term.toLowerCase()}</Text><Button onPress={onViewDay} icon="sunny-outline">Xem chi tiết ngày</Button></Card>
  </>;
}
const ms = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.2857%', textAlign: 'center', paddingVertical: 11, fontSize: 11, color: C.muted, fontWeight: '600' }, cell: { width: '14.2857%', minHeight: 64, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 4, marginBottom: 3 }, selected: { backgroundColor: C.green }, current: { backgroundColor: C.pale }, day: { fontSize: 17, fontWeight: '600', color: C.ink }, lunar: { fontSize: 10, color: C.muted }, dot: { width: 4, height: 4, borderRadius: 2 }, dateBlock: { padding: 12, backgroundColor: C.pale, borderRadius: 17 } });
