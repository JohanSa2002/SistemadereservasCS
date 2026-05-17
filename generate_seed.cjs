// Layout fiel al plano entregado
// Canvas: W=1050, H=830
const stands = [];

function s(nombre, svg_id, x, y, w, h, tier, isBodega = false) {
  stands.push({ nombre, svg_id, x, y, w, h, tier, isBodega });
}

// ── COLUMNA IZQUIERDA (1-8, de abajo hacia arriba) ─────────────────────────
const LX = 15, LW = 105, LH = 78;
s('Stand 1', 'stand-1',  LX, 735, LW, LH, 'Tier A');
s('Stand 2', 'stand-2',  LX, 651, LW, LH, 'Tier A');
s('Stand 3', 'stand-3',  LX, 567, LW, LH, 'Tier A');
s('Stand 4', 'stand-4',  LX, 483, LW, LH, 'Tier A');
s('Stand 5', 'stand-5',  LX, 399, LW, LH, 'Tier A');
s('Stand 6', 'stand-6',  LX, 315, LW, LH, 'Tier A');
s('Stand 7', 'stand-7',  LX, 215, LW, LH, 'Tier A');
s('Stand 8', 'stand-8',  LX, 130, LW, LH, 'Tier A');

// ── FLOTANTES ARRIBA (58-61) ───────────────────────────────────────────────
s('Stand 61', 'stand-61', 435, 15, 52, 35, 'Tier C');
s('Stand 60', 'stand-60', 497, 15, 52, 35, 'Tier C');
s('Stand 59', 'stand-59', 559, 15, 52, 35, 'Tier C');
s('Stand 58', 'stand-58', 621, 15, 52, 35, 'Tier C');

// ── ZONA TECHADA SUPERIOR ─────────────────────────────────────────────────
// Filas horizontales pequeñas (9-13, 14-19)
const RY1 = 108, RY2 = 168, RW = 45, RH = 28;
const RX = 138;
s('Stand 9',  'stand-9',  RX,         RY1, RW, RH, 'Tier B');
s('Stand 10', 'stand-10', RX+50,      RY1, RW, RH, 'Tier B');
s('Stand 11', 'stand-11', RX+100,     RY1, RW, RH, 'Tier B');
s('Stand 12', 'stand-12', RX+150,     RY1, RW, RH, 'Tier B');
s('Stand 13', 'stand-13', RX+200,     RY1, RW, RH, 'Tier B');

s('Stand 19', 'stand-19', RX,         RY2, RW, RH, 'Tier B');
s('Stand 18', 'stand-18', RX+50,      RY2, RW, RH, 'Tier B');
s('Stand 17', 'stand-17', RX+100,     RY2, RW, RH, 'Tier B');
s('Stand 16', 'stand-16', RX+150,     RY2, RW, RH, 'Tier B');
s('Stand 15', 'stand-15', RX+200,     RY2, RW, RH, 'Tier B');
s('Stand 14', 'stand-14', RX+250,     RY2, RW, RH, 'Tier B');

// Columnas verticales zona superior (20-22, 27-29, 33-35, 39-41, 45-47, 50-52)
// Cada columna: 3 stands de 30x38
const CV = [
  { x: 407, nums: [20, 21, 22] },
  { x: 447, nums: [27, 28, 29] },
  { x: 495, nums: [33, 34, 35] },
  { x: 543, nums: [39, 40, 41] },
  { x: 591, nums: [45, 46, 47] },
  { x: 639, nums: [50, 51, 52] },
];
const CY_TOP = 103, CV_H = 37, CV_W = 32;
CV.forEach(({ x, nums }) => {
  nums.forEach((n, i) => {
    s(`Stand ${n}`, `stand-${n}`, x, CY_TOP + i * (CV_H + 2), CV_W, CV_H, 'Tier B');
  });
});

// Stand 57 (single, zona derecha superior)
s('Stand 57', 'stand-57', 687, 140, 32, 37, 'Tier C');

