# Tối ưu dung lượng ảnh — bản 1.0.1

Bản trước dùng 112 JPEG lớn và 112 thumbnail: 42.602.140 byte. Bản WebP dùng 112 ảnh chính và 81 thumbnail cần thiết: 9.775.936 byte, giảm 77,05%. Không cắt bớt chương hoặc tranh.

| Thành phần | Cấu hình mới |
|---|---|
| Tranh Đạo Đức Kinh/lịch ngày | WebP 800 × 800, quality 58 |
| Tranh Việt Nam đầu tab | WebP tối đa 768 × 512, quality 56 |
| Thumbnail chương, hiển thị 52 pt | WebP 160 × 160, quality 50 |
| Logo trong giao diện | WebP 480 × 480, quality 70; 59.080 byte |
| App icon iOS | PNG 1024 × 1024, palette tối ưu; 569.284 byte |
| Logo khởi động | PNG 640 × 640; 248.572 byte |

WebP dùng effort 6, smartSubsample, bỏ metadata thừa; được mã hóa trực tiếp từ PNG gốc trong art-originals để tránh nén lặp từ JPEG. Tranh chương 800 px phục vụ khoảng 2× độ rộng ảnh thông thường trên iPhone; chọn ưu tiên dung lượng, không nhằm phóng to xem chi tiết toàn màn hình máy tính.

112 thumbnail cũ đã giảm thành 81 thumbnail chương; các ảnh tab không tải thumbnail không sử dụng. JPEG cũ đã lưu vào art-originals/legacy-jpeg và bị loại khỏi tài nguyên chạy. Ảnh gốc vẫn nằm tại dự án local, không đóng vào IPA.

Expo Image SDK 57 được dùng cho hiển thị WebP iOS/web. Tắt libavif/libdav1d vì app không dùng AVIF, để không đưa decoder không cần thiết vào binary.

Kiểm tra build kiểm tra số lượng, hash, format, kích thước và ngân sách ảnh 14 MB. Bước đóng gói IPA đối chiếu 112 hash ảnh chính, 81 thumbnail, logo WebP và từ chối bundle còn JPEG. File báo cáo IMAGE-OPTIMIZATION.json chứa số liệu máy đọc được.

Các con số trên là dung lượng tài nguyên ảnh; dung lượng IPA cuối còn bao gồm executable, thư viện React Native/Hermes, widget và tài nguyên hệ thống. Dung lượng IPA mới được xác minh sau khi GitHub build hoàn thành.
