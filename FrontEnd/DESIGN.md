# NetZeroHeroes — Hướng dẫn thiết kế giao diện

## Phạm vi và hiện trạng

Tài liệu này định hướng thiết kế frontend NetZeroHeroes: giúp người dùng hiểu tác động môi trường và tiếp cận các hành động giảm phát thải bằng một giao diện rõ ràng, tích cực, dễ sử dụng.

Hiện tại, `src/App.jsx`, `src/App.css` và `src/index.css` vẫn là giao diện khởi tạo React/Vite. Dự án sử dụng React, Vite và CSS thuần; chưa cài Tailwind hay thư viện UI. Các màn hình, thành phần và token bên dưới là **đề xuất để triển khai**, chưa phản ánh chức năng đang hoạt động. Thư mục `BackEnd` chưa có mã nguồn để xác nhận hợp đồng dữ liệu.

Tên hiển thị trong giao diện dùng **NetZeroHeroes** theo định hướng dự án; tên thư mục repository `NetZeroHero` được giữ nguyên. Tên dự án chính thức là **GOM**, do nhóm **NetZeroHeroes** phát triển. Trang Home ưu tiên giới thiệu GOM và mô hình kết nối phế thải B2B, vận tải, tái chế, chứng từ điện tử và tài chính xanh.

## Tinh thần sản phẩm

- **Dễ hiểu:** chuyển thông tin môi trường thành con số có đơn vị, ngữ cảnh và hành động cụ thể.
- **Có cơ sở:** phân biệt dữ liệu ước tính, dữ liệu người dùng nhập và dữ liệu đã xác minh; hiển thị nguồn khi có.
- **Khích lệ:** dùng ngôn ngữ tích cực, giúp người dùng bắt đầu từ việc nhỏ và theo dõi tiến bộ.
- **Tập trung:** mỗi khu vực có một hành động chính; trang dữ liệu ưu tiên khả năng đọc và so sánh.

Hướng hình ảnh là xanh rừng đậm, nền sáng ấm và xanh lá nổi bật. Nền tối dành cho hero, lời kêu gọi hành động và footer; nền sáng dành cho nội dung, biểu mẫu và dữ liệu. Không bắt buộc xen kẽ nền tối/sáng trong dashboard.

## Kiến trúc nội dung đề xuất

Chỉ đưa mục điều hướng lên giao diện khi có nội dung hoặc luồng hoạt động tương ứng.

| Khu vực | Mục đích | Nội dung và hành động đề xuất |
|---------|----------|-----------------------------|
| Trang chủ | Giới thiệu giá trị của NetZeroHeroes | Hero, cách tham gia, ví dụ hành động, CTA “Bắt đầu hành trình xanh” |
| Tổng quan | Giúp người dùng đọc nhanh tình hình | Chỉ số theo kỳ, xu hướng, tiến độ mục tiêu, hành động tiếp theo |
| Hoạt động | Ghi nhận dữ liệu đầu vào | Danh sách và biểu mẫu cho các nhóm như di chuyển, năng lượng, sinh hoạt |
| Mục tiêu | Theo dõi kế hoạch giảm phát thải | Mốc thời gian, mức cơ sở, mục tiêu, tiến độ |
| Hướng dẫn | Giải thích cách sử dụng và ý nghĩa số liệu | Đơn vị, phương pháp ước tính, nguồn dữ liệu, gợi ý thực hành |

Các nhóm hoạt động, phép tính và cơ chế tài khoản phải được xác nhận với yêu cầu nghiệp vụ trước khi triển khai. Không mặc định dự án đã có bảng xếp hạng, phần thưởng, tín chỉ carbon hay tích hợp dữ liệu bên ngoài.

## Màu sắc

Dùng token theo vai trò để dễ thay đổi toàn bộ giao diện. Xanh lá neon là điểm nhấn hành động; chữ trên nền neon dùng màu tối.

