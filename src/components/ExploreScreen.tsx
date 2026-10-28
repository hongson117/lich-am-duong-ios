import { Text } from './Typography';
import React from 'react';
import { View, Image } from 'react-native';
import { PersonalData } from '../lib/personal';
import { Card, Button, Section, s } from './UI';
import { TabArtwork } from './TabArtwork';
import { NativeSettings } from './NativeSettings';
export function ExploreScreen({ onMindfulness, personal, onPersonal, nativeStatus, onConvert, onBackup, onRestore, onInfo, ready, busy }: { onMindfulness: () => void; personal: PersonalData; onPersonal: (f: (p: PersonalData) => PersonalData) => Promise<void>; nativeStatus: string; onConvert: () => void; onBackup: () => void; onRestore: () => void; onInfo: () => void; ready: boolean; busy: boolean }) {
  return <>
    <View style={{ gap: 7 }}><Text style={s.eyebrow}>NHỮNG ĐIỀU NHỎ, HỮU ÍCH MỖI NGÀY</Text><Text style={s.title}>Tiện ích của bạn.</Text></View>
    <TabArtwork offset={21} />
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#EFEBDD' }}><Image source={require('../../assets/logo-3d.png')} style={{ width: 88, height: 88, borderRadius: 20 }} /><View style={{ flex: 1, gap: 6 }}><Text style={s.sectionTitle}>Lịch Âm Dương</Text><Text style={s.small}>Gìn giữ nếp Việt,{ '\n' }đón những ngày lành.</Text></View></Card>
    <Button secondary icon="swap-horizontal" onPress={onConvert}>Chuyển đổi ngày âm dương</Button>
    <Button secondary icon="book-outline" onPress={onMindfulness}>81 chương Đạo Đức Kinh</Button>
    {ready && <NativeSettings settings={personal.reminders} onSave={reminders => onPersonal(p => ({ ...p, reminders }))} status={nativeStatus} />}
    <Card><Text style={s.sectionTitle}>Giữ gìn dữ liệu của bạn</Text><Text style={s.body}>Sao lưu ngày giỗ, sổ chuẩn bị từng năm, ghi chú chiêm nghiệm và chương đã đánh dấu. Cất tệp trong Tệp/iCloud Drive hoặc chuyển sang thiết bị khác.</Text><Button secondary icon="download-outline" onPress={onBackup} disabled={!ready || busy}>Sao lưu toàn bộ dữ liệu</Button><Button secondary icon="cloud-upload-outline" onPress={onRestore} disabled={!ready || busy}>Khôi phục từ tệp sao lưu</Button><Text style={s.small}>Lưu riêng trên thiết bị. Đây là sao lưu chủ động bằng tệp, chưa có đồng bộ iCloud tự động.</Text></Card>
    <Section title="Về ứng dụng" /><Button secondary icon="information-circle-outline" onPress={onInfo}>Quyền riêng tư & nguồn dữ liệu</Button>
  </>;
}
