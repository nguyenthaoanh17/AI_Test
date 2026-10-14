#!/usr/bin/env node
/**
 * Sinh file report cho mỗi lần chạy regression, phân loại lỗi theo file test case.
 *
 * Luật:
 *   - Test fail + cột "Known issue" của mã case đó = true  -> LỖI ĐÃ BIẾT
 *   - Test fail + không tick                              -> LỖI MỚI (fail thật)
 *   - Chỉ có lỗi đã biết, không có lỗi mới                -> ĐẠT (có lỗi đã biết)
 *
 * Nguồn:
 *   test-results/results.json  (reporter json của Playwright)
 *   testcases/*.csv            (nguồn sự thật, ghép bằng mã case ở đầu tên test)
 *
 * Xuất:  test-reports/regression-<thời điểm>.md  +  test-reports/latest.md
 *        và in 1 dòng tóm tắt ra stdout để thông báo desktop dùng.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RESULTS = path.join(ROOT, 'test-results', 'results.json');
const CSV_DIR = path.join(ROOT, 'testcases');
const OUT_DIR = path.join(ROOT, 'test-reports');

/** Parser CSV nhỏ: xử lý được ô có dấu phẩy, dấu ngoặc kép và xuống dòng bên trong. */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // bỏ BOM
  const rows = [];
  let row = [], cell = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const TRUTHY = new Set(['true', 'x', 'yes', 'y', '1', 'có', 'co']);

/** Đọc mọi file csv trong testcases/ -> map mã case -> { known, bug, note, purpose } */
function readTestCases() {
  const map = new Map();
  if (!fs.existsSync(CSV_DIR)) return map;
  for (const f of fs.readdirSync(CSV_DIR).filter((x) => x.toLowerCase().endsWith('.csv'))) {
    const rows = parseCsv(fs.readFileSync(path.join(CSV_DIR, f), 'utf8'));
    // Tìm dòng tiêu đề: dòng có ô đầu là "Mã trường hợp kiểm thử"
    const h = rows.findIndex((r) => (r[0] || '').trim() === 'Mã trường hợp kiểm thử');
    if (h < 0) continue;
    const head = rows[h].map((c) => (c || '').trim().toLowerCase());
    const col = (name) => head.indexOf(name.toLowerCase());
    const cKnown = col('Known issue'), cBug = col('Mã lỗi');
    const cNote = col('Ghi chú'), cPurpose = col('Mục đích kiểm thử');
    for (const r of rows.slice(h + 1)) {
      const id = (r[0] || '').trim();
      if (!id) continue;
      const get = (i) => (i >= 0 && r[i] != null ? String(r[i]).trim() : '');
      map.set(id, {
        known: TRUTHY.has(get(cKnown).toLowerCase()),
        bug: get(cBug),
        note: get(cNote),
        purpose: get(cPurpose),
        file: f,
      });
    }
  }
  return map;
}

/** Lấy mã case ở đầu tên test, vd "CF_04b [P0] ..." -> "CF_04b" */
const caseIdOf = (title) => (title.match(/^([A-Z]{2,3}_\d+[a-z]?)/) || [])[1] || null;

