# <PROJECT NAME> — Tài liệu

Repo này là **source of truth** cho hành vi sản phẩm. Khi code và doc mâu thuẫn, doc
mô tả ý định — hãy sửa cái sai, đừng im lặng bỏ qua.

Doc ghi lại **hành vi và lý do**, không chép lại code. Nếu một đoạn doc chỉ đúng khi
đọc kèm code thì nó thuộc về comment trong code, không thuộc về đây.

---

## Bản đồ tài liệu

| Thư mục / file | Nội dung | Vai trò |
|---|---|---|
| [features/](./features/) | Trạng thái + doc chi tiết từng tính năng | **Cập nhật mỗi lần đổi code** |
| [app_flow/](./app_flow/) | Luồng điều hướng, màn hình, state UI | Spec hành vi |
| [domain_rules.md](./domain_rules.md) | Mọi luật nghiệp vụ + ràng buộc validation | Source of truth cho `src/domain/` |
| [decisions/](./decisions/) | ADR — quyết định kiến trúc và cái đã bị loại | Lịch sử lý do |
| [theme/design-system.md](./theme/design-system.md) | Design system: màu, typography, spacing | Nguồn của `src/styles/tokens.css` |

Thư mục nên thêm khi dự án cần: `screenshots/` (ảnh tham chiếu), `research/`
(phỏng vấn, phân tích đối thủ), `revenue/` (mô hình doanh thu).

---

## Luật cập nhật docs (bắt buộc)

Mỗi lần thay đổi hành vi tính năng, doc phải đi cùng commit đó — không để "viết sau".

1. **Đổi/thêm tính năng** → cập nhật `features/<feature>.md` (tạo mới từ
   [`features/_TEMPLATE.md`](./features/_TEMPLATE.md) nếu chưa có) và bảng trạng thái
   trong [`features/README.md`](./features/README.md).
2. **Đổi luật nghiệp vụ** → cập nhật [`domain_rules.md`](./domain_rules.md) trong
   **cùng commit** với thay đổi trong `src/domain/` và test tương ứng.
3. **Đổi luồng màn hình / route / state UI** → cập nhật file tương ứng trong
   [`app_flow/`](./app_flow/).
4. **Đổi token thiết kế** → cập nhật [`theme/design-system.md`](./theme/design-system.md).
5. **Quyết định có phương án thay thế thật sự** (chọn A thay vì B, đánh đổi gì) → viết
   một ADR trong [`decisions/`](./decisions/).
6. **Ràng buộc toàn dự án hoặc thứ cố tình không làm** → thành một luật đánh số trong
   [`../CLAUDE.md`](../CLAUDE.md), và ghi vào mục **Quyết định** của doc feature.

---

## Ghi chú riêng của dự án

Liệt kê những điểm dự án **cố ý** làm khác thông lệ, để không ai "sửa lại cho đúng":

- **Local-first, không backend.** Không auth, không đồng bộ. Guard chỉ kiểm tra
  `hasCompletedOnboarding`.
- **<Điểm khác biệt khác — xóa dòng này nếu không có.>**
