# Đáp án mẫu — Phỏng vấn API Tester (mid-level)

> Đi kèm [api-tester-interview-questions.md](./api-tester-interview-questions.md). File kia là góc nhìn **interviewer**; file này là **câu trả lời để nói ra miệng**.
>
> **Cách dùng:**
> - Chỗ `[...]` là bạn **phải** thay bằng dự án/kinh nghiệm thật. Đừng học thuộc nguyên văn — interviewer nhận ra ngay câu học vở.
> - Mỗi câu có **Nói (≈30–60s)** = phần bắt buộc, và **Nếu bị đào sâu** = đạn dự phòng. Đừng xả hết một lượt, chờ họ hỏi tiếp.
> - Câu kỹ thuật thì trả lời **dứt khoát trước, ví dụ sau**. Đừng mở đầu bằng "ờ thì… em nghĩ là…".

---

## 1. Warm-up & kinh nghiệm

> Ba câu này **không có đáp án đúng** — chỉ có đáp án *của bạn*. Soạn trước, nói thành tiếng 3 lần, bấm giờ.

### Q1. Kể về một API bạn test gần đây nhất.

**Khung bắt buộc đi qua 5 điểm:** API làm gì → ai gọi → dữ liệu đi đâu sau đó → bạn test gì → **tại sao chọn test cái đó**.

**Nói:**
> "API gần nhất em test là `[POST /api/feeds]` của dự án `[FeedNexa]` — nó `[tạo một feed sản phẩm từ store của merchant rồi đẩy sang Facebook Catalog / Google Merchant Center]`.
> Consumer là `[web app của merchant, và một job nền chạy sync định kỳ]`.
> Sau khi gọi thành công thì `[bản ghi feed vào DB, đồng thời một job được đẩy vào queue để generate file XML và upload lên kênh]` — nên em không chỉ check response.
> Em test theo 4 nhóm: happy path, validate từng field `[số lượng sản phẩm, loại kênh, mapping field]`, phân quyền `[merchant A không được tạo feed cho store của merchant B]`, và side effect `[feed có thực sự xuất hiện bên kênh không, job có chạy không]`.
> Em ưu tiên nhóm phân quyền và side effect vì `[đây là luồng chạm dữ liệu sản phẩm của khách — sai là lộ data chéo giữa các merchant, còn side effect thì response 200 không nói lên gì cả]`."

**Cốt lõi:** câu cuối — *tại sao ưu tiên* — là chỗ ăn điểm. Luôn gắn với **rủi ro nghiệp vụ**, không phải "vì nó quan trọng".

### Q2. Bug API nào bạn tự hào nhất?

**Khung:** em nghi ngờ vì sao → em làm gì để chứng minh → tác động nếu lọt.

**Nói (thay bằng bug thật của bạn):**
> "`[Bug ở luồng tạo feed: em thấy response trả 200 và feed hiện trên UI, nhưng khi em tạo 2 feed liên tiếp rất nhanh thì chỉ 1 cái được đẩy lên kênh.]`
> Em nghi ngờ vì `[số bản ghi trong DB và số feed bên kênh lệch nhau — em có thói quen đối chiếu side effect chứ không tin UI]`.
> Để chứng minh, em `[gửi 2 request gần như đồng thời, log lại request-id của cả hai, rồi nhờ dev trace log phía job — hoá ra job ghi đè nhau vì key bị tính theo store chứ không theo feed]`.
> Nếu lọt production thì `[merchant tưởng feed đã sync nhưng sản phẩm không lên kênh — mất doanh thu mà không ai biết, vì hệ thống không báo lỗi]`."

**Nếu bạn chưa có bug "oai":** chọn bug nhỏ nhưng kể được **đường suy luận**. Interviewer đo cách nghĩ, không đo độ hoành tráng. Tuyệt đối đừng nói "em tình cờ thấy".

### Q3. Chỉ có Swagger, không ai giải thích. 1 tiếng đầu làm gì?

**Nói:**
> "Em chia 1 tiếng đó làm 4 phần.
> 15 phút đầu đọc spec để **map bức tranh**: có những resource nào, endpoint nào thuộc resource nào, cái nào là luồng chính.
> 15 phút tiếp xác định **auth**: cơ chế gì, lấy token ở đâu, token có scope/role không — vì không qua được auth thì không test được gì.
> 20 phút gọi **happy path** của 2–3 API chính để xem shape response thật, đối chiếu với spec. Chỗ spec và thực tế lệch nhau là mỏ bug.
> 10 phút cuối em viết **danh sách câu hỏi** cho dev/BA về những chỗ spec im lặng: field nào bắt buộc, giới hạn giá trị, lỗi trả mã gì, ai được phép gọi, có phụ thuộc thứ tự giữa các API không.
> Em không viết test case trong 1 tiếng đầu — viết sớm lúc chưa hiểu nghiệp vụ thì phải bỏ đi làm lại."

**Nếu bị đào sâu** ("sao không hỏi dev luôn?"): "Em hỏi, nhưng hỏi sau khi đã tự đọc — để hỏi được câu đáng hỏi, và để không chiếm thời gian của dev vào những cái spec đã ghi rõ."

---

## 2. Nền tảng HTTP & API

> Phần này **phải trả lời trong 20–30 giây**, dứt khoát. Lưỡng lự ở đây là trừ điểm nặng nhất.

### Q4. 401 vs 403. Khi nào 404 thay 403?

**Nói:**
> "401 là **chưa xác thực được bạn là ai** — thiếu token, token sai, token hết hạn. 403 là **đã biết bạn là ai rồi nhưng bạn không có quyền** với resource này.
> Mẹo nhớ: 401 = *who are you?*, 403 = *I know you, but no*.
> Trả 404 thay 403 khi không muốn tiết lộ resource đó **tồn tại** — ví dụ `GET /users/999` là user của người khác: trả 403 là đã vô tình xác nhận 'có user 999', kẻ tấn công quét id là biết được tài khoản nào tồn tại. Chống enumeration thì trả 404."

**Nếu bị đào sâu** ("vậy luôn trả 404 cho tốt?"): "Không — 404 làm dev khó debug và làm người dùng thật bối rối. Em thấy hợp lý là: resource công khai thì 403 cho rõ ràng, resource chứa dữ liệu riêng của người khác thì 404."

### Q5. 400 vs 422 vs 409.

**Nói:**
> "400 là request **malformed** — JSON sai cú pháp, thiếu field bắt buộc, sai `Content-Type`. Server chưa hiểu được bạn muốn gì.
> 422 là **cú pháp đúng nhưng nội dung sai luật** — email không đúng format, `age: -5`, enum không hợp lệ. Server hiểu rồi, nhưng không chấp nhận.
> 409 là **xung đột trạng thái** — tạo trùng email, huỷ đơn đã giao, update bản ghi vừa bị người khác đổi.
> Phân biệt nhanh: 400 = *tôi không đọc nổi*, 422 = *tôi đọc được nhưng sai luật*, 409 = *đúng luật nhưng sai thời điểm*."

