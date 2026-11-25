# Birthday — A moment in time

Web HTML/CSS/JavaScript thuần, áp dụng thiết kế từ `birthday-fireworks-v4.html`.
Tạo cấu hình riêng theo hướng dẫn bên dưới rồi mở `index.html` bằng trình duyệt;
không cần build hay cài thêm thư viện.
Font Google cần mạng; nếu mất mạng, trang dùng font dự phòng.

## Cấu hình trước khi deploy

Git chỉ lưu `config.example.js` với dữ liệu giả. Sau khi clone, tạo cấu hình riêng:

```powershell
Copy-Item config.example.js config.js
```

Sửa `config.js` ở thư mục gốc. File này và các file `.env` được `.gitignore` bỏ qua,
nên không được đưa lên repo bằng `git add .`. Không dùng `git add -f` với file cấu hình riêng.
Kiểm thử sử dụng `config.example.js`, không đọc ngày sinh trong cấu hình riêng.

`config.js` vẫn được trình duyệt tải khi web chạy; không đặt mật khẩu hoặc API key trong file này.
Ví dụ dưới đây là dữ liệu giả:

```js
birthday: { year: 2000, month: 5, day: 20 },
locale: 'en-GB',
audioSrc: './assets/audio/birthday.mp3',
```

Tháng ở đây từ **1 đến 12**. Đổi `text` để sửa tiêu đề, lời chúc, nhãn nút và footer;
đổi `effects` để chỉnh số sao, số hạt, màu pháo hoa và khoảng cách giữa các lần phóng.
Giữ các mức mặc định nếu muốn giữ hiệu năng đã tối ưu. Màu và bố cục CSS vẫn ở `assets/css/base.css`.
Khi deploy, tải `index.html`, `config.js` và thư mục `assets` lên cùng một thư mục trên hosting tĩnh.
Nếu hosting tự deploy từ Git, cần tạo/cấp file `config.js` riêng ở bước deploy vì repo không chứa file này.
`.gitignore` không xóa dữ liệu đã có trong các commit cũ; cần xử lý lịch sử riêng nếu có dữ liệu cá nhân.
Ngày trên footer tự lấy từ cấu hình; thời gian sinh nhật vẫn theo giờ địa phương của thiết bị người xem.

## Đọc code theo thứ tự nào?

| File | Vai trò | Bạn chỉnh gì ở đây? |
| --- | --- | --- |
| `config.example.js` | Mẫu công khai trong repo | Các khóa cấu hình, sử dụng dữ liệu giả |
| `config.js` | Cấu hình riêng, Git bỏ qua | Ngày sinh, nội dung, đường dẫn nhạc, thông số hiệu ứng |
| `index.html` | Cấu trúc và nội dung | Tiêu đề, lời chúc, nhãn nút |
| `assets/css/base.css` | Giao diện | Màu, font, khoảng cách, responsive, animation CSS |
| `assets/js/birthday.js` | Logic chính | Ngày sinh, đếm ngược, chuyển màn hình, nhạc |
| `assets/js/effects.js` | Hiệu ứng Canvas | Sao, ánh sáng theo chuột, pháo hoa, lời ước |
| `assets/audio/birthday.mp3` | Nhạc sinh nhật | Thay file để đổi bài hát |

## 1. HTML: dựng khung

Trang có hai section: `#countdown` và `#birthday`. Thuộc tính `hidden` ẩn section chưa dùng.
`id` là tên duy nhất để JavaScript tìm một phần tử; `class` dùng chung để CSS tạo giao diện.

```html
<div class="unit">
  <span class="num" id="days">00</span>
  <small>days</small>
</div>
```

Trong ví dụ này, `.unit` tạo ô đồng hồ, `.num` tạo kiểu chữ số, còn `#days` là nơi JavaScript ghi số ngày.
Các phần tử có `data-text` nhận nội dung từ khóa tương ứng trong `config.js`.
Ví dụ `data-text="birthdayMessage"` lấy lời chúc từ `SITE_CONFIG.text.birthdayMessage`.
Các script có `defer` để chạy sau khi trình duyệt đọc xong HTML, theo thứ tự đã khai báo.

## 2. CSS: tạo hình dáng

Đổi `--gold` trong `:root` để đổi màu nhấn; `--muted` là màu chữ phụ.
Các màu gradient và pháo hoa được định nghĩa riêng, nên muốn đổi toàn bộ bảng màu cần chỉnh cả chúng.

