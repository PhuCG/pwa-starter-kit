# Architecture Decision Records

Một ADR cho mỗi quyết định **có phương án thay thế thật sự** và **khó đảo ngược**.
Không viết ADR cho việc chọn tên biến; viết cho việc chọn Dexie thay vì
localStorage, chọn local-first thay vì có backend, chọn zustand thay vì Redux.

Đặt tên `NNN-<slug>.md`, đánh số tăng dần, không dùng lại số đã dùng.

ADR **không sửa nội dung sau khi đã chấp nhận**. Khi đổi ý, viết ADR mới và đánh dấu
cái cũ là `Superseded by NNN`. Giá trị của ADR nằm ở chỗ nó ghi lại điều bạn *đã tin*
lúc đó, kể cả khi hóa ra sai.

| # | Quyết định | Trạng thái |
|---|---|---|
| [001](./001-local-first-no-backend.md) | Local-first, không backend | Accepted |