**Nếu bị đào sâu** ("API của bọn tôi trả 400 cho hết thì sao?"): "Vẫn chấp nhận được, nhiều team làm vậy — nhưng lúc đó body **phải** có mã lỗi và field nào sai, nếu không client không biết hiển thị gì cho người dùng. Em sẽ test chính cái đó: 400 nhưng body có nói rõ lỗi ở field nào không. Điều quan trọng là **nhất quán trong cả hệ thống**, chứ không phải chọn mã nào."

### Q6. PUT vs PATCH vs POST. PUT có idempotent không?

**Nói:**
> "POST tạo mới, **không** idempotent — gọi 2 lần ra 2 bản ghi. PUT **thay toàn bộ** resource và **có** idempotent — gọi 10 lần kết quả cuối giống gọi 1 lần. PATCH sửa một phần, **thường không** idempotent, ví dụ body kiểu `{"counter": "+1"}` thì gọi 2 lần tăng 2.
> Idempotent nghĩa là *trạng thái cuối cùng* giống nhau, không phải *response* giống nhau — PUT lần 2 vẫn có thể trả 200 thay vì 201.
> Với tester thì nó quan trọng vì nó chỉ đúng chỗ phải tấn công: **retry, double-submit, client timeout rồi gửi lại**. Mạng chập một cái là client gửi lại — câu hỏi là có tạo 2 bản ghi, có trừ tiền 2 lần không."

**Nếu bị đào sâu** ("PUT mà thiếu field thì sao?"): "Đó là bug kinh điển em luôn test — PUT là thay toàn bộ, nên gửi thiếu field thì field đó phải bị xoá/về default. Nhiều API cài PUT nhưng xử lý như PATCH, gửi thiếu thì nó giữ nguyên giá trị cũ. Lệch spec, và client dựa vào PUT để xoá field sẽ sai."

### Q7. Idempotency key là gì? API thanh toán không có nó thì test gì?

**Nói:**
> "Idempotency key là một key **do client sinh** ra và gửi kèm (thường ở header `Idempotency-Key`). Server lưu lại key đó cùng kết quả; lần sau thấy key trùng thì **trả lại kết quả cũ** chứ không tạo giao dịch mới. Nó biến một API không idempotent thành an toàn khi retry.
> Nếu API thanh toán **không có** nó, em test đúng cái rủi ro đó:
> Một là gửi 2 request giống nhau **gần như đồng thời** — xem có tạo 2 transaction không.
> Hai là gửi request, **cắt kết nối giữa đường** rồi gửi lại — mô phỏng client timeout, đây mới là case thật hay xảy ra.
> Ba là bấm submit liên tục trên UI.
> Và quan trọng nhất: kiểm tra **trong DB chỉ có 1 transaction**, chứ không chỉ xem response. Nếu ra 2 transaction thì đó là bug nghiêm trọng và em sẽ đề xuất idempotency key chứ không chỉ báo lỗi."

### Q8. Vòng đời access token + refresh token. Test gì?

**Nói:**
> "Access token sống ngắn, gửi kèm mọi request. Refresh token sống dài, chỉ dùng để xin access token mới khi nó hết hạn — để nếu access token bị lộ thì thiệt hại có giới hạn thời gian.
> Em test theo 3 nhóm:
> **Token không hợp lệ:** hết hạn, sai signature, token của user khác, token đã revoke, không gửi token, sai scheme (`Token abc` thay vì `Bearer abc`), token của môi trường khác (lấy token staging gọi production).
> **Luồng refresh:** refresh khi access còn hạn, refresh bằng token hết hạn, và quan trọng nhất là **dùng lại refresh token lần 2** — hệ thống tốt phải phát hiện reuse và revoke cả chuỗi, vì reuse thường có nghĩa là token bị đánh cắp.
> **Sau logout:** token cũ còn dùng được không. Rất nhiều API quên cái này."

**Nếu bị đào sâu** ("token hết hạn trả 401 hay 403?"): "401 — vì server không xác thực được nữa. Và body nên phân biệt được *token hết hạn* với *token sai*, để client biết nên refresh hay bắt đăng nhập lại."

### Q9. CORS là gì? Có ảnh hưởng tới test bằng Postman không?

**Nói:**
> "CORS là cơ chế bảo vệ của **browser**: trang web ở origin A gọi API ở origin B thì browser kiểm tra server B có trả header `Access-Control-Allow-Origin` cho phép hay không, không thì browser chặn.
> Postman **không** phải browser nên không bị chặn — nó cứ gửi và nhận bình thường.
> Hệ quả thực tế: một API 'chạy OK trong Postman nhưng web báo lỗi CORS' thì **không phải bug của API logic**, mà là thiếu config CORS phía server. Em không mất thời gian debug code nghiệp vụ, mà đi xem header và preflight `OPTIONS`.
> Và đây cũng là lý do em không kết luận 'API ổn' chỉ vì Postman xanh — Postman không thấy được CORS, cookie `SameSite`, hay CSP."

### Q10. REST vs GraphQL khác gì khi test?

**Nói:**
> "Khác lớn nhất: GraphQL thường **luôn trả HTTP 200**, kể cả khi lỗi — lỗi nằm trong mảng `errors` trong body. Nên assertion mà chỉ check status code là **vô nghĩa**: test sẽ xanh trong khi API đang lỗi. Em luôn assert `errors` phải rỗng/không tồn tại, rồi mới assert data.
> Thứ hai, client tự chọn field nên **không có một response shape cố định** — test phải gắn với query cụ thể.
> Thứ ba là mấy thứ riêng của GraphQL: query depth/complexity limit (chống query lồng vô hạn làm sập server), vấn đề N+1, batching, và phân quyền theo từng field chứ không theo endpoint."

> `[Nếu JD không có GraphQL và bạn chưa làm: "Em chưa làm GraphQL thật, nhưng em biết điểm phải cẩn thận nhất là nó luôn trả 200 nên không thể assert bằng status code." — thật thà + biết điểm cốt lõi vẫn ăn điểm.]`

### Q11. Khi nào dùng mock server thay môi trường thật?

**Nói:**
> "Ba trường hợp.
> Một, **API chưa có** — dev đang làm, em mock theo spec để viết test song song, tới lúc API xong là chạy được luôn thay vì chờ.
> Hai, **mô phỏng cái backend thật không tạo được**: 500, timeout, response dị dạng, field null bất ngờ, kênh thứ ba trả lỗi. Không ai làm sập staging để test error handling.
> Ba, **chạy trong CI** mà không muốn phụ thuộc hệ thống bên thứ ba — nó down thì pipeline đỏ oan, mà nhiều dịch vụ còn tính phí mỗi call.
> Nhưng em luôn nói rõ: mock **không thay được** test với hệ thống thật. Mock chỉ chứng minh code của mình xử lý đúng *giả định* về API, nên luôn phải có một bộ smoke chạy trên môi trường thật — không thì contract lệch lúc nào không biết."

