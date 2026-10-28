# Lịch Âm Dương 1.0.1 — bản WebP

**IPA unsigned mới: 23.618.146 byte = 23,62 MB = 22,52 MiB.**

So với bản 1.0.0 (58.947.857 byte = 56,22 MiB), giảm 35.329.711 byte, tương đương **59,93%**.

- 112 tranh chính WebP và 81 thumbnail chương, đủ hash đối chiếu với mã nguồn.
- Logo giao diện WebP; tổng cộng 194 file WebP trong IPA.
- Không còn JPEG cũ trong gói.
- iPhoneOS arm64, phiên bản 1.0.1, build 2, kèm một widget extension.
- ZIP/CRC và SHA-256 đã kiểm tra sau khi tải lại từ GitHub.
- SHA-256: 342d5741f21a1e04daee667ce8abef7df1e6dce16ea856a5cdea93938d4d7cc9

| Phần trong IPA | Dung lượng nén |
|---|---:|
| Tranh, thumbnail và logo WebP | 9.838.594 byte |
| Executable và framework | 11.694.398 byte |
| Asset catalog hệ thống | 1.892.620 byte |
| PNG/icon khác | 117.246 byte |

Ảnh được mã hóa một lần từ PNG gốc: tranh chương 800 px/Q58; ảnh đầu tab tối đa 768 × 512/Q56; thumbnail 160 px/Q50. Bản gốc vẫn được giữ cục bộ trong art-originals, không nằm trong IPA. Mức nén ưu tiên dung lượng và kích thước hiển thị trên iPhone; không được quảng cáo là nén không mất dữ liệu.

Release: https://github.com/hongson117/lich-am-duong-ios/releases/tag/unsigned-4

Build thành công: https://github.com/hongson117/lich-am-duong-ios/actions/runs/40683706571

Mã build: 5c1b7b13cf61502bf16e54ea0c221d1ac6482089

Đây vẫn là **IPA chưa ký**. Cần tự ký trước khi cài; công cụ ký cần xử lý cả ứng dụng và widget/App Group. Chưa kiểm thử cài đặt trên iPhone thật. 14 kiểm thử nghiệp vụ, 6 luồng giao diện và 21/21 kiểm tra Expo đã đạt trước build native.