| Token | Giá trị | Vai trò |
|-------|---------|---------|
| `--color-forest` | `#122314` | Hero, footer, nền thương hiệu tối |
| `--color-text` | `#273f2b` | Tiêu đề và nội dung chính trên nền sáng |
| `--color-text-muted` | `#596653` | Nội dung phụ trên nền sáng |
| `--color-text-inverse` | `#ffffff` | Chữ chính trên nền tối |
| `--color-text-inverse-muted` | `#b7bda5` | Nội dung phụ trên nền tối |
| `--color-primary` | `#68ef3f` | CTA chính, trạng thái được chọn |
| `--color-primary-hover` | `#58d932` | Hover của CTA chính |
| `--color-link` | `#246b18` | Liên kết trên nền sáng |
| `--color-page` | `#f2f5eb` | Nền ứng dụng sáng |
| `--color-surface` | `#ffffff` | Card, biểu mẫu, bảng |
| `--color-surface-success` | `#e7f9dd` | Nền trạng thái thành công |
| `--color-border` | `#d9deca` | Đường phân chia trang trí, viền card |
| `--color-control-border` | `#7e8371` | Viền trường nhập liệu trên nền sáng |
| `--color-border-dark` | `#49614b` | Viền bề mặt trên nền tối |
| `--color-success` | `#246b18` | Chữ và icon thành công |
| `--color-warning` | `#854d0e` | Chữ và icon cảnh báo |
| `--color-danger` | `#b42318` | Lỗi, thao tác xóa |
| `--color-info` | `#175cd3` | Thông báo và chuỗi dữ liệu bổ sung |

Màu cảnh báo, lỗi và thông tin phục vụ ý nghĩa chức năng. Không dùng xanh lá cho mọi trạng thái. Trạng thái luôn có nhãn hoặc icon đi kèm; đường biểu đồ cần thêm kiểu nét, ký hiệu hoặc nhãn để phân biệt.

## Typography

Ưu tiên font hệ thống hỗ trợ tiếng Việt: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Có thể bổ sung font thương hiệu sau khi xác nhận giấy phép, bộ ký tự tiếng Việt và phương án tải font. Không phụ thuộc Ozik, Aeonik hay font trả phí của tài liệu mẫu.

| Vai trò | Cỡ chữ | Độ đậm | Line-height |
|---------|--------|--------|-------------|
| Hero desktop | 48–64px | 700 | 1.15 |
| Hero mobile | 32–40px | 700 | 1.2 |
| Tiêu đề trang | 32px | 700 | 1.25 |
| Tiêu đề khu vực | 24px | 600–700 | 1.3 |
| Tiêu đề card | 18–20px | 600 | 1.4 |
| Nội dung, input | 16px | 400 | 1.5 |
| Nhãn, nút | 14–16px | 500–600 | 1.5 |
| Chú thích | 12–14px | 400 | 1.5 |
| Chỉ số nổi bật | 32–40px | 700 | 1.2 |

Chừa đủ chiều cao dòng cho dấu tiếng Việt, tránh cắt chữ bằng chiều cao cố định. Chỉ dùng tracking âm nhẹ ở tiêu đề lớn; nội dung dài giữ tracking mặc định. Dùng `font-variant-numeric: tabular-nums` cho bảng số và KPI.

## Khoảng cách, bố cục và hình khối

- Dùng bước 4px cho chi tiết, 8px cho bố cục: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96px.
- Container tối đa 1200px, căn giữa; lề ngang 16px trên mobile, 24px trên tablet và 32px trên desktop.
- Trang giới thiệu: khoảng cách khu vực 64–96px desktop, 40–64px mobile.
- Trang ứng dụng: khoảng cách khu vực 24–32px; card có padding 16px mobile, 24px desktop.
- Card bo góc 16px; input và nút thông thường 8px; badge và CTA hero có thể dùng pill `9999px`.
- Card mặc định dùng viền mảnh. Bóng nhẹ dành cho menu nổi, navigation và dialog; không nghiêng card dữ liệu.

