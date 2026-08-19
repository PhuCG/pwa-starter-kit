# <Tên tính năng>

> Trạng thái: ✅ Hoàn thành | 🚧 Một phần | ❌ Chưa làm
> Cập nhật lần cuối: YYYY-MM-DD — nhánh: `<branch>`

## Mục đích

Một đoạn ngắn: tính năng này giải quyết vấn đề gì cho người dùng. Không mô tả code.

## Màn hình & route

| Route | File | Ghi chú |
|---|---|---|
| `/example` | `src/features/example/ExamplePage.tsx` | |

Các state UI phải có: **loading · empty · content · error**. Ghi rõ mỗi state hiển thị gì.

## Hành vi

- Người dùng làm X → hệ thống làm Y.
- Điều kiện biên, thông báo lỗi, xác nhận trước hành động phá hủy.
- Thứ tự sắp xếp, quy tắc gộp nhóm, cái gì hiện trước.

## Domain & dữ liệu

| Thứ | Ở đâu |
|---|---|
| Luật / phân loại | `src/domain/<module>.ts` (+ `.test.ts`) |
| Ràng buộc | `src/domain/constraints.ts` |
| Đọc/ghi | `useAppStore` actions: `...` · Dexie: `src/db/repo.ts` |

Mọi phép tính hoặc phân loại đều nằm trong `src/domain/` kèm test — không nằm trong
component (luật 2 trong `../../CLAUDE.md`).

## i18n

Prefix key: `example*`. Thêm key vào **mọi** file trong `i18n/`, không chỉ một.
`src/lib/i18n.integrity.test.ts` sẽ báo lỗi nếu lệch.

## Quyết định

Ghi lại lựa chọn và đánh đổi mà đọc code không suy ra được:

- **<Quyết định>** — chọn A thay vì B vì ... . Hệ quả: ... .
- **Cố ý không làm** — ... , vì ... .

Nếu quyết định đủ lớn để ảnh hưởng ngoài tính năng này → viết ADR trong
[`../decisions/`](../decisions/) và link tới đây.

## Chưa làm / đã biết còn thiếu

- [ ] ...

## Tham chiếu

- Spec luồng: [../app_flow/](../app_flow/)
- Luật nghiệp vụ: [../domain_rules.md](../domain_rules.md)
