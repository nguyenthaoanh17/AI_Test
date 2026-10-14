# Bộ câu hỏi phỏng vấn: dùng AI dựng test automation (Playwright)

> Dành cho tester mô tả quy trình: **tự viết test case → Claude sinh script Playwright → chạy → report pass/fail → log bug → dev fix → chạy lại verify → đóng task**, kèm **bộ regression tự động chạy 08h30 và 15h30 hàng ngày** (61 test, có notification báo kết quả).
>
> Góc nhìn **người phỏng vấn**: mỗi câu kèm *mục đích hỏi*, *trả lời tốt*, *cờ đỏ*.
> File song hành: [`api-tester-interview-questions.md`](./api-tester-interview-questions.md)

**Mục lục**

1. [Interviewer đọc quy trình này thấy gì](#1-interviewer-đọc-quy-trình-này-thấy-gì)
2. [Hỏi về quy trình tổng thể](#2-hỏi-về-quy-trình-tổng-thể)
3. [Test case — phần mạnh của bạn](#3-test-case--phần-mạnh-của-bạn)
4. [AI sinh code — phần khó nhất](#4-ai-sinh-code--phần-khó-nhất)
5. [Playwright kỹ thuật](#5-playwright-kỹ-thuật)
6. [Đọc code tại chỗ (bài luyện quan trọng nhất)](#6-đọc-code-tại-chỗ-bài-luyện-quan-trọng-nhất)
7. [Regression & lịch chạy](#7-regression--lịch-chạy)
8. [Vòng đời bug](#8-vòng-đời-bug)
9. [Rủi ro & tính bền](#9-rủi-ro--tính-bền)
10. [Cách trả lời câu nhạy cảm nhất](#10-cách-trả-lời-câu-nhạy-cảm-nhất)
11. [Checklist chuẩn bị](#11-checklist-chuẩn-bị-theo-thứ-tự-ưu-tiên)

---

## 1. Interviewer đọc quy trình này thấy gì

### Điểm mạnh — chủ động kể ra, đừng chờ được hỏi

| Điểm mạnh | Vì sao nó có giá trị với interviewer |
|---|---|
| Vẫn **tự viết và review test case** trước khi sinh code | Phần tư duy QA là của bạn, AI chỉ làm phần gõ. Tách bạn khỏi người "nhờ AI làm hộ cả bài". |
| Có **vòng khép kín**: run → report → bug → dev fix → **re-run verify** → đóng task | Rất nhiều tester 2 năm không có bước verify tự động. |
| Có **regression tự động 2 lần/ngày** + notification | Nhiều công ty còn chưa làm được điều này. |

### Điểm yếu — họ chắc chắn đâm vào

- Câu **"không tự viết script được, 100% Claude viết"**. Họ sẽ hỏi: *test fail vì lỗi của chính test thì bạn làm gì?* và ngầm hỏi: *chúng tôi tuyển bạn hay tuyển Claude?*
- Trong report: **SKIP 4/61** và **LỖI ĐÃ BIẾT 1**. Họ sẽ hỏi 4 test skip từ bao giờ và bao giờ bật lại.
- Regression chạy trên **máy cá nhân** (notification hiện trên desktop) → "máy tắt thì sao, bạn nghỉ phép thì sao?"

---

## 2. Hỏi về quy trình tổng thể

### Q1. Dẫn mình đi qua quy trình từ lúc nhận task tới lúc đóng task. Mỗi bước mất bao lâu?
- **Đo:** bạn vận hành thật hay chỉ mô tả lý thuyết.
- **Tốt:** có con số cụ thể — "1 task ~30 case: viết case 2 tiếng, sinh script 30 phút, review + sửa 1 tiếng, chạy 5 phút."
- **Cờ đỏ:** không ước lượng được bước nào.

### Q2. Trước khi có quy trình này bạn làm thế nào? Nó tiết kiệm bao nhiêu?
- **Tốt:** so sánh có số — "trước viết tay 60 case mất 3 ngày, giờ 1 ngày."
- **Cờ đỏ:** "nhanh hơn nhiều" mà không có con số nào.

### Q3. Ai trong team dùng quy trình này? Bạn tự nghĩ ra hay team đã có sẵn?
- Nếu **bạn tự dựng** → điểm cộng rất lớn, phải nói rõ. Kể cả việc bạn thuyết phục team/lead thế nào.

### Q4. Quy trình này đã hỏng ở bước nào chưa? Bạn sửa ra sao?
- **Đo:** bạn có thật sự chạy nó đủ lâu để gặp sự cố không.

### Q5. Bạn đo hiệu quả của quy trình bằng chỉ số gì?
- **Tốt:** số bug thật bắt được, bug lọt production, thời gian từ fix tới verify, tỷ lệ flaky — **không phải** số lượng test.

---

## 3. Test case — phần mạnh của bạn

### Q6. Bạn viết test case trước rồi mới sinh script — tại sao không để AI sinh luôn test case?
> **Câu này bạn PHẢI trả lời tốt.**
- **Tốt:** AI không biết nghiệp vụ, không biết rủi ro thật nằm ở đâu, dễ sinh case thừa và bỏ sót edge case quan trọng. Test case là nơi quyết định **chất lượng của việc test**; script chỉ là cách thực thi.

### Q7. "Review lại xong chốt bộ cuối" — bạn review theo tiêu chí gì?
- **Tốt:** đủ nhóm (happy path / validate / edge / negative / permission), không trùng lặp, mỗi case có expected result kiểm chứng được, có ưu tiên P1/P2/P3.

### Q8. Một task thường ra bao nhiêu case? Làm sao biết là đủ?
- **Tốt:** bám acceptance criteria + đánh giá rủi ro, không phải "càng nhiều càng tốt". Nói được cách bạn **cắt** case thừa cũng quan trọng như cách bạn thêm case.

### Q9. Test case lưu ở đâu? Có trace được requirement → case → script → bug không?
- **Đo:** tư duy traceability. Nếu repo có thư mục `testcases/` thì mô tả cấu trúc và cách bạn đánh ID.

### Q10. Requirement đổi — bạn sửa test case trước hay script trước?
- **Tốt:** case trước (vì case là nguồn sự thật), rồi mới cập nhật script theo.

---

## 4. AI sinh code — phần khó nhất

### Q11. Claude viết 100% script. Vậy bạn kiểm tra code nó viết bằng cách nào?
> **Câu quyết định buổi phỏng vấn.**
- **Trả lời sai:** "em chạy thấy pass là được."
- **Trả lời tốt:**
  1. Đọc lại từng test xem **assertion có đúng cái mình muốn kiểm** không.
  2. **Cố tình làm nó fail** (sửa data sai, tắt API, đổi expected) để chắc test thật sự bắt được lỗi.
  3. Kiểm tra selector có ổn định không, có hardcode gì không.
  4. Kiểm tra test có tự tạo và tự dọn data không.

### Q12. AI viết một test luôn pass nhưng thực ra không assert gì có ý nghĩa. Bạn phát hiện bằng cách nào?
- **False pass nguy hiểm hơn fail** — nó cho cảm giác an toàn giả.
- **Cách phát hiện:** chạy test trên một build **đã biết là lỗi**; nếu vẫn pass thì test vô dụng. Hoặc review assertion thủ công.
- *Điểm cộng:* nhắc được khái niệm **mutation testing**.

### Q13. Test fail — làm sao biết đó là bug sản phẩm hay bug script?
- **Tốt:** phân loại theo kiểu lỗi — `assertion failed` → nghi bug sản phẩm; `timeout` / `selector not found` → nghi bug script. Mở trace/video/screenshot. Làm lại tay trên UI. Chạy lại vài lần xem có ổn định không.
- **Nhắc `npx playwright show-trace` ở đây ghi điểm rất mạnh** — chứng tỏ bạn biết debug chứ không chỉ biết chạy.

### Q14. Script fail vì lỗi script, Claude sửa 3 lần không được. Bạn làm gì?
- **Đo:** bạn có bị kẹt cứng không.
- **Tốt:** đọc trace xác định đúng dòng lỗi → tự sửa selector/wait ở mức làm được → nếu vẫn kẹt thì đổi cách tiếp cận (dùng API setup data thay vì đi qua UI) hoặc nhờ dev.

### Q15. Bạn đọc hiểu code Playwright Claude viết tới mức nào?
> **Đừng nói dối** — họ sẽ test ngay ở [phần 6](#6-đọc-code-tại-chỗ-bài-luyện-quan-trọng-nhất).
- **Tốt:** nói thật kèm lộ trình — "em đọc hiểu và sửa được selector, assertion, wait, fixture; phần em còn yếu là tự viết từ đầu helper phức tạp và cấu hình nâng cao — em đang học thêm."

### Q16. Nếu công ty cấm dùng AI tool, bạn làm việc thế nào?
- **Đo:** mức độ phụ thuộc.
- **Tốt:** chậm hơn nhưng vẫn làm được — viết dựa trên test có sẵn làm mẫu; và nhấn mạnh **tư duy test case không phụ thuộc tool**.

### Q17. Code AI sinh ra có qua code review của dev hoặc QA lead không?
- **Tốt:** có PR, có người review. Nếu chưa có → thừa nhận và nói đó là thứ bạn muốn thiết lập.

### Q18. Bạn có gửi code nội bộ hoặc dữ liệu thật của công ty cho AI không? Công ty có policy gì?
> Rất nhiều công ty hỏi câu này. **Đo ý thức bảo mật.**
- **Tốt:** chỉ gửi test case và cấu trúc, **không gửi credential, không gửi dữ liệu khách hàng thật**, dùng data giả; biết công ty có policy gì về AI tool.

---

## 5. Playwright kỹ thuật

> Họ dùng phần này để kiểm chứng câu trả lời ở Q15. Mở chính repo của bạn ra đọc trước.

### Q19. Trong `playwright.config.ts` bạn chỉnh những gì? Vì sao?
- Mong đợi: `baseURL`, `timeout`, `expect.timeout`, `retries`, `workers`, `projects` (browser/môi trường), `use.trace` / `screenshot` / `video`, `reporter`, `globalSetup` / `globalTeardown`.

### Q20. `globalSetup` bạn dùng làm gì?
- Repo có `globalSetup.ts` + `user.json` + `.auth-profile/` → gần như chắc chắn là **đăng nhập một lần rồi lưu `storageState`**.
- **Phải giải thích được:** tại sao (nhanh hơn, ít flaky hơn, không spam login) và **rủi ro** (state hết hạn, nhiều test dùng chung một user dễ đụng data).

### Q21. Phân biệt `page.locator()` và `page.$()`. Auto-waiting là gì?
- **Tốt:** locator là *lazy* — chỉ resolve khi dùng, và **tự chờ** element actionable (visible, enabled, stable) nên hầu như không cần chờ thủ công. `page.$()` trả element ngay tại thời điểm gọi, dễ stale.

### Q22. Tại sao `page.waitForTimeout(3000)` là code tệ? Thay bằng gì?
- **Tốt:** chờ cứng → vừa chậm vừa vẫn flaky (máy chậm hơn là fail). Thay bằng web-first assertion có auto-retry:

```typescript
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
await page.waitForResponse(res => res.url().includes('/api/orders') && res.ok());
await page.waitForURL('**/dashboard');
```

### Q23. Selector bạn hay dùng? Vì sao không dùng XPath dài?
- **Tốt:** ưu tiên `getByRole`, `getByLabel`, `getByText`, `getByTestId`. XPath bám cấu trúc DOM → vỡ ngay khi dev đổi layout.
- **Nếu bạn từng xin dev thêm `data-testid` → kể ra**, đây là điểm cộng lớn: cho thấy bạn hợp tác với dev để sản phẩm dễ test hơn.

### Q24. `test.describe.serial`, `beforeEach`, fixture — dùng khi nào?
- Repo có `tests/fixtures.ts` → nên giải thích được fixture bạn tự định nghĩa là gì, truyền gì vào test, và vì sao dùng fixture thay vì `beforeEach`.

### Q25. Chạy song song (`workers`) gây đụng data. Xử lý sao?
- **Tốt:** mỗi test tự tạo data riêng (prefix/uuid); tách user theo worker (`testInfo.parallelIndex`); nhóm test phụ thuộc nhau thì `describe.serial`.

### Q26. `retries` đặt bao nhiêu? Retry có che bug không?
- **Tốt:** retry giảm nhiễu nhưng **che mất flaky thật**. Thường `retries: 1` ở CI, `0` ở local, và **theo dõi test nào hay phải retry để sửa tận gốc** thay vì để đó.

### Q27. Trace / video / screenshot bạn bật ở chế độ nào?
- **Tốt:** `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` — đủ thông tin debug mà không phình dung lượng.

---

## 6. Đọc code tại chỗ (bài luyện quan trọng nhất)

> Họ sẽ đưa một đoạn code và hỏi "đoạn này có vấn đề gì". **Luyện kỹ phần này thì câu "em không tự viết được script" gần như vô hại.**

### Bài 1 — tìm lỗi

```typescript
test('login', async ({ page }) => {
  await page.goto('http://staging.abc.com/login');
  await page.fill('#user', 'admin');
  await page.fill('#pass', '123456');
  await page.click('button');
  await page.waitForTimeout(5000);
  expect(true).toBe(true);
});
```

**Phải chỉ ra được:**

1. **`expect(true).toBe(true)` — không assert gì cả, test luôn pass.** Lỗi nặng nhất, và đúng kiểu AI hay sinh ra.
2. URL hardcode → phải dùng `baseURL` trong config, `page.goto('/login')`.
3. Credential hardcode trong code → đưa ra env / `.env`, không commit.
4. `waitForTimeout(5000)` → chờ cứng, thay bằng assertion có auto-retry.
5. `page.click('button')` → selector mơ hồ, trang thường có nhiều button.
6. Thiếu negative case: sai mật khẩu, tài khoản bị khoá, để trống.
7. Tên test `'login'` quá chung — không biết nó verify điều gì.

**Bản sửa:**

```typescript
test('đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill(process.env.TEST_USER!);
  await page.getByLabel('Mật khẩu').fill(process.env.TEST_PASS!);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Trang chủ' })).toBeVisible();
});
```

### Bài 2 — tìm lỗi

```typescript
test('tạo đơn hàng', async ({ page }) => {
  await page.goto('/orders/new');
  await page.getByTestId('customer').fill('Nguyen Van A');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('Thành công')).toBeVisible();
});
```

**Vấn đề:**
1. Không kiểm tra **side effect** — đơn có thật sự được tạo không, hay chỉ hiện toast?
2. Data hardcode `'Nguyen Van A'` → chạy nhiều lần sinh rác, chạy song song dễ đụng.
3. **Không cleanup** — đơn tạo ra tồn tại mãi trên môi trường test.
4. `getByText('Thành công')` quá rộng, dễ khớp nhầm.
5. Không có negative case: thiếu field bắt buộc, khách hàng không tồn tại.

### Bài 3 — câu hỏi mở
"Nhìn một test file bất kỳ trong bộ của bạn — nếu phải xoá 1/3 số test, bạn xoá test nào và giữ test nào? Vì sao?"
→ Đo khả năng đánh giá **giá trị thực** của từng test, không phải giữ hết vì sợ.

---

## 7. Regression & lịch chạy

> Report mẫu: **"Quick Regression — KHÔNG ĐẠT — PASS 55, FAIL 1, LỖI ĐÃ BIẾT 1, SKIP 4 / 61"**

### Q28. Bộ 61 test chạy ở đâu — máy bạn, server, hay CI?
- Nếu **máy cá nhân**: họ sẽ hỏi ngay "máy tắt thì sao? bạn nghỉ phép thì sao? người khác xem kết quả kiểu gì?"
- **Tốt:** thừa nhận hạn chế + nói hướng — chuyển lên GitHub Actions / server dùng chung, report lưu tập trung.

### Q29. Tại sao 2 lần/ngày mà không phải mỗi lần deploy hoặc mỗi PR?
- **Tốt:** hiện chạy theo lịch cố định; hướng tốt hơn là **trigger theo deploy** để biết chính xác commit nào làm vỡ, thay vì phải lần mò trong nửa ngày thay đổi.

### Q30. Ai nhận notification này? Nhận xong ai làm gì?
> **Đo: báo cáo có người đọc không, hay chỉ bắn vào hư không.** Rất nhiều hệ thống automation chết ở đúng chỗ này.
- **Tốt:** có người triage trong X phút, có quy định rõ fail thì làm gì, có nơi lưu lịch sử kết quả.

### Q31. "LỖI ĐÃ BIẾT 1" — bạn quản lý known issue thế nào? Nó tồn tại bao lâu rồi?
- **Tốt:** mỗi known issue gắn link bug ticket, có ngày dự kiến fix, review định kỳ. Không để known issue thành vĩnh viễn — vì nó dần làm mọi người quen với màu đỏ.

### Q32. "SKIP 4" — skip từ bao giờ, vì sao, bao giờ bật lại?
> **Câu bẫy.** Test skip lâu ngày = **nợ kỹ thuật ẩn**: bạn tưởng mình có coverage mà thực ra không.
- **Tốt:** ghi lý do ngay trong code và review hàng tuần:

```typescript
test.skip(true, 'Chờ API /payments lên staging — BUG-123, dự kiến 20/10');
```

### Q33. Tiêu chí "ĐẠT / KHÔNG ĐẠT" do ai định nghĩa? Fail 1 test có chặn release không?
- **Tốt:** tiêu chí thống nhất với team, phân theo severity — fail test P1 thì chặn, fail test P3 thì ghi nhận.

### Q34. Bộ này chạy mất bao lâu? Nếu lên 500 test thì sao?
- **Tốt:** chia smoke / regression, gắn tag (`@smoke`, `@critical`), chạy song song, chạy theo module bị ảnh hưởng, shard trên CI.

### Q35. Bộ regression đã bắt được bug thật nào chưa? Kể một cái.
> **Câu chứng minh toàn bộ quy trình có giá trị hay không. Chuẩn bị sẵn 1 ví dụ cụ thể.**
- Nếu chưa bắt được gì → cả quy trình chỉ là trang trí, và họ sẽ nhận ra ngay.

### Q36. Có bug nào lọt production mà regression lẽ ra phải bắt được không? Sau đó bạn làm gì?
- **Tốt:** thêm test cho đúng case đó (regression test cho bug) — phản xạ của tester tốt. Và truy vì sao bộ test không phủ được chỗ đó.

---

## 8. Vòng đời bug

### Q37. Report pass/fail của bạn trông thế nào? Dev tự đọc được không?
- **Tốt:** Playwright HTML report + trace; đính kèm trace/video vào bug → dev fix nhanh hơn hẳn, đỡ cảnh "anh không reproduce được".

### Q38. Từ fail → chốt thành bug, bạn làm gì ở giữa?
- **Tốt:** reproduce lại tay để chắc chắn không phải lỗi script → thu hẹp điều kiện tái hiện → kiểm tra đã có bug trùng chưa → xác định severity → viết step rõ ràng kèm bằng chứng.

### Q39. Dev báo fix xong, bạn chạy lại verify — chỉ chạy test đó hay cả bộ?
- **Tốt:** chạy test đó **+ các test liên quan quanh vùng ảnh hưởng**, vì fix hay làm vỡ chỗ khác. Cuối ngày để bộ full regression chạy.

### Q40. "Cứ làm thế cho tới khi hết bug" — thực tế có task nào không bao giờ hết bug không? Lúc đó quyết định thế nào?
- **Tốt:** phân loại severity; bug nhỏ có thể chấp nhận và đưa vào backlog; quyết định release thuộc về PO/QA lead dựa trên rủi ro — **không phải "zero bug mới được release"**.

---

## 9. Rủi ro & tính bền

### Q41. Nếu mai bạn nghỉ, ai maintain được bộ test này?
- **Tốt:** code trong Git, có README, naming rõ ràng, người khác đọc và chạy được. Chưa có thì thừa nhận và coi là việc sắp làm.

### Q42. UI thay đổi lớn, 30 test vỡ. Bạn bảo Claude sinh lại từ đầu hay sửa?
- **Tốt:** nếu có **Page Object Model** / locator ổn định thì chỉ sửa một chỗ. Sinh lại từ đầu mỗi lần đổi UI là dấu hiệu kiến trúc test kém.
- Nếu bạn **chưa dùng POM**, hãy nói thẳng: *"hiện bộ test của em viết phẳng, em đang thấy đau ở chỗ phải sửa selector nhiều nơi — em muốn refactor sang POM."*
  → **Tự chỉ ra điểm yếu của mình kèm hướng khắc phục luôn gây ấn tượng tốt.**

### Q43. Bạn đo chất lượng bộ test bằng gì — số test, pass rate, hay cái khác?
- **Tốt:** số test và pass rate dễ gây ảo tưởng. Đáng tin hơn: **số bug thật bắt được**, số bug lọt production, tỷ lệ flaky, thời gian chạy, thời gian từ fail tới khi có người xử lý.

### Q44. Quy trình này có nhược điểm gì? Nếu làm lại, bạn đổi gì?
> Câu gần cuối buổi, rất hay được hỏi. **Chuẩn bị sẵn 2–3 ý thật:**
- Chuyển từ máy cá nhân lên CI.
- Thêm Page Object Model.
- Xử lý dứt điểm 4 test skip.
- Thêm API test để setup data thay vì đi vòng qua UI (nhanh và ổn định hơn nhiều).
- Trigger theo deploy thay vì theo giờ cố định.

---

## 10. Cách trả lời câu nhạy cảm nhất

Khi họ hỏi *"bạn không tự viết được script, vậy giá trị của bạn là gì?"* — đừng chống chế, cũng đừng tự hạ thấp:

> "Phần quyết định chất lượng của việc test là **test case** — biết cần kiểm gì, rủi ro nằm ở đâu, edge case nào dễ vỡ. Phần đó em tự làm và tự chịu trách nhiệm. AI giúp em phần gõ code, nhưng code nó sinh ra em phải review, phải **cố tình làm fail** để chắc chắn test có giá trị, và khi fail em phải đọc trace để phân biệt bug sản phẩm với bug script. Hiện em đọc và sửa được code; cái em còn yếu là tự viết từ đầu phần phức tạp, và đó là thứ em đang học. Kết quả cụ thể là bộ regression 61 test chạy 2 lần/ngày, đã bắt được [bug cụ thể]."

**Ba thứ bắt buộc phải có trong câu trả lời đó:**

1. **Thừa nhận thật** — đừng phóng đại năng lực, họ sẽ test ngay sau đó.
2. **Chứng minh bạn kiểm soát được output của AI** — review, làm fail có chủ đích, đọc trace.
3. **Một kết quả cụ thể** — con số, một bug thật.

---

## 11. Checklist chuẩn bị theo thứ tự ưu tiên

- [ ] **Luyện đọc code Playwright và chỉ ra lỗi** ([phần 6](#6-đọc-code-tại-chỗ-bài-luyện-quan-trọng-nhất)) — quan trọng nhất, bù trực tiếp cho điểm yếu lớn nhất
- [ ] Chuẩn bị **1 bug thật mà regression đã bắt được**, kể được chi tiết — [Q35](#q35-bộ-regression-đã-bắt-được-bug-thật-nào-chưa-kể-một-cái)
- [ ] Trả lời được **4 test skip là gì, vì sao, bao giờ bật lại** — [Q32](#q32-skip-4--skip-từ-bao-giờ-vì-sao-bao-giờ-bật-lại)
- [ ] Mở `playwright.config.ts`, `globalSetup.ts`, `tests/fixtures.ts` của chính mình ra đọc kỹ — họ sẽ hỏi đúng các file này
- [ ] Dùng thật `npx playwright show-trace` vài lần trước buổi phỏng vấn
- [ ] Chuẩn bị câu trả lời về **policy bảo mật khi dùng AI** — [Q18](#q18-bạn-có-gửi-code-nội-bộ-hoặc-dữ-liệu-thật-của-công-ty-cho-ai-không-công-ty-có-policy-gì)
- [ ] Biết **Page Object Model** là gì, kể cả khi chưa dùng — [Q42](#q42-ui-thay-đổi-lớn-30-test-vỡ-bạn-bảo-claude-sinh-lại-từ-đầu-hay-sửa)
- [ ] Chuẩn bị **2–3 nhược điểm thật của quy trình** kèm hướng cải thiện — [Q44](#q44-quy-trình-này-có-nhược-điểm-gì-nếu-làm-lại-bạn-đổi-gì)
- [ ] Có sẵn **con số**: bao nhiêu test, bao lâu một task, tiết kiệm bao nhiêu thời gian

### Nguyên tắc xuyên suốt khi trả lời

- **Trung thực về mức độ dùng AI.** Nói dối ở đây rất dễ lộ và mất điểm nặng hơn nhiều so với việc thừa nhận.
- Mỗi lần nói về AI, **gắn liền với cách bạn kiểm soát nó** — đừng để câu nào dừng ở "AI làm hộ em".
- Luôn quay về **kết quả**: bug bắt được, thời gian tiết kiệm, bug không lọt production.
- Chủ động nêu **điểm yếu + hướng khắc phục** trước khi họ moi ra. Người phỏng vấn đánh giá rất cao điều này.