| Chiều rộng viewport | Bố cục đề xuất |
|---------------------|----------------|
| Dưới 768px | Một cột; menu thu gọn; KPI xếp dọc hoặc hai cột nếu đủ chỗ |
| 768–1023px | Hai cột cho card; biểu mẫu có thể giữ một cột để dễ đọc |
| Từ 1024px | Hero hai cột; KPI tối đa bốn cột; vùng dữ liệu dùng grid theo nội dung |

Trên màn hình hẹp, đổi bảng thành danh sách nếu vẫn giữ được quan hệ dữ liệu; nếu cần so sánh nhiều cột, cho cuộn ngang trong vùng bảng có nhãn truy cập. Toàn trang không được tràn ngang ở chiều rộng 320px.

## Thành phần giao diện

### Navigation

Hiển thị wordmark NetZeroHeroes, các mục đang có và một CTA chính. Landing page có thể dùng thanh nổi bo góc trên nền rừng. Trang ứng dụng có thể dùng header hoặc sidebar khi số lượng màn hình cần thiết; không ép mọi luồng vào thanh pill.

Menu mobile có nút mở với nhãn truy cập, `aria-expanded`, điều khiển bằng bàn phím và đóng được bằng Escape. Dùng `aria-current="page"` cho trang đang chọn.

### Hero

Ví dụ nội dung:

> **Mỗi hành động nhỏ, một tương lai xanh hơn.**
>
> Cùng NetZeroHeroes hiểu tác động của thói quen hằng ngày và bắt đầu những thay đổi phù hợp với bạn.

CTA đề xuất: “Bắt đầu hành trình xanh”; liên kết phụ: “Tìm hiểu cách hoạt động”. Chỉ liên kết đến trang hoặc khu vực có thật. Có thể minh họa bằng lá, vòng tăng trưởng hoặc preview sản phẩm; preview dùng dữ liệu mẫu phải được ghi nhãn.

### Nút và liên kết

- Primary: nền xanh lá, chữ tối, dùng cho hành động chính như “Lưu hoạt động”.
- Secondary: nền trong suốt hoặc trắng, viền rõ, chữ theo bề mặt.
- Destructive: màu lỗi, nhãn mô tả hành động cụ thể như “Xóa hoạt động”.
- Liên kết trong đoạn văn có gạch chân hoặc dấu hiệu nhận biết ngoài màu sắc.
- Vùng chạm tối thiểu 44 × 44px; có hover, focus-visible, disabled và loading. Khi gửi dữ liệu, ngăn gửi lặp và giữ nhãn dễ hiểu như “Đang lưu…”.

### Card chỉ số và biểu đồ

Card chỉ số có tên chỉ số, giá trị, đơn vị và kỳ đo. Ví dụ: “Phát thải ước tính”, “128,4 kg CO₂e”, “Tháng này” với nhãn “Dữ liệu mẫu” khi minh họa.

Nếu hiển thị thay đổi, phải ghi kỳ so sánh và chiều thay đổi bằng chữ, ví dụ “Giảm 8% so với tháng trước”. Phát thải giảm có thể là kết quả tích cực; không mặc định tăng là xanh và giảm là đỏ. Thiếu mức cơ sở thì không tính tỷ lệ thay đổi.

Biểu đồ cần tiêu đề, đơn vị trục, khoảng thời gian, chú giải và nội dung tóm tắt hoặc bảng dữ liệu tương đương. Tooltip hoạt động với bàn phím và cảm ứng. Trạng thái thiếu dữ liệu khác với giá trị bằng 0.

### Biểu mẫu hoạt động

Mỗi trường có label hiển thị, đơn vị phù hợp và hướng dẫn ngắn khi cần. Placeholder chỉ minh họa cách nhập. Nhóm trường theo nội dung như loại hoạt động, ngày ghi nhận, số lượng và đơn vị.

