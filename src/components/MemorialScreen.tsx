import { Text } from './Typography';
import React, { useMemo, useState } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { villageArtwork } from '../data/artwork';
import { LinearGradient } from 'expo-linear-gradient';
import { CivilDate, formatDate } from '../lib/calendar';
import { Memorial, nextOccurrence, validateMemorial } from '../lib/memorials';
import { C, Card, Button, Chip, Icon, IconButton, Field, Sheet, Choice, s } from './UI';

export function MemorialScreen({ memorials, today, onEdit, onPlan, onAdd, ready }: { memorials: Memorial[]; today: CivilDate; onEdit: (m: Memorial) => void; onPlan: (m: Memorial, year: number) => void; onAdd: () => void; ready: boolean }) {
  const items = useMemo(() => memorials.map(m => ({ m, occurrence: nextOccurrence(m, today) })).sort((a, b) => (a.occurrence?.days ?? Infinity) - (b.occurrence?.days ?? Infinity)), [memorials, today]);
  return <>
    <View style={{ gap: 7 }}><Text style={s.eyebrow}>GÌN GIỮ NẾP NHÀ</Text><Text style={s.title}>Ngày thương nhớ.</Text><Text style={s.body}>Dẫu tháng năm đổi thay, yêu thương vẫn ở lại.</Text></View>
    <ImageBackground imageStyle={{ width: '100%', height: '100%' }} source={villageArtwork(today, 7).image} style={{ borderRadius: 24, overflow: 'hidden', minHeight: 185, justifyContent: 'flex-end' }} resizeMode="cover"><LinearGradient colors={['#173E3400', '#173E34EE']} style={StyleSheet.absoluteFill} /><View style={{ padding: 23, gap: 7 }}><Icon name="flower-outline" color="#F4D7A1" size={28} /><Text style={{ color: '#fff', fontSize: 23, fontWeight: '600' }}>Một ngày nhớ. Một đời thương.</Text><Text style={{ color: '#E0E9D5', fontSize: 12, lineHeight: 19 }}>Lưu một lần theo âm lịch,{ '\n' }để mỗi năm đều nhớ ngày trở về.</Text></View></ImageBackground>
    <View style={s.row}><Text style={s.sectionTitle}>Ngày giỗ gia đình</Text><Chip>{memorials.length} ngày đã lưu</Chip></View>
    {!items.length && <Card style={{ alignItems: 'center', paddingVertical: 30, gap: 13 }}><View style={{ padding: 20, borderRadius: 40, backgroundColor: C.peach }}><Icon name="leaf-outline" color={C.coral} size={32} /></View><Text style={[s.sectionTitle, { fontSize: 19 }]}>Giữ một nếp nhà</Text><Text style={[s.body, { textAlign: 'center' }]}>Thêm ngày giỗ của người thân.{ '\n' }Ứng dụng tự đổi sang ngày dương mỗi năm.</Text></Card>}
    {items.map(({ m, occurrence: o }) => <Card key={m.id}><View style={s.row}><View style={{ flex: 1, gap: 4 }}><Text style={[s.sectionTitle, { fontSize: 19 }]}>{m.name}</Text>{!!m.relation && <Text style={s.small}>{m.relation}</Text>}</View><IconButton name="create-outline" label={`Sửa ngày giỗ ${m.name}`} onPress={() => onEdit(m)} /></View><View style={s.row}><View style={{ gap: 4 }}><Text style={s.bodyStrong}>{m.day}/{m.month} âm lịch</Text><Text style={s.small}>{o ? `${formatDate(o.date)} dương lịch${o.leap ? ' · tháng nhuận' : ''}` : 'Ngoài phạm vi lịch hỗ trợ'}</Text></View>{o && <Chip color={o.days <= 30 ? C.coral : C.green} bg={o.days <= 30 ? C.peach : C.pale}>{o.days === 0 ? 'Hôm nay' : `Còn ${o.days} ngày`}</Chip>}</View>{o?.adjusted && <Text style={s.small}>Tháng này chỉ có 29 ngày: {m.shortMonthPolicy === 'last-day' ? 'lấy ngày cuối tháng' : 'chuyển sang mùng 1 tháng kế tiếp'}.</Text>}{!!m.note && <Text style={s.body} numberOfLines={3}>{m.note}</Text>}{o && <Button secondary icon="list-outline" onPress={() => onPlan(m, o.lunarYear)}>Sổ chuẩn bị giỗ {o.lunarYear}</Button>}{Object.keys(m.plans ?? {}).map(Number).filter(y => y !== o?.lunarYear).sort((a, b) => b - a).map(y => <Button key={y} secondary onPress={() => onPlan(m, y)}>Xem sổ năm {y}</Button>)}</Card>)}
    <Button onPress={onAdd} icon="add" disabled={!ready}>Thêm ngày giỗ</Button>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 6 }}><Icon name="shield-checkmark-outline" size={17} color={C.muted} /><Text style={[s.small, { flex: 1 }]}>Lưu riêng trên thiết bị, dùng được khi không có mạng. Bạn có thể sao lưu trong mục Tiện ích.</Text></View>
  </>;
}