### Q12. Header nào bạn luôn để ý?

**Nói:**
> "`Content-Type` và `Accept` — sai cái này là 400/415.
> `Authorization` — đúng scheme chưa.
> `X-Request-Id` / correlation id — em **luôn lấy cái này khi báo bug**, dev trace log bằng nó nhanh hơn em kể lể rất nhiều.
> `X-RateLimit-*` và `Retry-After` — để biết ngưỡng và cách client nên backoff.
> `Set-Cookie` — kiểm `HttpOnly`, `Secure`, `SameSite`; thiếu `HttpOnly` là JS đọc được session.
> `Location` — khi POST tạo mới, phải trả về URL của resource vừa tạo.
> `Cache-Control` — API trả dữ liệu riêng tư mà bị cache là lộ data sang người khác."

---

## 3. Thiết kế test case

### Q13. `POST /users` với `{name, email, age, role}` — liệt kê test case.

**Mở đầu bằng cách phân nhóm, đừng xả danh sách:**
> "Em chia theo 8 nhóm để không bỏ sót, rồi mới đi vào từng cái."

| Nhóm | Case |
|---|---|
| Positive | happy path đủ field; chỉ field bắt buộc, optional để trống; giá trị biên hợp lệ |
| Validate field | thiếu field; `null`; chuỗi rỗng; sai type (`age: "abc"`); vượt max length; biên `age` = 0, -1, 150; unicode/emoji trong `name`; khoảng trắng đầu-cuối; email sai format; email có dấu `+` |
| Business rule | email trùng → 409; `role` không tồn tại → 422; tuổi dưới giới hạn đăng ký |
| Schema/contract | đúng field, đúng type, không thiếu — và **không thừa field nội bộ** |
| Auth | không token; token hết hạn; user thường tạo tài khoản `role: admin` |
| Security | SQL injection và XSS payload trong `name`; **mass assignment** (gửi thêm `"isAdmin": true`); payload cực lớn; key trùng trong JSON |
| Hạ tầng | `Content-Type` sai; body không phải JSON; body rỗng; 2 request đồng thời cùng email |
| Side effect | DB đúng dữ liệu chưa; **password đã hash chưa**; email/event có bắn không |

**Chốt lại (đừng bỏ câu này):**
> "Trong đó em coi 3 cái là rủi ro cao nhất: **mass assignment** vì nó leo thang đặc quyền, **email trùng khi gửi đồng thời** vì validate ở application layer thường không đủ nếu DB thiếu unique constraint, và **response trả thừa field** như `passwordHash`."

**Follow-up gần như chắc chắn có — chuẩn bị sẵn:** *"Smoke chỉ chạy 5 case, chọn 5 nào?"*
> "Happy path; thiếu field bắt buộc → 400; email trùng → 409; không token → 401; và schema của response. Lý do: 5 cái này bao được *tạo được không*, *validate có sống không*, *auth có sống không*, *contract có vỡ không* — đủ để quyết định có deploy tiếp hay không."

### Q14. Làm sao test API không trả dữ liệu của user khác?

**Nói:**
> "Đây là IDOR, hay BOLA theo OWASP API Top 10. Cách em làm: tạo 2 user A và B có data riêng. Đăng nhập B, lấy id resource của B. Rồi dùng **token của A** gọi vào resource của B — mong đợi **403 hoặc 404**, tuyệt đối không được 200.
> Ba chỗ hay bị bỏ sót:
> Một, phải test **cả GET, PUT, DELETE, PATCH** — nhiều API chặn GET nhưng quên chặn DELETE.
> Hai, id không chỉ ở URL mà còn **trong body** và trong query param — ví dụ `{"accountId": "của B"}`, chỗ này rất hay lọt.
> Ba, các API **list** — `GET /orders` có lọc đúng theo user đang đăng nhập không, hay trả hết rồi để frontend tự lọc.
> Em cũng test cả theo chiều role: user thường gọi endpoint admin."

### Q15. 200 và body đúng nhưng vẫn fail. Khi nào?

**Nói:**
> "Nhiều trường hợp, và đây đúng là chỗ em cho là quan trọng nhất của test API.
> **Side effect sai:** DB không cập nhật, trạng thái đơn không đổi, event không được publish, email không gửi. Response chỉ nói 'tôi nhận được', không nói 'tôi làm xong'.
> **Trả thừa dữ liệu:** body đúng field cần, nhưng kèm cả `passwordHash` hay thông tin user khác.
> **Thiếu header** quan trọng, hoặc **response time** vượt SLA.
> **Dữ liệu đúng giá trị nhưng sai format:** timezone lệch, tiền là float, ngày không đúng ISO 8601.
> Em tóm lại một câu: 200 chỉ là điều kiện cần. Test API mà dừng ở status code và body thì bỏ lọt đúng những bug đắt nhất."

### Q16. API phụ thuộc 3 API khác — giữ test không flaky?

**Nói:**
> "Nguyên tắc của em: mỗi test **tự dựng dữ liệu của mình** và tự dọn.
> Setup data qua API hoặc seed script, không dùng data ai đó tạo tay trên staging — hôm nay có, mai bị xoá.
> **Không hardcode id** — chain biến từ response bước trước.
> Dữ liệu dùng **uuid hoặc prefix riêng** để chạy song song không đụng nhau.
> Chỗ bất đồng bộ thì **polling có timeout**, không bao giờ `sleep` cố định — `sleep` 2 giây hoặc là chậm vô ích, hoặc là chưa đủ, và nó flaky theo tốc độ máy.
> Dependency bên thứ ba thì mock trong CI.
> Cleanup ở teardown, và viết teardown kiểu idempotent để test fail giữa đường vẫn dọn được."

> `[Gắn thêm nếu có: "Ở dự án Playwright của em, em làm đúng vậy: globalSetup dựng session trước, mỗi spec tự tạo dữ liệu, teardown kill tiến trình browser để lần chạy sau không kế thừa state bẩn."]`

### Q17. Test pagination thế nào?

**Nói:**
> "Em test 4 nhóm.
> **Tham số biên:** `page` = 0, âm, vượt tổng số trang; `size` = 0, 1, cực lớn như 10000 — cái này vừa là validate vừa là rủi ro DoS.
> **Tính đúng đắn:** tổng số bản ghi và tổng số trang khớp nhau; trang cuối trả đúng phần dư; cộng hết các trang lại bằng tổng.
> **Bug kinh điển: data thay đổi giữa lúc phân trang.** Đang ở trang 1, có người thêm/xoá bản ghi, sang trang 2 thì có bản ghi **bị trùng hoặc bị nhảy mất**. Nguyên nhân là offset-based pagination mà sort không stable. Cách sửa là sort theo khoá duy nhất, hoặc dùng cursor-based.
> **Kết hợp:** filter + sort + page cùng lúc — rất hay sai ở chỗ filter chỉ áp dụng trong trang hiện tại thay vì trên toàn bộ tập dữ liệu."