Lỗi đặt cạnh trường, liên kết bằng `aria-describedby`, có `aria-invalid` khi phù hợp. Giữ dữ liệu đã nhập sau lỗi; cho biết lưu thành công và cách sửa bản ghi. Không tính kết quả từ dữ liệu không hợp lệ hoặc hệ số chưa được xác nhận.

### Mục tiêu và tiến độ

Hiển thị mục tiêu, mức cơ sở, thời hạn và tiến độ bằng số bên cạnh thanh tiến trình. Phân biệt dữ liệu chưa đủ với tiến độ 0%. Khi không thể tính tiến độ, giải thích dữ liệu cần bổ sung. Không chỉ dùng màu thanh để truyền đạt kết quả.

### Trạng thái hệ thống

| Trạng thái | Cách thể hiện |
|------------|---------------|
| Đang tải | Skeleton đúng bố cục, nhãn trạng thái phù hợp; tránh nhấp nháy |
| Chưa có dữ liệu | Giải thích ngắn và CTA cụ thể như “Thêm hoạt động đầu tiên” |
| Bộ lọc không có kết quả | Giữ bộ lọc, cho phép xóa hoặc điều chỉnh |
| Lỗi tải/lưu | Mô tả dễ hiểu, giữ dữ liệu nhập, có thao tác thử lại khi phù hợp |
| Thành công | Thông báo ngắn; cập nhật nội dung liên quan; không chỉ báo bằng màu |
| Chưa hỗ trợ | Nêu rõ giới hạn, không hiển thị số liệu hoặc hành động giả |

Thông báo cập nhật dùng live region phù hợp, tránh đọc lại toàn bộ trang. Dialog có tên, quản lý focus, giữ focus bên trong khi mở và trả focus về nút kích hoạt sau khi đóng.

## Nội dung và dữ liệu môi trường

Ngôn ngữ mặc định là tiếng Việt, giọng văn ngắn gọn và thân thiện. Giữ nhất quán thuật ngữ “phát thải ước tính”, “giảm phát thải”, “hoạt động” và “mục tiêu”.

- Hiển thị đầy đủ đơn vị, ví dụ kg CO₂e, t CO₂e, kWh hoặc km; phân biệt lượng phát thải với lượng giảm phát thải.
- Định dạng số theo locale `vi-VN`; lưu giá trị số độc lập với chuỗi đã định dạng. Ghi kỳ đo và múi giờ khi chúng ảnh hưởng kết quả.
- Ghi rõ phương pháp, nguồn và thời điểm áp dụng hệ số khi có phép ước tính. Nếu thiếu cơ sở tính toán, hiển thị chưa đủ dữ liệu.
- Các phép quy đổi như “tương đương số cây trồng” chỉ xuất hiện khi có phương pháp và giả định rõ ràng.
- Không tự tạo số người dùng, logo đối tác, chứng nhận, thành tích hay cam kết “đã đạt net zero”.
- Chỉ dùng lời khẳng định về kết quả môi trường khi có dữ liệu hỗ trợ. Mẫu giao diện và dữ liệu demo luôn có nhãn “Dữ liệu mẫu”.

## Hình ảnh và chuyển động

Dùng icon nét đơn giản, cùng độ dày 1.5–2px và kích thước 20–24px. Icon chức năng có nhãn phù hợp; icon trang trí đặt `aria-hidden="true"`.

Minh họa có thể gợi thiên nhiên, di chuyển xanh và thói quen bền vững. Ảnh cần liên quan nội dung và có quyền sử dụng; không dùng logo hoặc chân dung làm bằng chứng xã hội khi chưa được xác nhận. Hình nền trang trí không che chữ hoặc giảm độ tương phản.

Chuyển trạng thái hover/focus khoảng 150–200ms. Tôn trọng `prefers-reduced-motion`; tránh parallax, đếm số kéo dài và hiệu ứng chạy liên tục trong màn hình dữ liệu.

