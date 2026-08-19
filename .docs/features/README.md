# Tính năng — trạng thái

Bảng này là **danh sách kiểm tra sống**. Mỗi PR đụng vào một tính năng phải cập nhật
dòng tương ứng ở đây trong cùng commit.

- Cột **Code**: ✅ hoàn thành · 🚧 một phần · ❌ chưa làm
- Cột **Doc**: đường dẫn tới doc chi tiết, hoặc "—" nếu chưa viết. Lần tới sửa tính
  năng đó thì viết doc từ [`_TEMPLATE.md`](./_TEMPLATE.md) trước khi merge.

Một dòng "✅ / —" là **nợ kỹ thuật**, không phải trạng thái bình thường.

---

## Shell & điều hướng

| Tính năng | Route | Code | Doc |
|---|---|---|---|
| Main shell (bottom nav + FAB) | `/` `/settings` | ✅ | — |
| Khóa viewport (không kéo rê, không zoom, `#root` là container cuộn) | toàn app | ✅ | — |
| Onboarding | `/onboarding` | ✅ | — |

## Tính năng chính

| Tính năng | Route | Code | Doc |
|---|---|---|---|
| <Tính năng của bạn> | `/...` | ❌ | — |

## Hạ tầng

| Tính năng | Code | Doc |
|---|---|---|
| PWA: cài đặt & tự cập nhật | ✅ | — |
| Độ bền dữ liệu (`storage.persist`, báo lỗi ghi) | ✅ | — |
| Đa ngôn ngữ (vi/en) + test toàn vẹn catalog | ✅ | — |

## Cố ý không làm

| Tính năng | Lý do |
|---|---|
| Đăng nhập / tài khoản | Local-first, không backend |
| Dark theme | <chưa làm / không cần> |
