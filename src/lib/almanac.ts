import { CivilDate, dayNumber, solarToLunar, mod, BRANCHES, addDays, isValidDate } from './calendar';

// Four-day folk convention (Đạo–Viễn–Thông–Đạt). Other almanacs use six deities.
const GOOD = [0, 1, 5, 7];
const BAD = [3, 6, 9, 11];
const HOURS = ['110100101100', '001101001011', '110011010010', '101100110100', '001011001101', '010010110011'];
const TERMS = ['Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng', 'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ', 'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập'];
const OFFICERS = [
  { name: 'Kiến', do: ['Lập kế hoạch', 'Bắt đầu học tập', 'Gặp gỡ'], avoid: ['Quyết định vội vàng'] },
  { name: 'Trừ', do: ['Dọn dẹp nhà cửa', 'Sắp xếp công việc', 'Bỏ thói quen cũ'], avoid: ['Khởi sự việc lớn'] },
  { name: 'Mãn', do: ['Sum họp gia đình', 'Tri ân', 'Hoàn thiện việc đang làm'], avoid: ['Tranh chấp'] },
  { name: 'Bình', do: ['Công việc thường ngày', 'Hòa giải', 'Chăm sóc bản thân'], avoid: ['Thay đổi đột ngột'] },
  { name: 'Định', do: ['Lên lịch dài hạn', 'Gặp gỡ gia đình', 'Học tập'], avoid: ['Đổi kế hoạch liên tục'] },
  { name: 'Chấp', do: ['Giữ nếp sinh hoạt', 'Sửa chữa nhỏ', 'Rà soát công việc'], avoid: ['Khởi công việc lớn'] },
  { name: 'Phá', do: ['Dọn đồ cũ', 'Giải quyết việc tồn đọng', 'Nghỉ ngơi'], avoid: ['Cưới hỏi', 'Khai trương'] },
  { name: 'Nguy', do: ['Tĩnh tâm', 'Đọc sách', 'Chuẩn bị kỹ kế hoạch'], avoid: ['Việc mạo hiểm', 'Khởi sự việc lớn'] },
  { name: 'Thành', do: ['Hoàn thành mục tiêu', 'Gặp gỡ', 'Khai trương'], avoid: ['Tranh luận căng thẳng'] },
  { name: 'Thu', do: ['Tổng kết', 'Thu xếp việc nhà', 'Lưu giữ kỷ niệm'], avoid: ['Khởi đầu thiếu chuẩn bị'] },
  { name: 'Khai', do: ['Khai trương', 'Khởi sự', 'Kết nối bạn bè'], avoid: ['Để việc dang dở'] },
  { name: 'Bế', do: ['Nghỉ ngơi', 'Sắp xếp đồ đạc', 'Dành thời gian cho gia đình'], avoid: ['Khai trương', 'Khởi công'] },
];
// Standard low-order solar longitude, evaluated at noon Vietnam (not a transition timestamp).
export function solarLongitude(d: CivilDate) {
  const t = (dayNumber(d) + 2440587.5 + 5 / 24 - 2451545) / 36525;
  const mean = mod(280.46646 + 36000.76983 * t + .0003032 * t * t, 360);
  const anomaly = (357.52911 + 35999.05029 * t - .0001537 * t * t) * Math.PI / 180;
  const c = (1.914602 - .004817 * t - .000014 * t * t) * Math.sin(anomaly) + (.019993 - .000101 * t) * Math.sin(2 * anomaly) + .000289 * Math.sin(3 * anomaly);
  return mod(mean + c - .00569 - .00478 * Math.sin((125.04 - 1934.136 * t) * Math.PI / 180), 360);
}
export function almanac(d: CivilDate) {
  const lunar = solarToLunar(d);
  const branch = mod(dayNumber(d) + 2440589, 12);
  const relative = mod(branch - 2 * ((lunar.month - 1) % 6), 12);
  const quality = GOOD.includes(relative) ? 'good' : BAD.includes(relative) ? 'bad' : 'neutral';
  const longitude = solarLongitude(d);
  const monthBranch = (Math.floor(mod(longitude + 45, 360) / 30) + 2) % 12;
  const officer = OFFICERS[mod(branch - monthBranch, 12)];
  return {
    quality,
    label: quality === 'good' ? 'Ngày hoàng đạo' : quality === 'bad' ? 'Ngày hắc đạo' : 'Ngày bình hòa',
    term: TERMS[Math.floor(longitude / 15)],
    officer,
    hours: [...HOURS[branch % 6]].flatMap((v, i) => v === '1' ? [{ name: BRANCHES[i], time: i === 0 ? '23:00–01:00' : `${String(i * 2 - 1).padStart(2, '0')}:00–${String(i * 2 + 1).padStart(2, '0')}:00` }] : []),
  };
}
export function holidays(d: CivilDate): string[] {
  const l = solarToLunar(d), result: string[] = [];
  const solar: Record<string, string> = { '1/1': 'Tết Dương lịch', '30/4': 'Ngày Thống nhất', '1/5': 'Quốc tế Lao động', '2/9': 'Quốc khánh', '20/10': 'Phụ nữ Việt Nam', '20/11': 'Nhà giáo Việt Nam', '8/3': 'Quốc tế Phụ nữ' };
  const lunar: Record<string, string> = { '1/1': 'Tết Nguyên đán', '2/1': 'Mùng 2 Tết', '3/1': 'Mùng 3 Tết', '15/1': 'Tết Nguyên tiêu', '10/3': 'Giỗ Tổ Hùng Vương', '5/5': 'Tết Đoan Ngọ', '15/7': 'Lễ Vu Lan', '15/8': 'Tết Trung thu', '23/12': 'Ông Công, ông Táo' };
  if (solar[`${d.day}/${d.month}`]) result.push(solar[`${d.day}/${d.month}`]);
  if (!l.leap && lunar[`${l.day}/${l.month}`]) result.push(lunar[`${l.day}/${l.month}`]);
  return result;
}
export function upcomingHolidays(start: CivilDate, count = 4) {
  const result: { date: CivilDate; title: string; days: number }[] = [];
  for (let days = 0; days <= 370 && result.length < count; days++) {
    const date = addDays(start, days);
    if (!isValidDate(date)) break;
    holidays(date).forEach(title => result.push({ date, title, days }));
  }
  return result.slice(0, count);
}
