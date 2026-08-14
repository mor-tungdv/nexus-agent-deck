// wiki-static.jsx — STATIC version of the LLM Wiki pipeline slide.
// Same layout, coordinates, lines and content as the animated scene,
// but every element is rendered in its settled state (no enter/pop/flight,
// all connector lines fully drawn) so nothing appears late or disappears.

const W = 1920, H = 1080;
const FONT_SANS = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const CONTENT = 'oklch(0.56 0.15 250)', CONTENT_T = 'oklch(0.94 0.02 250)';
const ENTITY  = 'oklch(0.56 0.13 150)', ENTITY_T  = 'oklch(0.94 0.02 150)';
const FACT    = 'oklch(0.64 0.16 55)',  FACT_T    = 'oklch(0.94 0.03 55)';
const REL     = 'oklch(0.56 0.14 300)', REL_T     = 'oklch(0.94 0.02 300)';
const PROV    = 'oklch(0.6 0.15 20)',   PROV_T    = 'oklch(0.94 0.025 20)';

const THEMES = {
  light: { bg:'oklch(0.975 0.004 240)', panel:'oklch(0.995 0.002 240)', border:'oklch(0.87 0.008 240)',
    text:'oklch(0.24 0.014 240)', muted:'oklch(0.5 0.012 240)', faint:'oklch(0.63 0.01 240)', line:'oklch(0.8 0.01 240)' },
  dark: { bg:'oklch(0.22 0.014 240)', panel:'oklch(0.28 0.016 240)', border:'oklch(0.4 0.016 240)',
    text:'oklch(0.96 0.004 240)', muted:'oklch(0.76 0.01 240)', faint:'oklch(0.6 0.012 240)', line:'oklch(0.46 0.012 240)' },
};

// static settled helpers
const SETTLED = { opacity: 1, transform: 'none' };
const MOTION = { enter: () => SETTLED, pop: () => SETTLED, draw: () => 1 };
function reveal() { return { strokeDasharray: 1, strokeDashoffset: 0 }; }