```css
.clock {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
```

`grid` chia đồng hồ thành bốn cột bằng nhau; `gap` là khoảng cách giữa các ô.
`clamp(nhỏ nhất, co giãn, lớn nhất)` giúp chữ thay đổi theo kích thước màn hình.
`@media (max-width: 540px)` chứa các điều chỉnh dành cho điện thoại.
Các khối CSS sau có thể ghi đè khối trước: đây là thứ tự kế thừa từ bản thiết kế.

## 3. JavaScript: tính thời gian và cập nhật trang

Đổi ngày sinh trong `config.js`:

```js
birthday: { year: 2000, month: 5, day: 20 },
```

`month: 5` nghĩa là tháng 5; code ứng dụng tự chuyển sang cách đếm tháng từ 0 của JavaScript.
Không cần sửa footer riêng khi đổi ngày sinh.
Trang dùng ngày giờ địa phương của thiết bị người xem.

Luồng chạy: `getBirthdayState(now)` tính ngày sinh nhật tiếp theo, tuổi và số giây còn lại;
`updateCountdown()` đưa kết quả lên HTML mỗi giây; `showView()` chọn màn hình hiển thị.
Trong cả ngày sinh nhật, trang hiện màn chúc mừng và đúng tuổi năm đó. Sang ngày hôm sau, trang đếm tới năm tiếp theo.

```js
const days = Math.floor(seconds / 86400);
const hours = Math.floor(seconds / 3600) % 24;
document.querySelector('#days').textContent = String(days).padStart(3, '0');
```

Một ngày có 86.400 giây. `Math.floor()` lấy phần nguyên; `% 24` lấy số giờ dư sau khi trừ các ngày đầy đủ.
`querySelector()` tìm phần tử; `textContent` đổi nội dung; `padStart()` thêm số 0 phía trước.

Các nút dùng `addEventListener('click', ...)` để chạy hàm khi bấm.
Nhạc chỉ phát sau thao tác bấm của người dùng; quay lại đồng hồ sẽ dừng và tua nhạc về đầu.

## 4. Canvas: hiểu pháo hoa

`effects.js` giữ các hiệu ứng của bản thiết kế, chia thành ba khối hàm tự chạy:
nền sao, hiệu ứng ánh sáng/con trỏ, và pháo hoa trong màn sinh nhật.
Mỗi hạt có vị trí `x/y`, vận tốc `vx/vy`, màu và thời gian sống `life`.
`requestAnimationFrame()` yêu cầu trình duyệt vẽ khung tiếp theo; mỗi khung cập nhật vị trí và giảm `life`.
Hạt hết thời gian sống được loại khỏi mảng. Pháo hoa dừng khi tab bị ẩn hoặc rời màn sinh nhật.
Chế độ giảm chuyển động của hệ điều hành được tôn trọng.

Để giảm tải, nền sao vẽ ở 30 fps và dùng lại ảnh quầng sáng đã tạo sẵn.
Các nút cùng gửi sự kiện `birthday:celebrate` đến một lớp pháo hoa, tránh chạy nhiều bộ hạt chồng nhau.
Số hạt và độ phân giải canvas có giới hạn; nền tinh vân dùng gradient tĩnh thay cho blur chuyển động.

Nút gửi lời ước chỉ đổi nội dung và chạy hiệu ứng trên trang; không gửi dữ liệu lên máy chủ.

## Thực hành

1. Đổi tiêu đề và lời chúc trong `config.js`, tải lại trang để thấy kết quả.
2. Đổi `--gold` và `gap` trong CSS, xem ảnh hưởng đến màu và khoảng cách.
3. Đổi `birthday` trong `config.js`, kiểm tra lại ngày và tuổi trên web.
4. Đổi `effects.fireworkColors` trong `config.js` để đổi màu hạt.

Trang chỉ hiển thị theo ngày thực tế: không có nút xem trước hay tham số URL để chuyển màn hình.
Đến 00:00 ngày sinh nhật trong cấu hình theo giờ thiết bị, trang tự chuyển sang chúc mừng; sang ngày hôm sau sẽ đếm ngược cho năm sau.

## Kiểm tra logic

```sh
node tests/birthday.test.cjs
```

Bài kiểm tra bao gồm giây cuối trước sinh nhật, đầu/giữa/cuối ngày sinh nhật, ngày kế tiếp, tuổi và cú pháp JavaScript.
