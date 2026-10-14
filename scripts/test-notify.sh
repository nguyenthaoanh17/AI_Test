#!/usr/bin/env bash
# Chạy Playwright test, xong thì bắn thông báo desktop.
# Bấm nút "Mở report" trên thông báo để mở HTML report.
#
# Dùng:  npm run test:notify
#        npm run test:notify -- tests/install-app.spec.ts
#        npm run test:notify -- --grep CF_01
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

# Khi chạy từ systemd timer / cron thì PATH không có nvm -> tự nạp nvm nếu thiếu npx.
# (Không hardcode phiên bản node để nvm nâng cấp không làm hỏng lịch chạy.)
if ! command -v npx >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
fi
if ! command -v npx >/dev/null 2>&1; then
  notify-send -u critical "❌ Playwright" "Không tìm thấy npx — kiểm tra nvm/node." 2>/dev/null
  exit 127
fi

LOG=$(mktemp)
trap 'rm -f "$LOG"' EXIT

npx playwright test "$@" 2>&1 | tee "$LOG"
CODE=${PIPESTATUS[0]}

# Sinh file report (test-reports/) và phân loại lỗi mới / lỗi đã biết theo file test case.
# stdout của make-report.js: dòng 1 = verdict, dòng 2 = số liệu, dòng 3 = đường dẫn report.
REPORT_OUT=$(node scripts/make-report.js 2>/dev/null)
VERDICT=$(printf '%s\n' "$REPORT_OUT" | sed -n '1p')
COUNTS=$(printf '%s\n' "$REPORT_OUT" | sed -n '2p')
REPORT_FILE=$(printf '%s\n' "$REPORT_OUT" | sed -n '3p')
WHEN=$(printf '%s\n' "$REPORT_OUT" | sed -n '4p')

if [ -n "$VERDICT" ]; then
  [ -z "$WHEN" ] && WHEN=$(date '+%d/%m/%Y - %H:%M')
  TITLE="Quick regression test - $WHEN"
  SUMMARY="$VERDICT · $COUNTS"
  case "$VERDICT" in
    "KHÔNG ĐẠT")     URGENCY=2; ICON=dialog-error ;;
    *"lỗi đã biết"*) URGENCY=1; ICON=dialog-warning ;;
    *)               URGENCY=1; ICON=dialog-information ;;
  esac
  [ -n "$REPORT_FILE" ] && echo "→ report: $REPORT_FILE"
else
  # make-report.js không chạy được -> quay về đọc dòng tổng kết thô của Playwright
  SUMMARY=$(sed -e 's/\x1b\[[0-9;]*m//g' "$LOG" \
    | grep -oE '^[[:space:]]*[0-9]+ (passed|failed|flaky|skipped|interrupted|did not run)[^$]*' \
    | sed 's/^[[:space:]]*//' | paste -sd'|' - | sed 's/|/ · /g')
  [ -z "$SUMMARY" ] && SUMMARY="Không đọc được kết quả — mở report để xem."
  TITLE="Quick regression test - $(date '+%d/%m/%Y - %H:%M')"
  if [ "$CODE" -eq 0 ]; then
    SUMMARY="ĐẠT · $SUMMARY"; URGENCY=1; ICON=dialog-information
  else
    SUMMARY="KHÔNG ĐẠT · $SUMMARY"; URGENCY=2; ICON=dialog-error
  fi
fi

# Tách hẳn phần thông báo ra tiến trình độc lập: nó phải sống lâu hơn script này
# để còn giữ kết nối D-Bus và chờ bạn bấm vào thông báo.
setsid nohup "$(dirname "$0")/notify-report.py" \
  "$TITLE" "$SUMMARY" "$URGENCY" "$ICON" >/dev/null 2>&1 < /dev/null &

exit "$CODE"
