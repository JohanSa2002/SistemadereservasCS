const fs = require('fs');
const stands = [];
function addStand(n, x, y, w, h, tier = 'Tier C', isBodega = false) {
  stands.push({ nombre: isBodega ? 'BODEGA ' + n : 'Stand ' + n, n, x, y, w, h, tier, isBodega });
}
for(let i=0; i<8; i++) addStand(1 + i, 100 + i*65, 20, 60, 80, 'Tier A');
for(let i=0; i<7; i++) addStand(77 - i, 20, 120 + i*65, 80, 60, 'Tier A');
for(let i=0; i<8; i++) addStand(70 - i, 20 + i*60, 600, 50, 80, 'Tier A');
function addIsland(startTopRight, startX, startY) {
  addStand(startTopRight, startX + 80, startY, 40, 30, 'Tier C');
  addStand(startTopRight + 1, startX + 40, startY, 40, 30, 'Tier C');
  addStand(startTopRight + 2, startX, startY, 40, 30, 'Tier C');
  addStand(startTopRight + 3, startX + 80, startY + 30, 40, 30, 'Tier C');
  addStand(startTopRight + 4, startX + 40, startY + 30, 40, 30, 'Tier C');
  addStand(startTopRight + 5, startX, startY + 30, 40, 30, 'Tier C');
}
addIsland(78, 160, 200);
addIsland(84, 160, 280);
let roofX = 350; let roofY = 100;
for(let i=0; i<5; i++) {
  addStand(9 + i, roofX + i*40, roofY, 40, 30, 'Tier B');
  addStand(19 - i, roofX + i*40, roofY + 30, 40, 30, 'Tier B');
}
let vertX_left = roofX; let vertY = roofY + 60 + 20;
for(let r=0; r<6; r++) {
  let baseLeft = 25 + r*6;
  addStand(baseLeft, vertX_left, vertY + r*30, 30, 30, 'Tier B');
  addStand(baseLeft - 1, vertX_left + 30, vertY + r*30, 30, 30, 'Tier B');
  addStand(baseLeft - 2, vertX_left + 60, vertY + r*30, 30, 30, 'Tier B');
}
let vertX_right = vertX_left + 90 + 40;
for(let r=0; r<6; r++) {
  let baseRight = 20 + r*6;
  addStand(baseRight + 2, vertX_right, vertY + r*30, 30, 30, 'Tier B');
  addStand(baseRight + 1, vertX_right + 30, vertY + r*30, 30, 30, 'Tier B');
  addStand(baseRight, vertX_right + 60, vertY + r*30, 30, 30, 'Tier B');
}
let farRightX = vertX_right + 110;
addStand(61, farRightX, vertY + 30, 40, 30, 'Tier C');
addStand(60, farRightX, vertY + 70, 40, 30, 'Tier C');
addStand(59, farRightX, vertY + 110, 40, 30, 'Tier C');
addStand(58, farRightX, vertY + 150, 40, 30, 'Tier C');
let bodegaY = vertY + 6*30 + 30;
addStand(62, roofX, bodegaY, 30, 40, 'Tier C');
addStand(56, roofX + 40, bodegaY - 40, 40, 30, 'Tier C');
addStand(57, roofX + 90, bodegaY - 40, 40, 30, 'Tier C');
addStand(26, roofX + 40, bodegaY, 80, 80, 'Tier A', true);
addStand(15, roofX + 130, bodegaY, 60, 80, 'Tier A', true);
addStand(25, roofX + 40, bodegaY + 90, 150, 60, 'Tier A', true);

let output = '';
stands.forEach(s => {
  let tierVar = s.tier === 'Tier A' ? 'v_tier_a' : s.tier === 'Tier B' ? 'v_tier_b' : 'v_tier_c';
  output += `      INSERT INTO public.stands (event_id, tier_id, nombre, svg_id, x, y, w, h, status) VALUES (v_event_id, ${tierVar}, '${s.nombre}', 'stand-${s.isBodega ? "b" + s.n : s.n}', ${s.x}, ${s.y}, ${s.w}, ${s.h}, 'available');\n`;
});
fs.writeFileSync('c:\\Users\\2002s\\Documents\\proyectos\\reservascs\\stands_sql.txt', output);
console.log('Done');
