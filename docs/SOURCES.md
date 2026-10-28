# Nguồn và quy ước dữ liệu

## Âm lịch

- Astronomy Engine (Don Cross), MIT: https://github.com/cosinekitty/astronomy
- API SearchMoonPhase, Seasons, SunPosition: https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md
- `scripts/generate-calendar.mjs` xây bảng tháng từ điểm sóc và đông chí, theo ngày dân sự UTC+7. Tháng 11 chứa đông chí; nếu có 13 tháng giữa hai tháng 11, tháng đầu không chứa trung khí là tháng nhuận. Không sao chép mã Hồ Ngọc Đức có giới hạn sử dụng phi thương mại.
- Tết 2026: nguồn Chính phủ xác nhận 17/02/2026 là mùng 1 Tết Bính Ngọ: https://baochinhphu.vn/tai-nan-giao-thong-giam-trong-ngay-dau-tien-cua-nam-binh-ngo-102260217165027759.htm
- Kiểm thử round-trip toàn dải xác minh tính nhất quán, không phải đối chiếu độc lập 73.414 ngày với lịch chính thức. Bộ kiểm thử có các mốc Tết, tháng nhuận và dịp lễ đã biết.

## Văn hóa dân gian

- Bảng ngày Đạo–Viễn–Thông–Đạt: tháng Giêng/Bảy có Tý, Sửu, Tỵ, Mùi; các nhóm tháng kế tiếp dịch hai địa chi. Đây là một quy ước bốn ngày, khác hệ sáu thần thường thấy ở ứng dụng khác.
- Nguồn bảng truyền thống: *Thông thư*, bảng ngày hoàng đạo và hắc đạo: https://thuvien.kabala.vn/ebook/Huyen-Hoc-Dong-Phuong/42-thong-thu.pdf
- Giờ hoàng đạo theo chu kỳ sáu nhóm địa chi ngày. Giờ Tý 23h–1h qua ngày; app hiển thị khung dân gian, không dùng để khẳng định vận mệnh.
- 12 trực xác định theo chi ngày và tháng tiết khí. Gợi ý đời sống được biên soạn nhẹ nhàng, không phải luận giải bói toán cá nhân. Tiết khí là nhãn ước tính tại 12h Việt Nam, không cam kết thời điểm giao tiết.

## Đạo Đức Kinh

- Nguyên văn: Lão Tử, bản Vương Bật tại Wikisource: https://zh.wikisource.org/wiki/道德經_(王弼本)
- Nguyên tác cổ thuộc public domain. Dự án không nhập bản dịch tiếng Việt của dịch giả hiện đại.
- Snapshot nguồn dùng cho việc đối chiếu: `docs/sources/tao-source.html`.
- 81 chương nguyên văn nằm trong `tao-chapters-original.json`, bỏ phần chú giải Vương Bật và giao diện website khi trích xuất.
- Tóm lược chương, diễn dịch câu trích, giải nghĩa và gợi ý thực hành được viết mới cho ứng dụng. Chúng là cách đọc biên tập, không phải bản dịch học thuật đã thẩm định hoặc toàn văn tiếng Việt 81 chương.
- `verify-tao.py` đối chiếu 81 câu trích với đúng chương, bỏ dấu câu và phần chú giải; không chỉ tìm trên toàn sách.

## Nền tảng

- Expo SDK 57: https://docs.expo.dev/versions/v57.0.0/
- Widget và giới hạn runtime: https://docs.expo.dev/versions/v57.0.0/sdk/widgets/
- Local Notifications: https://docs.expo.dev/versions/v57.0.0/sdk/notifications/
- Apple Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
