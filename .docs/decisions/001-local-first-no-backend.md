# 001. Local-first, không backend

> Trạng thái: Accepted
> Ngày: <YYYY-MM-DD>

## Bối cảnh

Ứng dụng cá nhân, một người dùng một thiết bị, không có nhu cầu chia sẻ dữ liệu giữa
người dùng. Có backend nghĩa là: chi phí hạ tầng hàng tháng, đăng nhập, chính sách
riêng tư, và một điểm chết khi mạng hỏng.

## Quyết định

Toàn bộ dữ liệu nằm trong IndexedDB (Dexie) trên máy người dùng. Không auth, không
đồng bộ, không server.

## Phương án đã cân nhắc

| Phương án | Vì sao không chọn |
|---|---|
| Firebase / Supabase | Có auth + đồng bộ, nhưng kéo theo chi phí, phụ thuộc mạng, và trách nhiệm giữ dữ liệu người khác |
| localStorage | Đồng bộ, chặn main thread, giới hạn ~5MB, không có index |
| Chỉ giữ trong bộ nhớ + export tay | Mất dữ liệu mỗi lần đóng tab |

## Hệ quả

**Được:** chạy offline hoàn toàn, không chi phí vận hành, không rủi ro rò rỉ dữ liệu
người dùng vì chúng tôi không giữ gì cả, khởi động nhanh vì không đợi mạng.

**Mất:** không dùng được trên nhiều thiết bị. Không khôi phục được nếu người dùng mất
máy.

**Trở nên khó hơn về sau:** trình duyệt **có quyền xóa** IndexedDB khi máy thiếu dung
lượng, và mất là mất vĩnh viễn. Ba lớp phòng thủ bắt buộc phải có:

1. `navigator.storage.persist()` lúc khởi động — chỉ hiệu lực trên Chromium/Firefox.
2. Trên iOS Safari, quyền miễn xóa chỉ đến khi người dùng **cài PWA ra màn hình
   chính** → thẻ mời cài đặt không phải là marketing, nó là biện pháp bảo vệ dữ liệu.
3. Export JSON thủ công là bản sao lưu duy nhất người dùng thật sự sở hữu.

Thêm đồng bộ sau này sẽ tốn: mọi bảng đều cần khóa hợp nhất và dấu thời gian ghi, thứ
mà schema hiện tại không có.