**Nếu bị đào sâu** ("sao biết trùng/thiếu?"): "Em gọi trang 1, giữ danh sách id, tạo thêm bản ghi mới, rồi gọi trang 2 và kiểm tra giao của 2 tập id phải rỗng. Tự động hoá được, không cần nhìn mắt."

---

## 4. Postman & pm.test

### Q18. Mấy loại variable scope? Thứ tự ưu tiên?

**Nói:**
> "Có 5 scope, từ rộng tới hẹp: **Global → Collection → Environment → Data → Local**.
> Khi trùng tên thì **cái hẹp nhất thắng**: `Local > Data > Environment > Collection > Global`.
> Thực tế nó cứu em ở chỗ: `baseUrl` để ở Environment để đổi theo môi trường, còn cái gì chỉ dùng trong một run thì để Local để không ghi đè lên Environment của người khác."

**Follow-up hay có:** *"`pm.environment.set` vs `pm.collectionVariables.set` khác gì?"*
> "Collection variable nằm **bên trong** file collection, nên export collection là nó đi theo — tiện để chia sẻ, nhưng **rất dễ vô tình commit secret lên Git**. Environment là file riêng, nên em để secret ở đó và không commit file đó. Quy tắc của em: cái gì là *dữ liệu chạy* thì collection variable, cái gì *khác nhau theo môi trường hoặc là secret* thì environment."

### Q19. `pm.variables.set` vs `pm.environment.set`?

**Nói:**
> "`pm.variables.set` chỉ sống trong **run hiện tại** — không ghi vào environment, hết run là mất.
> `pm.environment.set` **ghi thật** vào environment, còn lại sau khi run xong.
> Em dùng cái đầu cho giá trị tạm: timestamp, random email, id vừa tạo. Lý do: tránh làm bẩn environment, và tránh xung đột khi nhiều người hoặc nhiều luồng dùng chung environment — đang chạy thì giá trị bị người khác ghi đè."

### Q20. Viết `pm.test`: status 201, response time < 800ms, `id` là number, `email` khớp, lưu `id`.

**Vừa viết vừa nói — interviewer đánh giá cách bạn nghĩ:**

```javascript
// Parse 1 lần, dùng lại
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

// Chain sang request sau
pm.collectionVariables.set("userId", res.id);
```

**Nói kèm:**
> "Em tách thành nhiều `pm.test` chứ không gộp, để report chỉ rõ **cái nào fail** thay vì chỉ thấy một dòng đỏ.
> `email` em so với biến đã gửi chứ không hardcode — hardcode là test chỉ chạy được 1 lần.
> `responseTime` em coi là assertion mềm: nó fail do mạng thì em không kết luận ngay, phải đo lại."

**Follow-up gần như luôn có:** *"Response không phải JSON thì `pm.response.json()` làm sao?"*
> "Nó **throw**, và vì em gọi ở ngoài `pm.test` nên **cả script dừng** — các test sau không chạy, report chỉ thấy một lỗi khó hiểu. Cách em xử lý là để việc parse vào trong một test, để nó fail gọn ở đó:"

```javascript
let res;
pm.test("Response is JSON", function () {
  res = pm.response.json();      // fail gọn tại đây
});
pm.test("Body is valid", function () {
  pm.expect(res, "không parse được JSON").to.be.an("object");
  pm.expect(res.id).to.be.a("number");
});
```

### Q21. `pm.expect` vs `pm.response.to.have.*`? Có cần bọc `pm.test`?

**Nói:**
> "`pm.response.to.have.*` là helper có sẵn cho response — gọn cho status, header, body. `pm.expect` là Chai, assert được **mọi giá trị**, kể cả biến hay dữ liệu em tự tính.
> Và **luôn phải bọc trong `pm.test`**. Assertion để ngoài vẫn chạy, nhưng khi fail nó **throw và làm vỡ cả script** — các test phía sau không chạy, mà trong report nó **không hiện thành một test result riêng**. Tức là test fail mà report không nói rõ fail cái gì. Đó là lý do bọc, không phải vì quy ước."

### Q22. Validate JSON Schema trong Postman?

```javascript
const schema = {
  type: "object",
  required: ["id", "email"],
  additionalProperties: false,          // bắt cả field lạ
  properties: {
    id:    { type: "number" },
    email: { type: "string", format: "email" },
    role:  { type: "string", enum: ["user", "admin"] }
  }
};

pm.test("Schema is valid", function () {
  pm.response.to.have.jsonSchema(schema);
});
```

**Nói:**
> "Giá trị của nó là bắt được **contract break** — đổi type, mất field, thêm field lạ — mà assert từng field rất dễ bỏ sót, vì mình chỉ assert cái mình nghĩ ra.
> Em thêm `additionalProperties: false` khi muốn bắt cả trường hợp API **trả thừa field**, đây vừa là contract vừa là bảo mật.
> Và schema nên **sinh từ OpenAPI** chứ không viết tay, để spec đổi là test đổi theo — viết tay thì vài sprint là lệch."

### Q23. Pre-request script dùng làm gì?

**Nói:**
> "Sinh dynamic data (timestamp, uuid, random email), lấy/refresh token, tính signature hoặc HMAC, set biến theo môi trường.
> Nhưng chỗ em thấy đáng làm nhất là **chỉ login khi token hết hạn**, thay vì gọi login ở mọi request — collection 200 request mà login 200 lần thì chậm, và dễ bị rate limit chặn."

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

> "Buffer 30 giây là để tránh trường hợp token còn 1 giây lúc check nhưng đã hết hạn lúc request thật tới server. Và em đặt script này ở **Collection-level pre-request** để mọi request dùng chung."

### Q24. `postman.setNextRequest()` dùng khi nào? Rủi ro?

**Nói:**
> "Nó điều khiển luồng trong Collection Runner: skip request, loop lại, retry, hoặc nhảy tới folder cleanup khi có lỗi.
> Rủi ro: một là **vòng lặp vô hạn** nếu điều kiện thoát sai — phải tự đếm và chặn. Hai là collection thành khó đọc, luồng thật không còn khớp với thứ tự hiển thị, người sau maintain rất mệt. Ba là nó **chỉ có tác dụng trong Runner/Newman** — bấm Send thủ công thì nó bị bỏ qua, nên dễ tưởng chạy đúng.
> Thực tế em hạn chế dùng; cần logic luồng phức tạp thì em thấy viết code sạch hơn nhiều."

### Q25. Chạy 1 collection với 100 bộ dữ liệu? Rồi trong CI?

**Nói:**
> "Dùng data file CSV hoặc JSON với Collection Runner, trong script đọc bằng `pm.iterationData.get("field")`. Mỗi dòng là một iteration.
> Trong CI thì dùng **Newman** hoặc **Postman CLI**:"