export function MemorialEditor({ value, onSave, onDelete, onClose }: { value: Memorial | null; onSave: (m: Memorial) => Promise<void>; onDelete: (id: string) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState(value?.name ?? ''); const [relation, setRelation] = useState(value?.relation ?? '');
  const [day, setDay] = useState(value ? String(value.day) : ''); const [month, setMonth] = useState(value ? String(value.month) : '');
  const [note, setNote] = useState(value?.note ?? '');
  const [leap, setLeap] = useState<Memorial['leapPolicy']>(value?.leapPolicy ?? 'regular');
  const [short, setShort] = useState<Memorial['shortMonthPolicy']>(value?.shortMonthPolicy ?? 'last-day');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [confirmDelete, setConfirmDelete] = useState(false);
  const save = async () => {
    const record: Memorial = { ...value, id: value?.id ?? `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name: name.trim(), relation: relation.trim(), day: Number(day), month: Number(month), note: note.trim(), leapPolicy: leap, shortMonthPolicy: short, createdAt: value?.createdAt ?? new Date().toISOString() };
    if (!validateMemorial(record)) { setError('Nhập tên người thân, ngày từ 1–30 và tháng âm lịch từ 1–12.'); return; }
    setBusy(true); setError('');
    try { await onSave(record); onClose(); } catch { setError('Chưa lưu được dữ liệu. Vui lòng thử lại; thông tin bạn nhập vẫn được giữ.'); } finally { setBusy(false); }
  };
  const remove = async () => { if (!value) return; setBusy(true); try { await onDelete(value.id); onClose(); } catch { setError('Không thể xóa lúc này. Vui lòng thử lại.'); } finally { setBusy(false); } };
  return <Sheet visible title={value ? 'Sửa ngày giỗ' : 'Thêm ngày giỗ'} onClose={() => { if (!busy) onClose(); }}>
    <Field label="Tên người thân" value={name} onChangeText={setName} placeholder="Ví dụ: Ông nội" maxLength={120} />
    <Field label="Mối quan hệ (không bắt buộc)" value={relation} onChangeText={setRelation} placeholder="Ví dụ: Gia đình bên nội" maxLength={80} />
    <View style={[s.row, { alignItems: 'flex-start' }]}><Field label="Ngày âm lịch" value={day} onChangeText={setDay} placeholder="1–30" numeric maxLength={2} /><Field label="Tháng âm lịch" value={month} onChangeText={setMonth} placeholder="1–12" numeric maxLength={2} /></View>
    <Text style={s.fieldLabel}>Khi năm đó có tháng nhuận cùng số</Text>
    <Choice title="Làm giỗ vào tháng thường" description="Mỗi năm một lần, không lặp lại ở tháng nhuận." selected={leap === 'regular'} onPress={() => setLeap('regular')} />
    <Choice title="Ưu tiên tháng nhuận" description="Nếu năm đó không có tháng nhuận tương ứng, dùng tháng thường." selected={leap === 'prefer-leap'} onPress={() => setLeap('prefer-leap')} />
    {Number(day) === 30 && <><Text style={s.fieldLabel}>Nếu tháng chỉ có 29 ngày</Text><Choice title="Lấy ngày cuối tháng (29)" selected={short === 'last-day'} onPress={() => setShort('last-day')} /><Choice title="Chuyển sang mùng 1 tháng kế tiếp" selected={short === 'next-day'} onPress={() => setShort('next-day')} /></>}
    <Field label="Ghi chú" value={note} onChangeText={setNote} multiline placeholder="Việc cần chuẩn bị, nơi sum họp gia đình…" maxLength={2000} />
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Button onPress={() => { void save(); }} disabled={busy} icon="checkmark">{busy ? 'Đang lưu…' : 'Lưu ngày giỗ'}</Button>
    {value && (confirmDelete ? <Card style={{ backgroundColor: C.peach }}><Text style={s.bodyStrong}>Xóa ngày giỗ của {value.name}?</Text><Text style={s.small}>Bạn có thể khôi phục từ bản sao lưu đã xuất trước đó.</Text><Button onPress={() => { void remove(); }} disabled={busy}>Xác nhận xóa</Button><Button secondary onPress={() => setConfirmDelete(false)}>Giữ lại</Button></Card> : <Button secondary icon="trash-outline" onPress={() => setConfirmDelete(true)} disabled={busy}>Xóa ngày giỗ</Button>)}
  </Sheet>;
}
