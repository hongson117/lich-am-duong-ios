import { Text } from './Typography';
import React, { useState } from 'react';
import { View } from 'react-native';
import { CivilDate, formatDate, parseDate, solarToLunar, lunarToSolar, LunarDate } from '../lib/calendar';
import { Button, Field, Choice, Sheet, Card, s } from './UI';
export function CalendarTool({ kind, date, onClose, onSelect }: { kind: 'jump' | 'convert'; date: CivilDate; onClose: () => void; onSelect: (d: CivilDate) => void }) {
  const [solar, setSolar] = useState(true), [value, setValue] = useState(formatDate(date)), [leap, setLeap] = useState(false);
  const [result, setResult] = useState<{ date: CivilDate; lunar: LunarDate } | null>(null), [error, setError] = useState('');
  const convert = () => {
    setError(''); setResult(null);
    let d: CivilDate | null = null;
    if (solar) d = parseDate(value);
    else { const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value.trim()); if (match) d = lunarToSolar({ day: +match[1], month: +match[2], year: +match[3], leap }); }
    if (!d) { setError(solar ? 'Nhập ngày dương hợp lệ theo dạng DD/MM/YYYY, từ 1900 đến 2100.' : 'Ngày âm không tồn tại. Kiểm tra ngày 30, tháng nhuận và năm (1900–2100).'); return; }
    if (kind === 'jump') { onSelect(d); onClose(); } else setResult({ date: d, lunar: solarToLunar(d) });
  };
  return <Sheet visible title={kind === 'jump' ? 'Đến một ngày' : 'Đổi ngày âm dương'} onClose={onClose}>
    {kind === 'convert' && <><Choice title="Dương lịch → Âm lịch" selected={solar} onPress={() => { setSolar(true); setResult(null); setValue(formatDate(date)); setError(''); }} /><Choice title="Âm lịch → Dương lịch" selected={!solar} onPress={() => { setSolar(false); setResult(null); setValue(formatDate(solarToLunar(date))); setError(''); }} /></>}
    <Field label={solar ? 'Ngày dương (DD/MM/YYYY)' : 'Ngày âm (DD/MM/YYYY)'} value={value} onChangeText={v => { setValue(v); setResult(null); }} placeholder="17/02/2026" maxLength={10} />
    {!solar && <View style={{ gap: 8 }}><Choice title="Tháng thường" selected={!leap} onPress={() => { setLeap(false); setResult(null); }} /><Choice title="Tháng nhuận" selected={leap} onPress={() => { setLeap(true); setResult(null); }} /></View>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Button icon={kind === 'jump' ? 'calendar-outline' : 'swap-horizontal'} onPress={convert}>{kind === 'jump' ? 'Xem ngày' : 'Chuyển đổi'}</Button>
    {result && <Card><Text style={s.bodyStrong}>Dương lịch: {formatDate(result.date)}</Text><Text style={s.bodyStrong}>Âm lịch: {result.lunar.day}/{result.lunar.month}{result.lunar.leap ? ' nhuận' : ''}/{result.lunar.year}</Text><Button secondary onPress={() => { onSelect(result.date); onClose(); }}>Xem trong lịch</Button></Card>}
    <Text style={s.small}>Âm lịch Việt Nam · Múi giờ UTC+7 · 1900–2100</Text>
  </Sheet>;
}