```bash
newman run collection.json \
  -e env.json \
  -d data.csv \
  --reporters cli,junit \
  --reporter-junit-export results/junit.xml
```

> "Em export JUnit để CI hiển thị được test result và đánh dấu build đỏ, chứ không phải đọc log bằng mắt."

**Follow-up hay làm hụt ứng viên:** *"Secret để ở đâu?"*
> "**Không commit** environment có secret lên Git. Em để file environment trong repo chỉ chứa **placeholder**, còn giá trị thật lấy từ secret của CI rồi inject lúc chạy:"

```bash
newman run collection.json -e env.json \
  --env-var "password=$API_PASSWORD" \
  --env-var "apiKey=$API_KEY"
```

> "Hoặc dùng `{{$processEnv API_PASSWORD}}` ngay trong collection để nó đọc biến môi trường. Và nhớ là Newman log có thể in cả request — nên phải chắc secret không bị in ra log của CI, vì log CI thường ai trong team cũng xem được."

### Q26. Collection 200 request — làm sao team khác maintain được?

**Nói:**
> "Em làm 5 việc.
> **Cấu trúc:** folder theo module hoặc theo luồng nghiệp vụ, naming nhất quán kiểu `[Module] Hành động - điều kiện`, nhìn tên là biết test gì.
> **Description cho từng request:** nó test gì, cần data gì trước, để lại gì cho bước sau.
> **Tách config khỏi logic:** baseUrl và secret ở environment, không hardcode.
> **Script dùng chung đặt ở Collection-level**, không copy-paste vào 200 request — sửa một chỗ là xong.
> **Version control:** export JSON vào Git để review được bằng pull request, kèm README nói cách chạy.
> Thêm folder `setup` / `teardown` riêng để người mới biết phải chạy gì trước.
> Nhưng em cũng nói thật: tới cỡ 200 request thì Postman bắt đầu là giới hạn — diff JSON gần như không review được, merge conflict rất đau. Đó là lúc em cân nhắc chuyển sang code."

### Q27. Có viết test ở Collection-level / Folder-level chưa? Để làm gì?

**Nói:**
> "Có — để đặt những assertion **phải đúng với mọi request**: không được trả 5xx, phải có `X-Request-Id`, response time dưới ngưỡng, `Content-Type` phải là JSON.
> Lợi ích thực tế là hai cái: giảm trùng lặp, và tạo một **mức chuẩn tối thiểu** cho cả collection — kể cả request ai đó mới thêm vào mà quên viết test thì vẫn được kiểm mấy điều kiện cơ bản đó."

```javascript
// Collection-level test
pm.test("Không có lỗi server", function () {
  pm.expect(pm.response.code).to.be.below(500);
});
pm.test("Có correlation id", function () {
  pm.expect(pm.response.headers.has("X-Request-Id")).to.be.true;
});
```

### Q28. Hạn chế của Postman? Khi nào chuyển sang code?

**Nói:**
> "Em coi Postman là tool để **explore và chia sẻ**, không phải nền tảng automation lớn.
> Em **chuyển sang code** khi: logic phức tạp cần hàm và điều kiện thật; cần reuse và refactor; cần chạy song song; cần **truy vấn DB hoặc message queue để verify side effect** — cái này Postman gần như không làm được; cần debug bằng breakpoint; và cần review bằng pull request, vì diff của collection JSON thì không ai review nổi.
> Em sẽ dùng `[Playwright API testing / pytest + requests / RestAssured]`.
> Nhưng Postman vẫn mạnh ở chỗ: explore API mới cực nhanh, chia sẻ được với BA và dev không code, mock server, sinh docs, và onboarding người mới. Em không coi là thay thế — em dùng Postman để khám phá, rồi code lại những gì cần chạy lặp lại trong CI."

> `[Nếu bạn đã làm Playwright thật — nói rõ: "Ở dự án hiện tại em viết automation bằng Playwright + TypeScript, nên em quen cách tổ chức fixture, chạy trong CI, và lưu trace khi fail để debug."]`

---

## 5. Automation, CI & môi trường

### Q29. Pipeline chạy API test ở bước nào? Fail thì làm gì?

**Nói:**
> "Em chia 2 tầng. **Smoke** chạy ngay sau khi deploy lên staging, vài phút, chỉ các luồng sống-chết — fail là coi như bản deploy đó không dùng được. **Regression** đầy đủ chạy theo schedule `[2 lần/ngày]` hoặc trước release.
> Fail thì: pipeline đỏ và **block merge**; report JUnit/HTML được đính kèm vào run; notification `[Slack/Teams]` kèm **link trực tiếp tới run** chứ không chỉ chữ 'failed' — để người nhận mở ra xem được ngay mà không cần hỏi lại.
> Và quan trọng là **có người chịu trách nhiệm xem**: pipeline đỏ mà không ai nhìn thì sau 2 tuần cả team quen với màu đỏ, lúc đó test coi như vô dụng."

> `[Dự án của bạn: workflow `.github/workflows/playwright.yml` chạy trên push và pull_request vào main/master, upload `playwright-report/` làm artifact giữ 30 ngày. Kể đúng cái này — nó cụ thể và thật.]`

### Q30. Local pass, CI fail. Debug thế nào?

**Nói:**
> "Em đi theo thứ tự từ nguyên nhân hay gặp nhất.
> **Environment và biến:** CI dùng đúng env chưa, secret có inject chưa, biến rỗng mà không ai báo.
> **Data:** local em có data tạo tay từ hôm trước, CI thì chạy sạch — test phụ thuộc data có sẵn là fail.
> **Timing:** CI chậm hơn máy local, timeout ngắn là fail. Chỗ này cũng lộ ra test nào đang dựa vào `sleep`.
> **Thứ tự và song song:** CI có thể chạy khác thứ tự hoặc nhiều worker.
> **Mạng:** CI có vào được VPN/internal host không — rất hay là nguyên nhân.
> **Locale và timezone:** máy em `[Asia/Ho_Chi_Minh]`, runner thường UTC. Test so sánh ngày là lệch.
> Và nguyên tắc: em **không đoán** — em bật log request/response thật trong CI, hoặc lưu artifact (trace, screenshot, HTML report) để xem lại đúng cái đã xảy ra.
> `[Ở dự án em, fixture tự ghi trace và chỉ giữ lại khi test fail, nên CI đỏ là em tải trace về mở bằng `npx playwright show-trace` xem lại từng bước — không phải chạy lại để đoán.]`"

### Q31. Flaky test là gì? Fail 1/10 lần thì làm gì?

