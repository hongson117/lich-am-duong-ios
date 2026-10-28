# Lịch Âm Dương — IPA chưa ký

Bản Release cho iPhone arm64, biên dịch trên GitHub Actions từ mã nguồn trong repository này. Không phải bản Simulator và chưa được Apple ký/xét duyệt.

- File IPA chưa có chứng chỉ/provisioning profile hợp lệ. Cần ký lại trước khi cài lên iPhone.
- Gói gồm phần mở rộng widget. Công cụ ký cần xử lý cả app chính, extension và App Group. Một số phương thức ký cá nhân có thể bỏ extension hoặc không cấp entitlement App Group; khi đó widget không hoạt động đầy đủ.
- Không nhập mật khẩu Apple ID, khóa p12/p8 hoặc provisioning profile vào repository.
- So khớp SHA-256 trong SHA256SUMS.txt trước khi sử dụng.
- IPA này không dùng để tải trực tiếp lên App Store Connect. Bản App Store cần quy trình signing/phát hành riêng.

Nguồn ứng dụng, 81 tranh Đạo Đức Kinh dùng chung cho lịch ngày và chương tương ứng, cùng bộ tranh Việt Nam minh họa các tab được giữ trong repository. Hình gốc và hồ sơ tạo ảnh đầy đủ nằm ở thư mục dự án trên máy.
