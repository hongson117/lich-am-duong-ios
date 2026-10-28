# Lịch Âm Dương

Ứng dụng iOS dành cho người Việt, thiết kế theo tranh làng quê, cây tre và bình minh. Viết bằng React Native + Expo SDK 57 + TypeScript; giao diện iOS dùng thành phần native, không phải WebView bọc website.

## Bắt đầu trên Windows

Đặt toàn bộ dự án tại `D:\công việc\Lich van nien`.

```powershell
cd 'D:\công việc\Lich van nien'
npm ci
npm run preview
```

Mở `http://127.0.0.1:4318` để dùng bản xem trước đã xuất trong `dist/`. Có thể chạy `START-PREVIEW.cmd`. Khi sửa mã nguồn, dùng `npm run web`, hoặc xuất lại bằng `npm run export:web`.

## IPA chưa ký trên GitHub

Repository riêng tư: https://github.com/hongson117/lich-am-duong-ios

Chạy workflow **Build unsigned iOS IPA** trong Actions. Máy macOS 26/Xcode 26.6 tạo native project bằng Expo prebuild, cài Pods, archive cho iPhone arm64 với signing tắt, kiểm tra binary rồi đóng gói IPA. Bản thành công được lưu trong Artifacts và GitHub prerelease khi bật tùy chọn xuất release. Không cần Expo token hoặc khóa Apple cho quy trình unsigned này.

File chưa ký phải được ký lại trước khi cài; widget cần công cụ ký xử lý cả extension và App Group. Chi tiết trong docs/UNSIGNED-IPA.md.

## Bộ tranh và font

- 81 tranh Đạo Đức Kinh: lịch ngày, câu trích và giải nghĩa cùng một chương; luân phiên chu kỳ 81 ngày. Mỗi trang chương dùng lại đúng tranh của mình.
- 31 tranh Việt Nam: minh họa các tab, thay đổi theo ngày với lựa chọn riêng từng tab.
- Font iPhone dùng San Francisco do iOS cung cấp qua font hệ thống; không phân phối tệp font Apple.
- Ảnh chạy trong app được tối ưu JPEG, có thumbnail cho danh sách. PNG gốc và hồ sơ tạo ảnh được giữ trong art-originals/ tại dự án local; thư mục này không đưa lên Git để giảm kích thước repository.

## Chức năng

- Lịch ngày và tháng, dương–âm Việt Nam UTC+7, 1900–2100; đổi hai chiều, tháng nhuận, Can Chi, tiết khí ước tính và các dịp lễ.
- Hoàng đạo và giờ hoàng đạo dưới góc nhìn văn hóa dân gian. Gợi ý theo 12 trực, không hứa hẹn vận may hay kết quả.
- 81 câu Đạo Đức Kinh luân phiên theo ngày, có chương, nguyên văn, diễn dịch và giải nghĩa riêng. Không dùng danh ngôn ngoài Đạo Đức Kinh.
- Tab **Tĩnh tâm**: đủ nguyên văn 81 chương, tóm lược tiếng Việt do ứng dụng biên soạn, tìm kiếm không dấu, chủ đề, đánh dấu và ghi chú riêng. Tóm lược không được trình bày như bản dịch toàn văn.
- Ngày giỗ lặp theo âm lịch, chọn cách xử lý tháng nhuận/ngày 30. Mỗi năm có sổ chuẩn bị riêng: thực đơn, khách mời, người cần gọi, checklist, ngân sách và khoản chi.
- Sao lưu/khôi phục JSON cho toàn bộ dữ liệu người dùng. Khôi phục bổ sung và giữ dữ liệu đã có; không tự bật thông báo.
- Thông báo cục bộ iOS tự chọn: giỗ và Rằm–Mùng 1, 7h ngày đó hoặc 18h hôm trước theo UTC+7. Không đưa tên người thân vào thông báo khóa màn hình. Tối đa 50 thông báo tiếp theo, nạp lại khi mở app.
- Widget iOS nhỏ/vừa, Lock Screen dạng chữ/hình chữ nhật; có timeline 60 ngày và trạng thái yêu cầu mở app khi hết dữ liệu. Widget chỉ chứa ngày và câu kinh.

## Chạy bản iOS

