# Kết quả build IPA chưa ký

- Repository công khai: https://github.com/hongson117/lich-am-duong-ios
- GitHub Release: https://github.com/hongson117/lich-am-duong-ios/releases/tag/unsigned-1
- Workflow thành công (lần thử 2): https://github.com/hongson117/lich-am-duong-ios/actions/runs/40658191862
- Mã nguồn ứng dụng được build: b4d13f79ef0c6193eceb90057b904e6989d8abf0
- Phiên bản: 1.0.0; Bundle ID: vn.lichamduong.app.
- Nền tảng: iPhoneOS, arm64; binary Release thật, không phải Simulator.
- Tên file: Lich-Am-Duong-unsigned.ipa
- Dung lượng: 58.947.857 byte (58,95 MB).
- SHA-256: 849b949e9dccb05955c5338cb8d6b7eefac427eaf744b61c6d01c1ca98ae6ca6

Đã tải lại file từ GitHub Release và kiểm tra: checksum khớp với bản build, ZIP/CRC hợp lệ, executable Mach-O arm64, Info.plist xác nhận iPhoneOS, đủ 112 ảnh chính có hash khớp mã nguồn và có một widget extension. App chính chưa được ký.

Bản local nằm tại build/github-release/. Bản này cần được ký lại trước khi cài vào iPhone. Chưa kiểm tra chạy trên iPhone thật, ký lại bằng công cụ bên thứ ba, thông báo khi app đóng hay widget runtime. Phần mở rộng widget cần provisioning/entitlement App Group phù hợp.

Repository đã chuyển công khai theo xác nhận trực tiếp của chủ dự án. Runner tiêu chuẩn của GitHub đã chạy được sau khi chuyển public. Không thay đổi thông tin thanh toán hoặc hạn mức tài khoản.

