# Design system

Nguồn thi hành: [`src/styles/tokens.css`](../../src/styles/tokens.css). File này giải
thích **vì sao** các token có giá trị như vậy và dùng chúng ở đâu — không chép lại
danh sách giá trị (chép là sẽ lệch).

**Luật 3 trong `../../CLAUDE.md`: không có hex thô, không có px thô trong `src/`.**
Đổi thương hiệu = sửa `tokens.css`. Nếu sửa ở đó mà giao diện không đổi theo, đó là
bug của component, không phải lý do để hardcode.

---

## Màu

| Nhóm token | Dùng cho |
|---|---|
| `--color-background` / `--color-surface` / `--color-surface-variant` | nền trang · nền thẻ · nền chìm (input, track) |
| `--color-primary` / `--color-secondary` | hành động chính, trạng thái active, gradient |
| `--color-text-main` / `-sub` / `-muted` | nội dung chính · mô tả phụ · nhãn và placeholder |
| `--color-border` / `--color-border-strong` | viền thẻ · viền input đang focus |
| `--color-success` / `-error` / `-warning` / `-info` | phản hồi trạng thái |
| `--color-positive` / `--color-negative` | giá trị có chiều (tăng/giảm, vào/ra) |
| `--chart-1..7` (+ `-light`) | chuỗi biểu đồ, lặp theo chỉ số |

Ba lưu ý dễ sai:

- **`--color-primary` bị nhân bản ba chỗ** vì trình duyệt cần biết màu chrome trước
  khi CSS tải: `APP.themeColor` trong `src/app.config.ts`, thẻ `<meta name="theme-color">`
  trong `index.html`, và token này. `npm run init` sửa cả ba cùng lúc — đừng sửa tay
  từng chỗ.
- **Màu ngữ nghĩa theo chiều, không theo hình thức.** Dùng `--color-positive`, đừng
  dùng `--color-success` cho một con số tăng: hai thứ này có thể tách nhau khi làm
  dark theme.
- **Chuỗi biểu đồ có bản `-light`** để tô nền vùng/nhãn mà không tự pha alpha.

## Dark theme

Bảng màu tối nằm dưới **một selector duy nhất**: `:root[data-theme="dark"]`.

**CSS không bao giờ đọc `prefers-color-scheme` trực tiếp.** Nếu đọc, media query sẽ
tiếp tục áp giao diện của hệ điều hành ngay cả sau khi người dùng đã chọn ngược lại,
và hai nguồn sẽ mâu thuẫn âm thầm. Thay vào đó:

1. [`src/lib/theme.ts`](../../src/lib/theme.ts) quy đổi lựa chọn (`system` / `light` /
   `dark`) thành thuộc tính `data-theme` trên `<html>`, và cập nhật luôn thẻ
   `<meta name="theme-color">` — trên PWA đã cài, đó là màu thanh trạng thái.
2. Một **script inline trong `index.html`** chạy trước lần vẽ đầu tiên để đặt thuộc
   tính đó, nếu không người dùng chế độ tối sẽ thấy một nháy trắng mỗi lần mở app.
   Script này giữ bản sao riêng của khóa localStorage — `npm run init` sửa cả hai chỗ.

Ba nhóm token **không** đổi theo giao diện, và đó là chủ ý:

- `--color-on-accent` — chữ/icon nằm **trên** nền màu đậm (primary, gradient, danger).
  Nền vẫn bão hòa ở chế độ tối nên độ tương phản đã đúng; lật màu sẽ làm mất chữ.
- **Gradient** — giữ nguyên vì chúng là nhận diện thương hiệu.
- **Spacing, radius, type scale** — hình học không có lý do gì để thay đổi theo màu.

Điều **có** đổi mà dễ quên: `--color-primary` sáng lên (`#818cf8`) vì màu indigo gốc
không đủ tương phản trên nền gần đen; và đổ bóng gần như vô nghĩa trên nền tối, nên
độ nổi ở đó đến từ việc `--color-surface` sáng hơn `--color-background`.

## Khoảng cách

Thang `--sp-xxs` (2px) → `--sp-massive` (64px). Chỉ dùng bậc trong thang; một giá trị
không nằm trong thang có nghĩa là bố cục đang bù cho một vấn đề khác.

Nhịp mặc định: padding thẻ `--sp-lg`, khoảng cách giữa các thẻ `--sp-md`, khoảng cách
giữa các nhóm `--sp-xl`.

## Bo góc

`--radius-xs` (4px) → `--radius-xxl` (24px), `--radius-full` cho pill và avatar.
Thẻ dùng `--radius-lg`, sheet dùng `--radius-xxl` ở hai góc trên.

## Đổ bóng

`--shadow-card` · `--shadow-card-hover` · `--shadow-button` · `--shadow-floating`.

**Thẻ dùng viền HOẶC bóng, không dùng cả hai** (luật 6). Cả hai cùng lúc tạo ra hai
đường phân cách cho một cạnh và làm giao diện trông nặng.

## Chữ

Lớp tiện ích `.text-*` trong `tokens.css`, không viết `font-size` rời rạc:

| Nhóm | Lớp | Dùng cho |
|---|---|---|
| Headline | `.text-headline-m` `.text-headline-s` | tiêu đề trang, con số chủ đạo |
| Title | `.text-title-l` `.text-title-m` `.text-title-s` | tiêu đề mục, tiêu đề thẻ |
| Body | `.text-body-l` `.text-body-m` `.text-body-s` | nội dung, mô tả |
| Label | `.text-label-l` `.text-label-m` `.text-label-s` | nhãn form, nhãn tab, chú thích |

Font: Plus Jakarta Sans, self-host trong `public/fonts/`, preload 2 weight trong
`index.html`. Đổi font → xem [`public/README.md`](../../public/README.md).

## Bố cục

- `--page-max-width` (480px): `#root` và thanh nav dưới cùng bị chặn ở đây, nên trên
  tablet ứng dụng vẫn là một cột điện thoại ở giữa thay vì giãn ra méo mó.
- `--bottom-nav-height` + `--safe-bottom`: padding dưới của `.page` phải cộng cả hai,
  nếu không nội dung cuối trang chui xuống dưới thanh nav.
- `--viewport-height` / `--viewport-bottom-inset`: **đo** bởi
  [`src/pwa/viewportInsets.ts`](../../src/pwa/viewportInsets.ts), không phải hằng số.
  Dùng chúng thay cho `100dvh` khi cần biết phần màn hình đang thực sự nhìn thấy —
  iOS không resize layout viewport khi bàn phím hiện lên.

## Chuyển động

Ngắn (120–200ms) và chỉ dùng `transform` / `opacity`. `global.css` đã tôn trọng
`prefers-reduced-motion` bằng cách rút thời lượng xuống gần 0 (không phải 0 — để các
listener `transitionend` vẫn kích hoạt và không có gì bị treo chờ chúng).

## Icon

Chỉ qua `<AppIcon name="..."/>`. Không emoji, không ký tự làm icon (luật 1).
Thêm icon = thêm một dòng vào `ICON_REGISTRY` trong
[`src/components/ui/icons.tsx`](../../src/components/ui/icons.tsx), đặt tên theo
**ý nghĩa** (`pin`, `back`) chứ không theo **hình vẽ** (`thumbtack`, `chevronLeft`).