// ── BODEGAS Y ZONA DERECHA ─────────────────────────────────────────────────
s('BODEGA 15', 'stand-b15', 728, 100, 115, 100, 'Tier A', true);
s('Stand 56',  'stand-56',  687, 218,  32,  50, 'Tier C');
s('BODEGA 26', 'stand-b26', 728, 218,  95,  95, 'Tier A', true);
s('BODEGA 25', 'stand-b25', 854, 130,  58, 195, 'Tier A', true);
s('Stand 62',  'stand-62',  728, 323,  50,  32, 'Tier C');

// ── ZONA TECHADA INFERIOR ─────────────────────────────────────────────────
// Columnas verticales inferiores (23-25, 30-32, 36-38, 41-43, 47-49, 53-55)
const CV2 = [
  { x: 407, nums: [23, 24, 25] },
  { x: 447, nums: [30, 31, 32] },
  { x: 495, nums: [36, 37, 38] },
  { x: 543, nums: [42, 43, 44] },
  { x: 591, nums: [48, 49, 50] },
  { x: 639, nums: [53, 54, 55] },
];
const CY_BOT = 285;
CV2.forEach(({ x, nums }) => {
  nums.forEach((n, i) => {
    s(`Stand ${n}`, `stand-${n}`, x, CY_BOT + i * (CV_H + 2), CV_W, CV_H, 'Tier B');
  });
});

// ── ISLAS CENTRALES (78-83, 84-89) ────────────────────────────────────────
// Isla 1: 78,79,80 / 81,82,83
const IX = 258, IY1 = 430, IW = 42, IH = 40;
s('Stand 78', 'stand-78', IX,         IY1,      IW, IH, 'Tier C');
s('Stand 79', 'stand-79', IX,         IY1+45,   IW, IH, 'Tier C');
s('Stand 80', 'stand-80', IX,         IY1+90,   IW, IH, 'Tier C');
s('Stand 81', 'stand-81', IX+52,      IY1,      IW, IH, 'Tier C');
s('Stand 82', 'stand-82', IX+52,      IY1+45,   IW, IH, 'Tier C');
s('Stand 83', 'stand-83', IX+52,      IY1+90,   IW, IH, 'Tier C');

// Isla 2: 84,85,86 / 87,88,89
const IX2 = 368;
s('Stand 84', 'stand-84', IX2,        IY1,      IW, IH, 'Tier C');
s('Stand 85', 'stand-85', IX2,        IY1+45,   IW, IH, 'Tier C');
s('Stand 86', 'stand-86', IX2,        IY1+90,   IW, IH, 'Tier C');
s('Stand 87', 'stand-87', IX2+52,     IY1,      IW, IH, 'Tier C');
s('Stand 88', 'stand-88', IX2+52,     IY1+45,   IW, IH, 'Tier C');
s('Stand 89', 'stand-89', IX2+52,     IY1+90,   IW, IH, 'Tier C');

// ── FILA INFERIOR (71-77) ─────────────────────────────────────────────────
const BY = 650, BW = 90, BH = 75;
const bNums = [77, 76, 75, 74, 73, 72, 71];
bNums.forEach((n, i) => {
  s(`Stand ${n}`, `stand-${n}`, 215 + i * 96, BY, BW, BH, 'Tier A');
});

// ── COLUMNA DERECHA (63-70) ───────────────────────────────────────────────
const RCX = 898, RCW = 92, RCH = 52;
const rcNums = [63, 64, 65, 66, 67, 68, 69, 70];
rcNums.forEach((n, i) => {
  s(`Stand ${n}`, `stand-${n}`, RCX, 413 + i * 58, RCW, RCH, 'Tier A');
});

// ── GENERAR SQL ───────────────────────────────────────────────────────────
const fs = require('fs');
let out = '';
stands.forEach(({ nombre, svg_id, x, y, w, h, tier }) => {
  const tv = tier === 'Tier A' ? 'v_tier_a' : tier === 'Tier B' ? 'v_tier_b' : 'v_tier_c';
  out += `      INSERT INTO public.stands (event_id, tier_id, nombre, svg_id, x, y, w, h, status) VALUES (v_event_id, ${tv}, '${nombre}', '${svg_id}', ${x}, ${y}, ${w}, ${h}, 'available');\n`;
});
fs.writeFileSync('stands_sql.txt', out);
console.log(`Generated ${stands.length} stands.`);
