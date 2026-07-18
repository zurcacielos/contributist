const fs = require('fs');

let original = fs.readFileSync('src/app/globals.css', 'utf8');
let newCss = fs.readFileSync('docs.local/example-ui/commit-canvas.css', 'utf8');

// Combine them if not already combined
if (!original.includes('.app-shell')) {
    original = original + '\n\n/* AESTHETIC CSS */\n' + newCss;
}

// Apply my responsive grid fixes to combined CSS

// 1. Layout: 330px left, responsive middle, 190px right
original = original.replace(
  /\.layout \{ display: grid; grid-template-columns: 330px minmax\(720px, 1fr\) 380px; gap: 18px; padding: 18px 24px 24px; \}/g,
  '.layout { display: grid; grid-template-columns: 330px minmax(0, 1fr) 190px; gap: 18px; padding: 18px 24px 24px; }'
);

// 2. Workspace container queries
original = original.replace(
  /\.workspace \{ min-width: 0; \}/g,
  '.workspace { min-width: 0; container-type: inline-size; }'
);

// 3. Graph-wrap overflow
original = original.replace(
  /\.graph-wrap \{ position:relative; padding-left:48px; min-height: 170px; \}/g,
  '.graph-wrap { position:relative; padding-left:48px; min-height: 170px; overflow-y: hidden; }'
);

// 4. Months font size
original = original.replace(
  /\.months \{ margin-left: 48px; display:grid; grid-template-columns: repeat\(12, 1fr\); color:#d9d7f0; font-size:14px; margin-bottom:8px; \}/g,
  '.months { margin-left: 48px; display:grid; grid-template-columns: repeat(12, 1fr); color:#d9d7f0; font-size: clamp(5px, 1.5cqi, 14px); margin-bottom:8px; }'
);

// 5. Contrib-grid responsive and days
const gridRegex = /\.contrib-grid \{[\s\S]*?(?=\.mountains \{)/;
const newGridCSS = `
.contrib-grid { display:grid; grid-auto-flow: column; gap: 0.35vw; position:relative; z-index:2; width: 100%; }
.contrib-grid::before { content:""; display: contents; }
.contrib-grid.big { grid-template-rows: repeat(7, 1fr); }
.contrib-grid.small { grid-template-rows: repeat(5, 1fr); margin-top: 4px; }
.contrib-grid > span { aspect-ratio: 1 / 1; width: 100%; height: auto; border-radius: 20%; background: #101b31; border:1px solid rgba(255,255,255,.025); box-shadow: inset 0 1px rgba(255,255,255,.04); }
.contrib-grid > span.v1 { background:#103625; }.contrib-grid > span.v2 { background:#176d39; }.contrib-grid > span.v3 { background:#2ab24e; }.contrib-grid > span.v4 { background:#99df3f; }.contrib-grid > span.hot1{background:#ffce42}.contrib-grid > span.hot2{background:#ff8e31}.contrib-grid > span.hot3{background:#ff4f91}.contrib-grid > span.hot4{background:#d02cff}.contrib-grid > span.purple{background:#6e34ce}.contrib-grid > span.pink{background:#d34dff}

.contrib-grid .days {
    position: absolute;
    left: -40px;
    top: 0;
    bottom: 0;
    display: grid;
    grid-template-rows: inherit;
    gap: inherit;
    color: #d5d2ef;
    font-size: clamp(5px, 1.5cqi, 14px);
    align-items: center;
}
`;
original = original.replace(gridRegex, newGridCSS);
original = original.replace(/\.days \{ position:absolute; left:0; top: 18px; display:grid; gap:34px; color:#d5d2ef; font-size:14px; \}/g, '');

fs.writeFileSync('src/app/globals.css', original);
console.log('Successfully recreated globals.css');
