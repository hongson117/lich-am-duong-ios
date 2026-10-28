# Kiểm chứng bàn giao

Môi trường: Windows, Node 24, Expo SDK 57. Kiểm tra giao diện bằng Edge headless ở kích thước iPhone. Ngày kiểm chứng: 28/10/2026.

## Đã đạt

- TypeScript strict: không lỗi.
- 14 kiểm thử nghiệp vụ: các mốc Tết, tháng nhuận, toàn dải quy đổi 1900–2100, ranh giới nửa đêm Việt Nam, lặp ngày giỗ, xử lý ngày 30, quy tắc tháng nhuận, backup, nội dung 81 chương, tìm không dấu, lịch thông báo và giới hạn UTF-8.
- 6 hành trình giao diện: lịch/chuyển đổi; thêm giỗ/sổ chuẩn bị/chi phí/checklist/backup; nhập bản sao và từ chối tệp sai; tìm chương/đánh dấu/ghi chú/đọc lại; báo lỗi dữ liệu hỏng mà không ghi đè.
- Expo Doctor: 21/21 kiểm tra đạt sau khi đồng bộ expo-font về SDK 57.
- Expo export web thành công.
- Expo export iOS/Hermes thành công. Đây là gói mã JS/Hermes, không phải IPA được ký.
- Đối chiếu tự động 81/81 câu trích khớp đúng chương trong bản Vương Bật; 81 chương nguyên văn và 81 tóm lược biên tập đã có trong dữ liệu.
- Đã xem ảnh giao diện sau sửa bố cục ảnh nền và nhãn truy cập. Ảnh trong `docs/screenshots` là bản web ở viewport iPhone, không phải ảnh chụp thiết bị iOS.

## Chưa xác minh trên thiết bị

- Signing, TestFlight và App Review. Native archive iPhoneOS arm64 chưa ký đã build thành công trên GitHub; xem BUILD-RESULT.md.
- WidgetKit/Expo Widgets chạy thực tế, nội dung khi khóa màn hình và refresh timeline do iOS điều phối.
- Local Notifications khi ứng dụng bị đóng, quyền bị thu hồi, máy khởi động lại và giờ hệ thống thay đổi.
- Share sheet/Files/iCloud Drive trên iPhone.
- VoiceOver và Dynamic Type trên thiết bị thật.

Lần gọi Expo prebuild iOS trên Windows bị công cụ từ chối vì cần macOS hoặc Linux để tạo native project. Không có lỗi này trong mã lịch; EAS Build sẽ prebuild trên máy build macOS. Không gọi kết quả export Hermes là “đã build IPA”.

## Phụ thuộc

`npm audit` ghi nhận 8 cảnh báo (5 low, 3 high) trong chuỗi Expo CLI, chủ yếu zod/deepmerge và các gói dẫn xuất. Không cưỡng ép sửa bằng cách hạ SDK. Những package này không được mã ứng dụng dùng để xử lý dữ liệu gia đình; trước release vẫn cần đánh giá lại công cụ build và bản vá upstream. Expo Doctor đạt không thay thế đánh giá bảo mật hoặc xét duyệt App Store.

## Dữ liệu và phương pháp

Round-trip toàn dải kiểm tra tính nhất quán, không chứng minh mọi ngày đã được đối chiếu với niên lịch chính thức độc lập. Thông tin dân gian công khai quy ước sử dụng. Tóm lược Đạo Đức Kinh là nội dung biên soạn để đọc hiểu, không tự nhận là bản dịch học thuật toàn văn.
