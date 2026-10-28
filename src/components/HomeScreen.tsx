import { Text } from './Typography';
import React, { useMemo } from 'react';
import { View, ImageBackground, StyleSheet, Pressable, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CivilDate, formatDate, WEEKDAYS, weekday, solarToLunar, canChiDay, canChiMonth, canChiYear, dateKey, addDays, isValidDate } from '../lib/calendar';
import { chapterArtwork } from '../data/artwork';
import { dailyQuote } from '../data/quotes';
import { holidays, upcomingHolidays } from '../lib/almanac';
import { Memorial, nextOccurrence } from '../lib/memorials';
import { Card, C, Icon, IconButton, Section, Chip, s } from './UI';
import { DayDetails } from './DayDetails';

export function HomeScreen({ date, today, onDate, onJump, onCalendar, onMemorials, onQuote, memorials }: { date: CivilDate; today: CivilDate; onDate: (d: CivilDate) => void; onJump: () => void; onCalendar: () => void; onMemorials: () => void; onQuote: () => void; memorials: Memorial[] }) {
  const lunar = solarToLunar(date), quote = dailyQuote(date), special = holidays(date);
  const upcoming = useMemo(() => upcomingHolidays(today, 3), [today]);
  const next = useMemo(() => memorials.map(m => ({ m, next: nextOccurrence(m, today) })).filter(x => x.next).sort((a, b) => a.next!.days - b.next!.days)[0], [memorials, today]);
  const art = chapterArtwork(quote.chapter);
  const isToday = dateKey(date) === dateKey(today);
  return <>
    <View style={s.row}><View style={{ gap: 7 }}><Text style={s.eyebrow}>MỖI NGÀY, MỘT NIỀM VUI</Text><Text style={s.title}>{isToday ? 'Chào ngày mới.' : 'Một ngày để nhớ.'}</Text></View><Pressable accessibilityRole="button" onPress={onJump} accessibilityLabel="Chọn ngày" style={hs.round}><Icon name="calendar-outline" color={C.green} /></Pressable></View>
    <View style={hs.hero}>
      <ImageBackground testID="daily-artwork" accessibilityLabel={`Minh họa Đạo Đức Kinh chương ${quote.chapter}`} source={art.image} style={hs.heroImage} imageStyle={{ opacity: .98, width: '100%', height: '100%' }} resizeMode="cover">
        <LinearGradient colors={['#FBF0DBF0', '#FBF0DB66', '#FBF0DB00']} locations={[0, .35, .7]} style={StyleSheet.absoluteFill} />
        <View style={hs.heroTop}><View><Text style={hs.weekday}>{WEEKDAYS[weekday(date)].toUpperCase()}</Text><Text style={hs.day}>{String(date.day).padStart(2, '0')}</Text><Text style={hs.month}>Tháng {date.month}, {date.year}</Text></View><View style={hs.heroBadge}><Icon name="sunny-outline" size={14} color={C.ink} /><Text style={{ color: C.ink, fontSize: 10, fontWeight: '600' }}>{isToday ? 'HÔM NAY' : 'LỊCH NGÀY'}</Text></View></View>
        <View style={hs.artCaption}><Text numberOfLines={2} style={{ color: '#fff', fontSize: 10, letterSpacing: 1, flex: 1 }}>CHƯƠNG {quote.chapter} · {art.title.toLocaleUpperCase('vi-VN')}</Text><Icon name="leaf-outline" size={17} color="#fff" /></View>
      </ImageBackground>
      <View style={hs.lunarRow}><View style={hs.lunarBadge}><Icon name="moon-outline" color={C.coral} size={17} /><Text style={{ color: C.coral, fontSize: 23, fontWeight: '700' }}>{lunar.day}</Text></View><View style={{ flex: 1 }}><Text style={s.bodyStrong}>Tháng {lunar.month}{lunar.leap ? ' nhuận' : ''} âm lịch</Text><Text style={s.small}>Năm {canChiYear(lunar.year)}</Text></View><View style={{ alignItems: 'flex-end', gap: 3 }}><Text style={[s.small, { color: C.ink }]}>Ngày {canChiDay(date)}</Text><Text style={[s.small, { fontSize: 11 }]}>Tháng {canChiMonth(lunar)}</Text></View></View>
    </View>
    <View style={[s.row, { marginTop: -10 }]}><IconButton name="chevron-back" label="Ngày trước" disabled={!isValidDate(addDays(date, -1))} onPress={() => onDate(addDays(date, -1))} /><Pressable accessibilityRole="button" onPress={() => onDate(today)} style={{ padding: 12 }}><Text style={s.link}>{isToday ? 'Âm dương hòa nhịp · Ngày thêm an yên' : 'Trở về hôm nay'}</Text></Pressable><IconButton name="chevron-forward" label="Ngày sau" disabled={!isValidDate(addDays(date, 1))} onPress={() => onDate(addDays(date, 1))} /></View>
    {special.length > 0 && <View style={s.wrap}>{special.map(x => <Chip key={x} color={C.coral} bg={C.peach}>{x}</Chip>)}</View>}
    <Card style={{ backgroundColor: '#F3EFE3', borderColor: '#E9E3D3', paddingVertical: 18 }}><View style={s.row}><Text style={[s.eyebrow, { color: C.gold }]}>ĐẠO ĐỨC KINH MỖI NGÀY</Text><Pressable accessibilityRole="button" accessibilityLabel="Chia sẻ câu Đạo Đức Kinh" onPress={() => { void Share.share({ message: `“${quote.text}”\n— ${quote.author}\n(Bản diễn dịch của Lịch Âm Dương)\n\nGiải nghĩa: ${quote.meaning}\n\n${formatDate(date)}` }).catch(() => {}); }} style={{ padding: 6 }}><Icon name="share-outline" size={18} color={C.muted} /></Pressable></View><Text style={hs.quote}>“{quote.text}”</Text><Text style={s.small}>{quote.author}</Text><View style={s.divider} /><Text style={[s.eyebrow, { color: C.gold }]}>HIỂU ĐỂ SỐNG AN NHIÊN</Text><Text style={[s.body, { color: '#64715E' }]}>{quote.meaning}</Text><Pressable accessibilityRole="button" onPress={onQuote} style={{ paddingVertical: 8 }}><Text style={s.link}>Nguyên văn & gợi ý thực hành  →</Text></Pressable><Text style={[s.small, { fontSize: 10 }]}>Diễn dịch và giải nghĩa do ứng dụng biên soạn.</Text></Card>
    <Section title="Nhịp ngày hôm nay" action="Lịch tháng" onPress={onCalendar} />
    <DayDetails date={date} />
    <Section title="Nhớ về người thân" action="Ngày giỗ" onPress={onMemorials} />
    <Pressable accessibilityRole="button" accessibilityLabel="Mở ngày giỗ" onPress={onMemorials}><Card><View style={s.row}><View style={hs.memoryIcon}><Icon name="flower-outline" color={C.coral} size={26} /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.bodyStrong}>{next ? next.m.name : 'Giữ trọn những ngày thương nhớ'}</Text><Text style={s.small}>{next ? `${next.m.day}/${next.m.month} âm lịch · ${formatDate(next.next!.date)}` : 'Lưu ngày giỗ âm lịch của gia đình bạn.'}</Text></View><Icon name="chevron-forward" size={18} color={C.muted} /></View>{next && <Chip color={C.coral} bg={C.peach}>{next.next!.days === 0 ? 'Hôm nay' : `Còn ${next.next!.days} ngày`}</Chip>}</Card></Pressable>
    <Section title="Sắp đến rồi" />
    <Card>{upcoming.map((event, i) => <View key={`${event.title}-${formatDate(event.date)}`}><View style={[s.row, { paddingVertical: 3 }]}><View style={hs.eventDate}><Text style={{ fontSize: 21, fontWeight: '700', color: C.coral }}>{event.date.day}</Text><Text style={{ fontSize: 10, color: C.coral }}>THÁNG {event.date.month}</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={s.bodyStrong}>{event.title}</Text><Text style={s.small}>{event.days === 0 ? 'Hôm nay' : `Còn ${event.days} ngày`}</Text></View><Icon name="arrow-forward" size={17} color={C.muted} /></View>{i < upcoming.length - 1 && <View style={[s.divider, { marginTop: 12 }]} />}</View>)}</Card>
    <Text style={hs.footer}>Gìn giữ nếp Việt · Đón những ngày lành</Text>
  </>;
}
const hs = StyleSheet.create({
  round: { backgroundColor: '#E9EEE2', width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: '#E9E4D7', backgroundColor: '#fff' },
  heroImage: { height: 310, justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 23 },
  heroBadge: { borderWidth: 1, borderColor: '#FFFFFFAA', backgroundColor: '#FFF9EBAA', padding: 8, borderRadius: 20, flexDirection: 'row', gap: 5, alignItems: 'center' },
  weekday: { fontSize: 12, letterSpacing: 2, fontWeight: '700', color: C.ink },
  day: { fontSize: 94, lineHeight: 106, fontWeight: '300', letterSpacing: -5, color: C.ink, fontVariant: ['tabular-nums'] },
  month: { fontSize: 14, color: C.ink, fontWeight: '500' },
  artCaption: { backgroundColor: '#173E34B3', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 20 },
  lunarRow: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 11 },
  lunarBadge: { backgroundColor: C.peach, borderRadius: 15, width: 48, paddingVertical: 8, alignItems: 'center', gap: 2 },
  quote: { fontSize: 19, lineHeight: 29, color: C.ink, fontWeight: '500', letterSpacing: -.2 },
  memoryIcon: { backgroundColor: C.peach, padding: 12, borderRadius: 17 },
  eventDate: { width: 58, backgroundColor: '#FBF1E6', alignItems: 'center', paddingVertical: 9, borderRadius: 13, gap: 3 },
  footer: { textAlign: 'center', fontSize: 11, color: '#8B947F', paddingVertical: 10, letterSpacing: .5 },
});
