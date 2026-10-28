import { Text } from './Typography';
import React, { useState } from 'react';
import { View, Pressable, Linking } from 'react-native';
import { ImageBackground, Image } from 'expo-image';
import { chapterArtwork, villageArtwork } from '../data/artwork';
import { todayVietnam } from '../lib/calendar';
import { LinearGradient } from 'expo-linear-gradient';
import { Chapter, PersonalData, searchChapters } from '../lib/personal';
import { C, Card, Icon, Button, Chip, Field, Sheet, s } from './UI';
export function MindfulnessScreen({ personal, onChapter }: { personal: PersonalData; onChapter: (c: Chapter) => void }) {
  const [search, setSearch] = useState(''), [topic, setTopic] = useState(''), [favorites, setFavorites] = useState(false);
  const result = searchChapters(search, topic, favorites, personal);
  return <>
    <View style={{ gap: 7 }}><Text style={s.eyebrow}>ĐẠO ĐỨC KINH · LÃO TỬ</Text><Text style={s.title}>Một khoảng tĩnh tâm.</Text><Text style={s.body}>81 chương. Một hành trình trở về với mình.</Text></View>
    <ImageBackground imageStyle={{ width: '100%', height: '100%' }} source={villageArtwork(todayVietnam(), 14).image} style={{ height: 150, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end' }}><LinearGradient colors={['#173E3400', '#173E34EE']} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} /><Text style={{ color: '#fff', fontSize: 22, fontWeight: '500', padding: 20 }}>“Cái thiện cao nhất{ '\n' }giống như nước.”</Text></ImageBackground>
    <Field label="Tìm chương hoặc chủ đề" value={search} onChangeText={setSearch} placeholder="Buông bỏ, lãnh đạo, biết đủ…" />
    <View style={s.wrap}>{['', 'Buông bỏ', 'Lãnh đạo', 'Đối nhân xử thế', 'Tĩnh tâm', 'Sống giản dị', 'Tự nhận thức'].map(t => <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: topic === t }} aria-pressed={topic === t} onPress={() => setTopic(t)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, backgroundColor: topic === t ? C.green : C.pale }}><Text style={{ color: topic === t ? '#fff' : C.green, fontSize: 12 }}>{t || 'Tất cả'}</Text></Pressable>)}</View>
    <Pressable accessibilityRole="checkbox" accessibilityLabel="Chỉ hiện chương đã đánh dấu" accessibilityState={{ checked: favorites }} aria-checked={favorites} onPress={() => setFavorites(!favorites)} style={[s.row, { justifyContent: 'flex-start', paddingVertical: 8 }]}><Icon name={favorites ? 'bookmark' : 'bookmark-outline'} size={20} color={C.green} /><Text style={s.bodyStrong}>Đã đánh dấu ({personal.favorites.length})</Text></Pressable>
    <Text style={s.small}>{result.length} chương · Nguyên văn và tóm lược tiếng Việt</Text>
    {result.length === 0 && <Card><Text style={s.body}>Chưa có chương phù hợp. Thử chủ đề khác hoặc đánh dấu chương bạn muốn đọc lại.</Text></Card>}
    {result.map(c => <Pressable key={c.chapter} accessibilityRole="button" accessibilityLabel={`Mở chương ${c.chapter}: ${c.title}`} onPress={() => onChapter(c)}><Card><View style={s.row}><Image source={chapterArtwork(c.chapter).thumbnail} style={{ width: 52, height: 52, borderRadius: 12 }} /><Text style={[s.eyebrow, { color: C.gold }]}>CHƯƠNG {String(c.chapter).padStart(2, '0')}</Text><Icon name={personal.favorites.includes(c.chapter) ? 'bookmark' : 'arrow-forward'} size={18} color={C.green} /></View><Text style={[s.sectionTitle, { fontSize: 20 }]}>{c.title}</Text><Text style={s.body} numberOfLines={2}>{c.meaning}</Text><View style={s.row}><Chip>{c.topic}</Chip>{!!personal.notes[c.chapter] && <Text style={s.small}>Có ghi chú riêng</Text>}</View></Card></Pressable>)}
  </>;
}
export function ChapterReader({ chapter, personal, onChange, onClose }: { chapter: Chapter; personal: PersonalData; onChange: (f: (p: PersonalData) => PersonalData) => Promise<void>; onClose: () => void }) {
  const [note, setNote] = useState(personal.notes[chapter.chapter] ?? ''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const changed = note !== (personal.notes[chapter.chapter] ?? '');
  const bookmark = async () => { setBusy(true); try { await onChange(p => ({ ...p, favorites: p.favorites.includes(chapter.chapter) ? p.favorites.filter(x => x !== chapter.chapter) : [...p.favorites, chapter.chapter] })); } catch { setMessage('Chưa lưu được đánh dấu.'); } finally { setBusy(false); } };
  const save = async () => { setBusy(true); try { await onChange(p => ({ ...p, notes: { ...p.notes, [chapter.chapter]: note } })); setMessage('Đã lưu ghi chú riêng của bạn.'); return true; } catch { setMessage('Chưa lưu được, vui lòng thử lại.'); return false; } finally { setBusy(false); } };
  return <Sheet visible title={`Chương ${chapter.chapter} · ${chapter.title}`} onClose={() => { if (!busy) { if (changed) setConfirmClose(true); else onClose(); } }}>
    <Button secondary icon={personal.favorites.includes(chapter.chapter) ? 'bookmark' : 'bookmark-outline'} disabled={busy} onPress={() => { void bookmark(); }}>{personal.favorites.includes(chapter.chapter) ? 'Đã đánh dấu chương này' : 'Đánh dấu để đọc lại'}</Button>
    <Image source={chapterArtwork(chapter.chapter).image} accessibilityLabel={`Minh họa chương ${chapter.chapter}`} style={{ width: '100%', aspectRatio: 1, borderRadius: 22 }} />
    <Text style={s.eyebrow}>NGUYÊN VĂN · BẢN VƯƠNG BẬT</Text><Text selectable style={{ fontSize: 21, color: C.ink, lineHeight: 35 }}>{chapter.original}</Text>
    <Card style={{ backgroundColor: '#F2EDDF' }}><Text style={s.sectionTitle}>Hiểu ý chương</Text><Text style={[s.body, { color: '#52634F', fontSize: 16, lineHeight: 27 }]}>{chapter.meaning}</Text><Text style={s.small}>Tóm lược và diễn giải do ứng dụng biên soạn; không phải bản dịch toàn văn.</Text></Card>
    <Field label="Ghi chú chiêm nghiệm của bạn" value={note} onChangeText={v => { setNote(v); setMessage(''); }} multiline placeholder="Câu này gợi cho mình điều gì? Mình muốn thực hành ra sao?" maxLength={10000} />
    <Button icon="checkmark" onPress={() => { void save(); }} disabled={busy}>Lưu ghi chú</Button>{!!message && <Text accessibilityRole="alert" style={s.bodyStrong}>{message}</Text>}
    <Text style={s.small}>Ghi chú chỉ lưu trên thiết bị. Bản sao lưu trong Tiện ích bao gồm cả ghi chú và chương đã đánh dấu.</Text>
    <Button secondary onPress={() => { void Linking.openURL(chapter.source).catch(() => setMessage('Không mở được trang nguồn.')); }}>Đối chiếu nguyên bản chương {chapter.chapter}</Button>
    {confirmClose && <Card><Text style={s.bodyStrong}>Ghi chú có thay đổi chưa lưu.</Text><Button disabled={busy} onPress={() => { void save().then(ok => { if (ok) onClose(); }); }}>Lưu trước khi đóng</Button><Button secondary disabled={busy} onPress={onClose}>Bỏ thay đổi và đóng</Button><Button secondary disabled={busy} onPress={() => setConfirmClose(false)}>Tiếp tục viết</Button></Card>}
  </Sheet>;
}