function collect(suites, out = [], trail = []) {
  for (const s of suites || []) {
    const where = s.title ? [...trail, s.title] : trail;
    for (const spec of s.specs || []) {
      for (const t of spec.tests || []) {
        const last = (t.results || [])[t.results.length - 1] || {};
        const ann = [...(t.annotations || []), ...(last.annotations || [])];
        out.push({
          title: spec.title,
          file: s.file || where[0] || '',
          line: spec.line,
          status: t.status,                       // expected | unexpected | skipped | flaky
          declaredSkip: ann.some((a) => a.type === 'skip' || a.type === 'fixme'),
          error: ((last.error && last.error.message) || '')
            .replace(/\x1b\[[0-9;]*m/g, '')
            .split('\n')[0].trim(),
          duration: last.duration || 0,
        });
      }
    }
    collect(s.suites, out, where);
  }
  return out;
}

function main() {
  if (!fs.existsSync(RESULTS)) {
    console.log('Không tìm thấy test-results/results.json — thiếu reporter json?');
    process.exit(0);
  }
  const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));
  const cases = readTestCases();
  const tests = collect(data.suites).filter((t) => t.title);

  const pass = [], failNew = [], failKnown = [], skipped = [], notRun = [], flaky = [];
  for (const t of tests) {
    const id = caseIdOf(t.title);
    const tc = id ? cases.get(id) : null;
    t.caseId = id; t.tc = tc;
    if (t.status === 'unexpected') (tc && tc.known ? failKnown : failNew).push(t);
    else if (t.status === 'flaky') flaky.push(t);
    else if (t.status === 'skipped') (t.declaredSkip ? skipped : notRun).push(t);
    else pass.push(t);
  }

  const verdict = failNew.length ? 'KHÔNG ĐẠT'
    : failKnown.length ? 'ĐẠT (có lỗi đã biết)' : 'ĐẠT';
  const total = tests.length;
  const started = new Date(data.stats.startTime);
  const secs = Math.round((data.stats.duration || 0) / 1000);
  const dur = secs >= 60 ? `${Math.floor(secs / 60)}m${String(secs % 60).padStart(2, '0')}s` : `${secs}s`;

  const counts =
    `PASS ${pass.length} · FAIL ${failNew.length} · LỖI ĐÃ BIẾT ${failKnown.length}` +
    ` · SKIP ${skipped.length}` +
    (notRun.length ? ` · KHÔNG CHẠY ${notRun.length}` : '') +
    (flaky.length ? ` · FLAKY ${flaky.length}` : '') +
    ` / ${total}`;

  const stamp = `${started.getFullYear()}-${String(started.getMonth() + 1).padStart(2, '0')}-` +
    `${String(started.getDate()).padStart(2, '0')}_${String(started.getHours()).padStart(2, '0')}` +
    `${String(started.getMinutes()).padStart(2, '0')}`;

  const L = [];
  L.push(`# Regression — ${verdict}`, '');
  L.push(`- **Thời điểm:** ${started.toLocaleString('vi-VN')}`);
  L.push(`- **Thời gian chạy:** ${dur}`);
  L.push(`- **Kết quả:** ${counts}`, '');

  const row = (t) => {
    const bug = t.tc && t.tc.bug ? t.tc.bug : '—';
    const note = t.tc && t.tc.note ? t.tc.note : '';
    const short = t.caseId ? t.title.slice(t.caseId.length).trim() : t.title;
    return `| \`${t.caseId || '?'}\` | ${short.replace(/\|/g, '\\|')} | ${bug} | ${note.replace(/\|/g, '\\|')} |`;
  };

  if (failNew.length) {
    L.push(`## ❌ LỖI MỚI (${failNew.length}) — cần xem`, '');
    for (const t of failNew) {
      const short = t.caseId ? t.title.slice(t.caseId.length).trim() : t.title;
      L.push(`### \`${t.caseId || '?'}\` ${short}`);
      L.push(`- **Lỗi:** ${t.error || '(không có thông báo)'}`);
      L.push(`- **Chỗ:** ${t.file}${t.line ? ':' + t.line : ''}`);
      if (!t.tc) L.push(`- ⚠️ **Không có mã case này trong file test case** — nên thêm vào CSV.`);
      L.push('');
    }
  }

  if (failKnown.length) {
    L.push(`## ⚠️ LỖI ĐÃ BIẾT (${failKnown.length}) — đã log bug, đang chờ fix`, '');
    L.push('| Mã case | Test | Mã lỗi | Ghi chú |', '|---|---|---|---|');
    failKnown.forEach((t) => L.push(row(t)));
    L.push('');
    L.push('<details><summary>Thông báo lỗi chi tiết</summary>', '');
    failKnown.forEach((t) => L.push(`- \`${t.caseId}\`: ${t.error || '(không có)'}`));
    L.push('', '</details>', '');
  }

  if (notRun.length) {
    L.push(`## ⏭️ KHÔNG CHẠY (${notRun.length})`, '');
    L.push('Các test này bị bỏ qua vì test trước trong cùng file đã fail (`mode: serial`).', '');
    L.push(notRun.map((t) => `\`${t.caseId || t.title}\``).join(', '), '');
  }

  if (skipped.length) {
    L.push(`## ⏸️ SKIP có chủ đích (${skipped.length})`, '');
    L.push(skipped.map((t) => `\`${t.caseId || t.title}\``).join(', '), '');
  }

  // Đối chiếu CSV <-> script
  const ranIds = new Set(tests.map((t) => t.caseId).filter(Boolean));
  const noScript = [...cases.keys()].filter((id) => !ranIds.has(id));
  const noCase = [...ranIds].filter((id) => !cases.has(id));
  if (noScript.length || noCase.length) {
    L.push('## 🔍 Đối chiếu file test case và script', '');
    if (noScript.length) L.push(`- Có trong test case, **chưa có script** (${noScript.length}): ${noScript.map((i) => `\`${i}\``).join(', ')}`);
    if (noCase.length) L.push(`- Có script, **không có trong test case** (${noCase.length}): ${noCase.map((i) => `\`${i}\``).join(', ')}`);
    L.push('');
  }

  L.push('---', '', `Report HTML chi tiết (kèm trace, ảnh): \`npx playwright show-report\``);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `regression-${stamp}.md`);
  fs.writeFileSync(file, L.join('\n') + '\n', 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'latest.md'), L.join('\n') + '\n', 'utf8');

  // stdout: dòng 1 = verdict, dòng 2 = số liệu, dòng 3 = đường dẫn (test-notify.sh đọc)
  console.log(verdict);
  console.log(counts);
  console.log(path.relative(ROOT, file));
}

main();