function Box({ x, y, w, h, style, children }) {
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', ...style }}>{children}</div>;
}
function Card({ x, y, w, h, theme, accent, glow, style, children }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box',
      background: theme.panel, border: `1.5px solid ${accent || theme.border}`, borderRadius: 12,
      boxShadow: glow ? `0 0 0 1px ${accent}22, 0 18px 40px -12px ${accent}55, 0 2px 8px rgba(0,0,0,.08)` : '0 2px 10px rgba(0,0,0,.06)',
      padding: 12, display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FONT_SANS, color: theme.text,
      ...style,
    }}>{children}</div>
  );
}
function MicroLabel({ children, theme, color }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: color || theme.faint }}>{children}</div>;
}
function Tech({ show, children, theme, style }) {
  if (!show) return null;
  return <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: theme.faint, ...style }}>{children}</div>;
}
function Tag({ text, color, tint }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 999, background: tint, color, fontSize: 13, fontWeight: 600, fontFamily: FONT_SANS }}>{text}</span>;
}
function Icon({ kind, color, size = 26 }) {
  const s = size;
  const base = { position: 'relative', width: s, height: s, flexShrink: 0 };
  if (kind === 'doc') return (
    <div style={base}>{[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 0, top: i * (s * 0.34), width: i === 2 ? s * 0.55 : s, height: s * 0.16, borderRadius: 2, background: color, opacity: i === 2 ? 0.55 : 0.85 }} />)}</div>
  );
  if (kind === 'person') return (
    <div style={base}><div style={{ position: 'absolute', left: s * 0.28, top: 0, width: s * 0.44, height: s * 0.44, borderRadius: '50%', background: color }} /><div style={{ position: 'absolute', left: s * 0.08, top: s * 0.52, width: s * 0.84, height: s * 0.44, borderRadius: '10px 10px 0 0', background: color, opacity: 0.75 }} /></div>
  );
  if (kind === 'grid') return (
    <div style={{ ...base, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: s * 0.14 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ borderRadius: 3, background: color, opacity: i === 1 || i === 2 ? 0.6 : 0.9 }} />)}</div>
  );
  if (kind === 'file') return (
    <div style={base}><div style={{ position: 'absolute', inset: 0, borderRadius: 4, border: `2px solid ${color}`, clipPath: `polygon(0 0, 65% 0, 100% 30%, 100% 100%, 0 100%)` }} /><div style={{ position: 'absolute', left: '62%', top: 0, width: '38%', height: '30%', borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} /></div>
  );
  if (kind === 'hub') return (
    <div style={base}><div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${color}`, opacity: 0.9 }} /><div style={{ position: 'absolute', inset: s * 0.28, borderRadius: '50%', background: color }} /></div>
  );
  if (kind === 'table') return (
    <div style={base}><div style={{ position: 'absolute', inset: 0, border: `2px solid ${color}`, borderRadius: 3 }} /><div style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: 2, background: color }} /><div style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: '100%', background: color }} /></div>
  );
  if (kind === 'link') return (
    <div style={base}><div style={{ position: 'absolute', left: '10%', top: '10%', width: s * 0.24, height: s * 0.24, borderRadius: '50%', background: color }} /><div style={{ position: 'absolute', right: '10%', top: '10%', width: s * 0.24, height: s * 0.24, borderRadius: '50%', background: color, opacity: 0.7 }} /><div style={{ position: 'absolute', left: '38%', bottom: 0, width: s * 0.24, height: s * 0.24, borderRadius: '50%', background: color, opacity: 0.85 }} /><svg style={{ position: 'absolute', inset: 0 }} viewBox={`0 0 ${s} ${s}`}><line x1={s * 0.22} y1={s * 0.22} x2={s * 0.5} y2={s * 0.88} stroke={color} strokeWidth="1.6" /><line x1={s * 0.78} y1={s * 0.22} x2={s * 0.5} y2={s * 0.88} stroke={color} strokeWidth="1.6" opacity="0.7" /></svg></div>
  );
  return null;
}
function Row({ k, v, theme, size = 13, color }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: size, fontFamily: FONT_SANS, lineHeight: 1.25 }}>
      <span style={{ color: theme.faint, fontWeight: 600 }}>{k}:</span>
      <span style={{ color: color || theme.text, fontWeight: 500 }}>{v}</span>
    </div>
  );
}

// ── ZONE 1 — SLACK (static, cards stay in place) ─────────────────────────────
const SLACK_CARDS = [
  { key: 'msg', y: 267, h: 110, icon: 'doc', title: 'Message', text: 'Team Member phụ trách API trong Sprint 1 — 10 task.', big: true },
  { key: 'thread', y: 417, h: 60, icon: 'doc', title: 'Thread', text: 'Kênh #project-nexus' },
  { key: 'sender', y: 517, h: 60, icon: 'person', title: 'Người gửi & thời gian', text: 'Project Manager · 14:32' },
  { key: 'excel', y: 617, h: 60, icon: 'file', title: 'File Excel', text: 'Project Plan.xlsx' },
  { key: 'pdf', y: 717, h: 60, icon: 'file', title: 'File PDF', text: 'Sprint1_Report.pdf' },
  { key: 'decision', y: 817, h: 76, icon: 'doc', title: 'Quyết định', text: 'Chốt: Team Member nhận API' },
];
const HUB = { x: 451, y: 300, r: 62 };

function SlackZone({ theme }) {
  const x0 = 40, w = 210;
  return (
    <>
      {SLACK_CARDS.map((c) => (
        <Card key={c.key} x={x0} y={c.y} w={w} h={c.h} theme={theme} style={{ justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon kind={c.icon} color={theme.faint} size={20} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              <MicroLabel theme={theme}>{c.title}</MicroLabel>
              <div style={{ fontSize: c.big ? 14.5 : 13, color: theme.text, fontWeight: c.big ? 600 : 500, lineHeight: 1.3 }}>{c.text}</div>
            </div>
          </div>
        </Card>
      ))}
      {/* flow arrows from Slack cards toward the hub */}
      <svg style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }}>
        {SLACK_CARDS.map((c) => (
          <line key={c.key} x1={x0 + w + 6} y1={c.y + c.h / 2} x2={HUB.x - HUB.r - 8} y2={HUB.y}
            stroke={theme.line} strokeWidth="1.4" opacity="0.5" />
        ))}
      </svg>
    </>
  );
}

// ── ZONE 2 — OPENCLAW ────────────────────────────────────────────────────────
const EVIDENCE = { x: 311, y: 390, w: 280, h: 270 };
const GATE1 = { x: 351, y: 680, w: 200, h: 50 };
const EV_FIELDS = [
  ['Nội dung', 'Team Member phụ trách API…'], ['Kênh & thread', '#project-nexus'],
  ['Người gửi', 'Project Manager'], ['Thời gian', '14:32'], ['File gốc', 'Project Plan.xlsx'],
];

function OpenClawZone({ theme, tech }) {
  return (
    <>
      <svg style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }}>
        <path pathLength="1" d={`M ${HUB.x} ${HUB.y + HUB.r} L ${EVIDENCE.x + EVIDENCE.w / 2} ${EVIDENCE.y}`} fill="none" stroke={theme.line} strokeWidth="2" {...reveal()} />
      </svg>
      <Box x={HUB.x - HUB.r} y={HUB.y - HUB.r} w={HUB.r * 2} h={HUB.r * 2}
        style={{ borderRadius: '50%', background: theme.panel, border: `2px solid ${theme.text}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: '0 10px 26px -8px rgba(0,0,0,.18)' }}>
        <Icon kind="hub" color={theme.text} size={26} />
        <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.text, letterSpacing: '.02em' }}>OpenClaw</div>
      </Box>
      <Card x={EVIDENCE.x} y={EVIDENCE.y} w={EVIDENCE.w} h={EVIDENCE.h} theme={theme} accent={theme.text + '22'} style={{ gap: 8 }}>
        <MicroLabel theme={theme}>Evidence Card</MicroLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {EV_FIELDS.map((f) => <div key={f[0]}><Row k={f[0]} v={f[1]} theme={theme} size={12.5} /></div>)}
        </div>
      </Card>
      <Box x={GATE1.x} y={GATE1.y} w={GATE1.w} h={GATE1.h}
        style={{ borderRadius: 10, border: `1.5px solid ${theme.text}33`, background: theme.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 3, height: 22, background: theme.text, opacity: 0.5, borderRadius: 2 }} />
          <div style={{ width: 3, height: 22, background: theme.text, opacity: 0.5, borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.text }}>Gate 1 — Kiểm tra nguồn</div>
      </Box>
      <div style={{ position: 'absolute', left: GATE1.x, top: GATE1.y + GATE1.h + 8, width: GATE1.w, fontSize: 11.5, color: theme.muted, textAlign: 'center', fontStyle: 'italic' }}>
        Nguồn nào? Phiên bản nào? Đến từ đâu?
      </div>
      <Tech show={tech} theme={theme} style={{ position: 'absolute', left: GATE1.x, top: GATE1.y + GATE1.h + 30, width: GATE1.w, textAlign: 'center' }}>Provenance</Tech>
    </>
  );
}