**Nói:**
> "Flaky là test **cùng code, cùng input mà lúc pass lúc fail** — nó phá niềm tin vào cả bộ test, vì sau vài lần đỏ-oan thì không ai tin màu đỏ nữa.
> Fail 1/10 lần thì việc đầu tiên em làm **không phải** là bật retry. Em tìm nguyên nhân, và nó thường là một trong:
> shared data giữa các test; **eventual consistency** (API trả 200 nhưng dữ liệu chưa kịp ghi/index); **race condition — và đây rất có thể là bug thật của hệ thống**, không phải lỗi test; timezone; thứ tự test.
> Em nhấn mạnh cái race condition: fail 1/10 lần ở luồng thanh toán thì nghĩa là **1/10 người dùng thật gặp lỗi**. Retry để nó xanh là mình vừa che một bug production.
> Chỉ khi xác định rõ nguyên nhân là async delay hợp lệ thì em mới xử lý — và sửa bằng **polling có timeout**, chứ không phải `sleep` cố định hay retry mù.
> Trong lúc chưa sửa được mà nó làm nghẽn team, em cho vào known-issue có **ticket và deadline**, không để treo vô thời hạn."

### Q32. Contract testing là gì? Khác API test thường?

**Nói:**
> "Contract testing kiểm tra provider và consumer **tuân thủ cùng một hợp đồng** — thường bằng Pact, hoặc bằng schema sinh từ OpenAPI.
> Khác biệt chính: nó **không cần dựng cả hệ thống**, chạy rất nhanh, và chạy được ngay trong pipeline của từng service. Nó trả lời đúng một câu hỏi: 'service này có vừa phá client của nó không'.
> API test thường thì verify **hành vi** end-to-end: nghiệp vụ đúng chưa, side effect đúng chưa — cái đó contract test không biết.
> Nên hai cái bổ sung nhau: contract test bắt breaking change sớm, lúc dev mới commit; API test bắt sai nghiệp vụ.
> `[Nếu chưa làm: "Em chưa làm Pact thật. Nhưng em có làm phần gần nhất với nó là validate JSON Schema sinh từ OpenAPI trong Postman — nó bắt được đổi type, mất field, thêm field lạ."]` — đừng nhận là đã làm Pact nếu chưa, họ đào một câu là lộ."

### Q33. Test data quản lý thế nào?

**Nói:**
> "Nguyên tắc: **test tự tạo data của mình, tự dọn** (self-contained).
> Data sinh động với **uuid hoặc prefix** như `auto_<uuid>@test.local` — tránh đụng nhau khi chạy song song, và nhìn là biết data của automation để xoá được.
> **Cleanup ở teardown**, viết kiểu chạy lại nhiều lần vẫn an toàn, để test chết giữa đường không để lại rác.
> Data dùng chung thực sự (bảng cấu hình, danh mục) thì dùng **seed script** version trong Git, không ai tạo tay.
> Và em tuyệt đối **không phụ thuộc data do người khác tạo tay trên staging** — hôm nay có, mai bị xoá, rồi mất nửa ngày debug một test không hề sai.
> Data sản xuất thật thì không dùng; cần dữ liệu giống thật thì phải masking."

---

## 6. Performance & security cơ bản

### Q34. Load / stress / spike / soak.

**Nói:**
> "**Load:** chạy ở mức tải **dự kiến**, xem có đạt SLA — câu hỏi là 'bình thường có ổn không'.
> **Stress:** tăng dần **tới khi vỡ**, để biết điểm giới hạn và biết nó vỡ kiểu gì — trả 503 đàng hoàng hay chết hẳn.
> **Spike:** tăng **đột ngột** rồi hạ, mô phỏng flash sale hay push notification — đo khả năng co giãn.
> **Soak:** tải vừa phải nhưng **chạy rất lâu**, vài tiếng tới vài ngày, để tìm memory leak, connection pool cạn, log đầy đĩa, hiệu năng tụt dần.
> Cái hay bị bỏ là soak, vì nó mất thời gian — nhưng memory leak thì chỉ soak mới thấy."

### Q35. API trả 200 nhưng chậm 5 giây. Báo bug thế nào?

**Nói:**
> "Trước khi báo, em làm 4 việc.
> **Đo lại nhiều lần** — không kết luận từ 1 lần, để loại trừ cold start và mạng của em.
> **Tách network và server:** xem thời gian xử lý phía server, so với tổng thời gian.
> **Thử thu hẹp input:** gọi với filter nhỏ hơn, ít bản ghi hơn, bỏ bớt field. Nếu nhỏ thì nhanh, lớn thì chậm tuyến tính → đoán được là data lớn, thiếu index, hay N+1 query. Nó biến bug từ 'API chậm' thành 'API chậm tỉ lệ thuận với số bản ghi'.
> **Lấy `X-Request-Id` và timestamp** để dev trace log đúng request đó.
> Rồi em báo bug kèm **số liệu p50/p95 và điều kiện tái hiện**, chứ không viết 'API chậm'. Và nói rõ **tác động**: `[với 5 giây thì người dùng bỏ giữa đường, và nếu đây là API trong luồng checkout thì ảnh hưởng doanh thu]`.
> Em cũng hỏi lại: SLA của API này là bao nhiêu? Không có ngưỡng thì 'chậm' chỉ là ý kiến cá nhân."

### Q36. Kiểm tra rate limiting thế nào?

**Nói:**
> "Em test 4 điểm.
> **Vượt ngưỡng:** gửi quá giới hạn → mong đợi **429**, kèm `Retry-After` hoặc `X-RateLimit-Remaining` để client biết chờ bao lâu. Trả 500 là bug.
> **Đơn vị tính:** ngưỡng theo user, theo IP, hay theo API key — quan trọng, vì tính theo IP thì cả công ty khách hàng dùng chung NAT sẽ chặn lẫn nhau.
> **Reset:** hết window có mở lại đúng không, hay bị chặn lâu hơn công bố.
> **Cách ly:** user A vượt ngưỡng có làm ảnh hưởng user B không — đây là câu em cho là quan trọng nhất.
> Và test ngược: ngưỡng có **quá chặt** không. Rate limit chặn luôn người dùng thật thì cũng là bug."

### Q37. Ba lỗ hổng API phổ biến nhất bạn luôn kiểm?

**Nói:**
> "Em luôn kiểm 3 cái đầu tiên, theo **OWASP API Security Top 10**:
> **BOLA / IDOR** — đổi id trong URL hoặc body để truy cập object của người khác. Đây là lỗ hổng số 1 của API và cũng dễ test nhất.
> **Broken authentication** — token hết hạn vẫn dùng được, token không verify signature, token còn sống sau logout, refresh token dùng lại được.
> **Excessive data exposure** — API trả cả object từ DB, kèm `passwordHash`, số điện thoại, email người khác, field nội bộ. Rất hay xảy ra khi backend trả thẳng entity và để frontend tự chọn field hiển thị.
> Hai cái em kiểm tiếp là **mass assignment** (gửi thêm `"isAdmin": true` hoặc `"role": "admin"` vào body để leo quyền) và **thiếu rate limit**.
> Em nói trước là em không phải pentester — em kiểm ở mức tester có thể làm trong luồng test thường, cái sâu hơn thì cần security team."

---

## 7. Bài tập thực hành (live coding)

### Bài 1 — Đọc response, tìm bug

