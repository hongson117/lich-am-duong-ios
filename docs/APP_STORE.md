# Chuẩn bị App Store

Ngày rà soát: 28/10/2026. Nguồn chính thức: https://developer.apple.com/app-store/review/guidelines/

## Định vị

**Tên:** Lịch Âm Dương

**Phụ đề đề xuất:** Lịch Việt, ngày giỗ & tĩnh tâm

**Danh mục đề xuất:** Lifestyle; danh mục phụ Productivity. Chủ tài khoản xác nhận trước khi đăng.

**Mô tả ngắn:** Lịch Việt Nam cùng sổ ngày giỗ gia đình và không gian chiêm nghiệm Đạo Đức Kinh. Chủ động chuẩn bị việc gia đình, giữ những ghi chú riêng và xem nhanh lịch bằng widget iPhone.

## Những điều khoản cần xem đúng

- **4.2:** Apple yêu cầu công dụng đủ sâu và trải nghiệm giống ứng dụng, không chỉ gói một website/cuốn sách. Sổ chuẩn bị từng năm, checklist, tính chi phí, ghi chú cá nhân, backup và tích hợp iOS tạo công dụng thực tế.
- **4.3:** Apple không chấp nhận app không phân biệt được với thứ đã phổ biến. Apple nêu các ví dụ, trong đó có fortune telling; không thể suy ra mọi app lịch hoặc câu nói đều bị từ chối. Một app duy nhất, một Bundle ID, chức năng gia đình và nhật ký riêng; không tạo nhiều bản chỉ thay skin.
- **4.4:** Widget phải có chức năng phù hợp, mô tả chính xác, không quảng cáo. Native widget cần được kiểm tra thật, không chỉ có tên trong hồ sơ.
- **2.1:** App phải hoàn chỉnh và được thử trên thiết bị. Bundle JS xuất thành công không thay cho build iOS đã ký hay thử TestFlight.
- **5.1 / 5.2:** Quyền riêng tư và quyền nội dung vẫn phải được kiểm tra. Nguyên tác cổ thuộc public domain không làm mọi bản dịch hiện đại tự do sử dụng. Không có khẳng định “100% được duyệt”.

Ứng dụng không đăng nội dung người dùng ra cộng đồng. Ghi chú cá nhân lưu cục bộ khác với mạng UGC công khai; không thêm tài khoản/cộng đồng chỉ để tăng số tính năng.

## Những điểm đã có trong mã nguồn

1. React Native, thành phần UI native, không WebView.
2. Ngày giỗ âm lịch cùng quy tắc tháng nhuận/tháng thiếu và hồ sơ chuẩn bị riêng mỗi năm.
3. Nguyên văn đầy đủ 81 chương, tóm lược riêng, tìm chủ đề, đánh dấu và nhật ký; 81 câu trích hằng ngày có nguồn.
4. Widget Home Screen và Lock Screen qua Expo Widgets, timeline có ngày hết hiệu lực rõ ràng.
5. Local Notifications tùy chọn, không cần đăng ký push token hay gửi dữ liệu lên server.
6. Sao lưu v2 và khôi phục nguyên khối; dữ liệu v1 được đọc và nâng cấp.
7. Thông tin hoàng đạo có nhãn văn hóa tham khảo, quy ước minh bạch. Không bói tuổi, hứa tài lộc, đảm bảo chữa bệnh hoặc thu phí xem bói.

## Release gates — chưa được coi là hoàn thành chỉ vì có mã

- [ ] Chủ ứng dụng cung cấp Apple Developer/Expo account và quyền signing, không chia sẻ mật khẩu trong tài liệu.
- [ ] Xác nhận Bundle ID và App Group thuộc cùng team; cấu hình EAS project ID.
- [ ] Chạy EAS/native build, cài iPhone thật; mở offline ngay lần đầu.
- [ ] Thử widget ở cỡ nhỏ/vừa, accessory rectangular/inline; light/dark/tinted/Always On; tap mở đúng app; kiểm tra chuyển ngày UTC+7 và timeline hết hạn.
- [ ] Thử xin/từ chối/thu hồi quyền thông báo, app đóng, máy khởi động lại, chỉnh ngày giỗ và xóa giỗ; xác nhận lịch cũ bị hủy; thử ở múi giờ khác Việt Nam.
- [ ] Thử Files share sheet, lưu iCloud Drive thủ công và nhập sang iPhone khác; đối chiếu ghi chú, checklist, chi phí.
- [ ] Thử VoiceOver, Dynamic Type cỡ lớn và cỡ màn hình nhỏ trên iOS.
- [ ] Đọc biên tập toàn bộ 81 tóm lược; thẩm định thêm bảng lịch với niên lịch chính thức nếu dùng thương mại, nhất là ngày sát giao sóc/trung khí.
- [ ] Xử lý/đánh giá lại cảnh báo npm audit còn nằm trong chuỗi công cụ Expo CLI trước release. Không dùng `npm audit fix --force` vì đề nghị hạ SDK không tương thích.
- [ ] Có Support URL thật, Privacy Policy URL thật và địa chỉ email liên hệ của chủ ứng dụng. Bản dự thảo chính sách có trong repo; chưa có URL công khai.
- [ ] Khai App Privacy dựa trên binary thực tế và mọi SDK sau cùng. Thiết kế hiện tại không thu thập dữ liệu người dùng lên server; không suy ra tự động rằng mọi bản build tương lai đều vậy.
- [ ] Dùng ảnh chụp iPhone thật/Simulator từ release build trong App Store Connect. Ảnh kiểm thử web trong docs chỉ dành cho xem giao diện, không giả làm ảnh chụp iOS đã xác minh.
- [ ] TestFlight, kiểm tra crash và tính toàn vẹn dữ liệu, rồi mới gửi App Review.

## Review notes (English draft, adjust after device validation)

Lich Am Duong is a Vietnamese family calendar and personal reflection application. It uses native React Native UI, with no website wrapper, account requirement, advertising, or paid fortune-telling service.

The core workflow is annual lunar-date family memorial planning. In the Ngay gio tab, add a memorial, select leap-month and short-month handling, then open its year-specific preparation notebook. The notebook supports checklists, menu planning, guests, people to contact, budgets, and individual expenses.

The Tinh tam tab contains all 81 chapters of the public-domain Chinese Dao De Jing, with independently written Vietnamese summaries, topic search, bookmarks, and private reflection notes. Daily selections cite chapter numbers and distinguish the original from our interpretation. No modern copyrighted translation has been imported.

Utilities include manual JSON backup/restore through the iOS share sheet and Files picker, opt-in local reminders, and Home/Lock Screen widgets. No login is needed to review any feature. User data stays on device; backups are exported only at the user's request. Traditional almanac information is explicitly labeled as cultural reference.

Before submitting, add actual tested iOS/device versions, exact steps for enabling widgets/reminders, and your verified support and privacy URLs. Do not claim these device checks passed until performed.