// ── ZONE 3 — TRÍCH XUẤT & CHUẨN HÓA ──────────────────────────────────────────
const SHARDS = [
  { key: 'content', y: 190, h: 160, color: CONTENT, tint: CONTENT_T, label: 'Nội dung', icon: 'doc' },
  { key: 'entities', y: 370, h: 160, color: ENTITY, tint: ENTITY_T, label: 'Thực thể', icon: 'grid' },
  { key: 'metrics', y: 550, h: 200, color: FACT, tint: FACT_T, label: 'Số liệu', icon: 'table' },
  { key: 'relations', y: 770, h: 160, color: REL, tint: REL_T, label: 'Quan hệ', icon: 'link' },
];
const ENTITY_TAGS = ['Team Member', 'API', 'Sprint 1', 'Nexus'];
const RELATION_ROWS = ['Team Member → phụ trách → API', 'Team Member → tham gia → Sprint 1', 'Sprint 1 → thuộc → Nexus'];
const SX = 638, SW = 432;

function ExtractZone({ theme, tech }) {
  return (
    <>
      <svg style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }}>
        {SHARDS.map((s, i) => {
          const y = s.y + s.h / 2;
          return <path key={s.key} pathLength="1" d={`M ${EVIDENCE.x + EVIDENCE.w} ${EVIDENCE.y + EVIDENCE.h * 0.15 + i * 60} L ${SX} ${y}`} fill="none" stroke={s.color} strokeWidth="1.6" opacity="0.55" {...reveal()} />;
        })}
      </svg>
      {SHARDS.map((s) => (
        <Card key={s.key} x={SX} y={s.y} w={SW} h={s.h} theme={theme} accent={s.color + '55'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon kind={s.icon} color={s.color} size={20} />
            <MicroLabel theme={theme} color={s.color}>{s.label}</MicroLabel>
          </div>
          {s.key === 'content' && (
            <div style={{ fontSize: 15, color: theme.text, marginTop: 6, lineHeight: 1.35 }}>&ldquo;Team Member phụ trách API trong Sprint 1.&rdquo;</div>
          )}
          {s.key === 'entities' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {ENTITY_TAGS.map((t) => <div key={t}><Tag text={t} color={s.color} tint={s.tint} /></div>)}
            </div>
          )}
          {s.key === 'metrics' && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ background: s.tint, borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 700, color: theme.text }}>task_count = 10</div>
                <div style={{ fontSize: 11.5, color: theme.muted }}>Đơn vị: task · Nguồn: Sprint 1 · E6:E59</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Gate 2 — Đối chiếu số liệu</span>
                <span style={{ color: s.color, fontWeight: 800 }}>✓</span>
              </div>
              <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic' }}>Con số phải khớp với vị trí trong nguồn.</div>
            </div>
          )}
          {s.key === 'relations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
              {RELATION_ROWS.map((r) => <div key={r} style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: theme.text }}>{r}</div>)}
            </div>
          )}
        </Card>
      ))}
    </>
  );
}