Widget không chạy trong Expo Go. Dùng development build hoặc TestFlight. Windows có thể dùng EAS Build để biên dịch trên máy macOS của Expo.

1. Cài Node.js LTS và chạy `npm ci`.
2. Đăng nhập tài khoản Expo: `npx eas-cli@latest login`.
3. Xác nhận bundle ID `vn.lichamduong.app` thuộc tài khoản phát hành; nếu đổi, đổi cả app group trong `app.json`.
4. Khởi tạo liên kết dự án EAS: `npx eas-cli@latest init`.
5. Bản thử iPhone: `npx eas-cli@latest build --platform ios --profile development-device`.
6. Sau khi cài build trên iPhone, chạy `npx expo start --dev-client` và mở development build.
7. Bản độc lập không cần máy dev: `npx eas-cli@latest build --platform ios --profile preview`.
8. Bản App Store: `npm run build:ios`, rồi kiểm tra trên TestFlight trước khi submit.

Việc ký bản cài iPhone, quản lý thiết bị thử và phát hành phụ thuộc tài khoản Apple Developer của chủ ứng dụng. Không có tài khoản, chứng chỉ hoặc IPA nào được tạo ngầm trong phiên phát triển này.

Trên Mac: `npx expo prebuild --platform ios`, `npx expo run:ios`. Windows không tạo được dự án iOS native bằng Expo prebuild; cấu hình tái tạo nằm trong `app.json`, `eas.json` và mã widget. Không chỉnh sửa native files sinh tự động làm nguồn duy nhất.

## Kiểm tra

```powershell
npm test
npm run typecheck
npm run export:web
npm run export:ios
npm run test:e2e
python -X utf8 scripts/verify-tao.py docs/sources/tao-source.html
```

`test:e2e` dùng Microsoft Edge headless, cỡ màn hình iPhone. Đây là kiểm thử luồng React Native Web, không thay thế kiểm thử iPhone. `export:ios` kiểm tra bundling và Hermes, không tạo IPA hay xác minh native widget trên thiết bị.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `App.tsx` | Điều hướng, lưu dữ liệu nguyên khối, khôi phục, liên kết sâu |
| `src/components/` | Màn hình và biểu mẫu |
| `src/lib/calendar.ts` | Chuyển lịch, ngày dân sự không phụ thuộc múi giờ thiết bị |
| `src/lib/memorials.ts` | Ngày giỗ và sổ chuẩn bị |
| `src/lib/personal.ts` | 81 chương, tìm kiếm, dữ liệu cá nhân, backup v2 |
| `src/lib/reminders.ts` | Lập lịch thông báo thuần TypeScript |
| `src/native/` | Tích hợp thông báo, widget; bản web có fallback rõ ràng |
| `src/widgets/` | Giao diện widget SwiftUI qua Expo Widgets |
| `src/data/` | Tháng âm đã tính, nguyên văn/biên soạn Đạo Đức Kinh |
| `assets/` | Tranh và logo gốc được tạo riêng |
| `scripts/` | Tái tạo lịch, đối chiếu văn bản, chạy preview |
| `tests/` | Kiểm thử nghiệp vụ và hành trình người dùng |
| `docs/` | Nguồn, bàn giao, App Store, quyền riêng tư, hình kiểm thử |

## Giới hạn rõ ràng

- Dùng UTC+7 cố định; không tái dựng toàn bộ thay đổi lịch sử múi giờ Việt Nam.
- Không có gia phả dạng cây, audio thu âm, đồng bộ tài khoản/iCloud tự động hoặc server. Dữ liệu người thân nằm trong sổ giỗ; iCloud Drive chỉ là nơi người dùng có thể cất file backup.
- Chưa xác nhận native build/signing hoặc chạy widget/thông báo trên iPhone trong môi trường Windows này.
- Muốn nộp App Store phải hoàn tất `docs/APP_STORE.md`, thông tin hỗ trợ/chính sách công khai và thử nghiệm thực tế.

## Tài liệu nguồn

Xem `docs/SOURCES.md`, `docs/DESIGN-PROMPTS.json` và `docs/THIRD_PARTY_NOTICES.md`. Quyền đối với nguyên tác Đạo Đức Kinh không đồng nghĩa có quyền sao chép mọi bản dịch hiện đại; dự án dùng nguyên văn cổ và nội dung tiếng Việt mới biên soạn.
