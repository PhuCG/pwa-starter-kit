# Luật nghiệp vụ

File này là **source of truth cho `src/domain/`**. Mỗi luật ở đây phải có một hàm và
một test tương ứng. Đổi luật → sửa file này **trong cùng commit** với code và test.

Nếu một luật chỉ nằm trong đầu bạn hoặc chỉ nằm trong một component, nó không phải
luật — nó là bug đang chờ.

---

## 1. Ràng buộc chung (`src/domain/constraints.ts`)

Đây là định nghĩa "dữ liệu hợp lệ". Store assert ở ranh giới ghi; UI validate cùng
những luật này **trước khi** submit, với thông báo thân thiện. Vì vậy một
`DomainConstraintError` lúc chạy **luôn là bug lập trình**, không bao giờ là lỗi
người dùng nhập.

| Ràng buộc | Ý nghĩa |
|---|---|
| `isPositiveNumber` / `isNonNegativeNumber` | `NaN` và `Infinity` **không phải** số hợp lệ |
| `isDayKey` | Đúng dạng `yyyy-MM-dd`, có đệm số 0, tháng 1–12, ngày 1–31 |
| `isMonthKey` | Đúng dạng `yyyy-MM` |
| `isNonBlank` | Chuỗi toàn khoảng trắng bị coi là rỗng |

## 2. Ngày tháng (`src/domain/dates.ts`)

- Mọi ngày lưu trữ là **chuỗi key** `yyyy-MM-dd` / `yyyy-MM`, không phải `Date`. Đối
  tượng `Date` mang theo múi giờ, và một bản ghi tạo lúc 23:30 sẽ nhảy sang ngày khác
  khi người dùng đi công tác.
- Key có đệm số 0 nên so sánh trực tiếp bằng `<`, `>`, `===` là đúng — không cần hàm
  so sánh riêng.
- Hiển thị luôn qua `Intl.DateTimeFormat(i18n.language, ...)`, không hardcode tên
  tháng.

## 3. <Luật nghiệp vụ của bạn>

Với mỗi luật, ghi đủ ba thứ:

**Công thức / quy tắc.** Viết bằng lời hoặc bằng ký hiệu, không dán code.

**Trường hợp biên.** Chia cho 0, danh sách rỗng, tháng có 28/29/30/31 ngày, giá trị
âm, số quá lớn. Trường hợp biên nào không có test thì coi như chưa quyết định.

**Vì sao là luật này chứ không phải luật kia.** Đây là phần code không nói được.

Ví dụ khung:

> ### 3.1 <Tên luật>
>
> `<đầu ra> = <biểu thức>`
>
> - Khi `<mẫu số>` bằng 0 → trả về `<giá trị>`, không phải `NaN`.
> - Làm tròn: chỉ làm tròn ở **biên hiển thị**, không bao giờ làm tròn giữa phép tính.
> - Chọn cách này vì ... . Phương án `<B>` bị loại vì ... .
>
> Code: `src/domain/<module>.ts` · Test: `src/domain/<module>.test.ts`