// ── ZONE 4 — LLM WIKI ────────────────────────────────────────────────────────
const CENTRAL = { x: 1310, y: 336, w: 290, h: 232 };
const SATS = [
  { key: 'nexus', x: 1130, y: 246, w: 160, h: 78, title: 'TRANG DỰ ÁN — NEXUS', sub: 'Dự án', link: 'thuộc dự án' },
  { key: 'sprint', x: 1650, y: 246, w: 160, h: 78, title: 'TRANG SPRINT — SPRINT 1', sub: 'Sprint', link: 'tham gia sprint' },
  { key: 'api', x: 1130, y: 586, w: 160, h: 78, title: 'TRANG CÔNG VIỆC — API', sub: 'Công việc', link: 'phụ trách' },
  { key: 'source', x: 1650, y: 586, w: 170, h: 78, title: 'TRANG NGUỒN — SLACK / EXCEL', sub: 'Nguồn', link: 'lấy từ nguồn' },
];
const FACT_CARD = { x: 1350, y: 744, w: 320, h: 86 };
const NAV_ITEMS = ['DỰ ÁN', 'CON NGƯỜI', 'CÔNG VIỆC', 'SPRINT', 'NGUỒN'];
const COVER = { x: 1100, y: 236, w: 740, h: 438 };
const TRACK_Y = 900;
function satEnd(s) { return { x: s.x + (s.x < CENTRAL.x ? s.w : 0), y: s.y + s.h / 2 }; }
function centralEdge(s) { return { x: s.x < CENTRAL.x ? CENTRAL.x : CENTRAL.x + CENTRAL.w, y: CENTRAL.y + CENTRAL.h / 2 }; }

