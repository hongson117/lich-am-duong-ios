import { Text } from './src/components/Typography';
import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Platform, AppState, Linking } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { todayVietnam, dateKey } from './src/lib/calendar';
import { Memorial, validateMemorial } from './src/lib/memorials';
import { dailyQuote, TaoQuote, TAO_SOURCE } from './src/data/quotes';
import { HomeScreen } from './src/components/HomeScreen';
import { MonthScreen } from './src/components/MonthScreen';
import { MemorialEditor, MemorialScreen } from './src/components/MemorialScreen';
import { MemorialPlanner } from './src/components/MemorialPlanner';
import { MindfulnessScreen, ChapterReader } from './src/components/MindfulnessScreen';
import { Chapter, EMPTY_PERSONAL, PersonalData, encodeFullBackup, decodeFullBackup, backupBytes } from './src/lib/personal';
import { syncNotifications, listenNotifications } from './src/native/notifications';
import { refreshWidgets } from './src/native/widgets';
import { ExploreScreen } from './src/components/ExploreScreen';
import { CalendarTool } from './src/components/CalendarTool';
import { C, Icon, IconName, IconButton, Sheet, Card, Button, s } from './src/components/UI';

const STORAGE_KEY = '@lich-am-duong/memorials/v1';
const DATA_KEY = '@lich-am-duong/data/v2';
type AppData = { memorials: Memorial[]; personal: PersonalData };
const TABS: { id: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { id: 'today', title: 'Hôm nay', icon: 'sunny-outline', activeIcon: 'sunny' },
  { id: 'month', title: 'Lịch tháng', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'memorials', title: 'Ngày giỗ', icon: 'flower-outline', activeIcon: 'flower' },
  { id: 'mindfulness', title: 'Tĩnh tâm', icon: 'leaf-outline', activeIcon: 'leaf' },
  { id: 'explore', title: 'Tiện ích', icon: 'options-outline', activeIcon: 'options' },
];
export default function App() { return <SafeAreaProvider><Application /></SafeAreaProvider>; }
function Application() {
  const inset = useSafeAreaInsets();
  const [tab, setTab] = useState('today');
  const [today, setToday] = useState(todayVietnam), [date, setDate] = useState(todayVietnam);
  const [memorials, setMemorials] = useState<Memorial[]>([]), [ready, setReady] = useState(false), [storageError, setStorageError] = useState('');
  const [personal, setPersonal] = useState<PersonalData>(EMPTY_PERSONAL), [chapter, setChapter] = useState<Chapter | null>(null);
  const [planner, setPlanner] = useState<{ memorial: Memorial; year: number } | null>(null);
  const [nativeStatus, setNativeStatus] = useState('');
  const dataRef = useRef<AppData>({ memorials: [], personal: EMPTY_PERSONAL });
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  const [editor, setEditor] = useState<Memorial | 'new' | null>(null);
  const [calendarTool, setCalendarTool] = useState<'jump' | 'convert' | null>(null);
  const [quote, setQuote] = useState<TaoQuote | null>(null), [info, setInfo] = useState(false);
  const [notice, setNotice] = useState(''), [transferBusy, setTransferBusy] = useState(false), [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const scroll = useRef<ScrollView>(null), todayRef = useRef(today);
  const load = async () => {
    setStorageError('');
    try {
      const full = await AsyncStorage.getItem(DATA_KEY);
      let loaded: AppData = { memorials: [], personal: EMPTY_PERSONAL };
      if (full) loaded = decodeFullBackup(full);
      else { const stored = await AsyncStorage.getItem(STORAGE_KEY); if (stored) { const data = JSON.parse(stored); if (!Array.isArray(data) || data.length > 1000 || !data.every(validateMemorial) || new Set(data.map(m => m.id)).size !== data.length) throw new Error('invalid'); loaded.memorials = data; } }
      dataRef.current = loaded; setMemorials(loaded.memorials); setPersonal(loaded.personal);
      setReady(true);
    } catch { setStorageError('Chưa đọc được dữ liệu ngày giỗ. Dữ liệu hiện có được giữ nguyên; vui lòng thử lại.'); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    const refresh = () => { const next = todayVietnam(); if (dateKey(next) !== dateKey(todayRef.current)) { const old = todayRef.current; todayRef.current = next; setToday(next); setDate(d => dateKey(d) === dateKey(old) ? next : d); } };
    const timer = setInterval(refresh, 30000); const sub = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearInterval(timer); sub.remove(); };
  }, []);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timer); } }, [notice]);
  const navigate = (next: string) => { setTab(next); scroll.current?.scrollTo({ y: 0, animated: false }); if (Platform.OS === 'ios') void Haptics.selectionAsync().catch(() => {}); };
  const commit = (update: (previous: AppData) => AppData): Promise<void> => {
    if (!ready) return Promise.reject(new Error('Storage unavailable'));
    const run = writeQueue.current.catch(() => {}).then(async () => { const next = update(dataRef.current); const serialized = encodeFullBackup(next.memorials, next.personal); if (backupBytes(serialized) > 2_000_000) throw new Error('Dữ liệu vượt giới hạn sao lưu 2 MB. Hãy rút gọn ghi chú.'); await AsyncStorage.setItem(DATA_KEY, serialized); dataRef.current = next; setMemorials(next.memorials); setPersonal(next.personal); }); writeQueue.current = run; return run;
  };
  const persist = (next: Memorial[]) => commit(p => ({ ...p, memorials: next }));
  const persistPersonal = (update: (p: PersonalData) => PersonalData) => commit(p => ({ ...p, personal: update(p.personal) }));
  const save = async (m: Memorial) => { const next = memorials.some(x => x.id === m.id) ? memorials.map(x => x.id === m.id ? m : x) : [...memorials, m]; if (next.length > 1000) throw new Error('Too many records'); await persist(next); setNotice('Đã lưu ngày giỗ của ' + m.name); };
  const remove = async (id: string) => { await persist(memorials.filter(m => m.id !== id)); setNotice('Đã xóa ngày giỗ.'); };
  const backup = async () => {
    setTransferBusy(true);
    try {
      await writeQueue.current;
      const text = encodeFullBackup(dataRef.current.memorials, dataRef.current.personal), name = `lich-am-duong-sao-luu-${dateKey(today)}.json`;
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Đã tải bản sao lưu ngày giỗ.');
      } else { const file = new File(Paths.cache, name); file.write(text); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Lưu bản sao ngày giỗ' }); else setNotice('Thiết bị chưa hỗ trợ chia sẻ tệp.'); }
    } catch { setNotice('Chưa xuất được bản sao lưu. Vui lòng thử lại.'); } finally { setTransferBusy(false); }
  };
  const restore = async () => {
    setTransferBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], copyToCacheDirectory: true });
      if (!result.canceled) { const asset = result.assets[0]; if (asset.size && asset.size > 2_000_000) throw new Error('Tệp sao lưu quá lớn.'); const text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text(); setPendingImport(decodeFullBackup(text)); }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Không đọc được tệp sao lưu.'); } finally { setTransferBusy(false); }
  };
  const confirmImport = async () => {
    if (!pendingImport || transferBusy) return; setTransferBusy(true);
    try { await commit(current => { const ids = new Set(current.memorials.map(m => m.id)); const additions = pendingImport.memorials.filter(m => !ids.has(m.id)); if (current.memorials.length + additions.length > 1000) throw new Error('Quá giới hạn 1.000 ngày giỗ.'); return { memorials: [...current.memorials, ...additions], personal: { ...current.personal, favorites: [...new Set([...current.personal.favorites, ...pendingImport.personal.favorites])], notes: { ...pendingImport.personal.notes, ...current.personal.notes } } }; }); setPendingImport(null); setNotice('Đã khôi phục dữ liệu mới; giữ nguyên nội dung hiện có.'); } catch (error) { setNotice(error instanceof Error ? error.message : 'Chưa thể lưu dữ liệu khôi phục.'); } finally { setTransferBusy(false); }
  };
  useEffect(() => {
    if (!ready || Platform.OS === 'web') return;
    let live = true;
    const refresh = () => { void syncNotifications(memorials, personal.reminders).then(count => { if (live) setNativeStatus(`Đã lập lịch ${count} thông báo sắp tới.`); }).catch(error => { if (live) setNativeStatus(error instanceof Error ? error.message : 'Chưa đồng bộ được nhắc lịch.'); }); void refreshWidgets().catch(() => { if (live) setNativeStatus('Chưa cập nhật được widget; hãy kiểm tra bản cài iOS.'); }); };
    refresh(); const listener = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { live = false; listener.remove(); };
  }, [ready, memorials, personal.reminders, dateKey(today)]);
  useEffect(() => listenNotifications(route => { navigate(route); setDate(todayVietnam()); }), []);
  useEffect(() => { const handle = (url: string | null) => { if (url?.startsWith('lichamduong://today')) { navigate('today'); setDate(todayVietnam()); } }; void Linking.getInitialURL().then(handle); const listener = Linking.addEventListener('url', e => handle(e.url)); return () => listener.remove(); }, []);
  return <View style={styles.background}><StatusBar style="dark" /><View style={[styles.app, { paddingTop: Math.max(inset.top, Platform.OS === 'web' ? 12 : 0) }]}>
    <View style={styles.header}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Image source={require('./assets/logo-ui.webp')} style={{ width: 37, height: 37, borderRadius: 10 }} /><View><Text style={styles.brand}>Lịch Âm Dương</Text><Text style={styles.tagline}>NẾP VIỆT TRONG TỪNG NGÀY</Text></View></View><IconButton name="information-circle-outline" label="Thông tin ứng dụng" onPress={() => setInfo(true)} /></View>
    {!!storageError && <View style={{ backgroundColor: C.peach, padding: 12, gap: 7 }}><Text style={s.error}>{storageError}</Text><Button secondary onPress={() => { void load(); }}>Thử đọc lại dữ liệu</Button></View>}
    <ScrollView ref={scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {tab === 'today' && <HomeScreen date={date} today={today} onDate={setDate} onJump={() => setCalendarTool('jump')} onCalendar={() => navigate('month')} onMemorials={() => navigate('memorials')} onQuote={() => setQuote(dailyQuote(date))} memorials={memorials} />}
      {tab === 'month' && <MonthScreen date={date} today={today} onDate={setDate} onViewDay={() => navigate('today')} onJump={() => setCalendarTool('jump')} onConvert={() => setCalendarTool('convert')} memorials={memorials} />}
      {tab === 'memorials' && <MemorialScreen memorials={memorials} today={today} onEdit={m => setEditor(m)} onPlan={(memorial, year) => setPlanner({ memorial, year })} onAdd={() => setEditor('new')} ready={ready} />}
      {tab === 'mindfulness' && <MindfulnessScreen personal={personal} onChapter={setChapter} />}
      {tab === 'explore' && <ExploreScreen onMindfulness={() => navigate('mindfulness')} personal={personal} onPersonal={persistPersonal} nativeStatus={nativeStatus} onConvert={() => setCalendarTool('convert')} onBackup={() => { void backup(); }} onRestore={() => { void restore(); }} onInfo={() => setInfo(true)} ready={ready} busy={transferBusy} />}
    </ScrollView>
    {!!notice && <View accessibilityRole="alert" style={styles.toast}><Text style={{ color: '#fff', fontSize: 13, lineHeight: 20, flex: 1 }}>{notice}</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng thông báo" onPress={() => setNotice('')} style={{ padding: 9 }}><Icon name="close" color="#fff" size={18} /></Pressable></View>}
    <View style={[styles.tabs, { paddingBottom: Math.max(inset.bottom, 13) }]}>{TABS.map(t => <Pressable accessibilityRole="tab" accessibilityLabel={t.title} accessibilityState={{ selected: t.id === tab }} aria-selected={t.id === tab} onPress={() => navigate(t.id)} key={t.id} style={styles.tab}><View style={[styles.tabIcon, t.id === tab && { backgroundColor: C.pale }]}><Icon name={t.id === tab ? t.activeIcon : t.icon} size={22} color={t.id === tab ? C.green : '#818A7B'} /></View><Text style={{ fontSize: 10, fontWeight: t.id === tab ? '700' : '500', color: t.id === tab ? C.green : C.muted }}>{t.title}</Text></Pressable>)}</View>
    {editor !== null && <MemorialEditor value={editor === 'new' ? null : editor} onSave={save} onDelete={remove} onClose={() => setEditor(null)} />}
    {planner && <MemorialPlanner memorial={planner.memorial} year={planner.year} onSave={save} onClose={() => setPlanner(null)} />}
    {chapter && <ChapterReader chapter={chapter} personal={personal} onChange={persistPersonal} onClose={() => setChapter(null)} />}
    {calendarTool && <CalendarTool kind={calendarTool} date={date} onClose={() => setCalendarTool(null)} onSelect={d => { setDate(d); navigate('today'); }} />}
    {quote && <Sheet visible title={`Đạo Đức Kinh · Chương ${quote.chapter}`} onClose={() => setQuote(null)}><Card style={{ backgroundColor: '#F2EDDF' }}><Text style={[s.eyebrow, { color: C.gold }]}>NGUYÊN VĂN</Text><Text selectable style={{ fontSize: 23, color: C.ink, lineHeight: 36 }}>{quote.original}</Text><Text style={s.small}>Lão Tử · Chương {quote.chapter}</Text></Card><Text style={s.eyebrow}>DIỄN DỊCH TIẾNG VIỆT</Text><Text style={[s.bodyStrong, { fontSize: 21, lineHeight: 32 }]}>{quote.text}</Text><Text style={s.sectionTitle}>Giải nghĩa</Text><Text style={s.body}>{quote.meaning}</Text><Card style={{ backgroundColor: C.pale }}><Text style={s.bodyStrong}>Một điều có thể thực hành</Text><Text style={s.body}>{quote.practice}</Text></Card><Text style={s.small}>Nguyên văn theo bản Vương Bật. Phần diễn dịch, giải nghĩa và thực hành do ứng dụng biên soạn, là một cách đọc để tham khảo.</Text><Button secondary icon="open-outline" onPress={() => { void Linking.openURL(TAO_SOURCE).catch(() => setNotice('Không mở được nguồn tham khảo.')); }}>Xem nguồn Đạo Đức Kinh</Button></Sheet>}
    <Sheet visible={info} title="Về Lịch Âm Dương" onClose={() => setInfo(false)}><Image source={require('./assets/logo-ui.webp')} style={{ width: 150, height: 150, alignSelf: 'center', borderRadius: 32 }} /><Text style={[s.title, { textAlign: 'center' }]}>Lịch Âm Dương</Text><Text style={[s.body, { textAlign: 'center' }]}>Gìn giữ nếp Việt · Phiên bản 1.0.1</Text><Card><Text style={s.bodyStrong}>Lịch Việt Nam · 1900–2100</Text><Text style={s.body}>Âm lịch được tính từ điểm sóc và trung khí thiên văn với múi giờ cố định UTC+7. Bảng lịch chạy ngay trên thiết bị. Quy ước này không tái hiện mọi thay đổi múi giờ lịch sử.</Text><Text style={s.bodyStrong}>Hoàng đạo & việc nên làm</Text><Text style={s.body}>Dùng bảng dân gian bốn ngày Đạo–Viễn–Thông–Đạt theo tháng âm; giờ hoàng đạo dùng chu kỳ địa chi ngày. Gợi ý công việc được biên soạn theo 12 trực, không chỉ dựa vào nhãn hoàng đạo. Các hệ lịch khác có thể khác nhau. Chỉ dùng tham khảo văn hóa.</Text><Text style={s.body}>Tiết khí là ước tính tại 12 giờ trưa Việt Nam của ngày được chọn, không phải thời điểm giao tiết chính xác.</Text><Text style={s.bodyStrong}>Đạo Đức Kinh</Text><Text style={s.body}>Chỉ dùng câu trích từ Đạo Đức Kinh, bản Vương Bật. Mỗi câu có số chương, nguyên văn, diễn dịch tiếng Việt và giải nghĩa. Mỗi ngày luân phiên 81 câu được chọn. Tab Tĩnh tâm có đủ nguyên văn 81 chương, tóm lược tiếng Việt, tìm chủ đề, đánh dấu và ghi chú cá nhân.</Text><Text style={s.bodyStrong}>Ngày giỗ & quyền riêng tư</Text><Text style={s.body}>Không cần tài khoản. Ngày giỗ được lưu cục bộ; ứng dụng không gửi dữ liệu gia đình lên máy chủ. Xóa ứng dụng hoặc xóa dữ liệu trình duyệt có thể làm mất bản lưu: hãy xuất bản sao khi cần. Có sao lưu/khôi phục chủ động bằng tệp; chưa đồng bộ tự động. Nhắc giỗ và Rằm–Mùng 1 chỉ được bật sau khi bạn cấp quyền. Widget iOS chỉ hiển thị lịch và câu kinh, không đưa thông tin người thân ra màn hình khóa.</Text></Card><Button secondary onPress={() => { void Linking.openURL('https://github.com/cosinekitty/astronomy').catch(() => {}); }}>Nguồn tính toán thiên văn</Button><Button secondary onPress={() => { void Linking.openURL(TAO_SOURCE).catch(() => {}); }}>Nguồn Đạo Đức Kinh</Button></Sheet>
    <Sheet visible={pendingImport !== null} title="Khôi phục dữ liệu" onClose={() => { if (!transferBusy) setPendingImport(null); }}><Text style={s.body}>Tệp có {pendingImport?.memorials.length ?? 0} ngày giỗ, {Object.keys(pendingImport?.personal.notes ?? {}).length} ghi chú và {pendingImport?.personal.favorites.length ?? 0} chương đánh dấu. Nội dung đã có được giữ nguyên; chỉ bổ sung dữ liệu mới. Không tự bật thông báo sau khôi phục.</Text><Button onPress={() => { void confirmImport(); }} disabled={transferBusy}>Bổ sung vào danh sách</Button><Button secondary onPress={() => setPendingImport(null)} disabled={transferBusy}>Hủy</Button></Sheet>
  </View></View>;
}
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#E4E9DE', alignItems: 'center' }, app: { width: '100%', maxWidth: 520, flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 21, paddingTop: 7, paddingBottom: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { fontSize: 16, fontWeight: '700', color: C.ink, letterSpacing: -.3 }, tagline: { fontSize: 7, letterSpacing: 1.7, fontWeight: '600', color: C.muted, marginTop: 4 },
  content: { paddingHorizontal: 21, paddingTop: 8, paddingBottom: 28, gap: 17 }, tabs: { borderTopWidth: 1, borderColor: '#E6E8DC', backgroundColor: '#FFFEF9', flexDirection: 'row', paddingTop: 9, paddingHorizontal: 8 }, tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 50 }, tabIcon: { paddingHorizontal: 19, paddingVertical: 6, borderRadius: 16 }, toast: { position: 'absolute', bottom: 95, left: 16, right: 16, backgroundColor: C.ink, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 10 },
});
