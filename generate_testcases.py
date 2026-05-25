"""
Sinh file Excel testcase tieng Viet cho man hinh Create Feed (Omega Feed Wizard).
Nguon: 'index (1).html' (UI) + 'There are 4 pricing plans in app F.txt' (BA spec)
"""

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

OUT = r"c:\Users\Thao Anh\OneDrive\Desktop\Testcase_CreateFeed_OmegaFeed.xlsx"

HEADER_FILL = PatternFill("solid", fgColor="1F4E78")
HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
SECTION_FILL = PatternFill("solid", fgColor="D9E1F2")
SECTION_FONT = Font(name="Calibri", size=11, bold=True, color="1F4E78")
BODY_FONT = Font(name="Calibri", size=10)
PRIORITY_HIGH = PatternFill("solid", fgColor="F8CBAD")
PRIORITY_MED = PatternFill("solid", fgColor="FFE699")
PRIORITY_LOW = PatternFill("solid", fgColor="C6EFCE")

THIN = Side(border_style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

HEADERS = [
    "ID",
    "Module / Tab",
    "Tieu de testcase",
    "Tien dieu kien",
    "Cac buoc thuc hien",
    "Du lieu test",
    "Ket qua mong doi",
    "Plan ap dung",
    "Loai",
    "Muc do uu tien",
]
COL_WIDTHS = [10, 18, 42, 32, 55, 30, 55, 22, 14, 14]


def style_header(ws, row=1):
    for col_idx, h in enumerate(HEADERS, start=1):
        c = ws.cell(row=row, column=col_idx, value=h)
        c.fill = HEADER_FILL
        c.font = HEADER_FONT
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BORDER
    ws.row_dimensions[row].height = 28
    for col_idx, w in enumerate(COL_WIDTHS, start=1):
        ws.column_dimensions[get_column_letter(col_idx)].width = w
    ws.freeze_panes = "A2"


def add_row(ws, row, data):
    priority = data[-1]
    for col_idx, val in enumerate(data, start=1):
        c = ws.cell(row=row, column=col_idx, value=val)
        c.font = BODY_FONT
        c.alignment = Alignment(vertical="top", wrap_text=True)
        c.border = BORDER
        if col_idx == len(HEADERS):
            if priority == "Cao":
                c.fill = PRIORITY_HIGH
            elif priority == "Trung binh":
                c.fill = PRIORITY_MED
            else:
                c.fill = PRIORITY_LOW
            c.alignment = Alignment(horizontal="center", vertical="center")
        if col_idx == 1:
            c.alignment = Alignment(horizontal="center", vertical="center")
            c.font = Font(name="Calibri", size=10, bold=True)


def write_sheet(wb, title, rows):
    ws = wb.create_sheet(title=title)
    style_header(ws)
    for i, row in enumerate(rows, start=2):
        add_row(ws, i, row)
        # auto row height heuristic
        max_len = max(len(str(x)) for x in row)
        ws.row_dimensions[i].height = min(max(28, max_len // 4), 130)
    return ws


# =============================================================================
# SHEET 0 - TONG QUAN
# =============================================================================
def build_overview(wb):
    ws = wb.create_sheet(title="00_TongQuan", index=0)
    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 90

    ws["A1"] = "BO TESTCASE - MAN HINH CREATE FEED (Omega Feed Wizard)"
    ws["A1"].font = Font(size=14, bold=True, color="1F4E78")
    ws.merge_cells("A1:B1")

    info = [
        ("Nguon", "index (1).html (UI mockup Polaris v13) + There are 4 pricing plans in app F.txt (BA spec)"),
        ("Pham vi", "Man hinh Create Feed wizard 4 buoc: Setup feed -> Mapping fields -> Mapping rules -> Preview"),
        ("4 goi", "Free, Basic, Scale, Advanced"),
        ("Ngon ngu testcase", "Tieng Viet"),
        ("Ngay tao", "2026-05-20"),
        ("Danh muc Sheet", ""),
    ]
    r = 3
    for k, v in info:
        ws.cell(row=r, column=1, value=k).font = Font(bold=True)
        ws.cell(row=r, column=2, value=v).alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[r].height = 24
        r += 1

    sheets_info = [
        ("01_Wizard_Chung", "Test wizard tong the: state cac tab, navigation Continue/Back, giu data"),
        ("02_Setup_SettingName", "Field 'Setting name' (required, trim, max 50)"),
        ("03_Setup_ProductSource", "4 radio Product source + dieu kien tung plan"),
        ("04_Setup_MarketSettings", "5 field Market settings + plan lock"),
        ("05_Setup_Schedule", "3 radio Schedule auto-sync + plan lock"),
        ("06_MappingFields", "Tab Mapping fields"),
        ("07_MappingRules", "Tab Mapping rules + popup Create rule + plan behavior"),
        ("08_Preview", "Tab Preview - Summary card + Preview card + modal san pham"),
        ("09_CrossPlan_Matrix", "Ma tran hanh vi theo tung goi Free/Basic/Scale/Advanced"),
        ("10_EdgeCases", "Edge cases, negative, boundary, UX bo sung"),
    ]
    ws.cell(row=r, column=1, value="STT").font = Font(bold=True, color="FFFFFF")
    ws.cell(row=r, column=1).fill = HEADER_FILL
    ws.cell(row=r, column=2, value="Mo ta").font = Font(bold=True, color="FFFFFF")
    ws.cell(row=r, column=2).fill = HEADER_FILL
    r += 1
    for i, (name, desc) in enumerate(sheets_info, start=1):
        ws.cell(row=r, column=1, value=name).alignment = Alignment(vertical="center")
        ws.cell(row=r, column=2, value=desc).alignment = Alignment(wrap_text=True, vertical="top")
        r += 1

    ws.freeze_panes = "A2"


# =============================================================================
# SHEET 1 - WIZARD CHUNG
# =============================================================================
WIZARD = [
    ["WZ_01", "Wizard chung", "Mo man hinh Create Feed - kiem tra trang thai 4 tab",
     "Da dang nhap app, da connect Facebook account/catalog",
     "1. Tu Dashboard, click 'Create new feed'\n2. Quan sat thanh stepper",
     "-",
     "Hien thi 4 tab: Setup feed (current/enable), Mapping fields, Mapping rules, Preview (3 tab nay disable)\nPage title 'Create setting'\nButton 'Continue' o footer",
     "Tat ca plan", "Positive", "Cao"],

    ["WZ_02", "Wizard chung", "Click vao tab dang disabled (Mapping fields/rules/Preview)",
     "Dang o Setup feed, chua click Continue",
     "1. Click vao label tab 'Mapping fields'\n2. Click vao 'Mapping rules'\n3. Click vao 'Preview'",
     "-",
     "Khong chuyen tab, van o Setup feed (tab disabled khong respond click)",
     "Tat ca plan", "Negative", "Trung binh"],

    ["WZ_03", "Wizard chung", "Continue tu Setup feed sang Mapping fields voi data hop le",
     "Da nhap day du data hop le o Setup feed",
     "1. Nhap Setting name hop le\n2. Chon Product source\n3. Schedule auto-sync\n4. Click Continue",
     "Setting name: 'Test Feed 01'\nSource: All products",
     "Chuyen sang tab Mapping fields, tab Setup feed van active (da hoan thanh), 2 tab sau van disable",
     "Tat ca plan", "Positive", "Cao"],

    ["WZ_04", "Wizard chung", "Back tu Mapping fields ve Setup feed - giu data",
     "Da Continue tu Setup feed sang Mapping fields",
     "1. O Mapping fields, click button 'Back'\n2. Quan sat data o Setup feed",
     "-",
     "Quay ve Setup feed\nSetting name, Product source, Market, Schedule giu nguyen gia tri da nhap",
     "Tat ca plan", "Positive", "Cao"],

    ["WZ_05", "Wizard chung", "Back-Continue qua lai nhieu lan giua cac tab - khong mat data",
     "Dang o Preview, da nhap day du data",
     "1. Back ve Mapping rules\n2. Back ve Mapping fields\n3. Back ve Setup feed\n4. Continue lan luot ve Preview",
     "-",
     "Tat ca data o moi tab van duoc giu nguyen, khong bi reset",
     "Tat ca plan", "Positive", "Cao"],

    ["WZ_06", "Wizard chung", "Stepper hien thi dung thu tu va icon",
     "Mo man hinh Create Feed",
     "1. Quan sat stepper-bar tren cung\n2. Kiem tra label tung step",
     "-",
     "Hien thi dung 4 step theo thu tu: Setup feed - Mapping Fields - Mapping Rules - Preview\nMoi step co icon + label\nStep hien tai co background highlight (current)",
     "Tat ca plan", "UI", "Trung binh"],

    ["WZ_07", "Wizard chung", "Back arrow tren page title - quay ve trang truoc",
     "Dang o tab bat ky cua wizard",
     "1. Click icon mui ten back ben canh 'Create setting'",
     "-",
     "Hien popup xac nhan 'Discard changes?' hoac thoat ve trang danh sach feed (theo design system)",
     "Tat ca plan", "Negative", "Trung binh"],

    ["WZ_08", "Wizard chung", "Validate truoc khi cho Continue",
     "Dang o Setup feed, chua nhap day du field bat buoc",
     "1. De trong Setting name\n2. Click Continue",
     "Setting name: rong",
     "Hien thi inline error 'Setting name is required', khong chuyen tab",
     "Tat ca plan", "Negative", "Cao"],

    ["WZ_09", "Wizard chung", "Click Continue khi co loi validate o nhieu field",
     "Dang o Setup feed, nhieu field thieu",
     "1. De trong Setting name\n2. Chon Product source = Products from collections nhung khong chon collection\n3. Click Continue",
     "-",
     "Hien thi day du inline error cua tat ca field loi, focus vao field loi dau tien",
     "Tat ca plan", "Negative", "Cao"],

    ["WZ_10", "Wizard chung", "Reload trang giua wizard",
     "Da nhap data o Setup feed, chua Continue",
     "1. F5 / Reload trang",
     "-",
     "Hien thi xac nhan reload (browser native) hoac auto-save data; sau reload phai duy tri data hoac quay ve trang chu (theo BA confirm)",
     "Tat ca plan", "Edge", "Trung binh"],
]


# =============================================================================
# SHEET 2 - SETTING NAME
# =============================================================================
SETTING_NAME = [
    ["SN_01", "Setup > Setting name", "Bo trong Setting name - bao loi required",
     "Dang o Setup feed",
     "1. Xoa toan bo Setting name\n2. Blur khoi field hoac click Continue",
     "Setting name: rong",
     "Hien inline error 'Setting name is required' (mau do), field viền do, khong cho Continue",
     "Tat ca plan", "Negative", "Cao"],

    ["SN_02", "Setup > Setting name", "Nhap text hop le",
     "Dang o Setup feed",
     "1. Nhap 'Linh Omega'\n2. Blur",
     "Setting name: 'Linh Omega'",
     "Field nhan gia tri, counter hien '10/50', khong loi",
     "Tat ca plan", "Positive", "Cao"],

    ["SN_03", "Setup > Setting name", "Trim space dau/cuoi khi blur",
     "Dang o Setup feed",
     "1. Nhap '  Linh Omega  '\n2. Blur khoi field",
     "Setting name: '  Linh Omega  '",
     "Sau blur, gia tri tu dong tro thanh 'Linh Omega' (khong con space dau cuoi)\nCounter cap nhat: 10/50",
     "Tat ca plan", "Positive", "Cao"],

    ["SN_04", "Setup > Setting name", "Nhap dung 50 ky tu - boundary",
     "Dang o Setup feed",
     "1. Paste chuoi 50 ky tu",
     "'A' x 50 = 50 ky tu",
     "Nhan toan bo, counter '50/50', khong loi",
     "Tat ca plan", "Boundary", "Cao"],

    ["SN_05", "Setup > Setting name", "Nhap > 50 ky tu - bi cat",
     "Dang o Setup feed",
     "1. Paste chuoi 80 ky tu",
     "'A' x 80",
     "Chi nhan duoc 50 ky tu (maxlength=50), counter '50/50'",
     "Tat ca plan", "Boundary", "Cao"],

    ["SN_06", "Setup > Setting name", "Nhap 1 ky tu - boundary toi thieu",
     "Dang o Setup feed",
     "1. Nhap 1 ky tu 'A'",
     "Setting name: 'A'",
     "Field nhan gia tri 1 ky tu, counter '1/50', khong loi",
     "Tat ca plan", "Boundary", "Trung binh"],

    ["SN_07", "Setup > Setting name", "Nhap ky tu dac biet",
     "Dang o Setup feed",
     "1. Nhap '!@#$%^&*()_+<>?\"\\'/'",
     "Setting name: chuoi dac biet",
     "Field nhan duoc, khong sanitize sai (khong loi XSS-related), counter dung",
     "Tat ca plan", "Edge", "Trung binh"],

    ["SN_08", "Setup > Setting name", "Nhap Unicode tieng Viet co dau",
     "Dang o Setup feed",
     "1. Nhap 'Feed thang 5 - Quan ao mua he'",
     "Setting name: 'Feed thang 5 - Quan ao mua he'",
     "Nhan duoc nguyen ven, hien thi dung dau, counter dem dung so ky tu",
     "Tat ca plan", "Positive", "Trung binh"],

    ["SN_09", "Setup > Setting name", "Nhap toan space - sau trim bao required",
     "Dang o Setup feed",
     "1. Nhap '          ' (10 space)\n2. Blur",
     "Setting name: 10 space",
     "Sau blur trim, gia tri thanh rong, hien error required",
     "Tat ca plan", "Negative", "Cao"],

    ["SN_10", "Setup > Setting name", "Counter cap nhat realtime khi go phim",
     "Dang o Setup feed",
     "1. Go tung ky tu va quan sat counter",
     "Vd: go 5 ky tu 'Hello'",
     "Counter cap nhat realtime moi keystroke: 1/50, 2/50, ... 5/50",
     "Tat ca plan", "UI", "Trung binh"],

    ["SN_11", "Setup > Setting name", "Copy-paste tu source co newline",
     "Dang o Setup feed",
     "1. Copy chuoi 'Linh\\nOmega' co newline\n2. Paste vao field",
     "Chuoi co newline",
     "Field text input loai bo newline hoac chuyen thanh space, khong gay vo layout",
     "Tat ca plan", "Edge", "Thap"],

    ["SN_12", "Setup > Setting name", "Trung ten Setting voi feed da co",
     "Da co feed ten 'Linh Omega'",
     "1. Tao feed moi, nhap Setting name 'Linh Omega'\n2. Click Continue",
     "Setting name: 'Linh Omega' (trung)",
     "Bao loi 'Setting name already exists' (neu BA yeu cau unique) hoac cho phep trung (cau hinh tuy he thong)",
     "Tat ca plan", "Negative", "Trung binh"],
]


# =============================================================================
# SHEET 3 - PRODUCT SOURCE
# =============================================================================
PRODUCT_SOURCE = [
    ["PS_01", "Setup > Product source", "Default radio 'All products' duoc chon san",
     "Mo lan dau Setup feed",
     "1. Quan sat block Product source",
     "-",
     "Radio 'All products' duoc chon mac dinh\nKhong co warning du store khong co active product\nGhi chu 'Max 100 active products by default'",
     "Tat ca plan", "Positive", "Cao"],

    ["PS_02", "Setup > Product source", "All products voi store co >100 active",
     "Store co 246 active product",
     "1. Chon radio 'All products'\n2. Continue",
     "Active products: 246",
     "App chi lay 100 active product dau (theo plan limit), hien stats '246 active products / Plan limit: 100'",
     "Free / Basic", "Boundary", "Cao"],

    ["PS_03", "Setup > Product source", "All products voi store co 0 active - khong canh bao",
     "Store co 0 active product",
     "1. Chon All products",
     "Active products: 0",
     "Khong hien warning 'no active products', cho phep Continue (theo spec)",
     "Tat ca plan", "Edge", "Trung binh"],

    ["PS_04", "Setup > Product source", "'Products from collections' - chua chon collection => warning",
     "Dang o Setup feed",
     "1. Chon radio 'Products from collections'\n2. Khong chon collection nao\n3. Click Continue",
     "Collection da chon: 0",
     "Hien warning 'Please select at least 1 collection', khong cho Continue",
     "Tat ca plan", "Negative", "Cao"],

    ["PS_05", "Setup > Product source", "'Products from collections' - co chon collection => pass",
     "Dang o Setup feed",
     "1. Chon radio 'Products from collections'\n2. Click Browse, tick chon 1 collection, click Add\n3. Click Continue",
     "Collection: 'Summer 2026'",
     "Collection xuat hien o table phia duoi (Image, Name, Active, In feed)\nKhong warning, cho Continue",
     "Tat ca plan", "Positive", "Cao"],

    ["PS_06", "Setup > Product source", "Mo popup Browse collections",
     "Da chon radio 'Products from collections'",
     "1. Click button 'Browse'",
     "-",
     "Mo popup 'Add collections' (top-level page, render qua App Bridge), hien thi danh sach collection co checkbox, button Add disable",
     "Tat ca plan", "Positive", "Cao"],

    ["PS_07", "Setup > Product source", "Tick checkbox collection - button Add enable",
     "Da mo popup Browse collections",
     "1. Tick checkbox 1 collection",
     "Vd collection 'Summer'",
     "Button 'Add' chuyen tu disable sang enable",
     "Tat ca plan", "Positive", "Cao"],

    ["PS_08", "Setup > Product source", "Click Add khong tick collection - button disable",
     "Da mo popup Browse collections, khong tick",
     "1. Quan sat button Add",
     "-",
     "Button Add van disable, khong click duoc",
     "Tat ca plan", "Negative", "Trung binh"],

    ["PS_09", "Setup > Product source", "Remove collection da add khoi table",
     "Da add 2 collection",
     "1. Click icon delete (thung rac) o row collection bat ky",
     "-",
     "Collection bi remove khoi table, summary cap nhat lai 'Total: X products from Y collections'",
     "Tat ca plan", "Positive", "Cao"],

    ["PS_10", "Setup > Product source", "Search collection trong popup",
     "Da mo popup Browse collections",
     "1. Go ten collection vao o search 'Summer'",
     "Tu khoa: 'Summer'",
     "Danh sach loc theo tu khoa realtime, chi hien collection co ten chua 'Summer'",
     "Tat ca plan", "Positive", "Trung binh"],

    ["PS_11", "Setup > Product source", "Products in specific tags - Free/Basic plan => locked",
     "Dang dung Free hoac Basic plan",
     "1. Quan sat radio 'Products in specific tags'",
     "-",
     "Radio bi disable\nHien badge 'Scale plan' voi icon khoa, mau highlighted",
     "Free / Basic", "UI", "Cao"],

    ["PS_12", "Setup > Product source", "Click badge 'Scale plan' tren Tags - redirect pricing",
     "Dang dung Free hoac Basic plan",
     "1. Click vao badge 'Scale plan' canh radio Tags",
     "-",
     "Redirect sang man hinh Pricing plan, focus vao goi Scale",
     "Free / Basic", "Positive", "Cao"],

    ["PS_13", "Setup > Product source", "Products in specific tags - Scale/Advanced => enable",
     "Dang dung Scale hoac Advanced",
     "1. Quan sat radio Tags",
     "-",
     "Radio enable, KHONG hien badge Scale plan, click duoc",
     "Scale / Advanced", "UI", "Cao"],

    ["PS_14", "Setup > Product source", "Tags - chon radio nhung khong chon tag => warning",
     "Dang dung Scale hoac Advanced",
     "1. Chon radio Tags\n2. Khong chon tag nao\n3. Continue",
     "Tag da chon: 0",
     "Hien warning 'Please select at least 1 product tag', khong cho Continue",
     "Scale / Advanced", "Negative", "Cao"],

    ["PS_15", "Setup > Product source", "Tags - chon tag thi hien table tags va Continue OK",
     "Dang dung Scale hoac Advanced",
     "1. Chon radio Tags\n2. Click Browse, chon tag 'bestseller'\n3. Continue",
     "Tag: 'bestseller' (42 products)",
     "Tag xuat hien o table, Continue chuyen sang Mapping fields",
     "Scale / Advanced", "Positive", "Cao"],

    ["PS_16", "Setup > Product source", "Pick individual products - Free/Basic => locked",
     "Dang dung Free hoac Basic",
     "1. Quan sat radio 'Pick individual products'",
     "-",
     "Radio disable, badge 'Scale plan' voi icon khoa",
     "Free / Basic", "UI", "Cao"],

    ["PS_17", "Setup > Product source", "Click badge 'Scale plan' tren Pick - redirect pricing",
     "Dang dung Free hoac Basic",
     "1. Click badge 'Scale plan' canh radio Pick individual products",
     "-",
     "Redirect sang man hinh Pricing plan",
     "Free / Basic", "Positive", "Cao"],

    ["PS_18", "Setup > Product source", "Pick individual products - Scale/Advanced => enable",
     "Dang dung Scale hoac Advanced",
     "1. Quan sat radio Pick",
     "-",
     "Enable, khong badge",
     "Scale / Advanced", "UI", "Cao"],

    ["PS_19", "Setup > Product source", "Pick - khong chon product => warning",
     "Dang dung Scale/Advanced, da chon Pick",
     "1. Khong chon product nao\n2. Continue",
     "0 product chon",
     "Warning 'Please pick at least 1 product', khong cho Continue",
     "Scale / Advanced", "Negative", "Cao"],

    ["PS_20", "Setup > Product source", "Pick - chon 1 product => pass",
     "Dang dung Scale/Advanced, da chon Pick",
     "1. Chon 1 product 'T-Shirt'\n2. Continue",
     "Product: T-Shirt",
     "Hien product trong table, cho Continue",
     "Scale / Advanced", "Positive", "Cao"],

    ["PS_21", "Setup > Product source", "Chi cho phep chon 1 radio (mutually exclusive)",
     "Dang o Product source",
     "1. Lan luot click 4 radio",
     "-",
     "Tai moi thoi diem chi 1 radio duoc chon, cac radio khac bi bo chon\nView phia duoi cap nhat theo radio dang chon",
     "Tat ca plan", "Positive", "Cao"],

    ["PS_22", "Setup > Product source", "Doi radio sau khi da chon data - data cu giu hay reset?",
     "Da chon Collection va add 2 collection",
     "1. Chuyen sang radio 'All products'\n2. Quan sat\n3. Quay lai radio 'Products from collections'",
     "-",
     "Data collection cu (2 collection) van duoc giu khi quay lai (theo design giu state) hoac reset (theo BA confirm)",
     "Tat ca plan", "Edge", "Trung binh"],

    ["PS_23", "Setup > Product source", "Plan limit 100 san pham - kiem tra rule import",
     "Store co 246 active product, plan Free",
     "1. Chon All products\n2. Hoan tat wizard, sync",
     "Active: 246, Plan limit: 100",
     "App chi import 100 product = min(246, 100), Dashboard hien thi ca 2 con so",
     "Free / Basic", "Positive", "Cao"],
]


# =============================================================================
# SHEET 4 - MARKET SETTINGS
# =============================================================================
MARKET = [
    ["MS_01", "Setup > Market settings", "Free/Basic plan - tat ca 5 field disable + badge",
     "Dang dung Free hoac Basic",
     "1. Quan sat card 'Market settings'",
     "-",
     "5 field disable: Select market, Select domain, Select country of sale, Select language, Select currency\nBadge 'Scale plan' voi icon khoa hien o header card",
     "Free / Basic", "UI", "Cao"],

    ["MS_02", "Setup > Market settings", "Click badge 'Scale plan' header card - redirect pricing",
     "Dang dung Free hoac Basic",
     "1. Click badge 'Scale plan' ben canh tieu de 'Market settings'",
     "-",
     "Redirect sang Pricing plan, focus goi Scale",
     "Free / Basic", "Positive", "Cao"],

    ["MS_03", "Setup > Market settings", "Scale/Advanced plan - 5 field enable, khong badge",
     "Dang dung Scale hoac Advanced",
     "1. Quan sat card Market settings",
     "-",
     "5 field enable, khong hien badge Scale plan",
     "Scale / Advanced", "UI", "Cao"],

    ["MS_04", "Setup > Market settings", "Select market - chon market chinh tu dong fill domain/country/currency/language",
     "Dang dung Scale/Advanced",
     "1. Click dropdown 'Select market'\n2. Chon 'European Union'",
     "Market: EU",
     "Tu dong fill: Domain=luonglinh-eu.myshopify.com, Country=DE, Currency=EUR, Language=EN",
     "Scale / Advanced", "Positive", "Cao"],

    ["MS_05", "Setup > Market settings", "Doi market - cac field derived cap nhat theo",
     "Da chon market EU, da hien data EU",
     "1. Doi market sang 'Japan'",
     "Market: JP",
     "4 field derived doi thanh: luonglinh-jp.myshopify.com / JP / JPY / JA",
     "Scale / Advanced", "Positive", "Cao"],

    ["MS_06", "Setup > Market settings", "Bo trong 1 trong 5 field - bao loi required",
     "Dang dung Scale/Advanced",
     "1. Xoa value Select market\n2. Continue",
     "Market: rong",
     "Hien error 'Market is required', khong cho Continue\nLap lai voi tung field con lai",
     "Scale / Advanced", "Negative", "Cao"],

    ["MS_07", "Setup > Market settings", "Re-sync link hoat dong",
     "Da chon market",
     "1. Click link 'Re-sync' canh field Select market",
     "-",
     "Trigger re-sync danh sach market tu Shopify, hien loading state, sau do refresh dropdown",
     "Scale / Advanced", "Positive", "Trung binh"],

    ["MS_08", "Setup > Market settings", "Market khong co domain hop le - canh bao",
     "Market chua setup domain trong Shopify",
     "1. Chon market 'Test'",
     "-",
     "Hien canh bao 'This market is missing domain configuration, please update in Shopify'",
     "Scale / Advanced", "Edge", "Trung binh"],

    ["MS_09", "Setup > Market settings", "Field domain/country/currency/language - read-only khi enable",
     "Dang dung Scale/Advanced",
     "1. Quan sat 4 field derived",
     "-",
     "Cac field hien data nhung read-only (khong sua truc tiep, chi doi qua Select market)",
     "Scale / Advanced", "UI", "Trung binh"],

    ["MS_10", "Setup > Market settings", "Continue voi Market hop le",
     "Da chon market day du",
     "1. Click Continue",
     "Market: Primary US",
     "Chuyen Mapping fields, data market duoc giu",
     "Scale / Advanced", "Positive", "Cao"],
]


# =============================================================================
# SHEET 5 - SCHEDULE AUTO-SYNC
# =============================================================================
SCHEDULE = [
    ["SS_01", "Setup > Schedule auto-sync", "Free plan - chi Weekly enable, Daily/Hourly khoa",
     "Dang dung Free",
     "1. Quan sat card Schedule auto-sync",
     "-",
     "Weekly enable + checked mac dinh\nDaily, Hourly disable, hien badge 'Basic plan' canh moi radio",
     "Free", "UI", "Cao"],

    ["SS_02", "Setup > Schedule auto-sync", "Free plan - click badge 'Basic plan' - redirect pricing",
     "Dang dung Free",
     "1. Click badge 'Basic plan' tren radio Daily\n2. Quay lai, click badge tren Hourly",
     "-",
     "Ca 2 lan deu redirect sang Pricing plan, focus goi Basic",
     "Free", "Positive", "Cao"],

    ["SS_03", "Setup > Schedule auto-sync", "Basic/Scale/Advanced - 3 radio enable, khong badge",
     "Dang dung Basic, Scale hoac Advanced",
     "1. Quan sat card Schedule auto-sync",
     "-",
     "Ca 3 radio Weekly/Daily/Hourly deu enable, KHONG badge 'Basic plan'",
     "Basic / Scale / Advanced", "UI", "Cao"],

    ["SS_04", "Setup > Schedule auto-sync", "Chon Weekly - hien field Repeat (day-of-week) + At + Next schedule",
     "Dang dung bat ky plan",
     "1. Chon radio Weekly",
     "-",
     "Hien field Repeat (dropdown ngay trong tuan)\nHien field At (time picker)\nHien dong 'Next schedule: ...'",
     "Tat ca plan", "Positive", "Cao"],

    ["SS_05", "Setup > Schedule auto-sync", "Chon Daily - hien At + Next schedule, khong Repeat",
     "Dang dung Basic+",
     "1. Chon radio Daily",
     "-",
     "An field Repeat\nHien field At + Next schedule",
     "Basic / Scale / Advanced", "Positive", "Cao"],

    ["SS_06", "Setup > Schedule auto-sync", "Chon Hourly - hien caption mo ta, khong time picker",
     "Dang dung Basic+",
     "1. Chon radio Hourly",
     "-",
     "An Repeat, At, Next schedule\nHien dong chu thich 'Omega Feed automatically re-syncs your products on an hourly schedule...'",
     "Basic / Scale / Advanced", "Positive", "Cao"],

    ["SS_07", "Setup > Schedule auto-sync", "3 radio mutually exclusive",
     "Dang o Schedule",
     "1. Lan luot click Weekly, Daily, Hourly",
     "-",
     "Tai moi luc chi 1 radio duoc chon",
     "Tat ca plan", "Positive", "Trung binh"],

    ["SS_08", "Setup > Schedule auto-sync", "Doi gio o field At - Next schedule cap nhat theo",
     "Dang chon Weekly hoac Daily",
     "1. Doi At = 23:59",
     "At: 23:59",
     "Next schedule cap nhat theo gio moi (vd: 'May 18, 2026, 23:59')",
     "Tat ca plan", "Positive", "Trung binh"],

    ["SS_09", "Setup > Schedule auto-sync", "Nhap gio khong hop le tai field At",
     "Dang chon Weekly hoac Daily",
     "1. Nhap '25:99' vao field At",
     "At: 25:99",
     "Hien error inline 'Invalid time format', revert ve gia tri hop le truoc do",
     "Tat ca plan", "Negative", "Trung binh"],

    ["SS_10", "Setup > Schedule auto-sync", "Weekly - doi Repeat day - Next schedule chuyen sang ngay moi",
     "Dang chon Weekly",
     "1. Doi Repeat tu 'Every Monday' sang 'Every Friday'",
     "Repeat: Friday",
     "Next schedule cap nhat sang ngay Friday gan nhat ke tu hom nay",
     "Tat ca plan", "Positive", "Trung binh"],

    ["SS_11", "Setup > Schedule auto-sync", "Default Schedule khi mo lan dau",
     "Dang dung Free, mo Setup feed lan dau",
     "1. Quan sat",
     "-",
     "Weekly checked, Repeat = 'Every Monday' (hoac mac dinh theo BA), At = 17:10 (theo mockup)",
     "Tat ca plan", "UI", "Thap"],
]


# =============================================================================
# SHEET 6 - MAPPING FIELDS TAB
# =============================================================================
MAPPING_FIELDS = [
    ["MF_01", "Tab Mapping fields", "Chuyen sang Mapping fields sau khi Continue tu Setup feed",
     "Da Continue tu Setup feed hop le",
     "1. Quan sat tab Mapping fields",
     "-",
     "Tab Mapping fields active, hien noi dung mapping; tab Setup feed van hoan thanh, Mapping rules + Preview disable",
     "Tat ca plan", "Positive", "Cao"],

    ["MF_02", "Tab Mapping fields", "Continue tu Mapping fields sang Mapping rules",
     "Dang o Mapping fields",
     "1. Click Continue o footer",
     "-",
     "Chuyen sang tab Mapping rules",
     "Tat ca plan", "Positive", "Cao"],

    ["MF_03", "Tab Mapping fields", "Back tu Mapping fields ve Setup feed",
     "Dang o Mapping fields",
     "1. Click button 'Back' o footer",
     "-",
     "Quay ve Setup feed, toan bo data o Setup feed (Setting name, Product source, Market, Schedule) giu nguyen",
     "Tat ca plan", "Positive", "Cao"],

    ["MF_04", "Tab Mapping fields", "Giu nguyen mapping da chinh khi Back-Continue",
     "Dang o Mapping fields, da chinh mapping vai field",
     "1. Click Continue sang Mapping rules\n2. Click Back ve Mapping fields",
     "-",
     "Mapping da chinh van duoc giu, khong reset",
     "Tat ca plan", "Positive", "Cao"],

    ["MF_05", "Tab Mapping fields", "Default mapping cua he thong",
     "Mo Mapping fields lan dau",
     "1. Quan sat mapping",
     "-",
     "Hien danh sach standard fields voi mapping default tu Shopify -> Facebook (vd: title -> title, price -> price...)",
     "Tat ca plan", "UI", "Trung binh"],

    ["MF_06", "Tab Mapping fields", "Field bat buoc cua Facebook chua mapped - canh bao",
     "Dang o Mapping fields",
     "1. Xoa mapping cua field required (vd: title)\n2. Continue",
     "title: rong",
     "Hien canh bao 'Required Facebook field not mapped', khong cho Continue (neu BA quy dinh)",
     "Tat ca plan", "Negative", "Cao"],
]


# =============================================================================
# SHEET 7 - MAPPING RULES TAB
# =============================================================================
MAPPING_RULES = [
    ["MR_01", "Tab Mapping rules", "Free/Basic/Scale - hien 3 demo rule disable + badge 'Demo'",
     "Dang o Mapping rules, plan Free/Basic/Scale",
     "1. Quan sat list rule",
     "-",
     "Hien 3 rule disable mac dinh, moi rule co badge 'Demo' (background info)\nToggle bi disable, khong sua/xoa duoc",
     "Free / Basic / Scale", "UI", "Cao"],

    ["MR_02", "Tab Mapping rules", "Free/Basic/Scale - Button 'Create rule' enable",
     "Dang o Mapping rules, plan Free/Basic/Scale",
     "1. Quan sat button Create rule",
     "-",
     "Button enable, click duoc",
     "Free / Basic / Scale", "UI", "Cao"],

    ["MR_03", "Tab Mapping rules", "Free/Basic/Scale - Click Create rule - popup hien, button Save disable",
     "Plan Free/Basic/Scale",
     "1. Click button 'Create rule'",
     "-",
     "Popup 'Create rule' mo, co Rule name + WHEN section + THEN section\nButton 'Save' o popup bi DISABLE (gating de upgrade)",
     "Free / Basic / Scale", "Positive", "Cao"],

    ["MR_04", "Tab Mapping rules", "Free/Basic/Scale - du dien day du form van khong Save duoc",
     "Da mo popup Create rule",
     "1. Nhap Rule name, chon field/operator/value\n2. Quan sat button Save",
     "-",
     "Du form valid, Save van disable -> kem badge 'Upgrade to Advanced' hoac similar",
     "Free / Basic / Scale", "Negative", "Cao"],

    ["MR_05", "Tab Mapping rules", "Advanced - empty state khi chua co rule",
     "Plan Advanced, chua tao rule nao",
     "1. Quan sat",
     "-",
     "Hien empty state (Polaris EmptyState) voi:\n- Anh minh hoa\n- Tieu de 'Set up your first feed rule'\n- Mo ta\n- Button 'Add your first rule'",
     "Advanced", "UI", "Cao"],

    ["MR_06", "Tab Mapping rules", "Advanced - click 'Add your first rule' mo popup Create rule",
     "Advanced, dang o empty state",
     "1. Click '+ Add your first rule'",
     "-",
     "Mo popup Create rule, button Save enable khi form valid",
     "Advanced", "Positive", "Cao"],

    ["MR_07", "Tab Mapping rules", "Advanced - tao rule moi va Save",
     "Plan Advanced, dang o popup",
     "1. Nhap Rule name 'Age group from product type'\n2. WHEN: Product type contains 'kid'\n3. THEN: Set Age_group to 'kid'\n4. Click Save",
     "-",
     "Popup dong, rule moi hien o list, status 'Active', toggle enable",
     "Advanced", "Positive", "Cao"],

    ["MR_08", "Tab Mapping rules", "Advanced - toggle enable/disable rule",
     "Co rule da tao, plan Advanced",
     "1. Click toggle Active -> Inactive",
     "-",
     "Status doi sang Inactive (mau xam), checkbox tu unchecked",
     "Advanced", "Positive", "Trung binh"],

    ["MR_09", "Tab Mapping rules", "Advanced - edit rule",
     "Co rule da tao",
     "1. Click icon edit (pencil)",
     "-",
     "Popup mo voi data cu duoc fill san, button Save enable",
     "Advanced", "Positive", "Cao"],

    ["MR_10", "Tab Mapping rules", "Advanced - xoa rule",
     "Co rule da tao",
     "1. Click icon delete (thung rac)",
     "-",
     "Hien confirm dialog 'Are you sure?', sau Confirm -> rule bien khoi list",
     "Advanced", "Positive", "Cao"],

    ["MR_11", "Tab Mapping rules", "Advanced - Rule name bat buoc",
     "Plan Advanced, popup Create rule mo",
     "1. De rong Rule name\n2. Cau hinh WHEN/THEN day du\n3. Click Save",
     "-",
     "Button Save disable, hoac hien error 'Rule name required'",
     "Advanced", "Negative", "Cao"],

    ["MR_12", "Tab Mapping rules", "Advanced - WHEN khong chon field/value - Save disable",
     "Plan Advanced, popup mo",
     "1. Chi nhap Rule name\n2. Click Save",
     "-",
     "Save disable",
     "Advanced", "Negative", "Trung binh"],

    ["MR_13", "Tab Mapping rules", "Advanced - them nhieu dieu kien WHEN (AND/OR)",
     "Plan Advanced, popup mo",
     "1. Them 2 dieu kien WHEN voi operator 'OR' va 'AND'",
     "-",
     "Cho phep them nhieu row, hien join keyword OR/AND giua cac row\nLuu duoc va list rule hien dung dieu kien",
     "Advanced", "Positive", "Cao"],

    ["MR_14", "Tab Mapping rules", "Toggle Active trong popup Create rule",
     "Plan Advanced, popup mo",
     "1. Toggle 'Active' o header popup -> Inactive",
     "-",
     "Label doi tu 'Active' sang 'Inactive', sau Save rule luu o trang thai Inactive",
     "Advanced", "Positive", "Trung binh"],

    ["MR_15", "Tab Mapping rules", "Click Back ve Mapping fields - giu rule da tao",
     "Plan Advanced, da tao 2 rule",
     "1. Click Back",
     "-",
     "Quay lai Mapping fields, sau khi Continue lai vao Mapping rules thi 2 rule van con",
     "Tat ca plan", "Positive", "Cao"],

    ["MR_16", "Tab Mapping rules", "Click Continue sang Preview",
     "Dang o Mapping rules",
     "1. Click Continue",
     "-",
     "Chuyen sang tab Preview, tab Mapping rules van completed",
     "Tat ca plan", "Positive", "Cao"],

    ["MR_17", "Tab Mapping rules", "Demo rule (Free/Basic/Scale) - khong delete/edit duoc",
     "Plan Free/Basic/Scale",
     "1. Quan sat rule demo",
     "-",
     "Khong co icon edit/delete, chi co badge Demo va toggle disable",
     "Free / Basic / Scale", "Negative", "Trung binh"],

    ["MR_18", "Tab Mapping rules", "Dong popup Create rule bang nut X / backdrop",
     "Popup dang mo",
     "1. Click X o goc tren phai\n2. Mo lai, click backdrop ngoai dialog",
     "-",
     "Popup dong, data nhap dang do bi mat (hoac hoi xac nhan tuy BA)",
     "Tat ca plan", "Positive", "Trung binh"],
]


# =============================================================================
# SHEET 8 - PREVIEW TAB
# =============================================================================
PREVIEW = [
    ["PV_01", "Tab Preview > Summary", "Summary card hien 6 field dung thu tu",
     "Dang o Preview, da hoan tat 3 tab truoc",
     "1. Quan sat Summary card",
     "-",
     "Hien 6 field: Products, Schedule, Market, Mapping fields, Language, Custom rules\nMoi field co button 'Edit'",
     "Tat ca plan", "UI", "Cao"],

    ["PV_02", "Tab Preview > Summary", "Field Products hien dung data tu Product source",
     "Da chon 2 collection co 245 product",
     "1. Quan sat field Products trong Summary",
     "-",
     "Hien dung '245 products / 2 collections' (khop voi data Setup feed)",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_03", "Tab Preview > Summary", "Field Schedule hien dung schedule da chon",
     "Da chon Daily 03:00",
     "1. Quan sat field Schedule",
     "-",
     "Hien 'Daily - 3 AM (Asia/Ho_Chi_Minh)' khop voi setup",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_04", "Tab Preview > Summary", "Field Market hien dung market da chon",
     "Da chon market Vietnam VND",
     "1. Quan sat field Market",
     "-",
     "Hien 'Vietnam (VN) - VND'",
     "Scale / Advanced", "Positive", "Cao"],

    ["PV_05", "Tab Preview > Summary", "Field Language hien dung language",
     "Da chon Language Vietnamese",
     "1. Quan sat field Language",
     "-",
     "Hien 'Vietnamese'",
     "Scale / Advanced", "Positive", "Trung binh"],

    ["PV_06", "Tab Preview > Summary", "Field Mapping fields hien so field standard",
     "Da setup 8 standard fields",
     "1. Quan sat",
     "-",
     "Hien '8 standard fields'",
     "Tat ca plan", "Positive", "Trung binh"],

    ["PV_07", "Tab Preview > Summary", "Field Custom rules hien rule active",
     "Plan Advanced, da tao 3 rule active",
     "1. Quan sat",
     "-",
     "Hien '3 active - \"<ten rule dau tien>\" +2 more'",
     "Advanced", "Positive", "Cao"],

    ["PV_08", "Tab Preview > Summary", "Field Custom rules BLANK voi plan Free/Basic/Scale chua tao rule",
     "Plan Free, chua co rule that nao",
     "1. Quan sat field Custom rules",
     "-",
     "Co the blank/empty (theo spec: 'Only the Custom rules field can be blank'), khong block Done setup",
     "Free / Basic / Scale", "Positive", "Cao"],

    ["PV_09", "Tab Preview > Summary > Edit", "Click Edit o Products - mo Setup feed va scroll den Product source",
     "Dang o Preview",
     "1. Click 'Edit' canh field Products",
     "-",
     "Chuyen ve tab Setup feed, page scroll den card 'Product source', focus highlight (theo design)",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_10", "Tab Preview > Summary > Edit", "Click Edit o Schedule - scroll den Schedule auto-sync",
     "Dang o Preview",
     "1. Click 'Edit' canh field Schedule",
     "-",
     "Setup feed mo, scroll den card 'Schedule auto-sync'",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_11", "Tab Preview > Summary > Edit", "Click Edit o Market - scroll den Market settings",
     "Dang o Preview",
     "1. Click 'Edit' canh field Market",
     "-",
     "Setup feed mo, scroll den card 'Market settings'",
     "Scale / Advanced", "Positive", "Cao"],

    ["PV_12", "Tab Preview > Summary > Edit", "Click Edit o Language - scroll den Language",
     "Dang o Preview",
     "1. Click 'Edit' canh field Language",
     "-",
     "Setup feed mo, scroll den field Language (trong Market settings)",
     "Scale / Advanced", "Positive", "Trung binh"],

    ["PV_13", "Tab Preview > Summary > Edit", "Click Edit o Mapping fields - mo tab Mapping fields",
     "Dang o Preview",
     "1. Click 'Edit' canh field Mapping fields",
     "-",
     "Chuyen sang tab Mapping fields",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_14", "Tab Preview > Summary > Edit", "Click Edit o Custom rules - mo tab Mapping rules",
     "Dang o Preview",
     "1. Click 'Edit' canh field Custom rules",
     "-",
     "Chuyen sang tab Mapping rules",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_15", "Tab Preview > Summary > Edit", "Edit roi tro lai Preview - data cap nhat theo",
     "Da o Preview, click Edit ve Setup feed",
     "1. Click Edit Schedule\n2. Doi tu Daily sang Weekly\n3. Continue qua cac tab quay lai Preview",
     "-",
     "Field Schedule trong Summary cap nhat thanh 'Weekly ...' (data sync 2 chieu)",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_16", "Tab Preview > Preview card", "Hien thi 3 product preview mac dinh",
     "Dang o Preview, co product",
     "1. Quan sat Preview card",
     "-",
     "Hien 3 product card (image + vendor + title + price + availability)",
     "Tat ca plan", "UI", "Cao"],

    ["PV_17", "Tab Preview > Preview card", "Click product preview - mo modal chi tiet",
     "Dang o Preview",
     "1. Click vao 1 product card 'Organic Cotton T-Shirt'",
     "-",
     "Mo modal chi tiet hien thi thumb + title + price + danh sach 'Fields sent to Facebook' + footer 'Facebook reviews each variant...'",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_18", "Tab Preview > Preview card", "Dong modal product detail",
     "Modal dang mo",
     "1. Click X / Backdrop / phim Esc",
     "-",
     "Modal dong, ve Preview",
     "Tat ca plan", "Positive", "Trung binh"],

    ["PV_19", "Tab Preview > Preview card", "Truong hop khong co product de preview",
     "Da chon collection rong, hoac filter ra 0 product",
     "1. Vao Preview tab",
     "-",
     "Hien empty state 'No products to preview' thay vi 3 card san pham",
     "Tat ca plan", "Edge", "Cao"],

    ["PV_20", "Tab Preview > Footer", "Button 'Done setup' va 'Sync' o footer",
     "Dang o Preview",
     "1. Quan sat footer",
     "-",
     "2 button: 'Done setup' (secondary) va 'Sync' (primary)\nButton Back ben trai",
     "Tat ca plan", "UI", "Cao"],

    ["PV_21", "Tab Preview > Footer", "Click 'Sync' - bat dau sync feed",
     "Dang o Preview, data day du",
     "1. Click 'Sync'",
     "-",
     "Hien loading/sync status, chuyen sang Step 5 (Feed products) hoac Dashboard\nSync job duoc tao",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_22", "Tab Preview > Footer", "Click 'Done setup' - luu setting khong sync",
     "Dang o Preview",
     "1. Click 'Done setup'",
     "-",
     "Setting duoc luu, redirect ve danh sach feed/Dashboard, status 'Not synced'",
     "Tat ca plan", "Positive", "Cao"],

    ["PV_23", "Tab Preview > Back", "Click Back ve Mapping rules - giu data Preview",
     "Dang o Preview",
     "1. Click Back",
     "-",
     "Quay lai Mapping rules, khi Continue thi data Preview giu nguyen",
     "Tat ca plan", "Positive", "Trung binh"],
]


# =============================================================================
# SHEET 9 - CROSS PLAN MATRIX
# =============================================================================
CROSS_PLAN = [
    ["CP_01", "Cross-plan", "Free plan - matrix tinh nang",
     "Dang dung Free plan",
     "1. Tao feed, di qua 4 tab",
     "-",
     "Setup: All product (max 100), Collection OK; Tags+Pick LOCKED Scale; Market LOCKED Scale; Schedule chi Weekly (Daily/Hourly khoa Basic)\nMapping rules: 3 demo rule, Save disable",
     "Free", "Positive", "Cao"],

    ["CP_02", "Cross-plan", "Basic plan - matrix tinh nang",
     "Dang dung Basic plan",
     "1. Tao feed",
     "-",
     "Setup: Tags+Pick van LOCKED Scale; Market van LOCKED Scale; Schedule day du 3 option\nMapping rules: van 3 demo, Save disable",
     "Basic", "Positive", "Cao"],

    ["CP_03", "Cross-plan", "Scale plan - matrix tinh nang",
     "Dang dung Scale plan",
     "1. Tao feed",
     "-",
     "Setup: Tags+Pick UNLOCK; Market UNLOCK; Schedule day du\nMapping rules: 3 demo, Save disable (chi Advanced moi tao rule that)",
     "Scale", "Positive", "Cao"],

    ["CP_04", "Cross-plan", "Advanced plan - matrix tinh nang",
     "Dang dung Advanced plan",
     "1. Tao feed",
     "-",
     "Tat ca tinh nang unlock\nMapping rules: empty state + button 'Add your first rule', co the tao/edit/delete rule",
     "Advanced", "Positive", "Cao"],

    ["CP_05", "Cross-plan", "Upgrade Free -> Basic - schedule mo khoa",
     "Dang Free, da o Setup feed",
     "1. Click badge 'Basic plan' tren Daily\n2. Upgrade len Basic\n3. Quay lai man hinh tao feed",
     "-",
     "Daily/Hourly enable, badge bien mat; data Setup feed cu duoc giu",
     "Free -> Basic", "Positive", "Cao"],

    ["CP_06", "Cross-plan", "Upgrade Basic -> Scale - Market/Tags/Pick mo khoa",
     "Dang Basic, da o Setup feed",
     "1. Upgrade len Scale\n2. Quay lai",
     "-",
     "Market+Tags+Pick enable",
     "Basic -> Scale", "Positive", "Cao"],

    ["CP_07", "Cross-plan", "Upgrade Scale -> Advanced - tao rule mo khoa",
     "Dang Scale, da tao feed den Mapping rules (thay 3 demo)",
     "1. Upgrade len Advanced\n2. Quay lai Mapping rules",
     "-",
     "3 demo rule bien mat, hien empty state 'Add your first rule'",
     "Scale -> Advanced", "Positive", "Cao"],

    ["CP_08", "Cross-plan", "Downgrade Advanced -> Scale - rule da tao se sao?",
     "Da tao 5 rule o Advanced",
     "1. Downgrade ve Scale",
     "-",
     "Cac rule that bi an hoac chuyen thanh 'demo/locked' (theo BA confirm), feed se khong ap rule",
     "Advanced -> Scale", "Edge", "Cao"],

    ["CP_09", "Cross-plan", "Free plan - so product sync = min(active, 100)",
     "Active products: 246, plan Free",
     "1. Tao feed All products, Sync",
     "-",
     "Chi sync 100 product, Dashboard hien '246 active / 100 imported'",
     "Free / Basic", "Boundary", "Cao"],

    ["CP_10", "Cross-plan", "Trang Pricing plan - hien thi 4 goi va CTA",
     "Click bat ky badge 'Scale plan'/'Basic plan'",
     "1. Click badge bat ky",
     "-",
     "Mo trang Pricing plan: 4 cot Free/Basic/Scale/Advanced, gia tien, tinh nang, button Upgrade",
     "Free / Basic / Scale", "Positive", "Cao"],
]


# =============================================================================
# SHEET 10 - EDGE CASES & MISCELLANEOUS
# =============================================================================
EDGE = [
    ["EC_01", "Edge / UX", "Resize man hinh - layout responsive",
     "Dang o wizard",
     "1. Resize trinh duyet xuong 1024px, 768px",
     "-",
     "Layout responsive, 2-col co the chuyen 1-col, stepper/footer khong vo, khong cat chu",
     "Tat ca plan", "UI", "Trung binh"],

    ["EC_02", "Edge / UX", "Keyboard navigation Tab giua cac field",
     "Dang o Setup feed",
     "1. Press Tab lien tuc",
     "-",
     "Focus di qua cac field theo thu tu logic top->bottom, left->right, focus ring hien ro",
     "Tat ca plan", "Accessibility", "Trung binh"],

    ["EC_03", "Edge / UX", "Enter trong field text khong submit form",
     "Dang o Setting name",
     "1. Nhap text\n2. Bam Enter",
     "-",
     "Khong submit toan form, chi blur field (theo Polaris convention)",
     "Tat ca plan", "Edge", "Thap"],

    ["EC_04", "Edge / UX", "Click Continue lien tiep nhanh nhieu lan",
     "Setup feed valid",
     "1. Spam click Continue 5 lan trong 1s",
     "-",
     "Chi trigger chuyen tab 1 lan, khong tao duplicate (debounce/disable button khi loading)",
     "Tat ca plan", "Edge", "Trung binh"],

    ["EC_05", "Edge / UX", "Network cham khi Continue",
     "Throttle 3G",
     "1. Click Continue",
     "-",
     "Button hien spinner, disable trong thoi gian loading, sau khi nhan response moi cho click tiep",
     "Tat ca plan", "Edge", "Trung binh"],

    ["EC_06", "Edge / UX", "Mat mang khi Continue / Sync",
     "Disconnect network",
     "1. Click Continue / Sync",
     "-",
     "Hien error toast 'Network error, please retry', data form khong mat",
     "Tat ca plan", "Negative", "Cao"],

    ["EC_07", "Edge / UX", "Loi 500 tu BE khi luu setting",
     "Mock BE tra ve 500",
     "1. Click Done setup / Sync",
     "-",
     "Hien toast loi 'Something went wrong', khong navigate, data form giu nguyen, log error",
     "Tat ca plan", "Negative", "Cao"],

    ["EC_08", "Edge / UX", "Mo cung 1 wizard o 2 tab browser khac nhau",
     "Da mo wizard o tab A",
     "1. Mo tab B cung URL wizard\n2. Tao data khac nhau o 2 tab",
     "-",
     "Khong xung dot du lieu (moi tab 1 draft), hoac bao 'Another session is active' (theo BA)",
     "Tat ca plan", "Edge", "Thap"],

    ["EC_09", "Edge / UX", "Browser Back/Forward giua cac tab wizard",
     "Da Continue tu Setup -> Mapping fields",
     "1. Bam nut Back cua browser",
     "-",
     "Quay ve trang truoc cua app (hoac quay ve Setup feed neu URL co query/hash phan biet step)",
     "Tat ca plan", "Edge", "Trung binh"],

    ["EC_10", "Edge / UX", "Plan-variant toggle (mockup-only) khong co tren production",
     "Production build",
     "1. Quan sat",
     "-",
     "Khong hien toggle Free/Basic/Scale (chi cho mockup), plan thuc te lay tu account",
     "Tat ca plan", "UI", "Thap"],

    ["EC_11", "Edge / UX", "Setting name trung khoang trang giua chu",
     "Dang o Setup feed",
     "1. Nhap 'Linh    Omega' (4 space giua)",
     "-",
     "Cho phep, khong nen tu dong gop space (chi trim 2 dau)",
     "Tat ca plan", "Edge", "Thap"],

    ["EC_12", "Edge / UX", "Modal Add collections - search rong tra ve danh sach goc",
     "Da mo popup",
     "1. Go gi do roi xoa het",
     "-",
     "Danh sach quay ve full list collection",
     "Tat ca plan", "Positive", "Thap"],

    ["EC_13", "Edge / UX", "Modal Add collections - khong co collection nao ton tai",
     "Store khong co collection",
     "1. Mo popup Browse",
     "-",
     "Hien empty state 'No collections found', co the kem link 'Create collection in Shopify'",
     "Tat ca plan", "Edge", "Trung binh"],

    ["EC_14", "Edge / UX", "Collection co special characters trong ten",
     "Store co collection ten '<script>alert(1)</script>'",
     "1. Mo popup, search\n2. Add collection",
     "Ten: <script>alert(1)</script>",
     "Ten hien thi escape, khong execute script (XSS safe)",
     "Tat ca plan", "Security", "Cao"],

    ["EC_15", "Edge / UX", "Add collection trung lap",
     "Da add collection 'Summer'",
     "1. Mo popup, tick lai 'Summer', Add",
     "-",
     "Khong add trung, hoac hien noti 'Already added'",
     "Tat ca plan", "Edge", "Trung binh"],

    ["EC_16", "Edge / UX", "Rule name dai > X ky tu",
     "Plan Advanced, popup mo",
     "1. Nhap Rule name 200 ky tu",
     "-",
     "Hoac chap nhan, hoac max length theo BA, khong vo UI",
     "Advanced", "Boundary", "Trung binh"],

    ["EC_17", "Edge / UX", "Rule name trung",
     "Plan Advanced, da co rule 'A'",
     "1. Tao rule moi cung ten 'A'",
     "-",
     "Cho phep trung hoac bao loi (theo BA)",
     "Advanced", "Edge", "Trung binh"],

    ["EC_18", "Edge / UX", "Truong hop khong co Facebook account/catalog connect",
     "Chua connect FB",
     "1. Vao Create feed",
     "-",
     "Block khong cho vao wizard, redirect ve onboarding 'Connect Facebook account first'",
     "Tat ca plan", "Negative", "Cao"],

    ["EC_19", "Edge / UX", "RTL languages - test layout",
     "Truong hop ho tro RTL",
     "1. Doi locale sang Arabic",
     "-",
     "Layout mirror dung huong, stepper, button position dung",
     "Tat ca plan", "Accessibility", "Thap"],

    ["EC_20", "Edge / UX", "Dark mode (neu ho tro)",
     "Bat dark mode Shopify",
     "1. Mo wizard",
     "-",
     "Mau sac, contrast text/background hop le, badge van nhin ro",
     "Tat ca plan", "UI", "Thap"],

    ["EC_21", "Edge / UX", "Re-open feed da tao - mode Edit thay vi Create",
     "Da tao feed 'Linh Omega'",
     "1. Click vao feed do tu danh sach\n2. Quan sat",
     "-",
     "Hien mode edit: stats '246 active products / Plan limit 100', them radio 'Up to plan limit', stepper co them tab 'Feed products'",
     "Tat ca plan", "Positive", "Cao"],

    ["EC_22", "Edge / UX", "Edit mode - tab 'Feed products' (step 5) co filter, bulk action",
     "Dang xem feed da tao",
     "1. Vao tab 'Feed products'\n2. Filter 'Disapproved'\n3. Tick chon 1 row, click 'Sync to Facebook'",
     "-",
     "Filter loc dung, bulk bar hien 'X selected', sync hoat dong",
     "Tat ca plan", "Positive", "Cao"],

    ["EC_23", "Edge / UX", "Click Page back (mui ten dau trang) trong khi co thay doi chua luu",
     "Da nhap data, chua luu",
     "1. Click icon back",
     "-",
     "Hien confirm dialog 'You have unsaved changes - Leave / Stay'",
     "Tat ca plan", "Negative", "Cao"],

    ["EC_24", "Edge / UX", "Setting name chi co dau cau, khong chu",
     "Dang o Setup feed",
     "1. Nhap '.....' hoac '----'",
     "-",
     "Cho phep neu chi yeu cau khong rong, hoac block (theo BA confirm rule validation)",
     "Tat ca plan", "Edge", "Thap"],

    ["EC_25", "Edge / UX", "Free plan - all product khi store co dung 100 active",
     "Active = 100, Free",
     "1. Chon All products, Sync",
     "-",
     "Sync dung 100 (boundary equal limit), khong canh bao gi them",
     "Free / Basic", "Boundary", "Trung binh"],
]


# =============================================================================
# BUILD WORKBOOK
# =============================================================================
def main():
    wb = Workbook()
    # remove default sheet (will be replaced by overview which is inserted at index 0)
    default = wb.active
    wb.remove(default)

    build_overview(wb)
    write_sheet(wb, "01_Wizard_Chung", WIZARD)
    write_sheet(wb, "02_Setup_SettingName", SETTING_NAME)
    write_sheet(wb, "03_Setup_ProductSource", PRODUCT_SOURCE)
    write_sheet(wb, "04_Setup_MarketSettings", MARKET)
    write_sheet(wb, "05_Setup_Schedule", SCHEDULE)
    write_sheet(wb, "06_MappingFields", MAPPING_FIELDS)
    write_sheet(wb, "07_MappingRules", MAPPING_RULES)
    write_sheet(wb, "08_Preview", PREVIEW)
    write_sheet(wb, "09_CrossPlan_Matrix", CROSS_PLAN)
    write_sheet(wb, "10_EdgeCases", EDGE)

    wb.save(OUT)
    total = (len(WIZARD) + len(SETTING_NAME) + len(PRODUCT_SOURCE) + len(MARKET) +
             len(SCHEDULE) + len(MAPPING_FIELDS) + len(MAPPING_RULES) + len(PREVIEW) +
             len(CROSS_PLAN) + len(EDGE))
    print(f"Saved: {OUT}")
    print(f"Total testcases: {total}")


if __name__ == "__main__":
    main()