**Nói theo thứ tự nghiêm trọng, đừng nhặt bừa:**

> "Em đi từ nặng tới nhẹ.
> **Một, nghiêm trọng nhất: lộ `passwordHash`** trong response — excessive data exposure. Hash vẫn brute-force được offline, và nó không có lý do gì để ra khỏi server. Em sẽ báo đây là bug bảo mật ưu tiên cao, không phải bug format.
> **Hai, `total: 59.999999` là float cho tiền** — float có sai số nhị phân, cộng dồn là lệch. Tiền nên là integer theo đơn vị nhỏ nhất (cent) hoặc decimal string.
> **Ba, `items` rỗng nhưng `total` > 0** — bất nhất về nghiệp vụ. Hoặc API trả thiếu items, hoặc total tính sai. Em sẽ hỏi nghiệp vụ trước khi kết luận.
> **Bốn, `createdAt: "2026-10-14T25:00:00Z"` — giờ 25 không tồn tại**, sai ISO 8601. Client parse là lỗi hoặc ra giá trị rác.
> **Năm, type không đồng nhất:** `id` là string `"123"` nhưng `user.id` là number `7`. Client typed language sẽ vỡ, và nó cho thấy không có contract chung.
> **Sáu, `status: 200` lặp trong body** — redundant, và nguy hiểm ở chỗ nó có thể lệch với HTTP status thật, lúc đó client không biết tin cái nào."

> **Mẹo:** sau khi liệt kê, chốt một câu *"nếu chỉ được báo 1 bug thì em báo `passwordHash`"* — thể hiện biết ưu tiên theo rủi ro.

