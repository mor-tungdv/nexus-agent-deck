#!/usr/bin/env bash
# Sync Nexus Agent Deck từ folder nguồn sang repo này.
#
# Folder nguồn là READ-ONLY: script chỉ đọc, không bao giờ ghi vào đó.
# Chỉ những path liệt kê trong manifest.txt được copy (allow-list, không phải
# .gitignore deny-list) — file không có trong manifest thì không tồn tại ở đây
# để mà commit nhầm.
#
# Dùng: ./sync.sh   rồi   git add -A && git commit -m "update deck" && git push

set -euo pipefail

SRC="${NEXUS_DECK_SRC:-/Users/tungdao/Downloads/Nexus Agent}"
STG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DECK="AI Agent Deck.dc.html"

[ -d "$SRC" ] || { echo "✗ Không tìm thấy folder nguồn: $SRC"; exit 1; }

# Assert closure đầy đủ TRƯỚC khi copy — thiếu file runtime thì deck hỏng âm
# thầm trên Pages (image slot trống, iframe trắng) mà không báo lỗi nào.
miss=0
while IFS= read -r p; do
  [ -n "$p" ] || continue
  [ -e "$SRC/$p" ] || { echo "MISSING: $p"; miss=$((miss + 1)); }
done < "$STG/manifest.txt"
[ "$miss" -eq 0 ] || { echo "✗ Thiếu $miss file trong nguồn — sửa manifest.txt"; exit 1; }

rsync -a --files-from="$STG/manifest.txt" "$SRC/" "$STG/"

# GitHub Pages cần index.html. Deck gốc tên có khoảng trắng + double-extension
# nên giữ nguyên tên và tạo bản copy, thay vì rename hay redirect stub.
cp "$STG/$DECK" "$STG/index.html"

# Jekyll của Pages bỏ qua mọi path bắt đầu bằng '_' → mất _ds/ (styles.css +
# _ds_bundle.js) → deck load nhưng không style, không chạy. Xoá file này là hỏng.
touch "$STG/.nojekyll"

echo "✓ Synced $(wc -l < "$STG/manifest.txt" | tr -d ' ') file + index.html + .nojekyll"