function WikiZone({ theme, tech }) {
  const checklist = ['Đúng cấu trúc', 'Đúng liên kết', 'Đủ nguồn'];
  return (
    <>
      <Tech show={tech} theme={theme} style={{ position: 'absolute', left: 1130, top: 190 }}>Wiki Catalog</Tech>
      <Box x={1130} y={204} w={680} h={30} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 8 }}>
        {NAV_ITEMS.map((n, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.03em', color: theme.text }}>{n}</span>
            {i < NAV_ITEMS.length - 1 && <span style={{ color: theme.faint, margin: '0 14px' }}>|</span>}
          </div>
        ))}
      </Box>

      <Box x={COVER.x} y={COVER.y} w={COVER.w} h={COVER.h} style={{ border: `1.5px dashed ${theme.faint}`, borderRadius: 16 }} />
      <div style={{ position: 'absolute', left: COVER.x, top: COVER.y + COVER.h + 8, width: COVER.w, fontSize: 12.5, color: theme.muted, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontWeight: 700, color: theme.text }}>Phạm vi đã xác nhận</span>
        <span style={{ fontStyle: 'italic' }}>— phân biệt &ldquo;không có&rdquo; và &ldquo;chưa đủ dữ liệu&rdquo;.</span>
        {tech && <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: theme.faint }}>Signed Coverage</span>}
      </div>

      <svg style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }}>
        {SATS.map((s) => {
          const a = satEnd(s), b = centralEdge(s);
          const midx = (a.x + b.x) / 2, midy = (a.y + b.y) / 2 - 20 * (s.y < CENTRAL.y ? 1 : -1);
          return <path key={s.key} pathLength="1" d={`M ${a.x} ${a.y} Q ${midx} ${midy} ${b.x} ${b.y}`} fill="none" stroke={theme.faint} strokeWidth="1.6" {...reveal()} />;
        })}
        <path pathLength="1" d={`M ${CENTRAL.x + CENTRAL.w / 2} ${CENTRAL.y + CENTRAL.h} L ${FACT_CARD.x + FACT_CARD.w / 2} ${FACT_CARD.y}`} fill="none" stroke={FACT} strokeWidth="2" {...reveal()} />
        <path pathLength="1" d={`M 451 730 L 451 ${TRACK_Y} L ${FACT_CARD.x + FACT_CARD.w / 2} ${TRACK_Y}`} fill="none" stroke={PROV} strokeWidth="1.5" strokeDasharray="6 5" {...reveal()} />
        <path pathLength="1" d={`M ${FACT_CARD.x + FACT_CARD.w / 2} ${TRACK_Y} L ${FACT_CARD.x + FACT_CARD.w / 2} ${FACT_CARD.y + FACT_CARD.h}`} fill="none" stroke={PROV} strokeWidth="1.5" strokeDasharray="6 5" {...reveal()} />
      </svg>

      {SATS.map((s) => (
        <Card key={s.key} x={s.x} y={s.y} w={s.w} h={s.h} theme={theme} style={{ padding: 10, gap: 3 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: theme.text, lineHeight: 1.25 }}>{s.title}</div>
          <div style={{ fontSize: 11, color: CONTENT, fontFamily: FONT_MONO }}>{s.link}</div>
        </Card>
      ))}

      <Card x={CENTRAL.x} y={CENTRAL.y} w={CENTRAL.w} h={CENTRAL.h} theme={theme} accent={CONTENT} glow style={{ gap: 3, padding: 14 }}>
        <MicroLabel theme={theme} color={CONTENT}>Trang nhân sự</MicroLabel>
        <div style={{ fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: '.01em', margin: '2px 0 6px', whiteSpace: 'nowrap' }}>TEAM MEMBER</div>
        <Row k="Vai trò" v="Backend" theme={theme} />
        <Row k="Dự án" v="Nexus" theme={theme} />
        <Row k="Sprint" v="Sprint 1" theme={theme} />
        <Row k="Phụ trách" v="API" theme={theme} />
        <Row k="Task" v="→ facts_ref" theme={theme} color={FACT} />
        <Row k="Nguồn" v="Slack + Excel" theme={theme} />
      </Card>
      <Tech show={tech} theme={theme} style={{ position: 'absolute', left: CENTRAL.x, top: CENTRAL.y + CENTRAL.h + 8, width: CENTRAL.w, textAlign: 'center' }}>Entity Page · Typed Wiki Page</Tech>

      <div style={{ position: 'absolute', left: 1100, top: 704, width: 730, textAlign: 'center', fontSize: 12, fontWeight: 700, color: theme.faint, letterSpacing: '.03em' }}>
        GATE 3 — KIỂM TRA TRƯỚC KHI XUẤT BẢN
      </div>
      <Box x={1100} y={722} w={730} h={16} style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        {checklist.map((c) => <div key={c} style={{ fontSize: 13, fontWeight: 600, color: theme.text, display: 'flex', gap: 5, alignItems: 'center' }}><span style={{ color: CONTENT }}>✓</span>{c}</div>)}
      </Box>

      <Card x={FACT_CARD.x} y={FACT_CARD.y} w={FACT_CARD.w} h={FACT_CARD.h} theme={theme} accent={FACT} style={{ gap: 3, padding: 12 }}>
        <MicroLabel theme={theme} color={FACT}>Số liệu đã kiểm chứng</MicroLabel>
        <div style={{ fontFamily: FONT_MONO, fontSize: 19, fontWeight: 700, color: theme.text }}>task_count = 10 task</div>
        <div style={{ fontSize: 11.5, color: theme.muted }}>Nguồn: Sprint 1 · E6:E59</div>
      </Card>
      <Tech show={tech} theme={theme} style={{ position: 'absolute', left: FACT_CARD.x, top: FACT_CARD.y + FACT_CARD.h + 6, width: FACT_CARD.w, textAlign: 'center' }}>Structured Facts · DuckDB/SQL</Tech>
      <div style={{ position: 'absolute', left: CENTRAL.x + CENTRAL.w / 2 + 8, top: CENTRAL.y + CENTRAL.h + (FACT_CARD.y - CENTRAL.y - CENTRAL.h) / 2 - 8, fontSize: 11.5, fontFamily: FONT_MONO, color: FACT, fontWeight: 700 }}>facts_ref</div>

      <Box x={1656} y={54} w={204} h={40} style={{ borderRadius: 999, background: CONTENT_T, border: `1.5px solid ${CONTENT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ color: CONTENT, fontWeight: 800 }}>✓</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>Sẵn sàng để truy vấn</span>
      </Box>
    </>
  );
}

function Gate4Preview({ theme }) {
  const steps = ['Người dùng hỏi', 'Gate 4 kiểm chứng', 'Câu trả lời + nguồn'];
  return (
    <Box x={1700} y={812} w={190} h={190} style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, textAlign: 'center' }}>{s}</div>
          {i < steps.length - 1 && <div style={{ fontSize: 12, color: theme.faint }}>↓</div>}
        </React.Fragment>
      ))}
      <div style={{ fontSize: 10.5, color: theme.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 6, lineHeight: 1.3 }}>
        Gate 4 chỉ hoạt động khi hệ thống tạo câu trả lời.
      </div>
    </Box>
  );
}

const ZONE_X = [0, 288, 614, 1094, 1920];
const ZONE_LABELS = ['SLACK', 'OPENCLAW', 'TRÍCH XUẤT & CHUẨN HÓA', 'LLM WIKI'];

function Header({ theme }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 64, top: 40, fontSize: 44, fontWeight: 800, color: theme.text, fontFamily: FONT_SANS, letterSpacing: '-0.01em' }}>
        Dữ liệu được nạp vào LLM Wiki như thế nào?
      </div>
      <div style={{ position: 'absolute', left: 64, top: 98, fontSize: 19, color: theme.muted, fontFamily: FONT_SANS }}>
        Dữ liệu được phân loại, liên kết và kiểm chứng trước khi sẵn sàng để hỏi.
      </div>
      <div style={{ position: 'absolute', left: 64, top: 134, width: 1792, height: 1, background: theme.line, opacity: 0.6 }} />
    </>
  );
}
function ZoneHeaders({ theme }) {
  return (
    <>
      {[288, 614, 1094].map(x => <div key={x} style={{ position: 'absolute', left: x, top: 152, width: 1, height: 818, background: theme.line, opacity: 0.4 }} />)}
      {ZONE_LABELS.map((label, i) => (
        <div key={label} style={{ position: 'absolute', left: ZONE_X[i] + 24, top: 152, width: ZONE_X[i + 1] - ZONE_X[i] - 48, textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: theme.faint }}>
          {label}
        </div>
      ))}
    </>
  );
}
function Footer({ theme }) {
  return (
    <div style={{ position: 'absolute', left: 200, top: 1008, width: 1300, fontSize: 24, fontWeight: 600, color: theme.text, lineHeight: 1.35 }}>
      Tri thức được tổ chức theo thực thể và mối liên hệ — nhưng mọi nội dung, con số đều giữ đường về nguồn gốc.
    </div>
  );
}

function WikiStatic(props) {
  const theme = THEMES[props.theme] || THEMES.light;
  const tech = props.tech !== undefined ? props.tech : true;
  return (
    <div style={{ position: 'absolute', inset: 0, background: theme.bg, overflow: 'hidden', fontFamily: FONT_SANS }}>
      <Header theme={theme} />
      <ZoneHeaders theme={theme} />
      <SlackZone theme={theme} />
      <OpenClawZone theme={theme} tech={tech} />
      <ExtractZone theme={theme} tech={tech} />
      <WikiZone theme={theme} tech={tech} />
      <Gate4Preview theme={theme} />
      <Footer theme={theme} />
    </div>
  );
}

window.WikiStatic = WikiStatic;