## Khả năng truy cập

Mục tiêu thiết kế là WCAG 2.2 mức AA; cần kiểm tra thực tế trước khi tuyên bố đạt chuẩn.

- Tương phản chữ thường tối thiểu 4.5:1, chữ lớn 3:1; viền điều khiển và dấu hiệu tương tác quan trọng tối thiểu 3:1 với nền kề.
- Có focus-visible rõ trên cả nền sáng và tối; không xóa outline khi chưa có thay thế.
- Dùng phần tử HTML ngữ nghĩa: button cho thao tác, anchor cho điều hướng, label cho input; heading theo thứ bậc.
- Mọi thao tác dùng được bằng bàn phím; thứ tự focus theo thứ tự đọc; có liên kết bỏ qua navigation khi cần.
- Nội dung vẫn đọc và thao tác được khi phóng to; nhãn dài và dấu tiếng Việt không bị cắt.
- Thông báo lỗi, biểu đồ và trạng thái truyền đạt được mà không phụ thuộc màu sắc.

## Bộ token CSS đề xuất

Đặt token dùng chung trong `src/index.css` khi triển khai. `src/App.css` và CSS của component tham chiếu token thay vì lặp màu. Đoạn dưới là cấu hình đề xuất, chưa được áp dụng vào mã hiện tại.

```css
:root {
  --color-forest: #122314;
  --color-text: #273f2b;
  --color-text-muted: #596653;
  --color-text-inverse: #ffffff;
  --color-text-inverse-muted: #b7bda5;
  --color-primary: #68ef3f;
  --color-primary-hover: #58d932;
  --color-link: #246b18;
  --color-page: #f2f5eb;
  --color-surface: #ffffff;
  --color-surface-success: #e7f9dd;
  --color-border: #d9deca;
  --color-control-border: #7e8371;
  --color-border-dark: #49614b;
  --color-success: #246b18;
  --color-warning: #854d0e;
  --color-danger: #b42318;
  --color-info: #175cd3;

  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --text-caption: 0.75rem;
  --text-small: 0.875rem;
  --text-body: 1rem;
  --text-subheading: 1.25rem;
  --text-heading: 1.5rem;
  --text-page-title: 2rem;
  --text-hero: clamp(2rem, 1.25rem + 3vw, 4rem);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  --radius-control: 8px;
  --radius-card: 16px;
  --radius-pill: 9999px;
  --page-max-width: 1200px;
  --control-min-height: 44px;
  --shadow-floating: 0 8px 32px rgb(18 35 20 / 12%);
  --duration-fast: 180ms;
}

/* Hai lớp focus giúp nhìn rõ trên cả nền sáng và nền tối. */
:focus-visible {
  outline: 2px solid var(--color-forest);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-primary);
}
```

## Tiêu chí kiểm tra khi triển khai

- Tên NetZeroHeroes, thuật ngữ, màu sắc và đơn vị nhất quán trên mọi màn hình.
- Mỗi CTA dẫn đến luồng hoạt động; nội dung mẫu có nhãn, không có thành tích tự tạo.
- Kiểm tra ở chiều rộng 320px, 768px và desktop, với nhãn tiếng Việt dài và phóng to 200%.
- Kiểm tra bàn phím, focus, độ tương phản, thông báo lỗi và chế độ giảm chuyển động.
- Các vùng dữ liệu có trạng thái tải, trống, lỗi và thành công phù hợp.
- Xác nhận đơn vị, kỳ đo, nguồn hệ số và cách phân biệt số 0 với thiếu dữ liệu trước khi hiển thị kết quả.
- Khi thay đổi mã giao diện, chạy `npm run lint` và `npm run build` trong `FrontEnd`, đồng thời kiểm tra giao diện trực tiếp. Thay đổi chỉ trong tài liệu không cần build ứng dụng.
