# Bộ câu hỏi phỏng vấn API Tester (mid-level, ~2 năm kinh nghiệm)

> Góc nhìn **người phỏng vấn**: mỗi câu đi kèm *mục đích hỏi*, *trả lời tốt là thế nào*, và *cờ đỏ*.
> Dùng để tự luyện: che phần đáp án, trả lời ra miệng thành câu hoàn chỉnh, rồi mở ra đối chiếu.

**Mục lục**

1. [Warm-up & kinh nghiệm](#1-warm-up--kinh-nghiệm)
2. [Nền tảng HTTP & API](#2-nền-tảng-http--api)
3. [Thiết kế test case](#3-thiết-kế-test-case)
4. [Postman & pm.test](#4-postman--pmtest)
5. [Automation, CI & môi trường](#5-automation-ci--môi-trường)
6. [Performance & security](#6-performance--security-cơ-bản)
7. [Bài tập thực hành](#7-bài-tập-thực-hành-live-coding)
8. [Hành vi & làm việc nhóm](#8-hành-vi--làm-việc-nhóm)
9. [Câu nên hỏi lại interviewer](#9-câu-nên-hỏi-lại-interviewer)
10. [Checklist ôn tập ưu tiên](#10-checklist-ôn-tập-ưu-tiên)

---

## 1. Warm-up & kinh nghiệm

### Q1. Kể về một API bạn test gần đây nhất. Nó làm gì, ai gọi nó, và bạn test nó thế nào?
- **Đo:** bạn hiểu business hay chỉ "gửi request xem có 200".
- **Tốt:** nói được luồng nghiệp vụ, ai là consumer (mobile / web / service khác), dữ liệu đi đâu sau đó, bạn test gì và **tại sao** chọn test những cái đó.
- **Cờ đỏ:** chỉ kể tên tool, không kể được nghiệp vụ.

### Q2. Bug API nào bạn tìm ra mà bạn tự hào nhất? Vì sao nó khó tìm?
- **Đo:** suy luận có chủ đích, không phải may mắn.
- **Tốt:** bug xuất phát từ một giả định sai — race condition, server thiếu validate, data của user A lọt sang user B, rollback không sạch, event không được publish. Kể được **cách bạn nghi ngờ** và **cách bạn chứng minh**.

### Q3. Bạn nhận một API mới, chỉ có Swagger, không ai giải thích. 1 tiếng đầu bạn làm gì?
- **Tốt:** đọc spec → map resource/endpoint → xác định cơ chế auth → gọi happy path để hiểu shape response → liệt kê field bắt buộc/optional → tìm phụ thuộc giữa các API → ghi lại danh sách câu hỏi cho dev/BA về những chỗ spec im lặng (giới hạn giá trị, lỗi trả về mã gì, ai được gọi).

---

## 2. Nền tảng HTTP & API

> Đây là phần loại người nhiều nhất. Phải trả lời gọn, dứt khoát, có ví dụ.

### Q4. Phân biệt 401 và 403. Khi nào server nên trả 404 thay vì 403?
- **401** = chưa/không xác thực được: thiếu token, token sai, token hết hạn.
- **403** = đã biết bạn là ai nhưng không có quyền.
- **404 thay 403** khi không muốn tiết lộ resource đó tồn tại (chống enumeration) — ví dụ `GET /users/999` của user khác.

### Q5. 400 vs 422 vs 409 — gặp case nào trả về từng mã?
- **400** — request malformed: JSON sai cú pháp, thiếu field bắt buộc, sai Content-Type.
- **422** — cú pháp đúng nhưng sai validate/nghiệp vụ: email không đúng format, tuổi âm, enum không hợp lệ.
- **409** — xung đột trạng thái: tạo trùng email, update bản ghi đã bị người khác đổi, huỷ đơn đã giao.

### Q6. PUT vs PATCH vs POST. PUT có idempotent không? Tại sao điều đó quan trọng với tester?
- POST tạo mới, **không** idempotent. PUT thay toàn bộ, **idempotent**. PATCH sửa một phần, thường **không** idempotent (ví dụ `{"counter": "+1"}`).
- **Quan trọng vì:** test retry, double-submit, client timeout rồi gửi lại — có bị tạo 2 bản ghi / trừ tiền 2 lần không.

### Q7. Idempotency key là gì? Nếu API thanh toán không có nó, bạn test gì?
- Key do client sinh, server dùng để nhận ra "request này tôi đã xử lý rồi" và trả lại kết quả cũ thay vì tạo giao dịch mới.
- **Test:** gửi 2 request giống nhau gần như đồng thời; hoặc gửi, cắt kết nối, gửi lại. Sau đó **kiểm tra DB chỉ có 1 transaction**. Đây là câu phân biệt junior/mid rất rõ.

### Q8. Vòng đời access token + refresh token. Bạn test gì quanh nó?
- **Test:** token hết hạn; token sai signature; token của user khác; token đã bị revoke; không gửi token; gửi sai header/sai scheme; refresh token dùng lại lần 2 (reuse detection); refresh khi access token còn hạn; token của môi trường khác.

### Q9. CORS là gì? Nó có ảnh hưởng tới test bằng Postman không?
- CORS là cơ chế của **browser**, Postman **không** bị chặn.
- → Một API "chạy OK trong Postman nhưng lỗi trên web" rất có thể là CORS. Trả lời được câu này chứng tỏ bạn biết **giới hạn của tool mình dùng**.

### Q10. REST vs GraphQL khác gì khi test? *(nếu JD có GraphQL)*
- GraphQL thường **luôn trả 200** dù có lỗi trong body → assertion phải kiểm `errors` array, **không được chỉ check status code**.
- Thêm: over-fetching, query depth/complexity limit, vấn đề N+1, batching.

### Q11. Khi nào bạn dùng mock server thay vì môi trường thật?
- Khi API chưa có (test song song với dev); khi cần mô phỏng 500 / timeout / response dị mà backend thật không tạo được; khi chạy ở CI mà không muốn phụ thuộc hệ thống bên thứ ba hoặc tốn phí.

### Q12. Header nào bạn luôn để ý khi test API?
- `Content-Type`, `Accept`, `Authorization`, `X-Request-Id` / correlation id (để dev trace log), `Cache-Control`, `X-RateLimit-*` / `Retry-After`, `Set-Cookie` (HttpOnly, Secure, SameSite), `Location` khi tạo mới.

---

## 3. Thiết kế test case

### Q13. Cho `POST /users` với body `{name, email, age, role}`. Liệt kê test case bạn nghĩ ra.

Trả lời phải **có nhóm**, không liệt kê bừa:

| Nhóm | Test case |
|---|---|
| Positive | happy path; giá trị biên hợp lệ; field optional để trống |
| Validate từng field | thiếu field; `null`; chuỗi rỗng; sai type (`age: "abc"`); vượt max length; boundary (`age` = 0, -1, 150); unicode/emoji; khoảng trắng đầu-cuối; email sai format |
| Business rule | email trùng → 409; `role` không tồn tại → 422; tuổi dưới giới hạn đăng ký |
| Schema / contract | response đúng field, đúng type, không thiếu, **không thừa field nội bộ** |
| Auth / authorization | không token; token hết hạn; user thường tạo tài khoản `admin` |
| Bảo mật | SQL injection, XSS payload trong `name`, **mass assignment** (gửi thêm `"isAdmin": true`), payload cực lớn, duplicate key trong JSON |
| Hạ tầng | `Content-Type` sai; body không phải JSON; body rỗng; gửi 2 request đồng thời |
| Side effect | DB có đúng dữ liệu chưa; password được hash chưa; email/event/message queue có được bắn không |

- **Follow-up thường gặp:** *"Nếu smoke test chỉ được chạy 5 case, bạn chọn 5 case nào?"* → đo khả năng **ưu tiên theo rủi ro**.

### Q14. Làm sao test được rằng API không trả về dữ liệu của user khác?
- IDOR / BOLA test: login user A, lấy id resource của user B, gọi bằng token của A → mong đợi **403 hoặc 404**, tuyệt đối không 200. Làm cho cả GET, PUT, DELETE, và cả id trong body chứ không chỉ trong URL.

### Q15. Response trả 200 và body đúng, nhưng bạn vẫn fail test case. Khi nào?
- Side effect sai (DB không cập nhật, trạng thái đơn không đổi); response time quá chậm; thiếu header quan trọng; trả thừa field sensitive; event không được publish; log ghi sai; dữ liệu đúng nhưng sai timezone/format.

### Q16. Bạn test một API phụ thuộc 3 API khác. Làm sao giữ test không flaky?
- Setup data bằng API riêng hoặc seed DB; **không hardcode id** — truyền biến động; cleanup sau test; polling có timeout cho eventual consistency; mock dependency bên thứ ba; mỗi test tự tạo data của mình để chạy song song được.

### Q17. Bạn test pagination thế nào?
- `page` = 0 / âm / vượt tổng số trang; `size` = 0 / 1 / cực lớn; tổng số bản ghi và tổng số trang; trang cuối; **trùng hoặc thiếu bản ghi giữa 2 trang khi data đang thay đổi** (bug kinh điển); sort có stable không; kết hợp filter + sort + page.

---

## 4. Postman & pm.test

### Q18. Postman có mấy loại variable scope? Thứ tự ưu tiên khi trùng tên?
- Các scope: **Global → Collection → Environment → Data (CSV/JSON) → Local (script)**.
- Khi resolve trùng tên, **cái hẹp nhất thắng**: `Local > Data > Environment > Collection > Global`.
- **Follow-up:** `pm.environment.set` vs `pm.collectionVariables.set` khác gì? Cái nào đi theo file collection khi export và dễ bị commit lên Git? → collection variable nằm **trong** collection, environment nằm ở file environment riêng.

### Q19. `pm.variables.set` vs `pm.environment.set` — khác gì? Khi nào dùng cái đầu?
- `pm.variables.set` chỉ sống trong phạm vi run hiện tại (local), **không ghi vào environment**.
- Dùng cho giá trị tạm → tránh làm "bẩn" environment và tránh xung đột khi nhiều người/nhiều luồng chạy cùng lúc.

### Q20. Viết `pm.test` kiểm tra: status 201, response time < 800ms, `id` là number, `email` khớp giá trị đã gửi, và lưu `id` cho request sau.

```javascript
const res = pm.response.json();

pm.test("Status is 201", function () {
  pm.response.to.have.status(201);
});

pm.test("Response time < 800ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(800);
});

pm.test("Body is valid", function () {
  pm.expect(res.id).to.be.a("number");
  pm.expect(res.email).to.eql(pm.variables.get("expectedEmail"));
});

pm.collectionVariables.set("userId", res.id);
```

- **Follow-up:** nếu response không phải JSON thì `pm.response.json()` làm gì? → nó **throw** và cả script dừng, các test sau không chạy. Cách xử lý: check `Content-Type` trước, hoặc bọc `try/catch`:

```javascript
let res;
pm.test("Response is JSON", function () {
  res = pm.response.json();   // fail gọn ở đây thay vì vỡ cả script
});
```

### Q21. Khác nhau giữa `pm.expect` (Chai) và `pm.response.to.have.*`? Có cần bọc `pm.test` không?
- `pm.response.to.have.*` là helper có sẵn cho response; `pm.expect` là Chai, assert mọi giá trị.
- **Luôn bọc trong `pm.test`**: assertion nằm ngoài vẫn chạy nhưng khi fail sẽ làm hỏng cả script và **không hiện thành test result riêng** trong report.

### Q22. Làm sao validate JSON Schema trong Postman?

```javascript
const schema = {
  type: "object",
  required: ["id", "email"],
  properties: {
    id:    { type: "number" },
    email: { type: "string" },
    role:  { type: "string", enum: ["user", "admin"] }
  }
};

pm.test("Schema is valid", function () {
  pm.response.to.have.jsonSchema(schema);
});
```

- **Lợi ích:** bắt được **contract break** (đổi type, mất field, thêm field lạ) mà assert từng field dễ bỏ sót. Schema nên lấy từ OpenAPI để luôn đồng bộ với spec.

### Q23. Pre-request script bạn thường dùng làm gì?
- Sinh dynamic data (timestamp, uuid, random email), lấy/refresh token, tính signature/HMAC, set biến theo môi trường.
- **Điểm cộng lớn:** chỉ login khi token hết hạn, thay vì gọi login ở mọi request:

```javascript
const expiry = Number(pm.collectionVariables.get("tokenExpiry") || 0);

if (Date.now() < expiry - 30000) {        // còn hạn, chừa 30s buffer
  return;
}

pm.sendRequest({
  url: pm.environment.get("baseUrl") + "/auth/login",
  method: "POST",
  header: { "Content-Type": "application/json" },
  body: {
    mode: "raw",
    raw: JSON.stringify({
      username: pm.environment.get("username"),
      password: pm.environment.get("password")
    })
  }
}, function (err, res) {
  if (err) { console.error(err); return; }
  const body = res.json();
  pm.collectionVariables.set("accessToken", body.access_token);
  pm.collectionVariables.set("tokenExpiry", Date.now() + body.expires_in * 1000);
});
```

### Q24. `postman.setNextRequest()` dùng khi nào? Rủi ro?
- Điều khiển luồng trong Collection Runner: skip, loop, retry, nhảy tới cleanup.
- **Rủi ro:** dễ tạo vòng lặp vô hạn; collection khó đọc; **chỉ hoạt động trong Runner/Newman**, không có tác dụng khi bấm Send thủ công.

### Q25. Làm sao chạy 1 collection với 100 bộ dữ liệu? Rồi chạy nó trong CI?
- Data file CSV/JSON + Collection Runner, đọc bằng `pm.iterationData.get("field")`.
- CI: **Newman** hoặc **Postman CLI**:

```bash
newman run collection.json \
  -e env.json \
  -d data.csv \
  --reporters cli,junit \
  --reporter-junit-export results/junit.xml
```

- **Follow-up (hay bị hụt):** secret để ở đâu? → **không commit** environment chứa secret. Dùng secret của CI rồi inject qua biến môi trường (`--env-var "password=$API_PASSWORD"`) hoặc `{{$processEnv VAR}}`; file environment trong Git chỉ để placeholder.

### Q26. Collection của bạn có 200 request. Làm sao team khác hiểu và maintain được?
- Folder theo module/luồng; naming convention nhất quán; description cho từng request; base URL và secret qua environment; folder `setup`/`teardown` riêng; script dùng chung đặt ở **Collection-level pre-request**; version control bằng export JSON vào Git (hoặc fork/merge trong Postman); README mô tả cách chạy.

### Q27. Bạn có viết test ở Collection-level / Folder-level chưa? Để làm gì?
- Assertion dùng chung cho mọi request: không được trả 5xx, phải có `X-Request-Id`, response time dưới ngưỡng, `Content-Type` đúng. Giảm trùng lặp và đảm bảo chuẩn tối thiểu toàn collection.

### Q28. Hạn chế của Postman mà bạn từng gặp? Khi nào bạn chuyển sang code?
- **Chuyển sang code** (RestAssured / pytest+requests / Playwright API / Jest+supertest) khi: logic phức tạp, cần reuse và refactor, chạy song song, truy vấn DB / message queue, debug tốt hơn, review bằng pull request, quản lý dependency.
- **Postman vẫn mạnh ở:** explore nhanh, chia sẻ với người không code, mock server, sinh docs, onboarding người mới.

---

## 5. Automation, CI & môi trường

### Q29. Pipeline của bạn chạy API test ở bước nào? Fail thì làm gì?
- Smoke ngay sau deploy lên staging; regression theo schedule hoặc trước release; fail thì block merge / cân nhắc rollback; có report (JUnit/HTML) và thông báo Slack/Teams với link tới run.

### Q30. Test chạy local pass, chạy CI fail. Debug thế nào?
- So sánh environment & biến; data phụ thuộc trạng thái; timing/timeout; thứ tự chạy; CI có vào được network/VPN không; token hết hạn; khác timezone/locale; **log lại request-response thật trong CI** thay vì đoán.

### Q31. Thế nào là flaky test? Test fail 1/10 lần thì bạn làm gì?
- **Không retry mù.** Tìm nguyên nhân: shared data, eventual consistency, race condition (**có thể là bug thật của hệ thống**), thời gian/timezone, thứ tự test.
- Chỉ retry khi đã biết rõ nguyên nhân là async delay — và nên dùng **polling có timeout** thay vì `sleep` cố định.

### Q32. Contract testing là gì? Khác API test thường ra sao?
- Kiểm tra provider và consumer tuân thủ cùng một hợp đồng (Pact, hoặc schema sinh từ OpenAPI). Chạy nhanh, bắt breaking change sớm, **không cần dựng cả hệ thống**. API test thường thì verify hành vi end-to-end của service.

### Q33. Test data bạn quản lý thế nào?
- Mỗi test tự tạo data của mình (self-contained); dùng prefix/uuid để tránh đụng nhau; cleanup ở teardown; seed script cho data dùng chung; không phụ thuộc data do người khác tạo tay trên staging.

---

## 6. Performance & security cơ bản

### Q34. Phân biệt load / stress / spike / soak test.
- **Load:** tải dự kiến, xem có đạt SLA. **Stress:** tăng đến khi vỡ, tìm điểm giới hạn. **Spike:** tăng đột ngột rồi giảm, xem khả năng co giãn. **Soak:** tải vừa trong thời gian dài, tìm memory leak / tụt hiệu năng dần.

### Q35. API trả 200 nhưng chậm 5 giây. Bạn báo bug thế nào và điều tra tới đâu?
- Đo lại nhiều lần (không kết luận từ 1 lần); tách thời gian network vs server; thử payload/filter nhỏ hơn để đoán nguyên nhân (data lớn, thiếu index, N+1 query); lấy `X-Request-Id` + timestamp cho dev trace log; báo bug kèm số liệu p50/p95, không chỉ "nó chậm".

### Q36. Bạn kiểm tra rate limiting như thế nào?
- Gửi vượt ngưỡng → mong đợi **429** kèm `Retry-After` / `X-RateLimit-*`; xác định ngưỡng tính theo user hay theo IP hay theo API key; sau khi hết window có reset đúng không; vượt ngưỡng có làm lỗi lan sang user khác không.

### Q37. Ba lỗ hổng API phổ biến nhất bạn luôn kiểm tra?
- **BOLA/IDOR** (truy cập object của người khác), **broken authentication**, **mass assignment**, **excessive data exposure** (trả thừa field), **thiếu rate limit**. Nhắc được **OWASP API Security Top 10** là điểm cộng.

---

## 7. Bài tập thực hành (live coding)

### Bài 1 — Đọc response, tìm bug

```json
{
  "status": 200,
  "data": {
    "id": "123",
    "total": 59.999999,
    "items": [],
    "createdAt": "2026-10-14T25:00:00Z",
    "user": { "id": 7, "passwordHash": "$2b$10$..." }
  }
}
```

**Phải chỉ ra:**
1. **Lộ `passwordHash`** — nghiêm trọng nhất, excessive data exposure.
2. `id` là string `"123"` nhưng `user.id` là number `7` → type không đồng nhất.
3. `total` là float cho tiền → sai số; tiền nên là integer (cent) hoặc decimal string.
4. `items` rỗng nhưng `total` > 0 → bất nhất về nghiệp vụ.
5. `25:00:00` không phải giờ hợp lệ trong ISO 8601.
6. `status: 200` lặp lại trong body → redundant, dễ lệch với HTTP status thật.

### Bài 2 — Viết pre-request lấy token nếu hết hạn
→ xem code ở [Q23](#q23-pre-request-script-bạn-thường-dùng-làm-gì).

### Bài 3 — Thiết kế luồng
"Test luồng đặt hàng: tạo giỏ → thêm sản phẩm → thanh toán → huỷ đơn."
Vẽ ra: các request, **biến truyền giữa các bước** (`cartId`, `orderId`, `paymentId`), assertion chính từng bước, và cleanup.
Nhớ nói thêm: test huỷ đơn **đã thanh toán** vs **chưa thanh toán**, thanh toán 2 lần, thêm sản phẩm hết hàng, giỏ hết hạn.

### Bài 4 — Pagination
`GET /orders?page=1&size=20` trả 20 đơn — bạn test gì? → xem [Q17](#q17-bạn-test-pagination-thế-nào).

### Bài 5 — Viết test cho API trả về danh sách
Yêu cầu assert: mảng không rỗng, mọi phần tử có đủ field bắt buộc, danh sách sort giảm dần theo `createdAt`.

```javascript
const list = pm.response.json().data;

pm.test("List is not empty", function () {
  pm.expect(list).to.be.an("array").that.is.not.empty;
});

pm.test("Every item has required fields", function () {
  list.forEach(function (item) {
    pm.expect(item).to.have.all.keys("id", "status", "total", "createdAt");
  });
});

pm.test("Sorted by createdAt desc", function () {
  const times = list.map(function (i) { return new Date(i.createdAt).getTime(); });
  const sorted = times.slice().sort(function (a, b) { return b - a; });
  pm.expect(times).to.eql(sorted);
});
```

---

## 8. Hành vi & làm việc nhóm

### Q38. Dev nói "không reproduce được, trên máy anh chạy ổn". Bạn làm gì?
- Cung cấp đủ bằng chứng: request đầy đủ (curl), response, thời điểm, môi trường, user/data dùng, `X-Request-Id`, video/log. Thử lại trên môi trường của dev. Thu hẹp điều kiện tái hiện. Không tranh luận — đưa dữ liệu.

### Q39. Bạn báo bug, dev bảo "đó là by design". Bạn xử lý thế nào?
- Quay về spec / acceptance criteria. Nếu spec không nói → đưa BA/PO quyết định, **không tự xử**. Trình bày theo **tác động tới người dùng và rủi ro**, không theo đúng/sai cá nhân. Ghi lại kết luận vào ticket để lần sau khỏi tranh lại.

### Q40. Release gấp chiều nay, bạn còn 2 tiếng. Bạn test gì?
- Risk-based: luồng tiền, đăng nhập, dữ liệu của user; các API bị ảnh hưởng bởi change; chạy smoke/regression tự động song song; và **nói rõ với stakeholder phần nào chưa được test** — đây là điểm interviewer rất muốn nghe.

### Q41. Bạn tự học gì trong 6 tháng gần đây?
### Q42. 2 năm tới bạn muốn đi hướng nào — automation, performance, security, hay QA lead?

---

## 9. Câu nên hỏi lại interviewer

Interviewer đánh giá cả phần này. Chuẩn bị 4–5 câu:

- Team hiện tại test API bằng gì, đã có automation chưa, coverage khoảng bao nhiêu?
- Ai viết và maintain test — QA hay cả dev?
- Quy trình từ ticket tới release ra sao, QA tham gia từ bước nào?
- API test đã chạy trong CI chưa? Fail có block merge không?
- Môi trường test có ổn định và có test data riêng không?
- 3 tháng đầu, thế nào là "làm tốt" ở vị trí này?
- Vị trí này mở ra vì team mở rộng hay vì có người rời đi?

---

## 10. Checklist ôn tập ưu tiên

Những câu ứng viên 2 năm hay hụt nhất — ôn trước:

- [ ] Thứ tự ưu tiên variable scope trong Postman — [Q18](#q18-postman-có-mấy-loại-variable-scope-thứ-tự-ưu-tiên-khi-trùng-tên)
- [ ] Idempotency + test double-submit — [Q6](#q6-put-vs-patch-vs-post-put-có-idempotent-không-tại-sao-điều-đó-quan-trọng-với-tester), [Q7](#q7-idempotency-key-là-gì-nếu-api-thanh-toán-không-có-nó-bạn-test-gì)
- [ ] CORS và giới hạn của Postman — [Q9](#q9-cors-là-gì-nó-có-ảnh-hưởng-tới-test-bằng-postman-không)
- [ ] Tại sao phải bọc assertion trong `pm.test` — [Q21](#q21-khác-nhau-giữa-pmexpect-chai-và-pmresponsetohave-có-cần-bọc-pmtest-không)
- [ ] Quản lý secret khi chạy Newman trong CI — [Q25](#q25-làm-sao-chạy-1-collection-với-100-bộ-dữ-liệu-rồi-chạy-nó-trong-ci)
- [ ] IDOR / BOLA — [Q14](#q14-làm-sao-test-được-rằng-api-không-trả-về-dữ-liệu-của-user-khác) — gần như luôn được hỏi ở mid-level
- [ ] Pagination khi data đang thay đổi — [Q17](#q17-bạn-test-pagination-thế-nào)
- [ ] 422 vs 400 vs 409 — [Q5](#q5-400-vs-422-vs-409--gặp-case-nào-trả-về-từng-mã)
- [ ] Phân biệt flaky test vs bug thật — [Q31](#q31-thế-nào-là-flaky-test-test-fail-110-lần-thì-bạn-làm-gì)
- [ ] Chuẩn bị sẵn **2 câu chuyện**: một bug bạn tự hào, một lần bạn bất đồng với dev

### Mẹo trả lời

- Dùng cấu trúc **tình huống → bạn làm gì → kết quả**, mỗi câu 60–90 giây, đừng kể lan.
- Mọi câu "bạn test gì" → trả lời **theo nhóm** (positive / validate / auth / security / side effect), đừng liệt kê rời rạc.
- Không biết thì nói "em chưa làm cái này, nhưng em sẽ tiếp cận theo hướng…" — tốt hơn đoán bừa rất nhiều.
- Luôn nhắc tới **side effect** (DB, event, email) — đó là thứ tách tester giỏi khỏi người chỉ check status code.