### Bài 2 — Pre-request lấy token nếu hết hạn
→ dùng code ở [Q23](#q23-pre-request-script-dùng-làm-gì). Nói kèm **lý do có buffer 30 giây** và **vì sao đặt ở collection-level**.

### Bài 3 — Thiết kế luồng đặt hàng

**Vẽ ra 4 cột: bước → request → biến truyền đi → assertion chính.**

| Bước | Request | Lấy ra | Assert chính |
|---|---|---|---|
| 1. Tạo giỏ | `POST /carts` | `cartId` | 201, `cartId` tồn tại, giỏ rỗng |
| 2. Thêm sản phẩm | `POST /carts/{cartId}/items` | `itemId` | 201, số lượng và giá đúng, tổng tiền được tính lại |
| 3. Thanh toán | `POST /orders` | `orderId`, `paymentId` | 201, trạng thái `paid`, **tiền trừ đúng 1 lần** |
| 4. Huỷ đơn | `POST /orders/{orderId}/cancel` | — | 200, trạng thái `cancelled`, **hoàn tiền được tạo** |
| 5. Cleanup | xoá giỏ / đơn test | — | môi trường sạch |

**Rồi nói thêm phần negative — đây là chỗ ăn điểm:**
> "Ngoài happy path em test: huỷ đơn **đã thanh toán** vs **chưa thanh toán** — hai luồng hoàn tiền khác nhau; **thanh toán 2 lần** cùng một giỏ; thêm **sản phẩm hết hàng** hoặc hết hàng giữa lúc checkout; **giỏ hết hạn**; thanh toán giỏ **rỗng**; huỷ đơn **đã giao** → phải 409; và dùng token user A huỷ đơn của user B → phải 403/404.
> Về side effect: sau bước 3 em kiểm tồn kho đã giảm chưa, sau bước 4 kiểm tồn kho đã trả lại chưa — rất hay là chỗ bug, vì hoàn tiền thì làm mà hoàn tồn kho thì quên.
> Và em không hardcode id ở bước nào — tất cả chain từ response bước trước, để test chạy được ở mọi môi trường."

### Bài 4 — Pagination
→ [Q17](#q17-test-pagination-thế-nào). Nhớ nhấn cái bug **trùng/thiếu bản ghi giữa 2 trang khi data đang đổi**.

### Bài 5 — Test API trả danh sách

```javascript
const list = pm.response.json().data;

pm.test("List is not empty", function () {
  pm.expect(list).to.be.an("array").that.is.not.empty;
});

pm.test("Every item has required fields", function () {
  list.forEach(function (item, i) {
    pm.expect(item, "item index " + i).to.include.all.keys("id", "status", "total", "createdAt");
  });
});

pm.test("Sorted by createdAt desc", function () {
  const times = list.map(function (i) { return new Date(i.createdAt).getTime(); });
  const sorted = times.slice().sort(function (a, b) { return b - a; });
  pm.expect(times).to.eql(sorted);
});
```

**Nói kèm — chỗ phân biệt mid với junior:**
> "Em thêm `item index` vào message để fail thì biết **phần tử nào** sai, chứ không phải đi đọc cả mảng.
> Em dùng `include.all.keys` thay vì `have.all.keys` vì đề chỉ yêu cầu 'có đủ field bắt buộc' — `have.all.keys` sẽ fail nếu API trả thêm field, mà đó là yêu cầu khác. Nếu mục tiêu là bắt field thừa thì em dùng `have.all.keys` hoặc JSON Schema với `additionalProperties: false` — nhưng phải cố ý chọn, không nhầm.
> Em cũng check sort bằng cách so với bản đã sort chứ không so từng cặp liền kề — ngắn và không sai sót."

---

## 8. Hành vi & làm việc nhóm

> Dùng cấu trúc **tình huống → bạn làm gì → kết quả**. 60–90 giây. Không nói xấu ai.

### Q38. Dev nói "không reproduce được, máy anh chạy ổn".

**Nói:**
> "Em không tranh luận, em đưa dữ liệu.
> Em gửi lại bug với đủ thứ để họ chạy được ngay: **curl đầy đủ** của request, response thật, **thời điểm chính xác**, môi trường, user/data đã dùng, và `X-Request-Id` để họ trace log.
> Rồi em **thu hẹp điều kiện tái hiện** — nó xảy ra với mọi user hay chỉ user có `[đặc điểm gì]`, mọi lần hay 1/5 lần. Nếu chỉ 1/5 lần thì khả năng cao là race condition hoặc phụ thuộc data, và chính thông tin 'không phải lúc nào cũng xảy ra' đã là manh mối cho dev.
> Nếu vẫn lệch, em đề nghị **ngồi cùng 5 phút**, em chạy trên máy em cho họ xem. Thường tới đó là ra — và hay hoá ra là khác data hoặc khác môi trường.
> Em coi 'không reproduce được' là **thiếu thông tin**, không phải bất đồng quan điểm."

### Q39. Bạn báo bug, dev nói "by design".

**Nói:**
> "Em quay về **spec và acceptance criteria** trước. Nếu spec nói rõ thì chuyện kết thúc — và nếu em sai thì em nhận, em sửa test case lại.
> Nếu **spec không nói gì** — phần lớn là trường hợp này — thì em không tự quyết mà cũng không để dev tự quyết: em đưa **BA/PO** vào, vì đây là câu hỏi nghiệp vụ, không phải câu hỏi kỹ thuật.
> Khi trình bày em nói theo **tác động tới người dùng và rủi ro**, không nói đúng/sai: ví dụ `['hiện tại người dùng có thể làm X và dẫn tới Y — mình chấp nhận rủi ro đó hay sửa?']`. Đóng khung như vậy thì dev không ở thế phải phòng vệ, và PO có cái để quyết.
> Và dù kết luận là gì, em **ghi lại vào ticket** — kể cả khi quyết định là 'không sửa'. Để 3 tháng sau không ai tranh lại, và để người mới vào không báo trùng."

### Q40. Release chiều nay, còn 2 tiếng. Test gì?

**Nói:**
> "Em test theo **rủi ro**, không theo thứ tự có sẵn.
> **Ưu tiên 1:** luồng tiền và luồng đăng nhập — sai là thiệt hại trực tiếp và không sửa được bằng hotfix nhanh.
> **Ưu tiên 2:** đúng những API bị **ảnh hưởng bởi change lần này** — em đọc diff hoặc hỏi dev đã sửa gì, chứ không test lan.
> **Ưu tiên 3:** phân quyền và dữ liệu chéo giữa user.
> Song song đó em **chạy bộ automation smoke/regression** để nó làm phần lặp lại, còn em tập trung vào phần mới và phần rủi ro cao.
> Và việc cuối quan trọng nhất: em **báo rõ với stakeholder phần nào chưa được test** và rủi ro còn lại là gì — kiểu `['2 tiếng em phủ được A, B, C; phần D và E chưa test, rủi ro là ...']`. Em không nói 'test xong rồi' khi mới test 60%. Quyết định release là của họ, nhưng họ phải quyết trên thông tin đúng."

### Q41. Bạn tự học gì 6 tháng gần đây?

**Khung:** học gì → học vì **vấn đề thật nào** → áp dụng được gì.

**Nói (sửa theo thật):**
> "`[Em học Playwright và TypeScript, vì dự án cần automation UI mà trước đó em chủ yếu test tay và dùng Postman.]`
> Em học không phải theo khoá tuần tự mà theo vấn đề gặp phải: `[đầu tiên là làm sao giữ session đăng nhập để không phải login lại mỗi test — em đọc về storageState và CDP attach; sau đó là làm sao debug khi test fail trong CI — em dùng trace viewer.]`
> `[Em cũng học cách dùng AI để sinh script từ test case em tự viết, và quan trọng hơn là cách kiểm tra lại code nó sinh ra — vì AI hay viết test luôn pass mà không assert gì có ý nghĩa.]`
> Cái em thấy mình còn thiếu và đang học tiếp là `[performance testing và test API bằng code thay vì Postman]`."

> **Cờ đỏ cần tránh:** "em học qua YouTube" mà không nói được áp dụng vào đâu. Luôn gắn với vấn đề thật.

### Q42. 2 năm tới muốn đi hướng nào?

**Nói — chọn một hướng, đừng nói "gì cũng được":**
> "Em muốn đi sâu về **`[automation]`** trước, vì `[em đang làm và thấy đây là chỗ em tạo ra khác biệt rõ nhất — bộ regression chạy tự động giúp team phát hiện lỗi sớm thay vì chờ test tay]`.
> Cụ thể 1–2 năm tới em muốn `[chuyển từ viết script sang thiết kế framework: tổ chức fixture, chạy song song ổn định, tích hợp CI, và mở rộng sang API test bằng code chứ không chỉ UI]`.
> Xa hơn em quan tâm `[performance]`, vì `[em thấy nhiều bug không phải sai logic mà là chậm và vỡ khi tải cao, mà đó lại là phần ít người test]`.
> Em chưa nhắm quản lý ngay — em muốn vững kỹ thuật trước đã."

> **Nếu JD nghiêng về hướng nào thì nói hướng đó trước** — nhưng phải thật, họ đào một câu là biết.

---

## 9. Câu nên hỏi lại interviewer

Chọn **4–5 câu**, hỏi xen trong buổi chứ đừng dồn cuối. Chọn câu mà câu trả lời **ảnh hưởng tới quyết định của bạn**:

- "Team hiện tại test API bằng gì — Postman, code, hay cả hai? Đã có automation chạy trong CI chưa?"
- "Ai viết và maintain test — QA tự làm hay dev cùng viết?"
- "API test fail có **block merge** không, hay chỉ là thông tin tham khảo?" → câu này lộ rõ team coi trọng chất lượng tới đâu.
- "Môi trường test có ổn định và có test data riêng không?" → nếu họ thở dài thì bạn biết 3 tháng đầu sẽ làm gì.
- "3 tháng đầu, thế nào là **làm tốt** ở vị trí này?"
- "Vị trí này mở ra vì team mở rộng hay vì có người rời đi?"
- "QA tham gia từ bước nào — từ lúc refine requirement hay khi dev code xong?"

**Đừng hỏi** lương/nghỉ phép ở vòng kỹ thuật, và đừng hỏi cái đã có trên JD.

---

## 10. Trước buổi phỏng vấn — việc tối thiểu

**Luyện theo thứ tự này, đừng ôn dàn đều:**

1. **Nói thành tiếng** Q1, Q2, Q3 — bấm giờ, mỗi câu dưới 90 giây. Đây là 3 câu quyết định ấn tượng ban đầu và là 3 câu duy nhất không học được từ file này.
2. Học chắc 6 câu hay hụt nhất: **Q6/Q7** (idempotency), **Q9** (CORS), **Q14** (IDOR), **Q18** (variable scope), **Q21** (bọc `pm.test`), **Q25** (secret trong CI).
3. **Viết tay** code của Q20 và Bài 5 một lần — không copy — để lúc live coding không bị trắng đầu.
4. Chuẩn bị **2 câu chuyện**: một bug bạn tự hào, một lần bất đồng với dev. Mỗi câu 60–90 giây, có kết quả cụ thể.
5. Soạn 4 câu hỏi lại interviewer, viết ra giấy mang theo.

**Ba nguyên tắc khi trả lời:**

- **Dứt khoát trước, chi tiết sau.** "401 là chưa xác thực, 403 là không có quyền" rồi mới giải thích. Đừng vừa nghĩ vừa nói.
- **Mọi câu "bạn test gì" → trả lời theo nhóm**, không liệt kê rời rạc. Nhóm thể hiện bạn có hệ thống; danh sách dài thể hiện bạn nhớ được nhiều.
- **Không biết thì nói không biết** — kèm cách bạn sẽ tiếp cận: "Em chưa làm cái này. Nếu gặp, em sẽ bắt đầu từ ... vì ...". Interviewer mid-level kỳ vọng bạn có lỗ hổng; họ chỉ không chấp nhận bạn đoán bừa rồi nói như thật.
- Và xuyên suốt: **luôn nhắc tới side effect** (DB, event, queue, email). Đó là thứ tách tester giỏi khỏi người chỉ check status code.
