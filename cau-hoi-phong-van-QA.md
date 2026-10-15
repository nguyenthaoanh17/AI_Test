# Bộ câu hỏi phỏng vấn QA — Manual (2+ năm) + Automation mức cơ bản

> Cách dùng file này:
> - Dấu ⭐ = gần như chắc chắn bị hỏi, ưu tiên chuẩn bị trước.
> - Chỗ có `[...]` là phải điền thông tin thật của mình vào. Đây mới là phần ăn điểm.
> - Ôn theo thứ tự: Phần 1 → 2 → 3 là đã phủ phần lớn buổi phỏng vấn.
> - Phần 9, 10 (automation) chỉ cần đọc hiểu, không cần học thuộc.

## Mục lục

1. [Bản thân và kinh nghiệm](#1-bản-thân-và-kinh-nghiệm)
2. [Thiết kế test case](#2-thiết-kế-test-case)
3. [Bug và quy trình xử lý](#3-bug-và-quy-trình-xử-lý)
4. [Khái niệm và loại test](#4-khái-niệm-và-loại-test)
5. [Quy trình và phối hợp](#5-quy-trình-và-phối-hợp)
6. [Kỹ thuật cơ bản: API, SQL, DevTools](#6-kỹ-thuật-cơ-bản-api-sql-devtools)
7. [Tình huống xử lý](#7-tình-huống-xử-lý)
8. [Câu hỏi mức 2+ năm kinh nghiệm](#8-câu-hỏi-mức-2-năm-kinh-nghiệm)
9. [Automation — mức hỏi không sâu](#9-automation--mức-hỏi-không-sâu)
10. [Phân loại test fail qua trace](#10-phân-loại-test-fail-qua-trace)
11. [Câu hỏi nên hỏi lại nhà tuyển dụng](#11-câu-hỏi-nên-hỏi-lại-nhà-tuyển-dụng)
12. [Lưu ý khi trả lời](#12-lưu-ý-khi-trả-lời)

---

# 1. Bản thân và kinh nghiệm

### ⭐ Giới thiệu về bản thân

> Em là `[tên]`, có `[số]` năm làm QA. Dự án gần nhất em làm là `[loại sản phẩm]`. Em phụ trách test phần `[module cụ thể]`. Công việc chính của em là đọc requirement, tự viết test case, test chức năng mới, chạy regression trước release và log bug theo dõi tới khi fix xong. Gần đây em bắt đầu tìm hiểu automation với Playwright để tự động hóa các case regression lặp lại nhiều.

Giữ trong 45–60 giây. Nhấn vào việc **mình tự viết test case** — đó là điểm mạnh thật.

### ⭐ Dự án gần nhất của bạn là gì?

Nói liền mạch theo 4 ý:
1. Sản phẩm làm gì, dành cho ai
2. Team bao nhiêu người, bao nhiêu QA
3. Mình phụ trách module nào
4. Quy trình: nhận requirement từ `[BA/PM]` → viết test case → test trên `[staging]` → log bug trên `[Jira]` → release theo `[sprint 2 tuần]`

### ⭐ Mô tả một ngày làm việc của bạn

> Buổi sáng em check mail và Jira xem bug nào được fix để retest trước. Sau đó em test các task mới dev đã đẩy lên môi trường test. Nếu có chức năng mới chưa có test case thì em đọc requirement và viết case trước khi test. Có bug thì em log kèm step, ảnh và dữ liệu test. Cuối ngày em cập nhật trạng thái test case và báo cáo lại phần đã test được. Gần ngày release thì em dành thời gian chạy regression các chức năng chính.

### ⭐ Kể về một bug bạn tâm đắc nhất

Cấu trúc: **bối cảnh → nghi ngờ gì → làm gì để chứng minh → hậu quả nếu lọt ra**

> Khi test chức năng `[...]`, em thấy case chính chạy đúng nhưng em thử `[thao tác bất thường: bấm submit 2 lần / nhập số âm / thoát giữa luồng rồi vào lại]`. Kết quả là `[dữ liệu lưu 2 lần / số tiền tính sai]`. Em kiểm tra lại trên database thì thấy `[...]`. Bug này nếu lọt ra thì ảnh hưởng trực tiếp đến `[tiền / dữ liệu khách hàng]`, nên được fix ngay trong sprint đó.

Chọn bug tìm ra **nhờ chủ động thử ngoài test case**, không phải bug hiển nhiên.

### Không có tài liệu thì bạn test thế nào?

> Em tìm thông tin từ nhiều nguồn: hỏi trực tiếp BA hoặc dev về mục đích của chức năng, xem các chức năng tương tự đã có, xem phiên bản cũ nếu là chức năng được sửa. Em cũng tự dùng thử như một người dùng thật để hiểu luồng. Sau đó em viết checklist những điểm em hiểu được rồi gửi lại BA hoặc dev xác nhận. Cách này vừa giúp em test được, vừa làm rõ requirement cho cả team.

### Chức năng nào bạn thấy khó test nhất?

> Với em là `[thanh toán / tính phí / phân quyền]`, vì nó phụ thuộc nhiều điều kiện cùng lúc và liên quan tới hệ thống bên ngoài. Em phải liệt kê các tổ hợp điều kiện ra bảng để không bỏ sót, và phải chuẩn bị nhiều bộ dữ liệu khác nhau. Nó cũng khó vì không phải lúc nào cũng tái hiện được, nên em phải lưu lại dữ liệu và thời điểm test để đối chiếu.

Lý do khó phải là lý do kỹ thuật/nghiệp vụ, không phải "vì em chưa biết".

### Vì sao bạn chọn làm QA? Điểm mạnh của bạn?

> Em thấy mình phù hợp vì em kỹ tính và hay đặt câu hỏi "nếu người dùng làm khác đi thì sao". Điểm mạnh của em là viết test case có hệ thống và bám bug tới khi fix xong. Em cũng khá thoải mái khi phải trao đổi với dev để làm rõ vấn đề.

Tránh câu sáo rỗng kiểu "vì em thích tìm lỗi".

### Vì sao bạn muốn chuyển việc / vào công ty này?

Nói về **hướng phát triển**, không nói xấu chỗ cũ.
> Ở chỗ cũ em làm chủ yếu manual và em muốn đi sâu hơn về `[automation / test API / nghiệp vụ lĩnh vực này]`. Em thấy vị trí này có `[điểm cụ thể]` nên phù hợp với hướng em muốn đi.

---

# 2. Thiết kế test case

**Nguyên tắc chung — luôn mở đầu bằng việc hỏi lại requirement:**

> Trước khi viết em xin hỏi lại vài điểm: `[...]`. Sau đó em sẽ chia test case thành các nhóm: trường hợp đúng, trường hợp sai, trường hợp biên, và các điểm liên quan như giao diện, phân quyền, bảo mật cơ bản.

Nói **có hệ thống** quan trọng hơn liệt kê được nhiều.

---

## ⭐ Test case cho chức năng ĐĂNG NHẬP

**Hỏi trước:** Có giới hạn số lần đăng nhập sai không? Có yêu cầu định dạng mật khẩu không? Đăng nhập bằng email và cả số điện thoại? Có "ghi nhớ đăng nhập"?

**Trường hợp đúng**
- Đúng email + đúng mật khẩu → vào được, hiển thị đúng tên người dùng
- Đăng nhập với các quyền khác nhau (admin, user thường) → vào đúng trang theo quyền

**Trường hợp sai**
- Đúng email, sai mật khẩu → báo lỗi
- Email không tồn tại → báo lỗi
- Để trống email / mật khẩu / cả hai → báo lỗi bắt buộc nhập
- Email sai định dạng (thiếu @, thiếu phần sau @) → báo lỗi định dạng
- Tài khoản bị khóa / chưa kích hoạt → báo lỗi đúng nguyên nhân
- Sai mật khẩu quá số lần cho phép → khóa tạm thời

**Trường hợp biên**
- Mật khẩu: đúng độ dài tối thiểu, dưới tối thiểu 1 ký tự, đúng tối đa, vượt tối đa 1 ký tự
- Email dài tối đa cho phép
- Khoảng trắng ở đầu/cuối email → hệ thống xử lý thế nào

**Liên quan**
- Mật khẩu hiển thị dạng dấu chấm; nút xem/ẩn hoạt động đúng
- Phân biệt chữ hoa chữ thường ở mật khẩu
- Nhấn Enter có đăng nhập được không
- Bấm nút đăng nhập 2 lần liên tiếp → không tạo 2 phiên
- Thông báo lỗi không tiết lộ quá cụ thể "email không tồn tại" hay "mật khẩu sai" (bảo mật)
- Sau khi đăng xuất, bấm Back → không được vào lại trang bên trong
- Dán URL trang bên trong khi chưa đăng nhập → bị đẩy về login
- Kiểm tra trên các trình duyệt chính và trên mobile

---

## ⭐ Test case cho Ô TÌM KIẾM

**Hỏi trước:** Tìm theo trường nào? Tìm chính xác hay gần đúng? Phân biệt hoa/thường, có dấu/không dấu? Có gợi ý tự động?

**Đúng**
- Từ khóa có kết quả → hiển thị đúng kết quả liên quan
- Tìm bằng một phần từ khóa → vẫn ra kết quả (nếu yêu cầu tìm gần đúng)
- Chữ hoa / chữ thường → kết quả giống nhau
- Có dấu / không dấu → kết quả giống nhau (nếu có yêu cầu)

**Sai / không có kết quả**
- Từ khóa không tồn tại → thông báo "không tìm thấy", không hiện trang lỗi
- Để trống rồi bấm tìm → báo lỗi hoặc hiện toàn bộ, nhưng phải nhất quán
- Chỉ nhập khoảng trắng → xử lý như để trống
- Ký tự đặc biệt → không lỗi hệ thống

**Biên**
- Nhập 1 ký tự
- Đúng số ký tự tối đa, và vượt tối đa
- Từ khóa khớp rất nhiều kết quả → kiểm tra phân trang và tốc độ

**Liên quan**
- Kết quả đúng thứ tự ưu tiên như yêu cầu
- Gợi ý tự động đúng và chọn được
- Kết hợp tìm kiếm với bộ lọc, với sắp xếp
- Sau khi tìm bấm Back → giữ lại từ khóa hay mất
- Nhập đoạn mã script hoặc câu lệnh SQL → không lỗi, không thực thi (bảo mật cơ bản)

---

## ⭐ Test case cho UPLOAD FILE

**Hỏi trước:** Định dạng nào được phép? Dung lượng tối đa? Upload nhiều file cùng lúc? Giới hạn kích thước ảnh?

**Đúng**
- File đúng định dạng, dung lượng hợp lệ → thành công, hiển thị đúng file
- Upload từng định dạng được cho phép → đều thành công
- Upload nhiều file cùng lúc (nếu cho phép)
- Upload xong, tải lại trang → file vẫn còn

**Sai**
- Sai định dạng (cần ảnh mà chọn .exe, .zip) → báo lỗi rõ ràng
- Vượt dung lượng tối đa → báo lỗi, nói rõ giới hạn
- File rỗng (0 KB) → báo lỗi
- File bị đổi đuôi (.txt đổi thành .jpg) → hệ thống phải phát hiện
- Tên file quá dài / ký tự đặc biệt / có dấu tiếng Việt
- Không chọn file mà bấm upload → báo lỗi

**Biên**
- File đúng dung lượng tối đa → phải thành công
- Vượt tối đa một chút → phải báo lỗi
- Ảnh kích thước rất nhỏ và rất lớn

**Liên quan**
- Thanh tiến trình, trạng thái đang xử lý khi file lớn
- Hủy giữa lúc upload → xử lý đúng, không lưu file lỗi
- Mất mạng giữa lúc upload → báo lỗi, không treo
- Xóa file đã upload rồi upload lại
- Upload cùng tên file 2 lần → ghi đè hay tạo bản mới
- Tải file về kiểm tra mở được và đúng nội dung

---

## ⭐ Test case cho FORM ĐĂNG KÝ (tên, email, SĐT, mật khẩu)

**Đúng**
- Nhập hợp lệ tất cả field → đăng ký thành công, nhận mail/OTP xác nhận nếu có
- Kiểm tra dữ liệu được lưu đúng trong hệ thống

**Sai — theo từng field**
- **Tên**: để trống; có số hoặc ký tự đặc biệt; quá dài; chỉ có khoảng trắng
- **Email**: để trống; sai định dạng; đã tồn tại; có chữ hoa (xử lý nhất quán)
- **SĐT**: để trống; có chữ; thiếu số; thừa số; đầu số không hợp lệ; đã tồn tại
- **Mật khẩu**: để trống; ngắn hơn tối thiểu; không đủ điều kiện (thiếu chữ hoa/số/ký tự đặc biệt); mật khẩu và xác nhận không khớp

**Liên quan**
- Thông báo lỗi hiện đúng dưới field bị lỗi
- Nhập sai rồi sửa đúng → thông báo lỗi biến mất
- Bấm submit nhiều lần → không tạo nhiều tài khoản trùng
- Tab đi đúng thứ tự các field
- Trường bắt buộc có dấu đánh dấu rõ ràng
- Link xác nhận trong email: còn hiệu lực, dùng 2 lần thì sao, hết hạn thì sao

---

## Các chức năng khác hay được hỏi

- Thêm vào giỏ hàng / thanh toán
- Đổi mật khẩu
- Nút "Xuất file Excel" của một danh sách
- Phân trang
- Nút Like trên bài viết

Đều áp dụng cùng khung: **hỏi requirement → đúng → sai → biên → liên quan**.

---

## Test case cho "cái bút" / thang máy / ATM (câu kiểm tra tư duy)

Họ xem bạn có chia nhóm được không, không cần đáp án đúng.

> Em chia thành mấy nhóm. **Chức năng**: bút viết được không, viết trên giấy thường/giấy bóng, mực ra đều không, bật tắt nắp được không. **Giao diện và cảm nhận**: cầm có vừa tay, nhìn có đúng mô tả. **Độ bền**: viết liên tục bao lâu thì hết mực, rơi từ độ cao bao nhiêu thì hỏng, để lâu không dùng còn viết được không. **Điều kiện bất thường**: viết khi trời lạnh/nóng, viết ngược chiều, viết trên tường. **An toàn**: mực có độc không, chi tiết nhỏ có gây nguy hiểm cho trẻ không.

Thêm câu này để ăn điểm:
> Trước khi test em cũng cần biết đây là bút dành cho ai và yêu cầu kỹ thuật là gì, vì bút cho trẻ em và bút cao cấp sẽ có tiêu chí khác nhau.

---

# 3. Bug và quy trình xử lý

### ⭐ Một bug report của bạn gồm gì?

> Em thường ghi: tiêu đề ngắn gọn nói đúng vấn đề; môi trường test và phiên bản; tài khoản và dữ liệu em dùng; các bước tái hiện đánh số rõ ràng; kết quả thực tế; kết quả mong đợi; mức độ severity và priority; kèm ảnh chụp hoặc video, và nếu lỗi liên quan tới dữ liệu thì em kèm cả response của API hoặc log. Em cố gắng viết để dev đọc là tái hiện được ngay, không cần hỏi lại.

### ⭐ Severity và Priority khác nhau thế nào?

> Severity là mức độ nghiêm trọng về kỹ thuật — lỗi này phá vỡ hệ thống đến đâu. Priority là mức độ cần fix gấp — nên sửa trước hay sau, do PM hoặc team quyết dựa vào ảnh hưởng tới người dùng và kế hoạch release.

**Severity cao, priority thấp:** chức năng xuất báo cáo bị crash hoàn toàn, nhưng là báo cáo cuối năm, hiện chưa ai dùng → để sprint sau fix.

**Severity thấp, priority cao:** tên công ty viết sai chính tả trên trang chủ. Kỹ thuật không ảnh hưởng gì nhưng ai cũng thấy, ảnh hưởng hình ảnh → sửa ngay.

### ⭐ Dev bảo "không tái hiện được" thì bạn làm gì?

> Đầu tiên em không tranh luận ngay mà kiểm tra lại phía mình: em test trên môi trường nào, phiên bản nào, tài khoản và dữ liệu gì — vì nhiều khi dev test trên môi trường hoặc dữ liệu khác. Em thử tái hiện lại một lần nữa, nếu còn thì em quay video kèm theo và ghi rõ đầy đủ các điều kiện. Nếu vẫn không được, em ngồi cùng dev tái hiện trực tiếp trên máy em. Nếu lỗi chỉ xảy ra một lần và không lặp lại, em vẫn ghi nhận lại kèm bằng chứng và thời điểm để dev kiểm tra log, chứ không đóng bug luôn.

### ⭐ Dev bảo "không phải bug" nhưng bạn tin là bug?

> Em sẽ quay về tài liệu requirement để đối chiếu. Nếu requirement ghi rõ thì em chỉ ra đúng chỗ đó. Nếu requirement không nói rõ thì vấn đề không phải ai đúng ai sai, mà là requirement chưa đủ, nên em đưa BA hoặc PM vào để xác nhận hành vi đúng là gì. Em cũng trình bày theo góc độ ảnh hưởng tới người dùng chứ không tranh luận đúng sai. Sau khi có kết luận thì cập nhật lại tài liệu để lần sau không lặp lại.

### Vòng đời của một bug

> New → Assigned → In Progress → Fixed → QA retest → Closed nếu đã đúng, hoặc Reopen nếu vẫn còn lỗi. Ngoài ra còn các nhánh: Rejected khi dev xác định không phải lỗi, Duplicate khi đã có người log trùng, Deferred khi đồng ý là lỗi nhưng để sau fix.

### Sắp release mà tìm ra bug nặng, PM muốn release đúng hạn?

> Việc của em là cung cấp thông tin đủ để người quyết định có thể quyết đúng, chứ không phải tự quyết. Em sẽ trình bày rõ: lỗi này xảy ra trong trường hợp nào, có bao nhiêu người dùng gặp phải, hậu quả là gì — mất dữ liệu, sai tiền, hay chỉ ảnh hưởng giao diện. Em cũng tìm xem có cách nào tạm thời đi đường khác được không. Nếu PM quyết vẫn release thì em ghi nhận lại thành rủi ro đã biết, có xác nhận của PM, và theo dõi sau release.

### Bug lọt ra production, khách hàng phát hiện?

> Trước mắt em ưu tiên xác định phạm vi ảnh hưởng và tái hiện để team fix nhanh. Sau khi xử lý xong, em xem lại vì sao mình bỏ sót: do thiếu test case, do requirement không rõ, hay do môi trường test khác production. Rồi em bổ sung test case cho trường hợp đó vào bộ regression để chắc chắn không lặp lại. Em coi đó là việc cải thiện quy trình, không phải tìm người để quy trách nhiệm.

### Làm sao viết step tái hiện mà dev đọc là làm được ngay?

> Em ghi từ điểm bắt đầu rõ ràng — đăng nhập bằng tài khoản nào, đang ở trang nào — rồi đánh số từng bước, mỗi bước một hành động. Em ghi kèm dữ liệu cụ thể em đã nhập chứ không viết chung là "nhập dữ liệu không hợp lệ". Cuối cùng là kết quả thực tế và kết quả mong đợi tách riêng. Nếu lỗi chỉ xảy ra trong điều kiện đặc biệt thì em ghi rõ điều kiện đó ngay đầu bug.

---

# 4. Khái niệm và loại test

### ⭐ Retest và Regression khác nhau?

> Retest là test lại đúng chỗ vừa được fix để xác nhận lỗi đã hết. Regression là test lại các chức năng khác xung quanh để chắc chắn bản fix đó không làm hỏng thứ đang chạy tốt. Retest chỉ làm trên bug cụ thể, regression làm rộng hơn và thường lặp lại mỗi lần release — nên đây cũng là phần thích hợp nhất để tự động hóa.

### ⭐ Smoke và Sanity khác nhau?

> Smoke test là kiểm tra nhanh xem bản build có dùng được không trước khi test sâu — đăng nhập được chưa, các trang chính mở được chưa. Nếu smoke fail thì em trả build lại cho dev chứ không test tiếp, vì test tiếp cũng vô nghĩa. Sanity test là kiểm tra nhanh một chức năng cụ thể sau khi có thay đổi nhỏ, để xem phần đó hoạt động hợp lý hay không trước khi test chi tiết.

### ⭐ Test case và Checklist khác nhau? Bạn dùng cái nào?

> Test case viết chi tiết từng bước, dữ liệu đầu vào và kết quả mong đợi — phù hợp khi chức năng quan trọng, phức tạp, hoặc cần người khác test lại được mà không cần hỏi. Checklist chỉ là danh sách các điểm cần kiểm tra, viết nhanh hơn — phù hợp khi thời gian gấp, chức năng đơn giản, hoặc khi em đã hiểu rõ hệ thống. Thực tế em dùng cả hai: test case chi tiết cho luồng nghiệp vụ chính và phần dùng cho regression, checklist cho các thay đổi nhỏ và test nhanh.

### ⭐ Khi nào coi là test đủ, dám nói release được?

> Em không nhìn vào việc đã chạy hết test case hay chưa, mà nhìn vào mấy điểm: các luồng nghiệp vụ chính đã test và pass hết chưa; còn bug nào mức nghiêm trọng đang mở không; regression các chức năng liên quan đã chạy chưa; và những phần em chưa test được thì rủi ro là gì. Nếu luồng chính ổn, không còn bug nặng, và em nói rõ được phần nào còn rủi ro thì em sẽ báo là có thể release, kèm danh sách rủi ro còn lại. Quyết định cuối cùng là của PM, nhưng thông tin phải do em cung cấp đầy đủ.

### Positive và Negative test case

> Positive là test với dữ liệu và thao tác đúng như mong đợi, để xác nhận chức năng làm được việc của nó. Negative là test với dữ liệu sai hoặc thao tác bất thường, để xác nhận hệ thống xử lý lỗi đàng hoàng chứ không bị crash. Ví dụ ở ô nhập số lượng: positive là nhập 5, negative là nhập 0, số âm, chữ, hoặc số rất lớn.

### Boundary value và Equivalence partitioning

Giải thích bằng ví dụ, đừng đọc định nghĩa:
> Giả sử ô tuổi cho nhập từ 18 đến 60. Thay vì test tất cả các số, em chia thành các nhóm có cùng cách xử lý: nhóm nhỏ hơn 18 không hợp lệ, nhóm 18–60 hợp lệ, nhóm lớn hơn 60 không hợp lệ — mỗi nhóm chỉ cần test một giá trị đại diện. Rồi em test thêm ở ranh giới vì lỗi thường nằm ở đó: 17, 18, 19 và 59, 60, 61. Cách này giúp giảm số test case mà vẫn không bỏ sót chỗ dễ lỗi.

### Thế nào là một test case tốt?

> Với em là test case mà người khác đọc vào cũng test được giống y như mình, không phải đoán. Cụ thể: tiêu đề nói rõ đang kiểm tra điều gì, bước thực hiện rõ ràng không mơ hồ, có dữ liệu đầu vào cụ thể, có kết quả mong đợi rõ ràng chứ không viết chung chung kiểu "hệ thống hoạt động đúng", mỗi case chỉ kiểm tra một điểm để khi fail là biết ngay lỗi ở đâu, và không phụ thuộc vào case khác phải chạy trước.

### Exploratory testing là gì? Bạn có dùng không?

> Là test không theo test case viết trước, em vừa dùng vừa quan sát và tự nghĩ ra hướng thử tiếp theo dựa vào những gì mình thấy. Em dùng nó trong hai tình huống: khi chức năng mới chưa có tài liệu đầy đủ, và sau khi đã chạy hết test case rồi em dành thêm thời gian thử các thao tác bất thường. Thực tế nhiều bug em tìm ra là từ cách này, vì test case viết trước thường chỉ phủ những gì mình đã nghĩ tới.

### Thời gian test bị cắt còn một nửa, bạn cắt gì giữ gì?

> Em ưu tiên theo rủi ro. Giữ lại: luồng nghiệp vụ chính mà hầu hết người dùng đi qua, các chức năng liên quan tới tiền và dữ liệu, phần vừa bị thay đổi trong bản này, và các bug cũ hay tái phát. Giảm bớt: các case biên ít xảy ra, phần giao diện nhỏ, các chức năng phụ ít người dùng, và test trên các trình duyệt ít phổ biến. Quan trọng là em báo rõ cho PM phần nào em không test được và rủi ro kèm theo, để quyết định là quyết định có thông tin.

### Các khái niệm khác cần nói được một câu

- **Black box / White box / Grey box** — Em làm black box, tức là test dựa vào yêu cầu và hành vi bên ngoài, không đọc code. Grey box là có biết một phần cấu trúc bên trong, ví dụ biết dữ liệu lưu ở bảng nào để kiểm tra database.
- **Functional / Non-functional** — Functional là kiểm tra chức năng làm đúng việc của nó. Non-functional là các yếu tố khác: hiệu năng, bảo mật, khả năng dùng, tương thích trình duyệt.
- **UAT** — Là test do người dùng hoặc khách hàng thực hiện trước khi nhận sản phẩm, họ test theo nghiệp vụ thực tế của họ. Khác với test của QA là QA test theo requirement còn UAT test theo nhu cầu sử dụng thật.
- **Verification / Validation** — Verification là kiểm tra có làm đúng theo tài liệu không. Validation là kiểm tra sản phẩm có thật sự giải quyết được nhu cầu của người dùng không.
- **Test plan** — Gồm phạm vi test, những gì test và không test, cách tiếp cận, môi trường và dữ liệu cần, thời gian và nhân sự, tiêu chí bắt đầu và kết thúc, rủi ro.

---

# 5. Quy trình và phối hợp

### Trong Scrum, QA tham gia buổi nào, làm gì?

> Ở planning em tham gia để hiểu các task trong sprint và estimate thời gian test, đồng thời đặt câu hỏi sớm nếu thấy requirement chưa rõ. Daily thì em báo đang test gì, có vướng gì, bug nào đang chờ fix. Review thì em xem demo và đối chiếu với những gì đã test. Retro thì em góp ý về quy trình, ví dụ build giao quá muộn khiến thời gian test bị dồn. Em thấy việc tham gia sớm từ planning là quan trọng nhất, vì hỏi được requirement từ đầu thì đỡ phải sửa test case về sau.

### Requirement không rõ ràng hoặc thiếu — xử lý thế nào?

> Em liệt kê cụ thể những điểm chưa rõ thành câu hỏi rồi gửi BA hoặc PM, càng sớm càng tốt. Em tránh tự suy luận rồi test theo cách hiểu của mình, vì nếu hiểu lệch thì test case sai từ gốc. Trong lúc chờ trả lời thì em test trước phần đã rõ. Sau khi có câu trả lời em cập nhật vào tài liệu để cả team dùng chung.

### Requirement đổi giữa sprint, test case đã viết rồi?

> Em cập nhật lại test case theo phần đổi, đánh dấu những case không còn dùng thay vì xóa, để còn truy lại được. Sau đó em xem thay đổi đó ảnh hưởng tới chức năng nào khác không, để bổ sung regression. Em cũng báo lại ảnh hưởng về thời gian test, vì đổi requirement giữa sprint thì thời gian test thường phải tính lại.

### Bạn estimate thời gian test bằng cách nào?

> Em dựa vào số lượng và độ phức tạp của chức năng, số test case dự kiến, thời gian chuẩn bị dữ liệu test, cộng thêm thời gian cho retest và regression — phần này thường bị quên nhưng chiếm khá nhiều. Em cũng cộng một khoảng dự phòng cho trường hợp bug nhiều phải retest nhiều lần hoặc môi trường gặp sự cố. Nếu đã từng làm chức năng tương tự thì em lấy thời gian thực tế lần trước làm cơ sở.

### Bạn báo cáo kết quả test thế nào?

> Em báo cáo theo: đã test những chức năng nào, bao nhiêu case pass bao nhiêu fail, danh sách bug đang mở kèm mức độ, phần nào chưa test được và vì sao, và kết luận của em là chức năng này đã sẵn sàng hay chưa. Em cố gắng để người đọc không cần mở Jira cũng nắm được tình hình.

---

# 6. Kỹ thuật cơ bản: API, SQL, DevTools

### ⭐ Bạn test API chưa? Test thế nào?

> Em dùng Postman. Em gửi request với các bộ dữ liệu khác nhau và kiểm tra: status code có đúng không, nội dung response có đúng dữ liệu mong đợi không, các trường bắt buộc có đủ không. Em test cả trường hợp sai: thiếu tham số bắt buộc, sai định dạng, gửi khi chưa có token hoặc token hết hạn, gửi dữ liệu vượt giới hạn. Em cũng đối chiếu dữ liệu trong response với dữ liệu trong database để chắc chắn là lưu đúng. Test API giúp em phát hiện lỗi sớm hơn và biết lỗi nằm ở tầng nào.

### ⭐ Các status code

| Code | Nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Request sai, thường do dữ liệu gửi lên không hợp lệ |
| 401 | Chưa đăng nhập hoặc token không hợp lệ |
| 403 | Đã đăng nhập nhưng không có quyền |
| 404 | Không tìm thấy |
| 500 | Lỗi phía server |

> Em để ý nhất 400 và 500: 400 thường nghĩa là phía client gửi sai, còn 500 thì gần như chắc chắn là bug phía backend.

### ⭐ Màn hình hiển thị sai — làm sao biết lỗi frontend hay backend?

> Em mở DevTools, tab Network, tìm request của chức năng đó rồi xem response trả về gì. Nếu response đã trả về dữ liệu sai thì lỗi ở backend. Nếu response trả đúng mà màn hình hiện sai thì lỗi ở frontend. Nếu request trả về mã lỗi 500 thì cũng là backend. Em cũng xem tab Console, nếu có lỗi JavaScript tại thời điểm đó thì nghiêng về frontend. Khi log bug em kèm luôn thông tin này để dev khoanh vùng nhanh hơn.

### GET, POST, PUT, DELETE

> GET là lấy dữ liệu, không làm thay đổi gì. POST là tạo mới. PUT là cập nhật. DELETE là xóa. Khi test em để ý: GET gọi nhiều lần phải cho kết quả như nhau và không được làm thay đổi dữ liệu; POST gọi hai lần liên tiếp thì không được tạo hai bản ghi trùng; DELETE một thứ đã xóa rồi thì phải xử lý đàng hoàng chứ không lỗi hệ thống.

### Bạn dùng SQL để làm gì?

> Em dùng chủ yếu để kiểm tra dữ liệu sau khi test — xem dữ liệu có được lưu đúng vào database không, có đúng trạng thái không, vì nhiều khi giao diện hiện đúng mà dữ liệu lưu sai. Em cũng dùng để chuẩn bị dữ liệu test, ví dụ tìm một tài khoản đúng điều kiện cần test.

Câu lấy user theo email:
```sql
SELECT * FROM users WHERE email = 'abc@gmail.com';
```

Nếu bị hỏi về JOIN:
> Em hiểu JOIN dùng để lấy dữ liệu liên quan từ nhiều bảng, ví dụ lấy danh sách đơn hàng kèm tên khách hàng thì phải nối bảng đơn hàng với bảng khách hàng. Em dùng được ở mức cơ bản, câu phức tạp thì em thường nhờ dev hỗ trợ.

**Đừng phóng đại mức SQL của mình.** Nói đúng mức rồi thêm "em đang học thêm" an toàn hơn bị hỏi sâu rồi bí.

### Test đa trình duyệt bạn làm thế nào?

> Em test chính trên Chrome vì phần lớn người dùng dùng nó, rồi kiểm tra lại các chức năng chính trên Firefox, Edge và Safari nếu sản phẩm có yêu cầu. Em tập trung vào giao diện bị lệch, nút bấm không hoạt động, và các chức năng liên quan tới upload hoặc hiển thị ngày tháng vì đây là chỗ hay khác nhau giữa các trình duyệt. `[Nếu có: Em từng gặp bug chỉ xuất hiện trên Safari là ...]`

### Test responsive / mobile kiểm tra gì?

> Em kiểm tra ở các kích thước màn hình chính: điện thoại, tablet, desktop. Những điểm hay lỗi: chữ bị tràn hoặc bị cắt, nút bị che hoặc quá nhỏ để bấm, bảng dữ liệu không cuộn được, menu không mở được, form bị lệch, ảnh bị méo. Em cũng kiểm tra khi xoay ngang màn hình, và khi bàn phím ảo hiện lên có che mất ô đang nhập không.

### Bạn có test bảo mật cơ bản không?

> Ở mức cơ bản thì có. Em kiểm tra: dán URL của trang cần quyền admin bằng tài khoản user thường xem có vào được không; sửa id trên URL để xem có truy cập được dữ liệu của người khác không; sau khi đăng xuất bấm Back xem có vào lại được không; mật khẩu không được hiển thị dạng chữ thường và không được xuất hiện trong URL; thông báo lỗi không tiết lộ quá nhiều thông tin hệ thống. Em cũng thử nhập đoạn mã script vào ô text xem hệ thống có xử lý không. Test bảo mật chuyên sâu thì cần người chuyên môn, em chỉ làm ở mức kiểm tra những lỗ hổng phổ biến.

### Cache và cookie ảnh hưởng thế nào?

> Có khi dev đã fix nhưng em vẫn thấy lỗi cũ chỉ vì trình duyệt còn giữ bản cũ. Nên khi retest em thường xóa cache hoặc mở cửa sổ ẩn danh để chắc chắn đang xem bản mới nhất. Ngược lại cũng có bug chỉ xuất hiện khi cache sạch, ví dụ lần đầu vào trang. Nên em test cả hai trạng thái: lần đầu truy cập và lần truy cập lại.

---

# 7. Tình huống xử lý

### Chức năng mới, không tài liệu, dev nghỉ — bắt đầu từ đâu?

> Em sẽ tự dùng thử chức năng đó trước như một người dùng để hiểu luồng chính, vừa làm vừa ghi lại thành checklist những gì em quan sát được. Song song em tìm nguồn thông tin khác: mô tả task trên Jira, trao đổi trong nhóm chat, chức năng tương tự đã có trong hệ thống, hoặc sản phẩm cùng loại trên thị trường. Sau đó em viết lại phần em hiểu và gửi BA hoặc PM xác nhận — vừa có cái để test, vừa làm rõ requirement cho cả team. Em bắt đầu test từ luồng chính trước, chỗ nào em không chắc đúng sai thì ghi là điểm cần xác nhận chứ không log thành bug ngay.

### Cùng một lỗi lặp lại qua nhiều sprint — bạn đề xuất gì?

> Em sẽ thống kê lại cụ thể là lỗi gì, xuất hiện ở sprint nào, để nói bằng số liệu chứ không bằng cảm giác. Nếu nguyên nhân là mỗi lần sửa chỗ này lại làm hỏng chỗ kia, em đề xuất bổ sung các case đó vào bộ regression bắt buộc chạy trước release, và đây cũng là phần nên tự động hóa. Nếu nguyên nhân là requirement hay bị hiểu khác nhau, em đề xuất làm rõ và ghi lại thành tài liệu chung. Em sẽ nêu trong buổi retro để cả team cùng xử lý.

### Môi trường test liên tục hỏng?

> Em sẽ ghi lại số lần hỏng, hỏng vào lúc nào và mất bao nhiêu thời gian chờ, rồi đưa ra con số cụ thể cho team thấy nó ảnh hưởng tiến độ thế nào. Về phía mình, em tạo thói quen kiểm tra nhanh môi trường trước khi bắt đầu test — đăng nhập được chưa, các trang chính mở được chưa — để không mất công test rồi phát hiện là do môi trường. Em cũng chuẩn bị sẵn việc khác để làm trong lúc chờ, như viết test case hoặc review lại bug cũ.

### 500 test case, còn 1 ngày — chạy gì?

> Em chạy smoke test trước để chắc chắn bản build dùng được, rồi chạy các case luồng chính và các case liên quan tới phần vừa thay đổi, ưu tiên những chỗ liên quan tới tiền và dữ liệu. Cuối ngày em báo cáo rõ đã chạy bao nhiêu phần trăm, phần nào chưa chạy và rủi ro của phần đó.

### Pass hết test case nhưng khách hàng vẫn phàn nàn khó dùng?

> Điều đó cho thấy test case của mình chỉ phủ phần "chức năng có chạy đúng không" mà chưa phủ phần "người dùng dùng có thuận tiện không". Hai việc này khác nhau. Em sẽ thu thập cụ thể khách hàng thấy khó ở chỗ nào, rồi tự đi lại luồng đó dưới góc nhìn người dùng thật — số bước có quá nhiều không, thông báo lỗi có dễ hiểu không, có chỗ nào gây nhầm lẫn không. Những điểm này em ghi nhận và trao đổi với BA, vì thường đây là vấn đề thiết kế chứ không phải lỗi code. Và em bổ sung thói quen đánh giá trải nghiệm vào quá trình test, không chỉ đối chiếu với requirement.

### Bạn và QA khác hiểu requirement khác nhau?

> Em không tranh luận để phân định ai đúng, mà đưa cả hai cách hiểu ra hỏi BA hoặc PM để có kết luận chính thức. Sau khi có kết luận thì ghi lại vào tài liệu để lần sau không ai phải đoán nữa. Em thấy khi hai người hiểu khác nhau thì phần lớn là do requirement viết chưa rõ, nên việc cần làm là làm rõ tài liệu.

---

# 8. Câu hỏi mức 2+ năm kinh nghiệm

> Nhóm này họ hỏi **phán đoán và quyền quyết định**, không hỏi định nghĩa.
> Công thức trả lời: **em dựa vào tiêu chí gì để quyết định → em làm gì → em thông báo cho ai.**

## 8.1 Chiến lược test và ưu tiên theo rủi ro

### Giao cho bạn một module hoàn toàn mới, bạn lập kế hoạch test thế nào?

> Em bắt đầu bằng việc hiểu module này ảnh hưởng tới ai và ảnh hưởng tới cái gì — liên quan tới tiền, tới dữ liệu khách hàng, hay chỉ là chức năng phụ. Từ đó em xác định phần nào rủi ro cao nhất để dồn thời gian vào. Tiếp đó em vẽ lại luồng nghiệp vụ chính và xác định các điểm tích hợp với module khác, vì lỗi thường nằm ở chỗ giao nhau. Rồi em mới chia ra: luồng chính test chi tiết bằng test case, phần phụ dùng checklist, phần lặp lại nhiều lần thì đánh dấu để sau này tự động hóa. Em cũng xác định trước cần chuẩn bị dữ liệu test gì và cần quyền gì, vì đây là thứ hay làm chậm tiến độ nhất.

### ⭐ Bạn ưu tiên test dựa vào gì khi không thể test hết?

> Em dựa vào hai yếu tố: mức độ ảnh hưởng nếu lỗi xảy ra, và khả năng lỗi xảy ra. Ảnh hưởng cao là những chỗ liên quan tới tiền, dữ liệu bị mất hoặc sai, và phân quyền. Khả năng xảy ra cao là những phần code vừa bị sửa, phần phức tạp nhiều điều kiện, phần do nhiều người cùng sửa, và phần trong quá khứ từng có nhiều bug. Chỗ nào cả hai đều cao thì em test trước và test sâu. Chỗ nào ảnh hưởng thấp mà ít thay đổi thì em chỉ kiểm tra qua. Em cũng luôn nói rõ với PM phần nào em cố ý làm nhẹ, để đó là quyết định có thông tin chứ không phải bỏ sót.

### Làm sao bạn biết test case của mình đã phủ đủ?

> Em đối chiếu ngược lại requirement: mỗi yêu cầu trong tài liệu phải có ít nhất một test case tương ứng. Nhưng phủ đủ requirement không có nghĩa là phủ đủ thực tế, nên em bổ sung thêm từ ba nguồn: các luồng người dùng thật hay làm nhưng tài liệu không ghi, các bug cũ từng xảy ra ở chức năng tương tự, và thời gian dành riêng để thử tự do ngoài test case. Sau mỗi lần có bug lọt ra production, em xem lại vì sao test case không bắt được và bổ sung vào.

## 8.2 Quản lý bộ regression

### ⭐ Bộ regression của bạn gồm những case nào? Chọn thế nào?

> Em chọn theo bốn tiêu chí: các luồng nghiệp vụ chính mà hầu hết người dùng đi qua; các chức năng liên quan tới tiền và dữ liệu; những chỗ từng có bug nghiêm trọng, vì chỗ đã lỗi một lần thường dễ lỗi lại; và các chức năng dùng chung mà nhiều phần khác phụ thuộc vào, ví dụ đăng nhập hay phân quyền. Em không đưa toàn bộ test case vào regression, vì bộ regression mà quá lớn thì sẽ không ai chạy nổi trước mỗi release, và lúc đó nó mất tác dụng.

### Bộ regression phình to, chạy không kịp trước release?

> Thứ nhất là rà soát lại và loại bỏ các case đã lỗi thời hoặc trùng nhau — bộ regression cần được bảo trì định kỳ chứ không chỉ thêm vào. Thứ hai là chia tầng: một bộ nhỏ chạy mỗi lần build, một bộ đầy đủ chạy trước release lớn. Thứ ba là chọn regression theo phạm vi thay đổi — nếu bản này chỉ sửa module A thì em chạy đầy đủ module A cộng với các module phụ thuộc, chứ không chạy hết tất cả. Và quan trọng nhất là đề xuất tự động hóa phần ổn định và lặp lại nhiều, để dành thời gian người cho phần cần phán đoán.

### ⭐ Case nào nên tự động hóa, case nào không nên?

> Nên tự động hóa: case lặp lại mỗi release, luồng ổn định ít thay đổi, case cần chạy với nhiều bộ dữ liệu, các bước chuẩn bị dữ liệu mất thời gian, và smoke test để kiểm tra bản build nhanh. Không nên: chức năng còn đang thay đổi liên tục vì viết xong là phải sửa lại; các case đánh giá cảm nhận như giao diện có đẹp không, dùng có thuận tiện không; case chỉ chạy một lần; và những case phụ thuộc vào yếu tố bên ngoài khó kiểm soát. Em cân nhắc cả chi phí bảo trì, vì một script phải sửa liên tục thì tốn công hơn là test tay.

## 8.3 Dữ liệu test và môi trường

### ⭐ Bạn quản lý dữ liệu test thế nào?

> Em chia dữ liệu thành hai loại. Loại dùng chung và ổn định — ví dụ các tài khoản ở từng quyền khác nhau — em giữ cố định và ghi lại ở chỗ cả team thấy được. Loại dùng một lần — ví dụ đơn hàng để test luồng thanh toán — thì em tạo mới mỗi lần test, không dùng lại, để tránh trường hợp dữ liệu đã bị thay đổi trạng thái bởi lần test trước. Em cũng ghi rõ trong test case là cần dữ liệu ở trạng thái nào, vì nhiều case fail không phải do bug mà do dữ liệu không đúng điều kiện đầu vào.

### Môi trường test dùng chung, dữ liệu bị thay đổi liên tục?

> Em hạn chế phụ thuộc vào dữ liệu có sẵn, thay vào đó mỗi lần test thì tự tạo dữ liệu của mình để không bị ảnh hưởng bởi người khác. Với dữ liệu buộc phải dùng chung thì em thống nhất với team cách đánh dấu, ví dụ thêm tiền tố vào tên để biết của ai, và thông báo trước khi thay đổi cấu hình chung. Khi một case fail bất thường, em luôn kiểm tra dữ liệu trước khi kết luận là bug — đây là nguyên nhân phổ biến nhất của fail giả.

### Môi trường test khác production thì rủi ro gì?

> Rủi ro lớn nhất là bug chỉ xuất hiện trên production mà môi trường test không bắt được. Thường do: dữ liệu trên production nhiều và đa dạng hơn, nên lỗi về hiệu năng hay phân trang chỉ lộ ra ở đó; cấu hình khác nhau, ví dụ test dùng sandbox của đối tác còn production dùng hệ thống thật; phiên bản hoặc dữ liệu cấu hình không đồng bộ. Nên trước release em luôn kiểm tra xem môi trường test có đang đúng phiên bản và đúng cấu hình không, và với các chức năng phụ thuộc dữ liệu lớn thì em yêu cầu dữ liệu test gần giống thực tế.

### Có nên test trên production không?

> Em tránh thực hiện các thao tác tạo và sửa dữ liệu trên production. Nhưng sau khi release thì em vẫn phải kiểm tra lại trên production, vì cấu hình và dữ liệu khác môi trường test. Lúc đó em chỉ làm những việc an toàn: kiểm tra trang mở được, kiểm tra bằng tài khoản test riêng được chuẩn bị cho mục đích này, xem dữ liệu hiển thị đúng chưa, và quan sát log hoặc thông báo lỗi. Những gì có thể ảnh hưởng tới dữ liệu khách hàng thì em không làm mà phải có quy trình và sự đồng ý rõ ràng.

## 8.4 Tích hợp và hệ thống bên ngoài

### ⭐ Test tích hợp với hệ thống bên thứ ba — ví dụ cổng thanh toán?

> Em test trên môi trường sandbox của đối tác nếu có. Em không chỉ test trường hợp thành công mà tập trung vào các trường hợp thất bại, vì đó là chỗ hay có bug: thanh toán bị từ chối, thẻ không đủ tiền, người dùng hủy giữa luồng, hết thời gian chờ, mất mạng giữa lúc đang xử lý. Em kiểm tra sau mỗi trường hợp thì trạng thái đơn hàng trong hệ thống mình có đúng không — đây là chỗ hay sai nhất, ví dụ thanh toán thất bại mà đơn vẫn chuyển sang trạng thái đã thanh toán. Em cũng test trường hợp đối tác gọi lại thông báo kết quả hai lần, xem hệ thống có xử lý trùng không.

### Hệ thống bên ngoài chưa sẵn sàng, vẫn phải test?

> Em đề xuất dùng mock, tức là một hệ thống giả trả về kết quả giống như đối tác thật, để test được luồng của mình trước. Điều này cũng giúp em test các trường hợp lỗi mà hệ thống thật khó tái hiện, ví dụ bắt nó trả về lỗi hoặc trả về chậm. Nhưng em luôn ghi rõ là phần này test bằng mock, và khi hệ thống thật sẵn sàng thì phải test lại, vì mock chỉ đúng theo tài liệu còn hệ thống thật có thể trả về khác tài liệu.

### Test chức năng gửi email / OTP / thông báo?

> Em kiểm tra: nội dung có đúng mẫu và đúng dữ liệu người nhận không, gửi đúng người không, thời gian đến có hợp lý không, link bên trong có hoạt động không. Phần rủi ro hơn là các trường hợp biên: OTP hết hạn rồi dùng, dùng lại OTP cũ đã dùng một lần, yêu cầu gửi lại nhiều lần liên tiếp xem có bị giới hạn không, nhập sai OTP quá số lần cho phép, và trường hợp người dùng nhận được hai mã rồi dùng mã cũ. Em cũng kiểm tra khi gửi thất bại thì hệ thống có xử lý đàng hoàng và có ghi log không.

### Test chức năng có job chạy định kỳ?

> Khó ở chỗ em không chủ động chạy được job, nên em thường nhờ dev cho phép kích hoạt thủ công trên môi trường test, hoặc chỉnh thời gian để job chạy sớm. Em kiểm tra: job chạy đúng thời điểm, xử lý đúng phạm vi dữ liệu, kết quả tính ra đúng. Và quan trọng là các trường hợp bất thường: job chạy khi không có dữ liệu nào, job chạy hai lần thì có tính trùng không, job bị lỗi giữa lúc đang chạy thì dữ liệu có bị dở dang không, và dữ liệu phát sinh đúng lúc job đang chạy thì được tính vào đợt nào.

## 8.5 Các nhóm case khó mức mid phải nghĩ tới

### ⭐ Test chức năng phân quyền có nhiều vai trò?

> Em lập một bảng: hàng là các vai trò, cột là các chức năng, ô là quyền được xem, được sửa, hoặc không được truy cập. Rồi em test theo bảng đó. Nhưng quan trọng hơn là test **vượt quyền**: đăng nhập bằng vai trò thấp rồi dán trực tiếp URL của trang chỉ dành cho vai trò cao, hoặc sửa id trên URL để xem dữ liệu của người khác. Nhiều hệ thống chỉ ẩn nút trên giao diện mà không chặn ở phía server, nên nhìn thì tưởng đúng nhưng vẫn truy cập được. Em cũng test trường hợp đang đăng nhập mà quyền bị thay đổi, xem hệ thống có cập nhật ngay không.

### Hai người dùng sửa cùng một dữ liệu một lúc?

> Em mở hai cửa sổ với hai tài khoản khác nhau, cùng mở một bản ghi, rồi lưu lần lượt. Em xem ai lưu sau có ghi đè mất dữ liệu của người trước không, hệ thống có cảnh báo không, hay nó âm thầm mất dữ liệu. Em cũng test trường hợp một người xóa trong khi người kia đang sửa, rồi người kia bấm lưu. Những case này ít được ghi trong requirement nhưng rất hay có bug, và hậu quả là mất dữ liệu nên mức độ nghiêm trọng cao.

### Test chức năng báo cáo có số liệu tổng hợp?

> Em không tin con số trên giao diện mà phải tự tính lại để đối chiếu — lấy dữ liệu gốc từ database rồi tính tay hoặc bằng câu truy vấn, so với con số báo cáo. Em test các trường hợp hay sai: khoảng thời gian ở ranh giới như ngày đầu và ngày cuối tháng, dữ liệu bị xóa rồi có bị tính vào không, dữ liệu ở trạng thái chờ xử lý có tính không, kết hợp nhiều bộ lọc cùng lúc. Và em kiểm tra tổng của các phần có khớp với tổng chung không, kiểm tra cả trường hợp không có dữ liệu thì báo cáo hiện gì.

### Test liên quan tới ngày tháng và múi giờ?

> Em để ý: hệ thống lưu theo múi giờ nào và hiển thị theo múi giờ nào; cùng một dữ liệu xem ở hai múi giờ khác nhau có hiển thị khác không; giao dịch tạo lúc gần nửa đêm được tính vào ngày nào. Em cũng test định dạng ngày khác nhau, ngày không hợp lệ như 31 tháng 2, năm nhuận, và các bộ lọc theo khoảng thời gian có bao gồm ngày đầu và ngày cuối hay không — chỗ này hay sai và rất khó phát hiện nếu không chủ ý test.

### Test migration dữ liệu khi hệ thống nâng cấp?

> Em kiểm tra ba điểm: đủ số lượng — số bản ghi trước và sau khi chuyển phải khớp; đúng nội dung — chọn mẫu đối chiếu từng trường, đặc biệt các trường có dấu tiếng Việt, số tiền và ngày tháng vì hay bị sai định dạng; và còn dùng được — sau khi chuyển thì các chức năng chạy trên dữ liệu đó vẫn hoạt động. Em để ý những bản ghi đặc biệt: dữ liệu cũ thiếu trường, dữ liệu đã bị xóa mềm, dữ liệu có ký tự lạ. Em cũng xác nhận là có phương án quay lui nếu chuyển đổi thất bại.

## 8.6 Số liệu và báo cáo

### ⭐ Bạn theo dõi những chỉ số gì về chất lượng?

> Chỉ số em quan tâm nhất là số bug lọt ra production, vì nó phản ánh trực tiếp hiệu quả của việc test. Mỗi bug lọt ra em đều xem lại nguyên nhân để bổ sung test case. Ngoài ra em theo dõi: số bug phát hiện theo từng chức năng, để biết chỗ nào hay có vấn đề mà tập trung vào; tỉ lệ bug bị reopen, vì cao thì nghĩa là fix chưa tới hoặc mô tả bug chưa rõ; và tỉ lệ bug bị reject, nếu cao thì có thể do em hiểu requirement lệch. Em dùng số liệu để biết nên dồn sức vào đâu, chứ không dùng để đánh giá ai.

### Bạn báo cáo cho quản lý không chuyên kỹ thuật thế nào?

> Em báo theo hướng trả lời câu hỏi "có release được hay không" chứ không liệt kê số liệu kỹ thuật. Cụ thể là: các chức năng chính đã test và kết quả; còn vấn đề gì đang mở và nó ảnh hưởng tới người dùng ra sao, diễn đạt bằng ngôn ngữ nghiệp vụ chứ không bằng thuật ngữ; phần nào chưa test được và rủi ro kèm theo; và khuyến nghị của em. Em để chi tiết kỹ thuật ở phần phụ lục cho ai cần xem.

### Chất lượng sản phẩm là trách nhiệm của ai?

> Của cả team, không riêng QA. QA là người cung cấp thông tin về chất lượng để team có cơ sở quyết định, chứ không phải người duy nhất chịu trách nhiệm hay người gác cổng cuối cùng. Em nghĩ cách hiệu quả nhất là tham gia sớm — đọc và phản biện requirement từ đầu, vì một yêu cầu viết không rõ mà phát hiện ở giai đoạn test thì đã tốn công hơn nhiều so với phát hiện lúc còn trên giấy.

## 8.7 Vai trò trong team, mentor người mới

### Bạn review test case của người khác thì xem những gì?

> Em xem: có phủ đủ requirement không, hay bỏ sót yêu cầu nào; có thiếu nhóm case nào không — thường người mới viết nhiều case đúng mà thiếu case sai và case biên; kết quả mong đợi có cụ thể không, vì viết "hệ thống hoạt động đúng" thì người khác không test được; các case có độc lập với nhau không; và có case nào trùng lặp không cần thiết. Em góp ý theo hướng đặt câu hỏi, ví dụ "nếu người dùng nhập quá số ký tự thì sao" để người viết tự nhận ra, chứ không chỉ sửa giúp.

### Có một QA mới vào team, bạn hướng dẫn thế nào?

> Em cho họ tiếp cận theo thứ tự: hiểu sản phẩm và nghiệp vụ trước, bằng cách tự dùng thử hệ thống như người dùng; rồi đọc test case có sẵn của một module để hiểu cách team viết; rồi giao một chức năng nhỏ và ít rủi ro để tự test, em review lại kết quả và bug họ log. Em cũng chỉ cho họ những thứ không có trong tài liệu nhưng rất cần: môi trường nào dùng để làm gì, tài khoản test ở đâu, quy ước log bug của team, và những chỗ trong hệ thống hay có vấn đề cần cẩn thận.

### ⭐ Bạn đã từng đề xuất cải tiến gì cho quy trình test chưa?

Cấu trúc: **vấn đề cụ thể → em làm gì → kết quả thay đổi thế nào**

> Trước đây mỗi lần release team em phải test tay lại toàn bộ luồng chính, mất khoảng `[...]` và hay bị dồn vào ngày cuối. Em đề xuất tách riêng một bộ smoke test cố định để chạy ngay khi có build, và ghi lại tài khoản cùng dữ liệu test dùng chung vào một chỗ để không phải chuẩn bị lại mỗi lần. Sau đó thời gian kiểm tra một bản build giảm còn `[...]` và team phát hiện build lỗi sớm hơn thay vì test nửa ngày mới biết.

Nếu chưa từng đề xuất gì lớn thì vẫn có cái để nói: tổ chức lại bộ test case, lập danh sách dữ liệu test dùng chung, thêm bước kiểm tra môi trường trước khi test, đề nghị dev ghi rõ phạm vi thay đổi để chọn regression đúng.

## 8.8 Nhóm câu khó dễ bị bí

### Bạn phân biệt bug, change request và improvement thế nào?

> Bug là hệ thống chạy khác với requirement đã thống nhất. Change request là requirement muốn đổi, tức là hệ thống đang chạy đúng theo yêu cầu cũ nhưng giờ muốn khác đi — cái này phải qua đánh giá và tính thêm thời gian. Improvement là hệ thống chạy đúng nhưng em thấy có thể tốt hơn cho người dùng, ví dụ giảm số bước hoặc thông báo lỗi rõ hơn. Em vẫn ghi nhận cả ba nhưng phân loại rõ, vì gộp improvement vào bug sẽ làm số liệu bug sai và dễ gây tranh luận không cần thiết với dev.

### Có bao giờ bạn bỏ sót bug quan trọng? Kể lại.

**Đừng trả lời "em chưa từng"** — nghe là mất điểm ngay.

> Có. `[Tình huống cụ thể]`. Nguyên nhân là em chỉ test theo requirement mà không nghĩ tới trường hợp `[...]`. Sau đó em bổ sung case đó vào bộ regression, và từ đấy em có thói quen `[thói quen cụ thể: luôn test thêm các thao tác bất thường như bấm hai lần, thoát giữa luồng rồi vào lại]`. Em thấy bug lọt ra là chuyện sẽ xảy ra, quan trọng là sau đó mình có khép được lỗ hổng đó lại không.

### Yêu cầu nghiệp vụ bạn thấy vô lý — bạn làm gì?

> Em vẫn test theo đúng requirement đã thống nhất, vì đó là thỏa thuận chung. Nhưng em nêu ý kiến ở giai đoạn review requirement, càng sớm càng tốt, và nêu theo góc độ ảnh hưởng tới người dùng kèm ví dụ cụ thể chứ không nói chung là "em thấy không hợp lý". Nếu BA quyết giữ nguyên thì em ghi nhận lại ý kiến đó và vẫn test đúng yêu cầu, rồi theo dõi phản hồi thực tế sau release.

### Dev đưa bản fix nhưng bạn nghi fix chưa tới gốc?

> Em không chỉ test lại đúng bước trong bug report, vì nhiều khi dev chỉ sửa đúng trường hợp em mô tả. Em thử thêm các biến thể của cùng vấn đề đó — cùng nguyên nhân nhưng đi vào bằng đường khác, hoặc chức năng khác dùng chung phần code đó. Nếu các biến thể vẫn còn lỗi thì nghĩa là chưa fix tới gốc, em reopen và nêu rõ biến thể nào còn lỗi. Em cũng hay hỏi dev nguyên nhân là gì, vì biết nguyên nhân thì em mới biết nên test lan ra tới đâu.

### Theo bạn, QA giỏi khác QA bình thường ở điểm nào?

> Em nghĩ khác ở ba điểm. Một là biết chọn chỗ nào cần test sâu chứ không test đều tay mọi chỗ, vì thời gian luôn có hạn. Hai là hiểu nghiệp vụ đủ sâu để nghĩ ra những trường hợp không có trong tài liệu — phần lớn bug nghiêm trọng nằm ở đó. Ba là làm cho bug được fix thật, nghĩa là mô tả đủ rõ để dev hiểu ngay, và theo tới khi xác nhận đã đúng, chứ không chỉ log rồi để đó.

### ⭐ Bạn thấy mình còn yếu ở đâu?

> Điểm yếu của em là nền tảng lập trình. Em mạnh ở phần phân tích và thiết kế test case, nhưng khi viết script automation thì em chưa tự viết được từ đầu mà cần tham khảo tài liệu và dùng công cụ hỗ trợ để dựng khung. Hiện em đang học theo hướng ngược lại một chút: thay vì học viết trước, em tập đọc và hiểu script — em phải giải thích được từng dòng làm gì, vì sao chọn cách tìm element đó. Em thấy điều quan trọng nhất không phải là gõ ra được script, mà là khi script fail em phải đọc được kết quả và biết đó là bug thật hay script sai. Phần đó em làm được vì nó gần với tư duy test của em.

Tuyệt đối không chọn điểm yếu kiểu "em quá cẩn thận" hay "em làm việc quá nhiều".

---

# 9. Automation — mức hỏi không sâu

> **Nguyên tắc quan trọng nhất: trả lời đúng tầm câu hỏi, đừng chủ động mở rộng.**
> Nói vừa đủ, nói chắc, rồi dừng. Mỗi thuật ngữ bạn tự nêu ra là một cái cớ để họ hỏi sâu thêm.
> Nêu ít từ kỹ thuật, nói nhiều về mục đích và phán đoán.

### Cấu trúc trả lời an toàn cho mọi câu auto

```
Em làm được ở mức [...]            → nói đúng mức, không phóng đại
Em dùng nó để [...]                → mục đích
Phần [...] em chưa làm             → tự chốt phạm vi, chặn câu hỏi sâu
Nếu cần thì em sẵn sàng học thêm   → thái độ
```

Câu thứ ba quan trọng nhất. Người phỏng vấn thích ứng viên biết rõ giới hạn của mình hơn là ứng viên nói vống rồi bí.

### Em có biết automation không? Dùng tool gì?

> Em đang dùng Playwright. Em dùng để tự động hóa các case regression lặp lại mỗi lần release, chủ yếu là luồng chính như đăng nhập và các nghiệp vụ hay phải kiểm tra lại. Em làm ở mức viết và chạy được case, đọc được kết quả; phần dựng framework thì em chưa làm.

### Vì sao chọn Playwright mà không phải Selenium?

> Em tiếp cận Playwright vì nó cài đặt đơn giản hơn và xử lý việc chờ trang load sẵn cho mình, nên người mới như em ít gặp lỗi do chờ sai. Nó cũng có công cụ xem lại quá trình chạy khi test fail, cái đó giúp em rất nhiều trong việc xác định fail là do bug hay do script. Selenium thì em biết là lâu đời hơn và dùng được nhiều ngôn ngữ, nhưng em chưa làm trực tiếp.

### ⭐ Em tự động hóa những case nào? Vì sao chọn những case đó?

> Em chọn các case chạy lặp lại mỗi release và luồng đã ổn định ít thay đổi — ví dụ đăng nhập, luồng nghiệp vụ chính. Những phần còn đang sửa liên tục thì em không auto, vì viết xong lại phải sửa script, tốn công hơn test tay. Các case đánh giá cảm nhận như giao diện hay trải nghiệm thì em vẫn test tay vì máy không đánh giá được.

Đây là câu **ăn điểm nhất** trong nhóm auto, và nó không cần kiến thức code.

### ⭐ Script fail thì em làm gì?

> Em không kết luận ngay là bug. Em mở lại kết quả chạy để xem fail ở bước nào và lỗi là gì. Nếu lỗi là không tìm thấy element thì em xem trạng thái trang lúc đó — nếu element vẫn có mà script không tìm được thì thường do UI đổi hoặc script viết chưa ổn. Nếu lỗi là kết quả sai so với mong đợi thì em kiểm tra dữ liệu trả về, rồi tự làm tay lại trên cùng môi trường — làm tay cũng sai thì đó là bug thật, em mới log. Nếu cả loạt test fail cùng lúc thì em nghi môi trường chứ không nghi bug.

Câu này kéo lại điểm cho cả nhóm auto. Trả lời chắc câu này là họ thấy bạn dùng automation có hiểu biết thật.

### Em chạy test ở đâu, bao lâu một lần?

> Em chạy trên máy em khi cần kiểm tra lại một luồng, và chạy cả bộ trước mỗi lần release. `[Nếu team có chạy tự động: Team em có chạy tự động khi có bản build mới, em xem kết quả và xử lý các case fail.]` Nếu công ty có hệ thống chạy tự động thì em sẵn sàng học thêm phần đó.

### Em có bao nhiêu test case đã auto hóa?

Nói số thật và nhỏ cũng không sao, miễn kèm lý do chọn:
> Khoảng `[số]` case, tập trung vào luồng chính. Em không đặt mục tiêu auto hóa thật nhiều, mà ưu tiên những case tốn thời gian test tay nhất và chạy lại thường xuyên nhất.

### Em có gặp test chạy lúc pass lúc fail chưa? Xử lý thế nào?

> Có, phần lớn là do script chờ chưa đúng — nó kiểm tra khi trang chưa load xong dữ liệu. Em xử lý bằng cách cho script chờ đúng trạng thái cần có thay vì chờ một khoảng thời gian cố định. Loại test này em tách riêng ra để sửa, không để lẫn vào kết quả chung, vì nếu để lẫn thì cả team sẽ mất lòng tin vào kết quả automation và dần bỏ qua các case fail.

### Automation có thay được manual không?

> Không. Automation làm tốt phần lặp lại và kiểm tra nhanh xem có gì bị hỏng sau khi sửa code. Nhưng nó chỉ kiểm tra được những gì mình đã nghĩ ra và viết vào, còn bug mới thường được tìm ra khi người test tự thử những tình huống ngoài dự tính. Nên em xem automation là công cụ giúp tiết kiệm thời gian để dành sức cho phần cần phán đoán, chứ không phải thay thế.

### Em có dùng Page Object không?

> Em biết ý tưởng là tách thông tin về các element của từng trang ra một chỗ riêng, để khi UI đổi thì chỉ sửa một nơi thay vì sửa khắp các script. Em làm ở mức cơ bản, chưa tổ chức thành hệ thống hoàn chỉnh.

Nếu chưa dùng thì nói chưa. Nhận bừa là dính câu hỏi tiếp ngay.

### Em có dùng AI để viết script không?

> Có, em dùng để dựng khung ban đầu cho nhanh. Nhưng em không lấy nguyên kết quả rồi chạy. Em đọc lại từng dòng, chỗ nào em chưa hiểu thì em tra hoặc thử bỏ đi xem script hỏng thế nào để biết dòng đó làm gì. Em cũng thường phải sửa lại cách tìm element, vì công cụ không biết trang thật của mình trông ra sao. Em nghĩ dùng công cụ hỗ trợ là bình thường, miễn là mình hiểu và chịu trách nhiệm được cho script mình đưa vào bộ test — vì nếu không hiểu thì lúc nó fail sẽ không biết lỗi ở đâu, lúc đó automation thành gánh nặng chứ không giúp gì.

### Năm từ cần nói được bằng lời thường

| Từ | Nói thế nào |
|---|---|
| **Locator / selector** | Cách để script xác định đúng element trên trang mà nó cần bấm hoặc nhập |
| **Assertion** | Phần kiểm tra kết quả — không có nó thì script chỉ bấm qua chứ không xác nhận được đúng sai |
| **Wait** | Cho script chờ đến khi trang sẵn sàng; chờ theo trạng thái an toàn hơn chờ theo số giây cố định |
| **Headless** | Chạy không mở cửa sổ trình duyệt, nhanh hơn, dùng khi chạy tự động; cần quan sát thì mở cửa sổ ra |
| **Trace / report** | Bản ghi lại quá trình chạy để xem lại khi fail, có ảnh và dữ liệu từng bước |

### CÂU THOÁT khi bị hỏi code mà không biết

Dùng được cho mọi câu code bạn không trả lời được:

> Phần này em chưa nắm chắc. Em hiểu nó dùng để `[mục đích chung nhất đoán được]`, còn chi tiết thì khi làm em sẽ tra lại tài liệu. Hiện em mạnh ở phần phân tích và thiết kế test case, phần script thì em đang ở mức đọc hiểu và sửa được chứ chưa tự viết từ đầu.

Và một cách nữa: khi bí phần cú pháp, **chuyển sang nói mục đích**.

> Em không nhớ chính xác cách viết, nhưng mục đích của bước đó là để chắc chắn trang đã load xong dữ liệu trước khi kiểm tra, nếu không thì test sẽ fail giả.

Trả lời được mục đích thì vẫn ghi điểm. Điều cần tránh không phải là "không trả lời được", mà là **ngồi im hoặc nói vống rồi bí**.

---

# 10. Phân loại test fail qua trace

> Đây là câu hay gặp và là câu mạnh nhất của bạn trong nhóm automation.
> Mở trace: `npx playwright show-trace trace.zip` hoặc click vào trace trong HTML report.

## Thứ tự đọc trace

**1. Filmstrip (dải ảnh trên cùng)** — xem toàn cảnh trước.
Nếu nhiều ảnh cuối là trang trắng, trang lỗi, hoặc màn hình login (bị kick ra) → nghiêng về **môi trường**. Nếu flow đi bình thường tới bước cuối rồi mới sai một chỗ nhỏ → nghiêng về **bug** hoặc **script**.

**2. Danh sách action bên trái + action bị đỏ**
- Đỏ ở `expect` (assertion) → hệ thống chạy được, chỉ là **giá trị sai** → thường là bug thật hoặc kỳ vọng cũ
- Đỏ ở `click` / `fill` / `waitFor` → **không tương tác được với element** → thường là script hoặc UI đổi

Để ý **thời gian** của action đỏ: chờ hết timeout (~30s) nghĩa là element không bao giờ xuất hiện; fail ngay tức thì nghĩa là giá trị có sẵn nhưng không khớp.

**3. Tab Log (của action đỏ)** — tab quan trọng nhất

| Nội dung trong Log | Nghĩa là |
|---|---|
| `waiting for locator...` rồi hết timeout | Element không xuất hiện → xem snapshot để biết là **bug** (không render) hay **UI đổi** (đổi selector) |
| `resolved to 2 elements` (strict mode violation) | **Script sai** — selector không đủ duy nhất, hoặc UI thêm element trùng |
| `element is not visible` / `not enabled` | Element có nhưng bị ẩn/disable → **bug** (nút đáng lẽ phải enable) hoặc **script** (chờ sai thời điểm) |
| `intercepted pointer events` | Có overlay/popup/spinner che → **script** (chờ thiếu) hoặc **bug** (spinner không bao giờ tắt) |
| `element is not stable` | Animation còn chạy → **script**, vấn đề timing |

**4. Snapshot Before / Action / After (khung giữa)** — DOM thật, click được

Đây là cách tách **script sai / UI đổi** khỏi **bug thật**:
- Dùng **Pick locator** trỏ vào element cần. Nếu element tồn tại nhưng locator thật khác với locator trong script → **UI đổi / script cần cập nhật**, không phải bug.
- Nếu element thật sự **không có**, và dữ liệu lẽ ra phải hiển thị cũng không có → **bug thật** hoặc thiếu data.
- Nếu snapshot cho thấy **thông báo lỗi của hệ thống** → **bug thật**, có luôn bằng chứng để log.

**5. Tab Network** — tách backend/môi trường khỏi UI
- API nghiệp vụ trả **400/500** hoặc **dữ liệu sai nội dung** → **bug thật** (backend). Xem được cả request body và response body, rất mạnh khi báo bug.
- **Tất cả** request đỏ, 502/503/connection refused, static file không load → **môi trường**
- API trả **đúng** mà màn hình hiển thị sai → **bug frontend**
- API trả rỗng (`[]`, `null`) → **thiếu data test / môi trường**, không phải bug

**6. Tab Console** — lỗi JavaScript của trang
Có JS error đúng tại thời điểm fail → **bug frontend** khá chắc. Console sạch mà element vẫn không ra → quay lại nghi script/data.

**7. Metadata / Attachments** — xác nhận base URL, browser, version, thời điểm chạy.
Nhiều "bug" chỉ là chạy sai env hoặc chạy trên build cũ. Luôn xác nhận trước khi log bug.

## Cây quyết định

```
Action đỏ là expect (sai giá trị)?
├─ Giá trị hiển thị sai về nghiệp vụ          → BUG THẬT
└─ Giá trị đúng, chỉ wording/format đổi       → UI ĐỔI, sửa script

Action đỏ là click/fill (không thấy element)?
├─ Snapshot: element có, locator khác         → UI ĐỔI / SCRIPT SAI
├─ Snapshot: element có nhưng bị che/disable  → SCRIPT (chờ) hoặc BUG
└─ Snapshot: element không có
   ├─ Network: API lỗi 4xx/5xx                → BUG THẬT (backend)
   ├─ Network: API ok nhưng data rỗng         → THIẾU DATA / MÔI TRƯỜNG
   ├─ Console: có JS error                    → BUG THẬT (frontend)
   └─ Toàn bộ network đỏ / trang trắng        → MÔI TRƯỜNG
```

## Heuristic nhanh

**Đếm số test fail.** 1–2 test fail rải rác → nghiêng về bug hoặc script. Cả suite fail cùng lúc → gần như chắc chắn môi trường hoặc một thay đổi UI dùng chung.

## Hai mẹo dùng trace hiệu quả

**So sánh hai trace.** Giữ trace của lần pass (build trước) rồi mở song song với trace fail. Nhìn cùng một bước ở hai bên là thấy ngay cái gì đã đổi — DOM, API response, hay thời gian. Cách nhanh nhất để chứng minh regression.

**Bật trace đúng chế độ.** `trace: 'on-first-retry'` hoặc `retain-on-failure` để chỉ lưu khi fail. Đang điều tra flaky thì bật `on` để có trace của cả lần pass lẫn lần fail của cùng một test.

## Quy trình triage không cần trace (trả lời khi được hỏi chung)

1. **Đọc evidence trước** — lỗi gì, ở bước nào. Assertion sai giá trị hay không tìm thấy element?
2. **Chạy lại test đó một mình.** Pass → nghi flaky hoặc phụ thuộc test khác, không phải bug.
3. **Tái hiện bằng tay** trên đúng env + đúng build. Fail tay = bug thật, đủ cơ sở log.
4. **So sánh chéo**: env khác pass → môi trường. Build trước pass → regression.
5. **Kiểm tra thay đổi**: release note, deploy log, thông báo đổi UI/feature flag.
6. **Kiểm tra data**: account/dữ liệu test còn hợp lệ không, có bị test khác dùng chung không.

## Bảng dấu hiệu tổng hợp

| Dấu hiệu | Nghiêng về |
|---|---|
| Làm tay cũng fail trên cùng build + env | **Bug thật** |
| API trả dữ liệu/status sai, kết quả nghiệp vụ sai | **Bug thật** |
| Chỉ fail từ build mới, build trước pass, script không đổi | **Bug thật (regression)** |
| Làm tay thì đúng, chỉ script fail | **Script sai** |
| "element not found / timeout" nhưng screenshot vẫn thấy element | **Script sai** |
| Chạy lại thì pass (flaky) | **Script sai — timing** |
| Chạy riêng pass, chạy cả bộ thì fail | **Script sai — test phụ thuộc nhau** |
| Fail vì data đã dùng rồi, trùng, hết hạn, account bị lock | **Script sai — quản lý data** |
| Hàng loạt test fail cùng lúc, nhất là ở login | **Môi trường / UI đổi** |
| 5xx, 502, timeout toàn bộ, trang trắng | **Môi trường** |
| Fail vì text/label đổi wording, layout đổi, thêm bước mới | **UI đổi** |
| Env đang test không phải version script được viết cho | **Môi trường** |

## Giảm nhầm lẫn từ gốc (nói thêm để ghi điểm)

- Selector ổn định (`data-testid`) thay vì XPath dài hoặc text hiển thị
- Không hardcode dữ liệu — mỗi test tự tạo data của mình, tự dọn sau khi chạy
- Dùng auto-wait theo trạng thái thay vì `sleep` cố định
- Mỗi test độc lập, không dựa vào test trước chạy xong
- Health-check môi trường trước khi chạy cả suite — fail thì dừng luôn
- Retry 1 lần để **phát hiện** flaky, nhưng vẫn báo cáo là flaky chứ không ẩn đi

## Khi báo cáo

Chỉ log bug khi **tái hiện được bằng tay** hoặc có bằng chứng rõ ở tầng API/dữ liệu. Nếu chưa chắc, ghi rõ: "fail trên automation, chưa tái hiện được bằng tay, cần xác nhận" — dev không mất thời gian và mình cũng không mất uy tín vì báo bug ảo.

---

# 11. Câu hỏi nên hỏi lại nhà tuyển dụng

Phần này hay bị bỏ qua nhưng ghi điểm thật:

- Team QA hiện có bao nhiêu người, chia việc theo module hay theo sprint?
- Quy trình release của công ty như thế nào, có regression trước release không?
- Công ty đang dùng automation ở mức nào? Nếu em vào thì lộ trình học auto ra sao?
- Tài liệu requirement thường ở dạng gì? QA có được tham gia review requirement không?
- Kỳ vọng với vị trí này trong 3 tháng đầu là gì?
- Môi trường test của team hiện có ổn định không, có dữ liệu test riêng không?

---

# 12. Lưu ý khi trả lời

Mấy điều quan trọng hơn cả nội dung:

### 1. Luôn kéo về kinh nghiệm thật
Câu nào trả lời xong mà thêm được *"ở dự án em thì..."* là câu đó ăn điểm gấp đôi. Chuẩn bị sẵn 2–3 ví dụ thật dùng đi dùng lại được.

### 2. Chuẩn bị sẵn 3 câu chuyện
- Một bug nghiêm trọng bạn tìm ra
- Một lần bạn bỏ sót và rút ra được gì
- Một lần bạn đề xuất cải tiến

### 3. Không biết thì nói không biết, kèm hướng xử lý
> Phần này em chưa làm trực tiếp. Em hiểu ở mức `[...]`. Nếu gặp thì em sẽ tìm hiểu thêm hoặc hỏi người có kinh nghiệm trong team.

An toàn hơn nhiều so với nói vòng vo rồi bị hỏi sâu.

### 4. Đừng dùng từ bạn không giải thích được
Nếu nói "equivalence partitioning" thì phải giải thích được ngay bằng ví dụ. Không chắc thì cứ diễn giải cách làm bằng lời thường — họ đánh giá bạn **hiểu** hay không, không đánh giá bạn **nhớ tên** hay không.

### 5. Với câu thiết kế test case, luôn hỏi lại requirement trước
Đây là chi tiết phân biệt người làm thật với người học thuộc.

### 6. Thể hiện bạn nghĩ về rủi ro, không chỉ đúng/sai
Câu ăn điểm nhất ở mức 2+ năm:
> Em sẽ nêu rõ phần nào chưa test được và rủi ro là gì, để PM quyết định dựa trên thông tin đầy đủ.

### 7. Công thức trả lời cho mọi câu mức mid
```
Em dựa vào tiêu chí gì để quyết định
→ em làm gì
→ em thông báo cho ai
```
Phần "thông báo cho ai" rất quan trọng — cho thấy bạn hiểu QA không tự quyết thay PM.

---

*File ôn tập phỏng vấn QA — cập nhật 2026-10-15*
