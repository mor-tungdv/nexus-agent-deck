# Nexus Agent Deck — live view

Live view của deck trình bày Nexus Agent, host trên GitHub Pages.

**→ https://mor-tungdv.github.io/nexus-agent-deck/**

## Repo này là gì

Bản publish của deck, không phải bản làm việc. Nguồn nằm ở folder local
`~/Downloads/Nexus Agent` (119 file, 81 MB). Repo này chỉ chứa **closure phụ
thuộc thật sự** của deck — 26 file, 49 MB — liệt kê trong [`manifest.txt`](manifest.txt).

Deck **không self-contained**: `index.html` phụ thuộc vào JS runtime
(`deck-stage.js`, `image-slot.js`, `support.js`), design-system bundle trong
`_ds/`, ảnh/video trong `uploads/`, và 4 sub-deck lồng trong `<iframe>` ở
`uploads/llm-wiki/`. Mở riêng file HTML mà thiếu cây thư mục này thì không chạy.

## Cập nhật deck

Sửa deck ở folder nguồn, rồi:

```bash
./sync.sh
git add -A && git commit -m "update deck" && git push
```

`sync.sh` đọc `manifest.txt`, assert đủ file trong nguồn, rsync sang đây, rồi
regenerate `index.html` và `.nojekyll`. Folder nguồn luôn read-only.

Đường dẫn nguồn override được: `NEXUS_DECK_SRC=/path/to/deck ./sync.sh`

## Ba file không được xoá

| File | Xoá thì sao |
|---|---|
| `.nojekyll` | Jekyll của Pages bỏ qua mọi path bắt đầu bằng `_` → mất `_ds/styles.css` và `_ds_bundle.js` → **deck load nhưng mất hết style và runtime** |
| `.image-slots.state.json` | `image-slot.js` fetch file này lúc render để hydrate ảnh vào slot → **các ô ảnh hiện trống, không lỗi nào báo ra** |
| `index.html` | Pages cần file này. Nó là bản copy của `AI Agent Deck.dc.html` (tên gốc có khoảng trắng + double-extension nên không dùng trực tiếp được) |

## Cấu trúc

```
index.html                    ← bản copy, Pages entry point
AI Agent Deck.dc.html         ← deck gốc, giữ nguyên tên để đối chiếu với local
deck-stage.js                 ← <x-import from="./deck-stage.js">
image-slot.js  support.js
.image-slots.state.json       ← sidecar, đọc lúc render
_ds/industry-.../             ← design system: styles.css + _ds_bundle.js
assets/  uploads/             ← ảnh + 4 video demo
uploads/llm-wiki/             ← 4 sub-deck iframe (self-contained) + support.js + wiki-static.jsx
```

Deck load Google Fonts từ CDN (`fonts.googleapis.com`) — dependency external duy nhất.
