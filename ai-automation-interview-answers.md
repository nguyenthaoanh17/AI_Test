# Đáp án mẫu — Phỏng vấn "dùng AI dựng test automation"

> Đi kèm [ai-automation-interview-questions.md](./ai-automation-interview-questions.md). File kia là góc nhìn **interviewer**; file này là **câu trả lời để nói ra miệng**.
>
> Đáp án dưới đây **gắn với repo thật của bạn** (`playwright.config.ts`, `globalSetup.ts`, `tests/fixtures.ts`, `tests/app-helpers.ts`, `testcases/FeedNexa_AI_Testcase_revised.csv`) — vì interviewer sẽ hỏi đúng mấy file này, và trả lời chung chung là lộ ngay.
> Chỗ `[...]` là bạn **phải** điền số/sự thật của mình.

---

## ⚠️ Đọc trước: 4 chỗ cần sửa trước khi đi phỏng vấn

Mình đối chiếu repo với con số trong file câu hỏi, có mấy chỗ lệch. Interviewer giỏi sẽ xin xem repo hoặc hỏi lại con số — nên chốt lại cho khớp:

| Bạn nói | Repo thật | Việc cần làm |
|---|---|---|
| "61 test, SKIP 4" | **49 test khai báo** = 44 active + **5 `test.skip`** (tất cả trong `install-app.spec.ts`: IA_00, IA_02, IA_03, IA_05, IA_08) | Đếm lại rồi dùng **một** con số duy nhất xuyên suốt. Nếu 61 là con số ở thời điểm khác thì nói rõ mốc thời gian. |
| "SKIP 4 có lý do" | 5 `test.skip(...)` **không có string lý do nào** | Thêm lý do + mã ticket vào từng cái (xem [Q32](#q32-skip--skip-từ-bao-giờ-vì-sao-bao-giờ-bật-lại)). Đây là việc 10 phút, và nó biến một câu bẫy thành câu ăn điểm. |
| Ưu tiên P1/P2/P3 | **47 test `[P0]`, 2 test `[P1]`** | 96% là P0 thì tức là chưa phân loại. Chuẩn bị câu trả lời thật cho [Q33](#q33-tiêu-chí-đạt--không-đạt-do-ai-định-nghĩa-fail-1-test-có-chặn-release-không). |
| — | `tests/app-helpers.ts` có helper (`appFrame`, `autoInstall`, `ensureFreshInstall`…) nhưng **chưa phải POM** | Dùng đúng từ: "em có **lớp helper dùng chung**, chưa phải Page Object Model". Nói "em có POM" rồi họ mở file ra là mất điểm nặng ([Q42](#q42-ui-thay-đổi-lớn-30-test-vỡ-bạn-bảo-claude-sinh-lại-từ-đầu-hay-sửa)). |

**Ba thứ trong repo là điểm mạnh thật, nhớ chủ động kể:**
1. **Traceability có thật:** mã case trong CSV (`IA_/CF_/CG_`) trùng tiền tố tên test → `CF_04b [P0] Step 2: ...`. Rất ít tester 2 năm làm được chuyện này.
2. **`.gitignore` loại `user.json`, `.auth-profile/`, `.env`** → session và credential không bao giờ lên Git. Đây là đạn cho câu bảo mật.
3. **Tự xử lý trace cho context attach qua CDP** trong `fixtures.ts` — chỗ này kỹ thuật thật, xem [Q27](#q27-trace--video--screenshot-bạn-bật-ở-chế-độ-nào).

---

### Nguyên tắc của cả file: chỉ nói tới mức bạn tự bảo vệ được

Bạn **không tự viết code**, nên mọi đáp án kỹ thuật trong file này được viết ở đúng mức sau — và bạn nên giữ đúng mức đó khi nói:

| Nói được | Không nói |
|---|---|
| **Phần này để làm gì**, và nếu bỏ đi thì chuyện gì xảy ra | Tên hàm, tên option, cú pháp |
| **Em gặp vấn đề gì nên nó phải có ở đó** | Giải thích cơ chế bên trong của Playwright |
| **Em phát hiện ra lỗi bằng cách nào** (report, ảnh, trace, làm lại tay) | "Em viết đoạn này" khi không phải |
| **Em kiểm chứng ra sao** (tái hiện lại lỗi cũ, cố tình làm fail) | Khẳng định chắc về thứ chưa dùng thật |

Và câu thoát khi bị đào sâu hơn mức đó — dùng thật, đừng cố gồng:

> *"Phần code đó do AI viết, em không thuộc cú pháp — em phải mở file ra xem lại. Nhưng tại sao nó phải có ở đó thì em biết, vì em là người gặp vấn đề đó và là người kiểm chứng là nó đã hết."*

Câu này **không làm bạn mất điểm**, vì nó khớp với những gì bạn đã nói ở [Q11](#q11-claude-viết-100-script-bạn-kiểm-tra-code-nó-viết-bằng-cách-nào) và [Q15](#q15-bạn-đọc-hiểu-code-playwright-tới-mức-nào). Thứ làm mất điểm là **nói sai tên hàm hoặc giải thích sai cơ chế** — lúc đó họ biết bạn đang nhắc lại cái người khác viết, và mọi câu trước đó cũng bị nghi theo.

---

## 2. Quy trình tổng thể

### Q1. Dẫn mình đi qua quy trình từ nhận task tới đóng task. Mỗi bước mất bao lâu?

**Phải có số. Điền số thật của bạn vào khung này:**

> "Em đi qua 6 bước.
> **1. Đọc requirement và viết test case** — `[2–3 tiếng cho một task ~20 case]`. Em viết vào file Excel/CSV, mỗi case có mã riêng kiểu `CF_04b`, mô tả, step, expected result và priority.
> **2. Review lại bộ case** — `[30 phút]`, cắt case trùng, bổ sung edge case. Bước này em tự làm, không nhờ AI.
> **3. Sinh script bằng Claude** — `[20–30 phút]`. Em đưa test case đã chốt kèm cấu trúc project và quy ước sẵn có, nó sinh file spec theo đúng mã case.
> **4. Review và sửa script** — `[1 tiếng]`. Đây là bước tốn thời gian thật, không phải bước 3.
> **5. Chạy và debug** — `[10–20 phút]` nếu suôn, lâu hơn nếu selector lệch.
> **6. Fail thì log bug → dev fix → chạy lại verify → đóng task.**
> Tổng một task cỡ `[20 case]` của em khoảng `[nửa ngày tới 1 ngày]`."

**Chốt bằng một câu lộ ra bạn vận hành thật:**
> "Điều em thấy ngược với kỳ vọng ban đầu là bước sinh code nhanh nhất, còn **bước review code AI lại lâu gấp đôi** — vì nó hay viết assertion yếu hoặc selector bám layout."

### Q2. Trước khi có quy trình này bạn làm thế nào? Tiết kiệm bao nhiêu?

> "Trước đó em `[test tay toàn bộ: mỗi lần app có bản mới là click lại từ đầu luồng install → create feed → sync, mất khoảng 2–3 tiếng mỗi lần và không ai làm được ngoài em]`.
> Giờ bộ `[44]` test chạy tự động hết `[X phút]`, và chạy được `[2 lần/ngày]` thay vì `[1–2 lần/tuần khi em có thời gian]`.
> Con số em thấy rõ nhất không phải thời gian viết, mà là **tần suất kiểm thử**: từ `[2 lần/tuần]` lên `[10 lần/tuần]` — nghĩa là bug bị phát hiện trong vòng `[nửa ngày]` thay vì `[vài ngày]`."

> `[Phải đo con số "[X phút]" này trước khi phỏng vấn — chạy `npx playwright test` và xem thời gian thật.]`

### Q3. Ai dùng quy trình này? Bạn tự nghĩ ra hay team có sẵn?

**Nếu bạn tự dựng — nói rõ, đây là điểm cộng lớn nhất trong cả buổi:**
> "Em tự dựng. `[Team em trước đó không có automation cho app này, chỉ test tay.]` Em bắt đầu từ `[một luồng install app]`, làm xong cho thấy nó bắt được lỗi thật, rồi mới mở rộng ra `[create feed Facebook và GMC]`.
> `[Em thuyết phục lead bằng cách chạy demo bộ smoke ngay trong buổi họp sprint, chỉ ra nó mất 5 phút cho việc em làm tay 2 tiếng.]`
> Hiện `[chỉ em dùng / em và một bạn nữa]`. Em biết đó là rủi ro — xem câu về 'nếu mai bạn nghỉ'."

**Nếu team có sẵn:** nói rõ bạn kế thừa phần nào và **tự thêm phần nào** — đừng nhận hết.

### Q4. Quy trình này đã hỏng ở bước nào chưa? Sửa ra sao?

> **Quan trọng: câu này hỏi về QUY TRÌNH, không phải về code.** Bạn không cần biết code để trả lời tốt — thậm chí trả lời bằng code là trả lời sai trọng tâm.
> Interviewer muốn nghe 4 thứ: **bạn có phát hiện ra không → có khoanh được vùng không → có làm gì để nó không lặp lại → ai làm phần sửa**. Ba cái đầu là của bạn. Cái thứ tư cứ nói thật.

**Nói:**
> "Có, hỏng mấy lần, và đáng kể nhất là ba lần này.
>
> **Một, cả bộ test đỏ mà không phải lỗi sản phẩm.**
> Một buổi `[sáng]`, report ra `[gần như toàn bộ]` test fail. Em mở report xem thì thấy chúng **fail hết ở cùng một bước đầu tiên** — bước mở app lên. Mà nếu sản phẩm lỗi thật thì không thể lỗi đồng loạt kiểu đó, nên em biết ngay là lỗi ở môi trường chạy, không phải ở app.
> Em mở app bằng tay thì thấy `[Chrome hiện popup hỏi 'Restore pages?' và test bị kẹt ở đó]` — nguyên nhân là `[lần chạy trước Chrome bị tắt đột ngột nên lần sau nó không mở sạch được]`.
> Em `[mô tả lại hiện tượng và đưa log cho Claude để sửa phần dọn trạng thái trước khi chạy]`. Và phần việc của em là **kiểm chứng**: em cố tình tái hiện lại đúng tình huống cũ — `[tắt Chrome giữa lúc đang chạy]` — rồi chạy lại để chắc là nó không còn xảy ra. Em không coi là xong chỉ vì lần chạy sau xanh.
>
> **Hai, session đăng nhập hết hạn.**
> Bộ test của em dùng một phiên đăng nhập Shopify có sẵn. Khi nó hết hạn thì cả bộ đỏ, mà thông báo lỗi lại rất khó hiểu — nhìn vào tưởng app lỗi.
> Em thấy vấn đề thật không phải là session hết hạn, vì cái đó tất nhiên sẽ xảy ra; vấn đề là **mất thời gian để nhận ra nguyên nhân**. Nên em đề xuất thêm một bước kiểm tra phiên đăng nhập **chạy trước tất cả test**: nếu phiên hỏng thì dừng ngay và báo rõ 'hãy chạy lại bước đăng nhập', thay vì để `[44]` test fail rồi em phải đi dò.
> Giờ gặp lại tình huống đó em xử lý trong `[2 phút]` thay vì `[nửa tiếng]`.
>
> **Ba, đổi máy thì bộ test chạy không được.**
> `[Em chuyển từ Windows sang Linux thì bộ test không chạy — nó không tìm thấy trình duyệt, và sau khi chạy xong thì có tiến trình còn sót lại.]`
> Em khoanh được vùng là `[code viết cho Windows nên sang Linux không dùng được]`, `[nhờ Claude sửa phần đó]`, rồi chạy lại cả bộ để xác nhận.
> Bài học em rút ra không phải về code mà về quy trình: bộ test của em **phụ thuộc vào máy của em** nhiều hơn em tưởng — và đó là một trong những nhược điểm em muốn sửa."

**Chốt lại — câu này mới là câu ăn điểm, nói đừng bỏ:**
> "Điểm chung của cả ba lần là: **cái hỏng không phải sản phẩm, mà là môi trường chạy test.** Nên thứ em học được là phải phân biệt 'test đỏ' với 'sản phẩm lỗi' trước khi làm gì khác — và phải làm cho chính bộ test **báo lỗi dễ hiểu** khi nó tự hỏng. Trước đây gặp đỏ hàng loạt là em mất `[nửa tiếng]` mới biết chuyện gì; giờ `[nhìn report là biết nó hỏng ở bước môi trường hay bước nghiệp vụ]`."

### Nếu họ đào sâu vào phần code — cách trả lời an toàn

Họ có thể hỏi *"cụ thể sửa thế nào?"*. **Đừng cố nói chi tiết kỹ thuật bạn không nắm.** Mẫu câu:

> "Nguyên nhân là `[Chrome để lại file khoá của lần chạy trước nên lần sau không mở sạch được]`, và cách sửa là `[dọn mấy file đó trước khi khởi động]`. Chi tiết code thì em phải mở file ra xem lại, em không thuộc — phần đó em nhờ AI viết, em là người tái hiện lỗi và kiểm chứng là nó đã hết."

Ba lý do câu này **an toàn hơn** việc kể tên file:
1. Nói sai tên file/hàm còn tệ hơn nói "em không thuộc" — vì nó chứng minh bạn đang nhắc lại cái người khác viết mà không hiểu.
2. Nó nhất quán với câu [Q15](#q15-bạn-đọc-hiểu-code-playwright-tới-mức-nào) và [Q11](#q11-claude-viết-100-script-bạn-kiểm-tra-code-nó-viết-bằng-cách-nào). Bạn đã nói "em đọc sửa được selector/assertion, phần cấu hình sâu thì còn yếu" — nên *không nhớ chi tiết phần đó là hợp lý*. Lệch mới đáng lo.
3. Cái quan trọng hơn code vẫn thuộc về bạn: **bạn phát hiện, bạn khoanh vùng, bạn tái hiện, bạn kiểm chứng.** Đó mới là việc của tester, và không nhờ AI được.

**Bản ngắn gọn nếu bạn muốn trả lời nhanh** (3 câu, dùng khi thời gian ít):
> "Có — mấy lần cả bộ đỏ nhưng không phải sản phẩm lỗi: `[Chrome lần trước tắt đột ngột nên lần sau không mở sạch]`, và `[phiên đăng nhập hết hạn]`. Em nhận ra vì chúng **fail đồng loạt ở cùng một bước đầu tiên** — sản phẩm lỗi thì không lỗi đều như vậy. Em khoanh vùng rồi `[nhờ AI sửa phần code]`, phần em làm là tái hiện lại lỗi cũ để chắc nó đã hết, và đề xuất thêm bước kiểm tra phiên đăng nhập trước khi chạy để lần sau nhìn là biết ngay."

### Q5. Bạn đo hiệu quả của quy trình bằng chỉ số gì?

> "Em không đo bằng số test, vì số test tăng rất dễ mà chẳng nói lên gì.
> Em nhìn 4 chỉ số:
> **Số bug thật bộ regression bắt được** — quan trọng nhất, nó trả lời 'bộ này có đáng tồn tại không'.
> **Bug lọt production mà bộ test lẽ ra phải bắt** — mỗi cái như vậy em thêm một test cho đúng case đó.
> **Thời gian từ lúc dev fix tới lúc verify xong** — quy trình tốt thì cái này tính bằng phút.
> **Tỷ lệ flaky** — test nào hay đỏ-oan, vì nó ăn mòn niềm tin của team nhanh hơn bất cứ thứ gì.
> `[Hiện em theo dõi mấy cái này thủ công, chưa có dashboard — đó là thứ em muốn làm tiếp.]`"

---

## 3. Test case — phần mạnh của bạn

### Q6. Tại sao không để AI sinh luôn test case?

> **Câu này quyết định buổi phỏng vấn cùng với Q11. Học chắc.**

> "Vì test case là chỗ **quyết định chất lượng của việc test**, còn script chỉ là cách thực thi. Và AI thiếu đúng ba thứ cần để viết case tốt:
> **Một, nó không biết nghiệp vụ thật.** Ví dụ ở app của em, giới hạn của Free plan là `[chỉ connect được 1 account và 1 feed]`. AI không biết con số đó, cũng không biết là khi xoá feed đi thì button phải enable lại — đó là luật nghiệp vụ nằm trong đầu PO, không có trong code.
> **Hai, nó không biết rủi ro thật nằm ở đâu.** Em biết `[luồng disconnect Facebook account hay vỡ nhất vì nó ảnh hưởng chéo sang GMC và MMC]`, nên em viết nhiều case quanh đó. AI sẽ chia case đều cho mọi màn hình.
> **Ba, nó sinh case thừa mà vẫn bỏ sót edge case.** Nó rất giỏi sinh 20 biến thể của validate ô input, nhưng bỏ qua `[case trạng thái: xoá feed rồi thì button đổi trạng thái chưa]` — mà đúng mấy case trạng thái đó mới là nơi có bug.
> Em vẫn dùng AI ở bước này, nhưng theo chiều ngược lại: em viết case xong **rồi hỏi nó 'em bỏ sót nhóm nào'** — dùng nó để review, không để nó quyết định. Quyết định cuối cùng và trách nhiệm là của em."

### Q7. "Review lại xong chốt bộ cuối" — review theo tiêu chí gì?

> "Em soi 5 tiêu chí:
> **Đủ nhóm:** happy path, validate, edge/boundary, negative, và phân quyền/trạng thái. Thiếu nhóm nào là em biết ngay vì em check theo danh sách.
> **Không trùng:** hai case khác câu chữ nhưng cùng đi một đường code thì gộp.
> **Expected result kiểm chứng được:** phải là cái máy khẳng định được đúng/sai. 'Hiển thị đúng' là expected tồi; `[button "+ Connect new account" ở trạng thái disabled]` mới là expected dùng được.
> **Có priority** và lý do priority đó.
> **Có điều kiện tiền đề rõ ràng** — case cần app ở trạng thái nào trước đó, vì bộ của em có nhiều case phụ thuộc trạng thái install.
> `[Tự nhận trước điểm yếu: hiện em đánh gần như toàn bộ là P0 — xem Q33.]`"

### Q8. Một task ra bao nhiêu case? Làm sao biết là đủ?

> "`[Khoảng 20 case cho một luồng cỡ create feed.]`
> Em không theo 'càng nhiều càng tốt'. Em dựa 2 thứ: **acceptance criteria** phải được phủ hết — mỗi AC ít nhất một case; và **đánh giá rủi ro** — chỗ nào mất tiền, mất dữ liệu, hoặc chỗ dev vừa sửa thì phủ dày hơn.
> Em coi là **đủ** khi: mọi AC có case, mọi nhóm case có mặt, và em không nghĩ thêm được câu 'nếu người dùng làm X thì sao' nào mà chưa có case.
> Và **cắt** cũng quan trọng như thêm: em cắt case khi nó đi cùng một đường code với case khác, hoặc khi chi phí tự động hoá nó cao hơn giá trị — `[ví dụ case phải chờ 30 giây uninstall rồi reinstall, em để test tay thay vì nhét vào bộ chạy 2 lần/ngày]`."

### Q9. Test case lưu ở đâu? Trace được requirement → case → script → bug không?

> **Đây là điểm mạnh thật của repo bạn. Chủ động kể, đừng chờ hỏi.**

> "Có, và em làm bằng **mã case thống nhất**.
> Test case nằm ở `[testcases/FeedNexa_AI_Testcase_revised.csv]`, mỗi case có mã theo module: `IA_` cho install app, `CF_` cho create feed Facebook, `CG_` cho create feed GMC.
> Tên test trong script mang **đúng mã đó cộng priority**, ví dụ `CF_04b [P0] Step 2: Products from collections -> Browse popup`.
> Nên chuỗi trace là: AC trong requirement → mã case trong file test case → tên test trong spec → tên test trong HTML report → mã case ghi trong bug ticket.
> Lợi ích thực tế: report đỏ ở `CF_14` là em biết ngay case nào, nghiệp vụ nào, không cần đọc code. Và khi requirement đổi, em grep mã case là thấy hết chỗ phải sửa.
> `[Chỗ còn thiếu: em chưa map ngược từ case lên mã requirement/ticket của BA — hiện đang nối bằng tên màn hình. Đó là việc em muốn làm.]`"

### Q10. Requirement đổi — sửa test case trước hay script trước?

> "**Case trước, vì case là nguồn sự thật.** Script chỉ là bản thực thi của case.
> Nếu sửa script trước thì file test case thành sai, và lần sau ai đọc nó cũng không biết tin cái nào — tệ hơn là không có tài liệu, vì nó gây hiểu sai.
> Quy trình em làm: cập nhật case (thêm/sửa/đánh dấu bỏ) → xác định case nào bị ảnh hưởng theo mã → sửa script đúng những test đó → chạy lại cả nhóm quanh vùng đó, vì requirement đổi thường kéo theo trạng thái liên quan.
> Và nếu một case bị bỏ hẳn, em **xoá test** chứ không `skip` — skip để đó sẽ thành nợ."

---

## 4. AI sinh code — phần khó nhất

### Q11. Claude viết 100% script. Bạn kiểm tra code nó viết bằng cách nào?

> **Câu quan trọng nhất cả buổi. Nói có cấu trúc, 4 bước, đừng kể lan.**

> "Em kiểm 4 bước, theo thứ tự này.
> **Một, đọc assertion xem nó có kiểm đúng cái em muốn kiểm không.** Đây là chỗ AI sai nhiều nhất. Nó hay viết assertion 'dễ pass': check element tồn tại thay vì check **trạng thái** của element. Case của em là `[button phải disabled khi hết hạn mức Free plan]` — nó viết `expect(button).toBeVisible()`, mà button visible thì luôn đúng, kể cả khi bug làm button enable. Em sửa thành `toBeDisabled()`.
> **Hai, cố tình làm nó fail.** Em sửa expected sang giá trị sai, hoặc đổi data, hoặc chạy trên trạng thái app đã biết là sai, và **test phải đỏ**. Nếu sửa expected thành vô lý mà test vẫn xanh thì test đó vô dụng — em luôn làm bước này với test mới, vì một test không bao giờ fail được thì không bảo vệ gì cả.
> **Ba, soi selector.** Có bám layout không, có hardcode text dễ đổi không, có `waitForTimeout` cứng không. AI rất hay chèn chờ cứng cho nhanh xanh.
> **Bốn, kiểm data và trạng thái:** test tự tạo dữ liệu của mình chưa, có dọn chưa, có phụ thuộc test chạy trước nó không.
> Em tóm lại một câu: **em không review code AI theo tiêu chí 'có chạy được không', em review theo tiêu chí 'nó có bắt được lỗi không'.** Hai cái đó khác nhau hoàn toàn."

### Q12. AI viết test luôn pass nhưng không assert gì có ý nghĩa — phát hiện thế nào?

> "False pass nguy hiểm hơn fail, vì fail thì có người xem, còn false pass cho cảm giác an toàn giả và không ai mở ra đọc lại.
> Em phát hiện bằng 3 cách:
> **Chạy trên build đã biết là lỗi** — hoặc dựng lại đúng trạng thái lỗi. Vẫn pass thì test vô dụng, xoá hoặc viết lại.
> **Đọc assertion và hỏi 'cái này có thể fail được không'.** `expect(true).toBe(true)`, `toBeVisible()` cho element luôn có, hoặc assertion nằm sau một `catch` im lặng — đều là test giả.
> **Đếm số assertion trên mỗi test.** Test 30 dòng mà một assertion ở cuối thì gần như chắc chắn nó chỉ kiểm 'không crash'.
> Khái niệm chuẩn của việc này là **mutation testing**: cố tình gài lỗi vào code sản phẩm rồi xem bộ test có bắt được không — bộ test không bắt được mutation nào thì coverage chỉ là số đẹp. Em làm thủ công phiên bản rẻ của nó: gài lỗi vào expected hoặc vào trạng thái dữ liệu."

### Q13. Test fail — làm sao biết bug sản phẩm hay bug script?

> "Em phân loại theo **kiểu lỗi** trước, vì nó đoán đúng 80%:
> `assertion failed` — tức là app chạy tới được chỗ đó nhưng giá trị sai → **nghi bug sản phẩm**.
> `timeout` hoặc `selector not found` — tức là test không tìm thấy đường đi → **nghi bug script**, thường là dev đổi UI.
> Nhưng em không dừng ở đoán. Em **mở trace**: `npx playwright show-trace test-results/.../trace.zip`. Trace cho xem lại từng action kèm snapshot DOM, network và console, nên em thấy đúng khoảnh khắc nó lệch — và phân biệt được 'element không có' với 'element có nhưng bị che' hay 'API trả lỗi nên UI không render'.
> Ở repo của em, fixture **tự ghi trace và chỉ giữ lại khi fail**, kèm screenshot full page đính vào report — nên fail là có đủ bằng chứng ngay, không phải chạy lại để đoán.
> Sau đó em **làm lại tay trên UI** đúng các bước đó. Tay cũng lỗi → bug sản phẩm, đi kèm luôn bằng chứng cho dev. Tay chạy ổn → bug script hoặc flaky, và em **chạy lại vài lần** xem có ổn định không."

### Q14. Script fail vì lỗi script, Claude sửa 3 lần không được. Bạn làm gì?

> "Sửa 3 lần không được thì em **dừng vòng lặp đó**, vì nó sẽ không tự thoát — AI đang đoán mà không có thông tin mới.
> Em làm theo thứ tự:
> **Một, tự đọc trace xác định đúng dòng lỗi và đúng trạng thái DOM lúc đó.** Rất nhiều lần hoá ra không phải selector sai, mà là element nằm trong iframe, hoặc bị overlay che — ở app của em là `[chatbot widget che button]`, và đó là lý do fixture có đoạn inject CSS ẩn chatbot.
> **Hai, sửa thủ công ở mức em làm được:** selector, wait, thứ tự bước, hoặc đổi locator sang `getByRole`.
> **Ba, nếu vẫn kẹt thì đổi cách tiếp cận thay vì sửa tiếp.** Ví dụ không đi qua UI để dựng dữ liệu nữa mà `[gọi API hoặc dùng helper reset trạng thái app như `ensureFreshInstall`]` — nhanh hơn và ổn định hơn nhiều.
> **Bốn, nhờ dev** — nhưng nhờ bằng câu hỏi cụ thể: 'element này render sau event nào' hoặc 'có `data-testid` cho chỗ này không', chứ không phải 'test em fail anh xem hộ'.
> Và quan trọng: lúc này em **đưa thông tin mới cho AI** chứ không bảo nó thử lại — dán đoạn DOM thật, lỗi thật từ trace. Nó sửa sai 3 lần vì em mô tả vấn đề thiếu, không phải vì nó không làm được."

### Q15. Bạn đọc hiểu code Playwright tới mức nào?

> **Đừng phóng đại — phần 6 họ test ngay. Nói đúng mức, và nói luôn ranh giới.**

> "Em nói thẳng mức của em.
> **Đọc được và sửa được:** tên test, selector, assertion, các bước trong một test, và đọc report/trace để biết test fail ở đâu. Mấy cái này em làm hàng ngày.
> **Hiểu được mục đích nhưng không tự viết:** phần cấu hình và phần dựng môi trường chạy — `[trong dự án em là file config, file mở Chrome lên, và file fixture]`. Em giải thích được **từng phần đó để làm gì và nếu bỏ đi thì chuyện gì xảy ra**, vì em là người gặp đúng những vấn đề mà nó giải quyết. Nhưng code cụ thể thì do AI viết, em không tự viết lại từ đầu được.
> **Chưa làm:** `[Page Object Model, chạy song song, shard trên CI.]`
> Em đang thu hẹp khoảng đó bằng cách `[mỗi lần AI sinh code em bắt nó giải thích tại sao chọn cách đó, và em tự sửa tay những phần nhỏ trước — selector, assertion, thêm bước vào test có sẵn.]`"

**Nếu họ hỏi tiếp "giải thích thử một đoạn xem":** chọn thứ bạn **hiểu mục đích vì bạn từng gặp vấn đề đó**, không phải thứ nghe kỹ thuật nhất. Mẫu:

> "Ví dụ trong file fixture của em có một đoạn **ẩn widget chatbot** trên trang. Nó có ở đó vì `[chatbot nổi lên che đúng chỗ button cần click, làm test fail mà sản phẩm không lỗi gì]`. Em là người phát hiện ra nguyên nhân đó từ `[ảnh chụp lúc fail]`, và đoạn code đó giải quyết đúng việc ấy — nó ẩn chatbot **trước khi trang hiện ra**, nên không bị cảnh chatbot kịp hiện rồi mới ẩn.
> Chi tiết cú pháp thì em phải mở file ra xem lại, em không thuộc. Nhưng tại sao nó phải có ở đó thì em biết rõ, vì không có nó là em mất `[cả buổi]` tưởng app lỗi."

> **Vì sao cách trả lời này tốt hơn:** nó chứng minh đúng thứ interviewer cần biết — bạn hiểu **hệ thống mình đang vận hành**, chứ không phải bạn thuộc API của Playwright. Và nó không thể bị bắt bài, vì nó là trải nghiệm thật của bạn.

### Q16. Nếu công ty cấm dùng AI tool, bạn làm việc thế nào?

> "Chậm hơn, nhưng vẫn làm được — và phần quan trọng nhất không bị ảnh hưởng.
> **Phần không phụ thuộc AI:** viết test case, đánh giá rủi ro, quyết định test gì, đọc trace, phân biệt bug sản phẩm với bug script, quyết định có chặn release. Đó là phần em tự làm từ đầu tới giờ.
> **Phần chậm lại là gõ code.** Em sẽ làm như trước khi có AI: dùng `[bộ test có sẵn trong repo làm mẫu]`, dùng **Playwright codegen** (`npx playwright codegen`) để sinh khung rồi sửa lại cho sạch, và tra tài liệu chính thức.
> Thực tế em nghĩ năng suất giảm `[khoảng 30–40%]` ở bước viết script, chứ không phải không làm được. Và em không coi đó là lý do để không nhận việc — nhiều công ty có policy đó vì lý do bảo mật chính đáng."

### Q17. Code AI sinh ra có qua code review của dev hoặc QA lead không?

**Trả lời thật. Nếu chưa có thì đây là cách nói:**
> "`[Hiện chưa có review bắt buộc — code em đẩy lên Git và tự review, vì team em không có QA khác và dev không đọc code test.]`
> Em biết đó là điểm yếu: tự review code mình thì không thấy được điểm mù của mình, nhất là khi code do AI sinh và em là người duyệt.
> Nên em bù bằng 2 việc: **bắt test fail có chủ đích** trước khi merge, và `[đặt tên test theo mã case để người khác đọc report hiểu được mà không cần đọc code]`.
> Và đây là thứ em muốn thiết lập ở chỗ làm mới: `[mở PR cho mỗi bộ test, nhờ dev review phần selector — vì họ biết element nào ổn định, element nào sắp bị đổi; đó cũng là cách tự nhiên để xin thêm `data-testid`.]`"

> **Đừng nói "có PR có review" nếu không có** — họ hỏi "ai review" là lộ.

### Q18. Bạn có gửi code nội bộ hoặc dữ liệu thật của công ty cho AI không? Policy công ty là gì?

> **Câu đo ý thức bảo mật. Bạn có đạn thật từ `.gitignore`.**

> "Em có nguyên tắc rõ ràng về cái gì được gửi.
> **Em gửi:** test case em tự viết, cấu trúc project, đoạn code test đang lỗi, thông báo lỗi, đoạn DOM của trang đang test.
> **Em không gửi:** credential, token, cookie, session; dữ liệu khách hàng thật; và `[source code sản phẩm của công ty]`.
> Cụ thể trong repo em, session đăng nhập nằm ở `user.json` và `.auth-profile/`, **cả hai đều trong `.gitignore`** cùng với `.env` — nên nó không lên Git, và cũng không có trong cái em gửi cho AI. Data test em dùng `[store dev riêng, không phải store của khách]`.
> `[Về policy: công ty em hiện chưa có policy chính thức về AI tool — em tự đặt giới hạn như trên. Em có hỏi lead trước khi dùng.]`
> Và em luôn kiểm trước khi dán: đoạn code em gửi có lẫn token hay URL nội bộ không. Em coi mỗi lần dán là một lần **publish** ra ngoài — đã gửi là coi như không rút lại được."

> `[Nếu công ty bạn có policy thật thì nói rõ: tool nào được duyệt, có bản enterprise không, có cấm gửi gì. Biết policy = điểm cộng; "em không biết công ty có policy gì" = cờ đỏ.]`

---

## 5. Playwright kỹ thuật

> Trước buổi phỏng vấn: **mở 4 file này đọc lại** — `playwright.config.ts`, `globalSetup.ts`, `tests/fixtures.ts`, `tests/app-helpers.ts`. Họ sẽ hỏi đúng chúng.

### Q19. Trong `playwright.config.ts` bạn chỉnh những gì? Vì sao?

> **Câu này họ sẽ hỏi vì nó là file của bạn. Trả lời theo "dòng này để làm gì", đừng cố nói cú pháp.**
> Và nói trước một câu định khung, để cả đoạn sau thành trung thực chứ thành thiếu hụt:

> "Em nói trước là **phần config này do AI viết khi em dựng project**, em không tự viết từ đầu. Nhưng em biết từng phần để làm gì, vì mỗi phần đều là cách giải quyết một vấn đề em gặp thật. Em kể theo cách đó.
>
> **Một, nó chỉ chạy một test tại một thời điểm, không chạy song song.** `[Trong config là `workers: 1`.]` Lý do: bộ test của em dùng **một cửa sổ Chrome thật đã đăng nhập sẵn**, nên nhiều test chạy cùng lúc sẽ tranh nhau đúng một cửa sổ đó. Đây là ràng buộc của cách em làm, không phải em chọn cho an toàn — muốn chạy song song thì phải đổi cách dựng môi trường trước.
>
> **Hai, có một bước kiểm tra đăng nhập chạy trước tất cả test.** Nếu phiên đăng nhập hỏng thì nó dừng ngay và báo rõ, thay vì để `[44]` test fail với lỗi khó hiểu. Cái này em đề xuất thêm sau khi bị đúng tình huống đó — xem câu `[Q4]`.
>
> **Ba, report dạng HTML** để em gửi được cho dev, có kèm ảnh và trace khi fail. Và có cả report dạng danh sách in ra terminal để em xem lúc chạy.
>
> **Bốn, có bước tự mở Chrome trước khi chạy và tự tắt sau khi chạy xong.**
>
> **Và mấy thứ em biết là mình còn thiếu:** URL của app hiện nằm trong code chứ chưa tách ra config, nên đổi môi trường là phải sửa code; thời gian chờ và số lần chạy lại khi fail thì đang để mặc định. `[Đó là mấy việc em muốn sửa.]`"

> **Ranh giới an toàn:** nếu họ hỏi sâu hơn ("`expect.timeout` khác `timeout` thế nào?") thì nói thật: *"Em chưa chỉnh tới mấy option đó nên em không nắm chắc — em biết là có và biết để làm gì, nhưng chưa dùng nên em không nói bừa."* Thừa nhận một option chưa dùng thì không ai trừ điểm; nói sai thì bị.

### Q20. `globalSetup` bạn dùng làm gì?

> **Đây là phần đặc biệt của dự án bạn — kể được là rất mạnh. Nhưng kể bằng "nó giải quyết vấn đề gì", không bằng tên hàm.**

> "`globalSetup` là bước chạy **một lần trước toàn bộ test**. Ở dự án em nó làm một việc: **mở sẵn một cửa sổ Chrome đã đăng nhập Shopify**, rồi tất cả test dùng chung cửa sổ đó.
>
> **Vì sao phải làm vậy** — và đây là lý do thật, không phải chọn cho tiện: app em test nằm trong Shopify admin, mà `[Shopify phát hiện và chặn trình duyệt có dấu hiệu bị điều khiển tự động — em bị chặn hoặc bị bắt xác minh liên tục khi dùng cách mở browser thông thường của Playwright]`. Dùng một Chrome thật với phiên đăng nhập thật thì không bị. Phụ thêm là nó **không phải đăng nhập lại mỗi lần chạy**, nên nhanh hơn và bớt một chỗ dễ vỡ.
>
> **Nó còn dọn trạng thái của Chrome trước khi mở.** Cái này thêm vào sau khi em gặp sự cố ở `[Q4]`: lần chạy trước Chrome bị tắt đột ngột thì lần sau nó mở lên kèm popup 'Restore pages?' và cả bộ test fail. Nên bước này xoá mấy file còn sót lại của lần trước để Chrome mở sạch.
>
> **Rủi ro của cách này — em biết rõ vì em gặp hết rồi:**
> **Phiên đăng nhập hết hạn** thì cả bộ đỏ. Em giảm đau bằng bước kiểm tra phiên chạy trước, báo lỗi rõ ràng.
> **Không chạy song song được**, vì chỉ có một cửa sổ và một phiên đăng nhập.
> **Phụ thuộc máy phải có Chrome thật** — `[em đổi máy là phải sửa lại phần tìm Chrome.]`
> **Phiên dùng lâu thì dễ bẩn** — cookie, cache, popup tích tụ, nên thỉnh thoảng em phải đăng nhập lại từ đầu.
>
> Nếu không bị chặn automation, em sẽ dùng **cách tiêu chuẩn** là lưu lại trạng thái đăng nhập vào một file rồi test nào cũng nạp vào — nhẹ hơn, chạy song song được, không phụ thuộc Chrome của máy. `[Em chọn cách hiện tại vì ràng buộc của Shopify, không phải vì không biết cách kia.]`"

> **Ranh giới an toàn:** câu cuối rất quan trọng — nó cho thấy bạn biết cách làm phổ biến và biết vì sao mình làm khác. Nếu họ hỏi *"`storageState` dùng thế nào?"* thì: *"Em biết nguyên lý là lưu cookie và session vào file rồi test nạp lại, nhưng em chưa dùng thật ở dự án nào nên em không nói chắc về chi tiết."*

### Q21. `page.locator()` vs `page.$()`. Auto-waiting là gì?

> "`page.locator()` trả về một **locator — lazy**, nó chỉ là mô tả cách tìm element, chưa đi tìm. Mỗi lần dùng nó mới resolve lại trên DOM hiện tại. Nhờ vậy nó **không bị stale**: element bị render lại thì lần dùng sau vẫn đúng.
> `page.$()` đi tìm **ngay tại thời điểm gọi** và trả về element handle của đúng element lúc đó. Element bị re-render là handle thành stale, và nó trả `null` ngay nếu element chưa xuất hiện — nên phải tự chờ. Nó là API cũ, giờ Playwright khuyến nghị không dùng.
> **Auto-waiting** là: trước mỗi action, Playwright **tự chờ element actionable** — tồn tại, visible, stable (không đang animate), enabled, và nhận được event. Nên `await page.getByRole('button').click()` đã bao gồm chờ sẵn, không cần `waitFor` thủ công.
> Và nó áp dụng cả cho assertion: `expect(locator).toBeVisible()` là **web-first assertion**, nó tự retry tới khi đúng hoặc hết timeout. Đó là lý do hầu như không bao giờ cần `waitForTimeout`."

### Q22. Tại sao `page.waitForTimeout(3000)` là code tệ? Thay bằng gì?

> "Nó tệ ở hai đầu cùng lúc: **vừa chậm vừa vẫn flaky**. Nếu trang xong trong 200ms thì em vứt đi 2.8 giây — nhân với 44 test là mất hàng phút mỗi lần chạy. Còn nếu máy CI chậm hơn hoặc mạng kém thì 3 giây không đủ và test vẫn fail. Tức là nó không giải quyết vấn đề, chỉ làm vấn đề xảy ra thưa hơn.
> Thay bằng **chờ đúng điều kiện mình đang cần**:"

```typescript
// chờ UI vào đúng trạng thái — web-first assertion, tự retry
await expect(page.getByRole('heading', { name: 'Omega Feed' })).toBeVisible();
await expect(page.getByRole('button', { name: '+ Connect new account' })).toBeDisabled();

// chờ đúng response của API mình quan tâm
await page.waitForResponse(res => res.url().includes('/api/feeds') && res.ok());

// chờ điều hướng
await page.waitForURL('**/dashboard');
```

> "Nguyên tắc em dùng: **chờ một điều kiện, không chờ một khoảng thời gian.**
> Chỗ duy nhất em thấy `waitForTimeout` tạm chấp nhận được là khi phải chờ một thứ hoàn toàn không quan sát được từ phía client — `[ví dụ case uninstall app phải chờ 30 giây phía Shopify]` — và lúc đó em ghi comment giải thích tại sao, chứ không để trần."

### Q23. Selector bạn hay dùng? Vì sao không dùng XPath dài?

> "Em ưu tiên theo thứ tự: **`getByRole`** trước, rồi `getByLabel`, `getByText`, và `getByTestId` khi mấy cái trên không đủ phân biệt.
> Lý do chọn `getByRole`: nó bám vào **vai trò accessibility** của element — cái mà người dùng thật cảm nhận — nên dev đổi `div` thành `button`, đổi class, đổi layout thì nó vẫn đúng. Và nó kiểm luôn một phần accessibility: element không có role đúng thì screen reader cũng không đọc được.
> **XPath dài kiểu `/html/body/div[3]/div[2]/button`** thì bám cấu trúc DOM: dev thêm một `div` wrapper là vỡ hết, mà nó vỡ im lặng — báo 'không tìm thấy element' chứ không nói lý do thật. Nó cũng không đọc được: nhìn vào không biết đang click cái gì.
> `[Thực tế trong bộ của em có một số chỗ phải dùng selector theo class pattern — ví dụ ẩn chatbot em dùng `[class*="crisp" i]` — nhưng đó là để ẩn widget của bên thứ ba, không phải để test chức năng.]`
> **Và em có xin dev thêm `data-testid`:** `[ở mấy chỗ button chỉ khác nhau bằng text và text thì sắp đổi theo bản dịch.]` Em thấy đó là cách rẻ nhất để bộ test bớt vỡ — và em trình bày với dev theo hướng 'cái này giúp cả hai bên đỡ mất thời gian sửa test mỗi sprint', chứ không phải 'anh sửa code cho em test'."

> **Nếu bạn chưa từng xin `data-testid`:** đừng bịa. Nói: "Em chưa làm, nhưng em thấy bộ test của em đang đau đúng chỗ đó — nhiều test khớp theo text của button, mà text là thứ dev đổi thường xuyên nhất. Em muốn đề xuất việc này."

### Q24. `test.describe.serial`, `beforeEach`, fixture — dùng khi nào?

> **Trả lời theo "cái nào dùng cho việc gì", đừng đi vào cơ chế.** Phần mạnh của bạn ở câu này là đoạn cuối — nó nói về chính bộ test của bạn.

> "Ba cái dùng cho ba việc khác nhau.
> **Fixture** là thứ **chuẩn bị sẵn môi trường cho test dùng**, và dọn sau khi test xong. Bộ của em có fixture riêng: nó lo phần `[kết nối vào cửa sổ Chrome đã đăng nhập, ẩn chatbot, bật ghi trace, và chụp ảnh khi test fail]`. Nhờ vậy mỗi test chỉ cần viết phần nghiệp vụ, không phải lặp lại mấy bước đó.
> **Vì sao dùng fixture chứ không `beforeEach`:** vì fixture để được **cả phần chuẩn bị và phần dọn vào cùng một chỗ**, nên không bị cảnh sửa phần chuẩn bị mà quên sửa phần dọn. `[Phần fixture này do AI viết, em hiểu nó lo những việc gì vì đó đúng là mấy vấn đề em từng gặp — chatbot che button, fail mà không có ảnh để xem.]`
> **`beforeEach`** em dùng cho **bước nghiệp vụ lặp lại ở mọi test**, không phải môi trường — `[ví dụ mỗi test đều phải mở app và đóng popup onboard trước]`.
> **`test.describe.serial`** dùng khi các test **thật sự phụ thuộc nhau**, test trước fail thì test sau không còn ý nghĩa. Nó bắt chạy đúng thứ tự và dừng cả nhóm khi một cái fail.
>
> **Và đây là chỗ bộ của em đang có vấn đề thật:** `[bộ test của em đang phụ thuộc thứ tự nhưng không khai báo ra. Ví dụ `CF_00` là case reset app để popup onboard sẵn sàng, các case sau mới chạy được; `CF_11` xoá feed rồi thì `CF_12` và `CF_13` mới kiểm được trạng thái sau khi xoá.]`
> Hiện nó vẫn chạy đúng vì bộ test chạy tuần tự một test một lúc. Nhưng **sự phụ thuộc đó đang ngầm** — người khác nhìn vào không biết, và nếu sau này chạy song song hoặc chạy lẻ một test thì sai. `[Dùng `describe.serial` cho mấy nhóm đó sẽ làm nó hiện ra rõ — đó là một việc em muốn sửa.]`"

> Đoạn cuối là **tự chỉ ra điểm yếu kèm hướng sửa**, và nó nằm trong mức bạn hiểu chắc: đó là chuyện thứ tự test, không phải chuyện cơ chế của Playwright.

### Q25. Chạy song song (`workers`) gây đụng data. Xử lý sao?

> "Em trả lời thật về tình trạng hiện tại rồi mới nói cách xử lý chuẩn.
> **Hiện bộ của em chạy `workers: 1`**, nên chưa gặp vấn đề đụng data — nhưng không phải vì em chọn an toàn, mà vì **kiến trúc CDP attach chỉ có một context và một profile**, nhiều worker sẽ tranh nhau cùng một Chrome.
> **Nếu phải chạy song song, em biết cần 3 thứ:**
> **Tách môi trường cho từng luồng chạy** — mỗi luồng một cửa sổ Chrome và một tài khoản riêng, thay vì dùng chung một cái. `[Phần này em biết là phải làm vậy nhưng chưa tự triển khai được.]`
> **Mỗi test tự tạo data của mình**, đặt tên theo uuid hoặc prefix để không đụng — `[ví dụ tên feed `auto_<uuid>` thay vì 'Facebook catalog 1']`. Chỗ này bộ của em còn yếu: nhiều case dùng tên feed cố định.
> **Nhóm nào thật sự phụ thuộc thứ tự thì `describe.serial`**, và tách data của nhóm đó ra riêng.
> Cái khó nhất ở app em test không phải data mà là **trạng thái dùng chung**: app chỉ install được một lần trên một store, Free plan chỉ cho một feed. Nên song song thật thì phải `[mỗi worker một store dev riêng]` — đó là thay đổi về môi trường, không chỉ về code."

### Q26. `retries` đặt bao nhiêu? Retry có che bug không?

> "Repo của em **hiện không set `retries`, tức là 0** — cả local và CI.
> Em thấy mặt tốt của 0 là **flaky lộ ra ngay**, không bị che. Mặt dở là một lần nhiễu mạng cũng làm cả lần chạy 'KHÔNG ĐẠT', và `[với bộ chạy 2 lần/ngày thì em phải tự phân biệt đỏ thật với đỏ oan]`.
> **Và retry có che bug — che hai loại.** Một là che flaky của test, mình không bao giờ sửa tận gốc. Hai, nguy hiểm hơn, là **che bug thật của sản phẩm**: nếu một race condition làm 1/5 lần hỏng thì retry 2 lần sẽ gần như luôn xanh, mà ngoài production vẫn là 1/5 người dùng gặp lỗi.
> **Cách em cho là đúng:** `retries: 0` ở local để thấy ngay, `retries: 1` ở CI để giảm nhiễu hạ tầng, và **bắt buộc theo dõi danh sách test phải retry mới pass** — Playwright báo rõ là 'flaky' chứ không gộp vào passed. Test nào xuất hiện trong danh sách đó quá `[2 lần/tuần]` là em mở ticket sửa, chứ không để retry gánh mãi.
> Nói ngắn: retry là thuốc giảm đau, không phải thuốc chữa. Dùng được, nhưng phải có người theo dõi liều."

### Q27. Trace / video / screenshot bạn bật ở chế độ nào?

> **Đây vẫn là câu mạnh của bạn — nhưng điểm mạnh nằm ở chỗ bạn biết VÌ SAO cách thông thường không dùng được, không nằm ở chỗ đọc được code.**

> "Bộ của em hiện: **test fail thì có ảnh chụp toàn trang và có trace** đính kèm vào report; **test pass thì không lưu gì**. Video thì em chưa bật.
> Lý do chọn như vậy: trace là thứ giúp em debug nhanh nhất, nhưng nếu lưu cho cả `[44]` test mỗi lần chạy thì rất nặng — mà test xanh thì em không mở ra xem bao giờ. Nên chỉ giữ khi fail.
>
> **Và có một chuyện đáng nói ở dự án em:** cách thông thường để bật trace là đặt **một dòng trong file config** — hầu hết dự án làm vậy. Nhưng ở dự án em **cách đó không có tác dụng**, vì test của em không dùng Chrome do Playwright tự mở, mà **dùng cửa sổ Chrome mở sẵn từ bên ngoài**. Playwright chỉ áp dụng cấu hình đó cho browser do nó tự tạo.
> Nên trace ở dự án em phải được xử lý riêng ở phần fixture: bật ghi khi test bắt đầu, và **khi test xong thì xem nó fail hay pass — fail thì lưu lại file trace và đính vào report, pass thì bỏ đi.**
> `[Phần code đó do AI viết, em không tự viết được. Nhưng em là người phát hiện vấn đề: lúc đầu em đặt option trong config mà fail vẫn không có trace nào, em không hiểu vì sao — tìm ra thì là do cách dự án em attach vào Chrome bên ngoài. Và em là người kiểm chứng: em cố tình làm một test fail để chắc là trace có thật và mở được.]`
>
> **Dùng để làm gì trong thực tế:** test đỏ là em mở trace bằng `npx playwright show-trace`, xem lại từng bước kèm ảnh màn hình tại mỗi bước, xem request mạng và log console. Nhờ nó em phân biệt được `[element không có]` với `[element có nhưng bị che]` hay `[API lỗi nên trang không hiện]`. Và em **gửi luôn trace cho dev** thay vì mô tả bằng lời — `[gần như không còn phải tranh luận bug có thật không.]`"

> **Ranh giới an toàn:** đoạn `[...]` ở trên là cách nói trung thực mà vẫn mạnh — "em phát hiện vấn đề, em kiểm chứng, phần code do AI viết". Nếu họ hỏi *"viết đoạn đó ra xem"* thì: *"Em phải mở file ra xem lại, em không thuộc cú pháp."* Đừng cố viết từ đầu.

---

## 6. Đọc code tại chỗ

> **Luyện phần này kỹ nhất.** Nó bù trực tiếp cho điểm yếu "không tự viết script" — người đọc code ra lỗi thì không ai nghĩ là "nhờ AI làm hộ".
> Cách trả lời: **xếp lỗi theo mức nghiêm trọng**, đừng nhặt bừa. Nói "lỗi nặng nhất là..." trước.

### Bài 1 — `test('login')`

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

> "Em đi từ nặng tới nhẹ.
> **Một, nặng nhất: `expect(true).toBe(true)` — test này không assert gì cả, nó luôn pass.** Nó không kiểm tra đăng nhập có thành công hay không; app sập hoàn toàn nó vẫn xanh. Đây là **false pass**, tệ hơn là không có test, vì nó làm mọi người tin là luồng login đã được phủ. Và đây đúng là kiểu code AI hay sinh ra khi không biết expected result là gì.
> **Hai, credential hardcode trong code** — `admin/123456` nằm trong file rồi commit lên Git là rò rỉ. Phải đưa ra biến môi trường, và file `.env` phải nằm trong `.gitignore`.
> **Ba, `waitForTimeout(5000)`** — chờ cứng, vừa chậm vừa không chắc đủ. Thay bằng assertion có auto-retry.
> **Bốn, `page.click('button')`** — selector mơ hồ, trang login thường có nhiều button (đăng nhập, quên mật khẩu, đăng nhập Google). Playwright sẽ báo strict mode violation hoặc click sai cái.
> **Năm, URL hardcode** `http://staging.abc.com` — phải để `baseURL` trong config rồi `goto('/login')`, để đổi môi trường không cần sửa code. Và đang là `http`, không phải `https`.
> **Sáu, `#user`/`#pass` bám id** — đỡ hơn XPath nhưng vẫn là chi tiết kỹ thuật; `getByLabel` tốt hơn vì nó bám cái người dùng thấy.
> **Bảy, tên test `'login'`** — không nói lên nó verify điều gì. Report đỏ ở dòng 'login' thì không ai biết là login sai mật khẩu, login thành công, hay login bị khoá.
> **Tám, thiếu negative case** — sai mật khẩu, tài khoản bị khoá, để trống. Một test cho luồng login là chưa đủ.
> Nếu chỉ được sửa một thứ thì em sửa cái assertion, vì sáu cái còn lại làm test *dễ vỡ*, còn cái đó làm test *vô dụng*."

**Bản sửa — chuẩn bị để viết được ra:**

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

### Bài 2 — `test('tạo đơn hàng')`

```typescript
test('tạo đơn hàng', async ({ page }) => {
  await page.goto('/orders/new');
  await page.getByTestId('customer').fill('Nguyen Van A');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText('Thành công')).toBeVisible();
});
```

> "Bài này tinh hơn bài 1 — selector tốt, có assertion thật. Vấn đề nằm ở chỗ khác.
> **Một, nó chỉ kiểm toast, không kiểm side effect.** 'Thành công' hiện ra chỉ chứng minh frontend hiển thị thông báo. Đơn có thật sự được tạo không, có đúng dữ liệu không, có vào danh sách đơn không — chưa kiểm. Bug kinh điển: UI báo thành công nhưng API lỗi, hoặc đơn được tạo thiếu field. Em sẽ assert thêm: đơn xuất hiện trong danh sách với đúng tên khách, hoặc check qua API.
> **Hai, `getByText('Thành công')` quá rộng** — nó khớp bất kỳ chỗ nào có chữ đó trên trang, kể cả một toast cũ còn sót hoặc một dòng text khác. Nên khoanh vùng: `page.getByRole('status')` hoặc `getByTestId('toast-success')`.
> **Ba, data hardcode `'Nguyen Van A'`** — chạy nhiều lần sinh một đống đơn trùng tên, chạy song song thì đụng nhau, và không phân biệt được đơn của lần chạy nào. Nên dùng `auto_${Date.now()}` hoặc uuid.
> **Bốn, không cleanup** — mỗi lần chạy để lại một đơn trên môi trường test, `[2 lần/ngày thì một tháng là 60 đơn rác]`, làm nhiễu cả người test tay.
> **Năm, thiếu negative case** — thiếu field bắt buộc, khách hàng không tồn tại, lưu hai lần liên tiếp.
> **Sáu, test không tự dựng tiền đề** — nó giả định `/orders/new` mở được và form rỗng. Nếu test trước để lại form có data thì kết quả khác.
> Nếu chỉ sửa một thứ: thêm assertion kiểm **đơn thật sự tồn tại**. Vì đó là lý do test này được viết ra."

### Bài 3 — "Xoá 1/3 số test, bạn xoá cái nào?"

> **Đây là câu mở — và bạn có câu trả lời rất cụ thể từ chính bộ test của mình.**

> "Em không xoá theo kiểu giữ lại cái dễ. Em xét 3 tiêu chí: **test này bảo vệ rủi ro gì**, **nó có trùng đường code với test khác không**, và **chi phí maintain của nó**.
> Áp vào bộ của em: nhóm em cắt trước là **các case kiểm trạng thái button theo giới hạn Free plan** — `CF_07` đến `CF_10b`, rồi `CF_11` đến `CF_16`. Khoảng 10 case, và chúng gần như cùng một thứ: 'ở channel X, button Y phải disabled/enabled khi hết/còn hạn mức'. Chúng đi qua cùng một đường logic, chỉ khác channel.
> Em **không xoá hẳn** mà **gộp thành một test chạy theo bảng dữ liệu**: một mảng `[{channel, button, expected}]` rồi loop. 10 test thành 1 test với 10 trường hợp — giữ nguyên coverage, giảm 10 chỗ phải sửa khi UI đổi xuống còn 1.
> Nhóm em **giữ chắc** là: `IA_01` (session và app load — fail cái này thì mọi test sau vô nghĩa), `CF_01`–`CF_05` (luồng onboard tạo feed từ đầu tới cuối — đây là luồng chính của sản phẩm), và `CF_14` (disconnect Facebook, vì nó ảnh hưởng chéo sang GMC và MMC — rủi ro cao mà không test tay nào nhớ hết).
> Nhóm em **xoá thật** nếu buộc phải: `[case kiểm UI tĩnh kiểu 'heading hiển thị đúng chữ' — nó vỡ mỗi lần đổi copy mà gần như không bắt được bug thật.]`
> Nguyên tắc em dùng: **giữ test bảo vệ luồng kiếm tiền và luồng dữ liệu, cắt test kiểm hiển thị.**"

> Câu trả lời này mạnh vì nó **dựa trên bộ test thật**. Mở `tests/create-feed.spec.ts` ra xem lại tên case trước khi đi phỏng vấn để nói đúng mã.

---

## 7. Regression & lịch chạy

### Q28. Bộ test chạy ở đâu — máy bạn, server, hay CI?

> **Thừa nhận thẳng rồi nói hướng. Chống chế ở đây là mất điểm.**

> "`[Hiện chạy trên máy của em]`, hẹn giờ `[2 lần/ngày, 08h30 và 15h30]`, notification hiện trên desktop của em.
> Em biết rõ 3 hạn chế: **máy tắt hoặc em nghỉ phép thì không chạy**; **chỉ em thấy kết quả**, không có chỗ lưu lịch sử để so sánh; và **không truy được commit nào làm vỡ**, vì nó chạy theo giờ chứ không theo deploy.
> Lý do nó đang ở máy em là **ràng buộc kỹ thuật thật**, không phải vì em không biết CI: bộ test attach vào một Chrome thật có session Shopify đã login — `[Shopify chặn môi trường trông giống automation, và session đó không đưa lên CI runner được một cách an toàn]`.
> **Hướng em muốn làm, theo thứ tự:**
> Một, **đẩy report ra chỗ dùng chung** — việc này làm được ngay mà không cần đổi kiến trúc: `[upload HTML report lên một nơi team xem được, và gửi notification vào kênh chat thay vì desktop]`.
> Hai, chuyển sang **self-hosted runner** — một máy để riêng, luôn bật, vẫn giữ được Chrome thật và profile đã login. Đây là cách giải đúng cho ràng buộc của em.
> Ba, dài hạn: tách bộ test không cần session Shopify thật ra để chạy được trên GitHub Actions — repo em đã có sẵn workflow `.github/workflows/playwright.yml` chạy trên push và PR vào main, upload `playwright-report` làm artifact giữ 30 ngày. `[Hiện phần này chưa chạy được đầy đủ vì vấn đề session.]`"

### Q29. Tại sao 2 lần/ngày mà không phải mỗi deploy hoặc mỗi PR?

> "Hai lần/ngày là `[lựa chọn thực tế theo ràng buộc hiện tại: nó chạy trên máy em, và bộ test mất khoảng [X phút] nên không chạy liên tục được]`. Mốc `[08h30]` để sáng ra biết trạng thái trước khi vào việc, `[15h30]` để còn kịp xử lý trong ngày.
> Nhưng em biết đây **không phải cách tốt nhất**, và lý do cụ thể: chạy theo giờ thì khi đỏ, em phải lần trong **nửa ngày thay đổi** để tìm nguyên nhân — có thể là commit của dev, có thể là deploy, có thể là data ai đó sửa trên store test.
> **Trigger theo deploy thì khoanh được ngay commit nào làm vỡ.** Đó là thứ em muốn đổi nhất.
> Còn **mỗi PR** thì em nghĩ phải chia tầng: chạy cả `[44]` test trên mỗi PR là quá chậm và tốn. Cách em cho là hợp lý: **smoke `[5–8]` test chạy mỗi PR**, full regression chạy sau mỗi deploy lên staging, và giữ một lần chạy theo lịch ban đêm để bắt những thứ hỏng không do code — `[session hết hạn, data trên store bị đổi, phía Shopify thay đổi]`."

### Q30. Ai nhận notification? Nhận xong ai làm gì?

> **Câu này đo "report có người đọc không". Trả lời thật.**

> "`[Hiện notification chỉ hiện trên desktop máy em, nên thực tế chỉ em nhận và chỉ em xử lý.]`
> Quy trình của em khi đỏ: `[mở HTML report xem test nào fail → mở trace để phân biệt bug sản phẩm với bug script → nếu là bug sản phẩm thì reproduce tay để chắc, rồi log bug kèm trace và screenshot → nếu là bug script thì sửa luôn]`.
> Em biết điểm yếu ở đây và nói thẳng: **một người nhận là một điểm chết**. Em nghỉ thì không ai biết bộ test đỏ, và không có SLA nào cho việc 'bao lâu phải có người xem'.
> **Cái em muốn thiết lập:** notification vào **kênh chat của team** chứ không phải desktop cá nhân, kèm link trực tiếp tới report; có người trực luân phiên hoặc ít nhất một người thứ hai trong kênh; và quy định rõ **fail test P0 thì xử lý trong bao lâu**.
> Em cũng nghĩ quan trọng không kém là **tránh làm phiền khi không cần**: nếu notification đỏ 2 lần/ngày vì flaky thì sau 2 tuần cả team tắt thông báo, và lúc đó bộ test coi như không tồn tại. Nên trước khi mở rộng người nhận, em phải giảm flaky trước."

### Q31. "LỖI ĐÃ BIẾT 1" — quản lý known issue thế nào? Nó tồn tại bao lâu rồi?

> "`[Hiện em đánh dấu known issue trong report bằng tay — em biết test nào đang đỏ vì bug đã log và đang chờ dev fix, nên không tính nó là fail mới.]`
> Em biết cách này yếu: nó nằm trong đầu em, không ai khác đọc được, và không có hạn.
> **Cách em cho là đúng** và đang muốn làm: mỗi known issue phải có **ba thứ** — link bug ticket, lý do, và **ngày dự kiến fix**. Ghi ngay trong code chứ không ghi ngoài:

```typescript
test.fail('CF_14 [P0] Disconnect FB -> GMC button chuyển disabled', {
  annotation: { type: 'known-issue', description: 'BUG-123 — dev đang fix, dự kiến 20/10' },
}, async ({ page }) => { /* ... */ });
```

> **Dùng `test.fail`, không dùng `skip` hay `fixme`** — và đây là chỗ đáng kể trong phỏng vấn:
> `skip`/`fixme` thì test **không chạy**, nên mình mất coverage và **không biết lúc nào dev fix xong**.
> `test.fail` thì test **vẫn chạy và phải fail**. Nó được tính là 'đã biết' nên report không đỏ vì nó.
> Nhưng khi dev fix xong, test pass — và Playwright báo **đỏ** với thông báo `Expected to fail, but passed.`
> Tức là bộ test **tự nhắc** mình gỡ nhãn known-issue, known issue không thể bị bỏ quên vĩnh viễn.
> Em cũng kiểm là nó không làm dừng cả file dù bộ của em chạy `mode: 'serial'`.
> Và **review định kỳ** `[mỗi tuần khi họp sprint]`. Lý do em cho là quan trọng: known issue để lâu thì cả team quen với màu đỏ, rồi một hôm có fail thật không ai để ý. Nó biến report từ công cụ ra quyết định thành tiếng ồn.
> `[Trả lời thật câu "nó tồn tại bao lâu rồi" — và nếu đã lâu, nói luôn: "cái này treo [X tuần] rồi, đó là một trong những thứ em thấy quy trình của em còn dở."]`"

### Q32. "SKIP" — skip từ bao giờ, vì sao, bao giờ bật lại?

> **Câu bẫy, và repo bạn đang hở đúng chỗ này. Sửa trước khi đi phỏng vấn.**

> "Hiện bộ của em có **5 test đang skip, tất cả trong `install-app.spec.ts`**: `IA_00`, `IA_02`, `IA_03`, `IA_05`, `IA_08`.
> `[Lý do: mấy case này phụ thuộc trạng thái install của app — IA_00 phải uninstall rồi chờ 30 giây reinstall, nên nó làm hỏng trạng thái của các test chạy sau và mất rất nhiều thời gian. Em tách ra chạy tay khi cần.]`
> Và em nói thẳng một điểm yếu: **trong code em mới chỉ `test.skip(...)` mà chưa ghi lý do**, nên người khác đọc không biết tại sao. Đó là nợ em đang trả — việc đúng phải là ghi lý do và mốc thời gian ngay trong code:

```typescript
test.skip('IA_00 [P0] Nếu app đã có thì uninstall + đợi 30s + reinstall',
  async ({ page }) => { /* ... */ });
// → sửa thành:
test.fixme(
  'IA_00 [P0] uninstall + reinstall — làm bẩn trạng thái các test sau, ' +
  'chờ tách thành project riêng chạy trước. Ticket QA-45, dự kiến [ngày].',
  async ({ page }) => { /* ... */ }
);
```

> Em coi test skip là **nợ kỹ thuật ẩn**, nguy hiểm vì nó làm mình tưởng có coverage mà thực ra không: report ghi 'PASS 44' nhưng 5 luồng install không hề được kiểm.
> Nên nguyên tắc của em: skip phải có **lý do + ticket + ngày**, và review hàng tuần. Cái nào bỏ hẳn thì **xoá test**, không để skip vĩnh viễn."

> **Việc cần làm trước buổi phỏng vấn:** mở `install-app.spec.ts`, thêm lý do vào 5 chỗ skip đó. Rồi câu này từ bẫy thành điểm cộng — bạn kể được là bạn *đã* sửa.

### Q33. Tiêu chí "ĐẠT / KHÔNG ĐẠT" do ai định nghĩa? Fail 1 test có chặn release?

> "`[Hiện tiêu chí do em tự đặt: có bất kỳ test fail mới nào thì em đánh KHÔNG ĐẠT, known issue thì không tính.]`
> Em biết cách này có vấn đề: nó là **nhị phân**, mà không phải fail nào cũng nặng như nhau. Và quyết định release thì không nên phụ thuộc đánh giá của một người.
> **Và em tự nhận một điểm yếu thật:** test của em gắn nhãn priority trong tên — `[P0]`, `[P1]` — nhưng thực tế `[47 test là P0, chỉ 2 test là P1]`. Mọi thứ đều P0 thì tức là **chưa phân loại thật**, và lúc đó nhãn priority không giúp quyết định được gì.
> **Cách em cho là đúng:** tiêu chí do **QA và PO thống nhất**, không phải QA tự quyết, và phân theo severity:
> fail test **P0** — luồng chính, luồng dữ liệu, luồng tiền — thì **chặn release**;
> fail test **P1/P2** thì ghi nhận, đánh giá rủi ro, release được nhưng phải có ticket;
> và quyết định cuối cùng là của PO/lead dựa trên rủi ro, còn vai trò của em là **đưa thông tin đúng và đủ** để họ quyết — fail cái gì, ảnh hưởng ai, nếu release thì rủi ro còn lại là gì.
> Việc em muốn làm trước: **phân lại priority cho thật** — chỉ luồng nào mà hỏng là người dùng không dùng được sản phẩm thì mới P0."

### Q34. Bộ này chạy mất bao lâu? Nếu lên 500 test thì sao?

> "`[Hiện 44 test chạy khoảng [X phút].]` `[Đo trước khi phỏng vấn.]`
> Em biết nó **không scale theo cách hiện tại**, vì `workers: 1` — thời gian tăng tuyến tính theo số test. 500 test thì `[nhân hơn 10 lần]`, không ai chờ nổi.
> **Bốn việc em sẽ làm, theo thứ tự hiệu quả:**
> **Một, chia tầng và gắn tag:** `@smoke` cỡ `[5–8]` test chạy mỗi PR trong vài phút, `@critical` chạy sau mỗi deploy, full regression chạy ban đêm. Phần lớn giá trị nằm ở `[10%]` test đầu.
> **Hai, gộp test trùng đường code bằng data-driven.** Bộ của em có khoảng 10 case kiểu 'button X ở channel Y phải disabled theo Free plan' — gộp thành một test chạy theo bảng thì giảm số test mà không giảm coverage. 500 test viết phẳng thường thực chất là `[200]` test có ý nghĩa cộng với rất nhiều biến thể.
> **Ba, chạy song song** — nhưng với kiến trúc CDP attach hiện tại thì phải đổi trước: mỗi worker một profile và một cổng CDP riêng, hoặc `[mỗi worker một store dev riêng]`. Đây là việc nặng nhất nhưng là việc bắt buộc nếu muốn lên 500.
> **Bốn, chạy theo vùng ảnh hưởng** — dev sửa module feed thì chạy nhóm `CF_`/`CG_`, không chạy cả bộ. Và trên CI thì **shard** ra nhiều máy.
> Thứ em sẽ **không** làm là tăng số test cho đẹp báo cáo. 500 test mà 300 cái kiểm hiển thị thì chậm hơn mà không an toàn hơn."

### Q35. Bộ regression đã bắt được bug thật nào chưa? Kể một cái.

> **Câu chứng minh cả quy trình có giá trị hay không. Bắt buộc chuẩn bị trước — không có ví dụ là cả buổi phỏng vấn mất giá trị.**

**Khung kể, 60–90 giây:**
> "Có. `[Bộ regression chạy buổi sáng báo fail ở CF_12 — case kiểm sau khi xoá feed thì button '+ Connect account' ở GMC Sync phải enable lại.]`
> `[Em mở trace thì thấy button vẫn disabled dù feed đã xoá thành công. Em reproduce tay thì đúng như vậy.]`
> `[Nguyên nhân là hạn mức Free plan được tính theo một chỗ khác với chỗ cập nhật khi xoá feed, nên trạng thái không được tính lại.]`
> `[Tác động: merchant dùng Free plan xoá feed đi vẫn không tạo được feed mới — họ bị kẹt và sẽ nghĩ app lỗi.]`
> `[Bug này test tay rất khó phát hiện vì phải đi đúng chuỗi: tạo feed → hết hạn mức → xoá feed → kiểm lại đúng channel khác. Không ai test tay nhớ hết chuỗi đó mỗi lần.]`
> Em nghĩ đó là giá trị thật của bộ regression: nó không giỏi hơn em, nhưng nó **không bao giờ quên kiểm** `[44]` chuỗi đó, hai lần một ngày."

> `[THAY bằng bug thật của bạn. Nếu bộ test chưa bắt được bug nào thật — nói thật, kèm cái nó đã bắt được: "chưa bắt bug nghiệp vụ, nhưng nó đã bắt [vài lần regression do UI đổi làm luồng onboard vỡ] và [lần session/API hỏng mà team chưa biết]." Và nói rõ đó là điều bạn muốn cải thiện — vì bộ test chưa bắt được bug thật thì có nghĩa là assertion còn yếu hoặc đang test sai chỗ.]`

### Q36. Có bug nào lọt production mà regression lẽ ra phải bắt? Sau đó bạn làm gì?

> "`[Có — [kể bug]. Bộ test không bắt được vì [luồng đó chưa được phủ / assertion chỉ kiểm element hiện ra chứ không kiểm trạng thái].]`
> Phản xạ của em có 3 bước:
> **Một, viết ngay một test cho đúng case đó** — regression test cho bug. Để nó không bao giờ quay lại mà không ai biết. Em làm bước này trước cả khi dev fix xong, để test đỏ chính là bằng chứng bug còn đó, và xanh là bằng chứng fix thật.
> **Hai, hỏi câu quan trọng hơn: vì sao bộ test không phủ được chỗ đó.** Thường lý do có hệ thống, không phải ngẫu nhiên: `[em chỉ test từng màn hình riêng mà không test chuỗi trạng thái xuyên màn hình]`, hoặc `[assertion của em kiểm hiển thị chứ không kiểm trạng thái]`. Sửa cái nguyên nhân đó thì bắt được **cả nhóm** bug tương tự, chứ không chỉ một cái.
> **Ba, xem lại cả nhóm case cùng loại** để vá luôn.
> Em không coi bug lọt production là thất bại cá nhân — không bộ test nào phủ hết. Em coi nó là **thông tin về điểm mù của bộ test**, và mỗi lần như vậy bộ test phải tốt lên một chút. Chỉ số em theo dõi chính là cái này: cùng một loại bug có lọt lần thứ hai không."

---

## 8. Vòng đời bug

### Q37. Report pass/fail của bạn trông thế nào? Dev tự đọc được không?

> "Em dùng **Playwright HTML report** — `reporter: [['list'], ['html', { open: 'never' }]]` trong config. Mở bằng `npx playwright show-report`.
> Dev đọc được, và điểm quan trọng là **report đã chứa bằng chứng**: test nào fail, fail ở bước nào, **screenshot full page lúc fail**, và **trace** — em attach cả hai vào report từ fixture. Dev mở trace bằng `npx playwright show-trace` là xem lại được từng action kèm DOM snapshot, network request và console log tại đúng khoảnh khắc đó.
> Khác biệt thực tế rất lớn: trước đây em phải viết lại các bước bằng lời và thường nhận lại câu 'anh không reproduce được'. Giờ em gửi trace, dev tự thấy — `[em gần như không còn phải tranh luận về việc bug có thật không]`.
> Và tên test mang mã case (`CF_12 [P0] ...`) nên dev đọc report là biết luồng nghiệp vụ nào, không cần đọc code test.
> `[Chỗ còn thiếu: report hiện nằm trên máy em, chưa có nơi lưu tập trung để so sánh lịch sử giữa các lần chạy — đó là việc em muốn làm.]`"

### Q38. Từ fail → chốt thành bug, bạn làm gì ở giữa?

> "Em làm 5 việc, và **không bỏ bước nào**, vì log bug sai làm mất thời gian của cả dev lẫn mình.
> **Một, xác định đây là bug sản phẩm hay bug script** — xem kiểu lỗi, mở trace. Nếu là bug script thì em sửa, không log bug.
> **Hai, reproduce lại bằng tay trên UI.** Tay cũng lỗi thì chắc chắn; tay chạy ổn thì em nghi flaky và chạy lại vài lần.
> **Ba, thu hẹp điều kiện tái hiện.** Nó xảy ra với mọi `[plan]` hay chỉ `[Free plan]`, mọi channel hay chỉ `[GMC]`, lần nào cũng xảy ra hay `[1/5 lần]`. Bước này làm dev tiết kiệm nhiều thời gian nhất — và chính 'không phải lúc nào cũng xảy ra' đã là manh mối.
> **Bốn, kiểm đã có bug trùng chưa** và xác định **severity**.
> **Năm, viết ticket:** step rõ ràng, expected vs actual, môi trường, **mã case** (`CF_12`), kèm **trace và screenshot**. Và nói rõ **tác động tới người dùng**, không chỉ mô tả hiện tượng — `[merchant Free plan bị kẹt không tạo được feed mới]` thì dev và PO mới ưu tiên đúng."

### Q39. Dev báo fix xong, verify — chỉ chạy test đó hay cả bộ?

> "Em chạy **test đó cộng nhóm test quanh vùng ảnh hưởng**, không chạy một test lẻ.
> Lý do: fix hay làm vỡ chỗ khác, nhất là ở app của em vì trạng thái liên thông — `[sửa logic tính hạn mức Free plan thì ảnh hưởng cả Facebook, GMC, MMC và cả luồng xoá feed]`. Chạy đúng một test thì em chỉ biết 'cái đã báo đã hết', không biết 'có sinh ra cái mới không'.
> Cụ thể em làm: chạy `[nhóm CF_ hoặc CG_ tương ứng]` — `npx playwright test -g "CF_1"` hoặc chạy cả file spec đó. `[Mất vài phút, chấp nhận được.]`
> Rồi **để bộ full regression chạy ở lần kế tiếp** — `[15h30 hoặc sáng hôm sau]` — và em chỉ đóng bug sau khi lần full đó xanh.
> Em cũng **verify lại bằng tay** đúng case đó một lần nữa trước khi đóng, nếu nó là `[P0]`. Test xanh mà tay vẫn lỗi là chuyện có xảy ra — thường vì assertion của em chưa kiểm đúng cái cần kiểm, và đó cũng là dịp để em sửa test cho chặt hơn."

### Q40. Có task nào không bao giờ hết bug không? Lúc đó quyết định thế nào?

> "Có, và em nghĩ gần như task nào đủ lớn cũng vậy — luôn còn bug nhỏ về `[hiển thị, copy, trường hợp hiếm]`. Nếu tiêu chí là 'zero bug mới release' thì không bao giờ release được.
> Nên em không dùng tiêu chí 'hết bug', em dùng **phân loại severity**:
> bug **chặn luồng chính**, mất dữ liệu, sai tiền, hoặc lỗ hổng bảo mật → phải fix trước khi release;
> bug ảnh hưởng một phần người dùng nhưng có **cách làm khác** → đánh giá rủi ro, có thể release kèm ghi chú;
> bug nhỏ về hiển thị, trường hợp hiếm → vào backlog, có ticket, không chặn.
> **Và quyết định release không phải của em.** Nó thuộc PO hoặc QA lead, dựa trên rủi ro và cả yếu tố kinh doanh — deadline, cam kết với khách. Việc của em là làm cho quyết định đó **có thông tin đúng**: còn bao nhiêu bug, mức nào, ảnh hưởng ai, và **phần nào em chưa test được**.
> Điều em giữ chắc là: em không bao giờ nói 'ổn rồi' khi em chưa test xong, và không im lặng về rủi ro còn lại. Chấp nhận rủi ro là quyền của họ, nhưng họ phải biết mình đang chấp nhận cái gì.
> Thực tế cách em làm là `[trước release em gửi một bản tóm tắt: đã test gì, bug còn mở nào mức nào, phần nào chưa phủ]`."

---

## 9. Rủi ro & tính bền

### Q41. Nếu mai bạn nghỉ, ai maintain được bộ test này?

> **Thừa nhận thật — đây là điểm yếu lớn nhất của setup hiện tại.**

> "Thật lòng thì **hiện tại khó**, và em nói rõ vì sao để thấy em biết mình đang thiếu gì.
> **Cái đã có:** toàn bộ code trong Git; test đặt tên theo mã case nên đọc report hiểu được không cần đọc code; `[file test case trong repo]`; `[script npm run login để dựng lại session]`; và `[trong mấy file khó có comment giải thích tại sao phải làm vậy — vì sao chỉ chạy một test một lúc, vì sao phải dọn trạng thái Chrome trước khi mở]`.
> **Cái còn thiếu:**
> **Không có README** — người mới clone về không biết chạy gì trước, không biết phải `npm run login` một lần trước khi test. Đây là lỗ hổng lớn nhất và cũng là cái dễ sửa nhất.
> Setup phụ thuộc **máy em**: Chrome thật, profile `.auth-profile` là session của `[account của em]`, và `.auth-profile` không ở trong Git (đúng về bảo mật, nhưng nghĩa là người khác phải tự dựng lại).
> **Chỉ em hiểu phần CDP** — đây là phần không chuẩn so với Playwright thông thường, nên người mới đọc sẽ bỡ ngỡ.
> Lịch chạy nằm trên máy em.
> **Việc em làm nếu có thêm thời gian, theo thứ tự:** viết README đủ để người khác chạy được từ đầu; `[đưa lịch chạy lên runner dùng chung]`; và `[hướng dẫn cho một bạn trong team chạy + đọc report]` — vì tài liệu không thay được việc có người thứ hai từng chạy nó thật."

> Nói "chưa có, và đây là thứ em sắp làm" **tốt hơn nhiều** so với nói "có README, có tài liệu" rồi họ hỏi "cho xem".

### Q42. UI thay đổi lớn, 30 test vỡ. Bảo Claude sinh lại từ đầu hay sửa?

> "**Sửa, không sinh lại.** Sinh lại từ đầu mỗi lần UI đổi là dấu hiệu kiến trúc test kém — và nó còn mất luôn những gì mình đã học được qua từng lần sửa.
> Cách em làm: mở trace của vài test vỡ để **tìm nguyên nhân chung**. 30 test vỡ cùng lúc thì gần như chắc chắn chỉ có `[2–3]` nguyên nhân gốc, không phải 30 — thường là một selector dùng khắp nơi, hoặc một bước trong luồng onboard bị thêm/bỏ. Sửa đúng nguyên nhân gốc là xanh lại phần lớn.
> **Và em nói thẳng tình trạng của bộ em: em chưa dùng Page Object Model.** Em có `tests/app-helpers.ts` — một **lớp helper dùng chung** với các hàm như `appFrame()`, `dismissChatbot()`, `autoInstall()`, `ensureFreshInstall()`, `assertAppInstalled()`. Nó đã giúp em không lặp lại logic nhiều bước, và nó là lý do `[khi app đổi luồng install em chỉ sửa một hàm]`.
> **Nhưng selector thì vẫn nằm rải trong từng spec**, nên UI đổi một button dùng ở 10 test là em phải sửa 10 chỗ. Em đang đau đúng chỗ đó.
> **Em muốn refactor sang POM:** gom locator của từng page vào một class — `OnboardWizardPage`, `FacebookSyncPage`, `PricingPage` — để mỗi element có **một chỗ định nghĩa duy nhất**. Lúc đó UI đổi là sửa một dòng. Em chưa làm vì `[ưu tiên phủ thêm luồng trước]`, nhưng với `[44]` test trở lên thì đây là việc phải làm, và em muốn làm trước khi bộ test lớn thêm — refactor 44 test còn dễ, 200 test thì rất đau.
> Về việc nhờ AI: em dùng nó để **sửa**, và em đưa cho nó trace cùng đoạn DOM mới chứ không chỉ nói 'test fail sửa hộ'. Nhờ nó sinh lại từ đầu thì em mất quyền kiểm soát việc assertion còn đúng ý mình nữa hay không."

### Q43. Bạn đo chất lượng bộ test bằng gì?

> "Không phải bằng số test, cũng không phải pass rate — hai cái đó dễ gây ảo tưởng nhất. Em có thể viết 200 test kiểm heading hiển thị đúng chữ: số đẹp, pass rate 100%, mà không bảo vệ được gì. Pass rate cao cũng có thể chỉ có nghĩa là assertion yếu.
> Em nhìn 5 chỉ số:
> **Số bug thật bắt được** — chỉ số quan trọng nhất, nó trả lời 'bộ này có đáng tồn tại không'.
> **Bug lọt production mà bộ test lẽ ra phải bắt** — chỉ số đau nhất nhưng trung thực nhất. Nó đo điểm mù.
> **Tỷ lệ flaky** — test hay đỏ-oan ăn mòn niềm tin nhanh hơn mọi thứ; bộ test không ai tin thì coi như không có.
> **Thời gian chạy** — nó quyết định bộ test được chạy mấy lần một ngày, mà tần suất mới là nơi ra giá trị.
> **Thời gian từ lúc fail tới lúc có người xử lý** — report không ai đọc thì bằng không.
> Và một phép thử em thấy rất thật: **cố tình gài một lỗi vào sản phẩm, bộ test có bắt được không.** Đó là tinh thần của mutation testing, và nó đo đúng cái mình muốn biết — chứ không phải đếm xem có bao nhiêu test."

### Q44. Quy trình này có nhược điểm gì? Nếu làm lại, bạn đổi gì?

> **Câu gần cuối buổi, rất hay được hỏi. Có sẵn 3–4 ý thật, xếp theo mức quan trọng. Đây là câu bạn chủ động kiểm soát được ấn tượng cuối cùng.**

> "Em có mấy nhược điểm em thấy rõ, xếp theo mức em muốn sửa trước.
> **Một, nó phụ thuộc vào em quá nhiều.** Chạy trên máy em, notification tới desktop em, session là account em, và chỉ em hiểu phần CDP. Em nghỉ là bộ test dừng. Đây là nhược điểm lớn nhất và em sửa trước: viết README, đưa lịch chạy lên `[runner dùng chung]`, đẩy notification vào kênh team.
> **Hai, chạy theo giờ chứ không theo deploy.** Nên khi đỏ em phải lần trong nửa ngày thay đổi để tìm nguyên nhân. Em muốn trigger theo deploy, cộng một bộ smoke chạy mỗi PR.
> **Ba, selector nằm rải trong spec, chưa có POM.** UI đổi là sửa nhiều chỗ. Em muốn refactor sớm, trước khi bộ test lớn thêm.
> **Bốn, 5 test đang skip và priority chưa phân loại thật** — `[47 P0, 2 P1]`. Cả hai làm report kém tin cậy: em tưởng có coverage mà không có, và nhãn priority không giúp quyết định được gì.
> **Năm, mọi thứ đều đi qua UI.** Dựng dữ liệu bằng cách click qua từng bước thì chậm và dễ vỡ. Em muốn thêm **API để setup data** — gọi API tạo trạng thái cần thiết rồi mới dùng UI để verify đúng cái mình muốn test. Nhanh hơn và ổn định hơn nhiều.
> **Nếu làm lại từ đầu**, thứ em đổi sớm nhất là `[tách phần dựng dữ liệu ra khỏi UI, và dựng POM ngay từ test thứ 10 chứ không chờ tới 44]`. Hai cái đó rẻ lúc đầu và rất đắt khi sửa sau."

---

## 10. Câu nhạy cảm nhất: "không tự viết được script, giá trị của bạn là gì?"

**Học thuộc ý, đừng học thuộc chữ. 90 giây, và phải có đủ 4 phần:**

> "Phần quyết định chất lượng của việc test là **test case** — biết cần kiểm gì, rủi ro nằm ở đâu, edge case nào dễ vỡ. Phần đó em tự làm và tự chịu trách nhiệm, AI không làm được vì nó không biết nghiệp vụ và không biết chỗ nào hay hỏng.
>
> AI giúp em phần gõ code. Nhưng code nó sinh ra em **phải review theo tiêu chí 'nó có bắt được lỗi không', không phải 'nó có chạy được không'** — và em **cố tình làm test fail** để chắc chắn nó thật sự bắt được. AI hay viết assertion dễ pass: kiểm element tồn tại thay vì kiểm trạng thái. `[Ví dụ nó viết `toBeVisible()` cho button mà case của em cần `toBeDisabled()` — visible thì luôn đúng, kể cả khi bug.]`
>
> Và khi test fail, phần phân biệt **bug sản phẩm với bug script** là của em: đọc trace, reproduce tay, thu hẹp điều kiện. AI không làm được việc đó vì nó không mở được app lên xem.
>
> Về mức của em: em **đọc và sửa được** selector, assertion, wait, fixture, config, và đọc trace để debug. Cái em còn yếu là tự viết từ đầu phần phức tạp — `[fixture CDP, POM]` — và đó là thứ em đang học, cụ thể bằng cách `[tự viết lại helper không nhìn, và bắt AI giải thích tại sao nó chọn cách đó]`.
>
> Kết quả cụ thể: bộ `[44]` test chạy `[2 lần/ngày]`, đã bắt được `[bug cụ thể — kể 1 câu]`, và `[giảm thời gian kiểm luồng chính từ 2–3 tiếng tay xuống [X] phút]`."

**Bốn phần bắt buộc, kiểm lại trước khi nói:**
1. **Phân định rõ phần nào là của bạn** (test case, review, debug, quyết định) và phần nào là AI (gõ code).
2. **Chứng minh bạn kiểm soát được output của AI** — có ví dụ cụ thể, không nói chung.
3. **Thừa nhận thật giới hạn** kèm việc bạn đang làm để thu hẹp. Phóng đại ở đây là tự sát, vì phần đọc code sẽ kiểm chứng ngay.
4. **Một kết quả có số.**

**Và đừng:** xin lỗi, tự hạ thấp ("em cũng chỉ biết dùng AI thôi"), hay chống chế ("ai giờ cũng dùng AI mà"). Trả lời bình thường như mô tả một cách làm việc — vì đúng là vậy.

---

## 11. Checklist chuẩn bị

**Làm theo thứ tự này. Nếu chỉ còn 2 tiếng thì làm 4 việc đầu.**

- [ ] **Sửa 5 chỗ `test.skip` trong `install-app.spec.ts`**: thêm lý do + ticket + mốc thời gian. Biến [Q32](#q32-skip--skip-từ-bao-giờ-vì-sao-bao-giờ-bật-lại) từ bẫy thành điểm cộng.
- [ ] **Chạy `npx playwright test` và ghi lại con số thật**: bao nhiêu test, mất bao lâu, bao nhiêu pass/fail/skip. Dùng một con số duy nhất suốt buổi ([Q28](#q28-bộ-test-chạy-ở-đâu--máy-bạn-server-hay-ci), [Q34](#q34-bộ-này-chạy-mất-bao-lâu-nếu-lên-500-test-thì-sao)).
- [ ] **Chuẩn bị 1 bug thật bộ regression đã bắt được**, kể được 60–90 giây có nguyên nhân và tác động — [Q35](#q35-bộ-regression-đã-bắt-được-bug-thật-nào-chưa-kể-một-cái). Thiếu cái này là mất giá trị cả buổi.
- [ ] **Luyện đọc code chỉ ra lỗi** — [phần 6](#6-đọc-code-tại-chỗ). Quan trọng nhất, bù trực tiếp cho điểm yếu lớn nhất.
- [ ] **Mở đọc lại 4 file của chính mình**: `playwright.config.ts`, `globalSetup.ts`, `tests/fixtures.ts`, `tests/app-helpers.ts`. Phải giải thích được **tại sao** từng đoạn có ở đó, nhất là `workers: 1` và chuyện trace không áp dụng cho context CDP.
- [ ] **Dùng thật `npx playwright show-trace`** vài lần — làm fail một test rồi mở trace xem. Nhắc tới nó mà chưa từng mở là lộ.
- [ ] Chuẩn bị câu trả lời về **policy bảo mật khi dùng AI** — [Q18](#q18-bạn-có-gửi-code-nội-bộ-hoặc-dữ-liệu-thật-của-công-ty-cho-ai-không-policy-công-ty-là-gì). Biết `.gitignore` của mình loại những gì.
- [ ] **Biết Page Object Model là gì** dù chưa dùng, và nói đúng rằng mình có *helper layer* chứ không phải POM — [Q42](#q42-ui-thay-đổi-lớn-30-test-vỡ-bảo-claude-sinh-lại-từ-đầu-hay-sửa).
- [ ] Chuẩn bị **3–4 nhược điểm thật kèm hướng sửa** — [Q44](#q44-quy-trình-này-có-nhược-điểm-gì-nếu-làm-lại-bạn-đổi-gì).
- [ ] Có sẵn **con số cho mọi câu "bao lâu"**: một task mấy tiếng, bộ test mấy phút, tiết kiệm bao nhiêu.

### Nguyên tắc xuyên suốt

- **Trung thực về mức độ dùng AI.** Nói dối ở đây rất dễ lộ, và mất điểm nặng hơn nhiều so với thừa nhận.
- Mỗi lần nói về AI, **gắn liền với cách bạn kiểm soát nó**. Không để câu nào dừng ở "AI làm hộ em".
- **Chủ động nêu điểm yếu kèm hướng khắc phục trước khi họ moi ra.** Nó đổi hẳn vị thế: từ ứng viên bị thẩm vấn thành người đang kể về hệ thống mình đang xây.
- Luôn quay về **kết quả**: bug bắt được, thời gian tiết kiệm, bug không lọt production.
- **Kể sự cố thật, không kể chi tiết code.** Chuyện "cả bộ đỏ vì Chrome lần trước tắt đột ngột", "chatbot che button làm test fail", "phiên đăng nhập hết hạn" là thứ **không ai bịa được** và bạn kể được bằng lời thường. Đó mới là bằng chứng bạn vận hành hệ thống này thật — không phải việc thuộc tên hàm.
- **Giữ đúng mức đã nêu ở [đầu file](#nguyên-tắc-của-cả-file-chỉ-nói-tới-mức-bạn-tự-bảo-vệ-được)** suốt cả buổi. Trả lời một câu vượt mức là họ sẽ đào sâu đúng chỗ đó.
