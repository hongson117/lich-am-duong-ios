import { Text } from './Typography';
import React, { useState } from 'react';
import { Platform, Linking } from 'react-native';
import { ReminderSettings } from '../lib/personal';
import { enableNotifications } from '../native/notifications';
import { refreshWidgets } from '../native/widgets';
import { Button, Card, Choice, s } from './UI';
export function NativeSettings({ settings, onSave, status }: { settings: ReminderSettings; onSave: (s: ReminderSettings) => Promise<void>; status: string }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const update = async (next: ReminderSettings) => {
    setBusy(true); setMessage('');
    try {
      const enabling = (!settings.memorials && next.memorials) || (!settings.lunarDays && next.lunarDays);
      if (enabling && Platform.OS === 'web') { setMessage('Nhắc lịch hoạt động trong bản ứng dụng iOS đã cài trên iPhone.'); return; }
      if (enabling && !(await enableNotifications())) { setMessage('Bạn chưa cho phép thông báo. Có thể bật lại trong Cài đặt iPhone.'); return; }
      await onSave(next);
    } catch { setMessage('Chưa cập nhật được nhắc lịch. Vui lòng thử lại.'); } finally { setBusy(false); }
  };
  return <>
    <Card><Text style={s.sectionTitle}>Nhắc những ngày cần nhớ</Text><Text style={s.body}>Bạn chủ động bật từng loại nhắc. Thông báo ngày giỗ dùng nội dung chung để giữ riêng tư trên màn hình khóa.</Text>
      <Button secondary disabled={busy} icon={settings.memorials ? 'notifications' : 'notifications-outline'} onPress={() => { void update({ ...settings, memorials: !settings.memorials }); }}>Ngày giỗ: {settings.memorials ? 'Đang bật' : 'Đang tắt'}</Button>
      <Button secondary disabled={busy} icon="moon-outline" onPress={() => { void update({ ...settings, lunarDays: !settings.lunarDays }); }}>Rằm & Mùng 1: {settings.lunarDays ? 'Đang bật' : 'Đang tắt'}</Button>
      <Choice title="7:00 sáng đúng ngày" description="Theo giờ Việt Nam, kể cả khi đi nước ngoài." selected={settings.when === 'morning'} onPress={() => { if (!busy) void update({ ...settings, when: 'morning' }); }} /><Choice title="18:00 chiều hôm trước" selected={settings.when === 'evening-before'} onPress={() => { if (!busy) void update({ ...settings, when: 'evening-before' }); }} />
      <Text style={s.small}>Tối đa 50 lần nhắc sắp tới, được làm mới khi mở ứng dụng. Bao gồm Rằm, Mùng 1 của tháng nhuận nếu có.</Text>{!!status && <Text style={s.small}>{status}</Text>}{!!message && <Text accessibilityRole="alert" style={s.bodyStrong}>{message}</Text>}
      {Platform.OS === 'ios' && <Button secondary onPress={() => { void Linking.openSettings(); }}>Mở cài đặt quyền thông báo</Button>}
    </Card>
    <Card style={{ backgroundColor: '#EDF2E8' }}><Text style={s.sectionTitle}>Lịch ngay ngoài màn hình</Text><Text style={s.body}>Widget hiển thị ngày dương, ngày âm và câu Đạo Đức Kinh. Có cỡ nhỏ, vừa và widget màn hình khóa.</Text><Text style={s.body}>Trên iPhone: nhấn giữ màn hình chính → Sửa → Thêm tiện ích → Lịch Âm Dương. Với màn hình khóa: nhấn giữ → Tùy chỉnh → Thêm tiện ích.</Text><Button secondary icon="grid-outline" onPress={() => { void refreshWidgets().then(ok => setMessage(ok ? 'Đã gửi lịch 60 ngày tới widget. iOS quyết định thời điểm làm mới.' : 'Widget có trong bản iOS đã cài, không hiển thị ở bản xem trước web.')).catch(() => setMessage('Chưa cập nhật được widget. Hãy dùng bản iOS có phần mở rộng widget.')); }}>Cập nhật widget</Button><Text style={s.small}>Mở app định kỳ để nạp lịch 60 ngày tiếp theo. Khi hết dữ liệu, widget mời mở app thay vì hiện ngày cũ.</Text>
    </Card>
  </>;
}
