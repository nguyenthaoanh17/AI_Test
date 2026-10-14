#!/usr/bin/env python3
"""Bắn 1 thông báo desktop; bấm vào thông báo thì mở Playwright HTML report.

Vì sao phải viết bằng Python thay vì notify-send/gdbus:
  - notify-send 0.8.8 trên máy này báo "Actions are not supported by this
    notifications server" dù GNOME Shell có hỗ trợ actions.
  - Gửi bằng `gdbus call` rồi lắng nghe bằng `gdbus monitor` KHÔNG chạy được:
    GNOME gửi signal ActionInvoked riêng cho đúng tiến trình đã tạo thông báo.
    Hai lệnh gdbus là hai kết nối D-Bus khác nhau, và tiến trình gửi chết ngay
    sau khi gọi -> không còn ai nhận signal, bấm vào thông báo chỉ ẩn đi.
  - Script này giữ MỘT kết nối: gửi Notify rồi chờ signal trên cùng kết nối đó.

Dùng: notify-report.py "<tiêu đề>" "<nội dung>" [urgency 0|1|2] [icon]
"""
import os
import subprocess
import sys

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib  # noqa: E402

DEST = "org.freedesktop.Notifications"
OBJ = "/org/freedesktop/Notifications"

title = sys.argv[1] if len(sys.argv) > 1 else "Playwright"
body = sys.argv[2] if len(sys.argv) > 2 else ""
urgency = int(sys.argv[3]) if len(sys.argv) > 3 else 1
icon = sys.argv[4] if len(sys.argv) > 4 else "dialog-information"

repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
wait_seconds = int(os.environ.get("NOTIFY_WAIT_SECONDS", "1800"))

bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
loop = GLib.MainLoop()


def open_report():
    """Mở report. start_new_session để web server sống độc lập sau khi script thoát."""
    subprocess.Popen(
        ["npx", "playwright", "show-report"],
        cwd=repo,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        start_new_session=True,
    )


# 'default' = bấm vào thân thông báo; 'open' = nút bấm. expire_timeout 0 = không tự tắt.
params = GLib.Variant(
    "(susssasa{sv}i)",
    (
        "Playwright",
        0,
        icon,
        title,
        body,
        ["default", "Mở report", "open", "Mở report"],
        {"urgency": GLib.Variant("y", urgency)},
        0,
    ),
)
notif_id = bus.call_sync(
    DEST, OBJ, DEST, "Notify", params, GLib.VariantType("(u)"),
    Gio.DBusCallFlags.NONE, -1, None,
).unpack()[0]


def on_signal(_conn, _sender, _path, _iface, signal, args):
    payload = args.unpack()
    if not payload or payload[0] != notif_id:
        return
    if signal == "ActionInvoked":
        open_report()
        loop.quit()
    elif signal == "NotificationClosed":
        loop.quit()


for sig in ("ActionInvoked", "NotificationClosed"):
    bus.signal_subscribe(
        None, DEST, sig, OBJ, None, Gio.DBusSignalFlags.NONE, on_signal,
    )

GLib.timeout_add_seconds(wait_seconds, loop.quit)
loop.run()
