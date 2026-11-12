/**
 * 拯救派大星 —— Canvas 美术绘制层
 * 所有角色/道具均为程序化绘制（无需图片资源），风格：卡通、圆润、海星粉。
 */
import { VIEW } from './engine.js';

const SKY = ['#5fc0ee', '#8fd8f7', '#c8ecfb'];

export function drawBackground(ctx, t, clouds) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  g.addColorStop(0, SKY[0]);
  g.addColorStop(0.55, SKY[1]);
  g.addColorStop(1, SKY[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  // 太阳
  const sx = VIEW.width - 110;
  const sy = 92;
  const sun = ctx.createRadialGradient(sx, sy, 8, sx, sy, 90);
  sun.addColorStop(0, 'rgba(255,246,200,0.95)');
  sun.addColorStop(0.35, 'rgba(255,236,150,0.55)');
  sun.addColorStop(1, 'rgba(255,236,150,0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sx, sy, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3b8';
  ctx.beginPath();
  ctx.arc(sx, sy, 34, 0, Math.PI * 2);
  ctx.fill();

  // 云
  for (const c of clouds) {
    drawCloud(ctx, ((c.x + t * c.speed) % (VIEW.width + 260)) - 130, c.y, c.scale, c.alpha);
  }

  // 远处的海（底部浅色带，增加层次）
  const sea = ctx.createLinearGradient(0, 470, 0, 640);
  sea.addColorStop(0, 'rgba(130, 214, 245, 0)');
  sea.addColorStop(1, 'rgba(96, 196, 235, 0.55)');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 470, VIEW.width, 170);

  // 光束
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 220 + Math.sin(t * 0.3 + i) * 14;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 90, 0);
    ctx.lineTo(x + 250, 640);
    ctx.lineTo(x + 120, 640);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  drawGround(ctx, t);
}

function drawCloud(ctx, x, y, s, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 26 * s, 0, Math.PI * 2);
  ctx.arc(x + 30 * s, y - 12 * s, 32 * s, 0, Math.PI * 2);
  ctx.arc(x + 66 * s, y, 24 * s, 0, Math.PI * 2);
  ctx.arc(x + 34 * s, y + 10 * s, 30 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGround(ctx, t) {
  const top = 576;
  // 沙滩
  const sand = ctx.createLinearGradient(0, top, 0, VIEW.height);
  sand.addColorStop(0, '#ffe9a8');
  sand.addColorStop(1, '#f3c96b');
  ctx.fillStyle = sand;
  ctx.beginPath();
  ctx.moveTo(0, top + 14);
  ctx.quadraticCurveTo(VIEW.width * 0.25, top - 8, VIEW.width * 0.5, top + 8);
  ctx.quadraticCurveTo(VIEW.width * 0.78, top + 22, VIEW.width, top + 4);
  ctx.lineTo(VIEW.width, VIEW.height);
  ctx.lineTo(0, VIEW.height);
  ctx.closePath();
  ctx.fill();

  // 沙纹
  ctx.strokeStyle = 'rgba(197, 148, 72, 0.35)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 108;
    const y = top + 36 + (i % 3) * 14;
    ctx.beginPath();
    ctx.arc(x, y + 8, 22, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // 小贝壳
  for (const [x, y, s] of [[760, 612, 1], [852, 596, 0.8], [610, 624, 0.7]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#ffd7e8';
    ctx.beginPath();
    ctx.arc(0, 0, 12, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e79cc0';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(i * 5, -11);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 海草
  ctx.strokeStyle = 'rgba(58, 160, 132, 0.55)';
  ctx.lineWidth = 7;
  for (const [x, h] of [[330, 62], [352, 44], [905, 54]]) {
    ctx.beginPath();
    ctx.moveTo(x, VIEW.height);
    ctx.quadraticCurveTo(x + Math.sin(t * 1.4) * 14, VIEW.height - h * 0.5, x + Math.sin(t * 1.4 + 1) * 8, VIEW.height - h);
    ctx.stroke();
  }
}

/** 左下角固定「救助站」 */
export function drawRescueZone(ctx, t, glow) {
  const zx = 128;
  const zy = 556;
  ctx.save();

  // 光晕
  const pulse = 0.55 + Math.sin(t * 2.4) * 0.12 + glow * 0.5;
  const halo = ctx.createRadialGradient(zx, zy, 10, zx, zy, 96);
  halo.addColorStop(0, `rgba(255, 240, 150, ${0.35 * pulse})`);
  halo.addColorStop(1, 'rgba(255, 240, 150, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(zx, zy, 96, 0, Math.PI * 2);
  ctx.fill();

  // 木箱
  ctx.fillStyle = '#b57a3f';
  roundRect(ctx, zx - 52, zy - 26, 104, 66, 10);
  ctx.fill();
  ctx.fillStyle = '#d99a55';
  roundRect(ctx, zx - 52, zy - 26, 104, 16, 8);
  ctx.fill();
  ctx.strokeStyle = '#8a5527';
  ctx.lineWidth = 4;
  roundRect(ctx, zx - 52, zy - 26, 104, 66, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(zx - 34, zy - 14);
  ctx.lineTo(zx - 34, zy + 34);
  ctx.moveTo(zx + 34, zy - 14);
  ctx.lineTo(zx + 34, zy + 34);
  ctx.stroke();

  // 牌子
  ctx.fillStyle = '#8a5527';
  roundRect(ctx, zx - 44, zy - 84, 88, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 20px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('救助站', zx, zy - 66);

  // 旗子
  const wave = Math.sin(t * 3) * 4;
  ctx.strokeStyle = '#8a5527';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(zx - 52, zy - 26);
  ctx.lineTo(zx - 52, zy - 108);
  ctx.stroke();
  ctx.fillStyle = '#ff8dc7';
  ctx.beginPath();
  ctx.moveTo(zx - 52, zy - 106);
  ctx.quadraticCurveTo(zx - 18 + wave, zy - 98, zx - 14, zy - 86);
  ctx.quadraticCurveTo(zx - 34, zy - 82, zx - 52, zy - 76);
  ctx.closePath();
  ctx.fill();

  // 呼吸圈
  if (glow > 0) {
    ctx.globalAlpha = Math.min(1, glow * 2.2);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(zx, zy, 76 + (0.6 - glow) * 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** 派大星 */
export function drawPatrick(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const pts = starPoints(0, 0, r, 0.46);
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#f79fc8';
  ctx.fill();
  ctx.strokeStyle = '#d873a8';
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.stroke();

  // 花纹（浅色斑点）
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 210, 232, 0.85)';
  for (const [dx, dy, rr] of [[-r * 0.28, -r * 0.12, r * 0.1], [r * 0.3, -r * 0.2, r * 0.08], [r * 0.05, r * 0.42, r * 0.09]]) {
    ctx.beginPath();
    ctx.arc(dx, dy, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  // 花短裤（下部绿色 + 紫色小花）
  if (r > 22) {
    ctx.fillStyle = '#57b56b';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.46, r * 0.62, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b46bd8';
    for (const dx of [-r * 0.22, r * 0.16]) {
      ctx.beginPath();
      ctx.arc(dx, r * 0.46, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 脸
  const eyeY = -r * 0.12;
  const eyeDx = r * 0.2;
  ctx.fillStyle = '#ffffff';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * eyeDx, eyeY, r * 0.13, r * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3a2340';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * eyeDx + r * 0.02, eyeY + r * 0.02, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  // 眉毛
  ctx.strokeStyle = '#8a4a6e';
  ctx.lineWidth = Math.max(2, r * 0.055);
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * eyeDx, eyeY - r * 0.16, r * 0.13, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  // 微笑
  ctx.strokeStyle = '#8a4a6e';
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.beginPath();
  ctx.arc(0, r * 0.16, r * 0.18, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // 腮红
  ctx.fillStyle = 'rgba(255, 120, 170, 0.35)';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * r * 0.4, r * 0.18, r * 0.1, r * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 星星 */
export function drawStar(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = 'rgba(255, 236, 140, 0.9)';
  ctx.shadowBlur = 18;
  const pts = starPoints(0, 0, r, 0.45);
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#ffe14d';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#e8a800';
  ctx.lineWidth = Math.max(2, r * 0.09);
  ctx.stroke();
  // 高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.16, -r * 0.2, r * 0.14, r * 0.09, -0.6, 0, Math.PI * 2);
  ctx.fill();
  // 小眼睛
  ctx.fillStyle = '#7a5300';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * r * 0.16, r * 0.04, r * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 垃圾袋 */
export function drawTrash(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const w = r * 1.5;
  const h = r * 1.7;
  // 袋身
  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  grad.addColorStop(0, '#6d7f96');
  grad.addColorStop(0.45, '#46566b');
  grad.addColorStop(1, '#2c3949');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, h * 0.42);
  ctx.quadraticCurveTo(-w * 0.66, -h * 0.1, -w * 0.3, -h * 0.36);
  ctx.quadraticCurveTo(0, -h * 0.5, w * 0.3, -h * 0.36);
  ctx.quadraticCurveTo(w * 0.66, -h * 0.1, w * 0.5, h * 0.42);
  ctx.quadraticCurveTo(w * 0.3, h * 0.6, 0, h * 0.6);
  ctx.quadraticCurveTo(-w * 0.3, h * 0.6, -w * 0.5, h * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1d2733';
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.stroke();

  // 扎口
  ctx.fillStyle = '#54657a';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.42, w * 0.24, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1d2733';
  ctx.stroke();
  // 两个小耳朵
  ctx.beginPath();
  ctx.moveTo(-w * 0.16, -h * 0.48);
  ctx.quadraticCurveTo(-w * 0.34, -h * 0.66, -w * 0.1, -h * 0.58);
  ctx.moveTo(w * 0.16, -h * 0.48);
  ctx.quadraticCurveTo(w * 0.34, -h * 0.66, w * 0.1, -h * 0.58);
  ctx.stroke();

  // 高光
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = Math.max(2, r * 0.1);
  ctx.beginPath();
  ctx.arc(-w * 0.14, h * 0.02, r * 0.36, Math.PI * 1.05, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
}

export function drawItem(ctx, item) {
  if (item.kind === 'patrick') drawPatrick(ctx, item.x, item.y, item.radius, item.rot);
  else if (item.kind === 'star') drawStar(ctx, item.x, item.y, item.radius * 0.95, item.rot);
  else drawTrash(ctx, item.x, item.y, item.radius, item.rot);
}

/** 降落伞（含所携带的掉落物） */
export function drawParachute(ctx, p, t) {
  const sw = Math.sin(t * 2.2) * 3;
  const cx = p.x + sw * 0.4;
  const cy = p.y;
  const r = 44;

  // 绳子
  ctx.save();
  ctx.strokeStyle = 'rgba(90, 60, 40, 0.8)';
  ctx.lineWidth = 2;
  for (const s of [-1, -0.5, 0.5, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * r * 0.92, cy + 8);
    ctx.lineTo(p.x, p.y + 28);
    ctx.stroke();
  }

  // 伞衣
  const colors = ['#ff6b8a', '#fff1e0', '#ffb03a', '#fff1e0', '#ff6b8a', '#fff1e0'];
  const N = colors.length;
  for (let i = 0; i < N; i++) {
    const a0 = Math.PI + (i / N) * Math.PI;
    const a1 = Math.PI + ((i + 1) / N) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
  }
  // 伞衣描边与底部波浪
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
  ctx.strokeStyle = '#d94f6d';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  for (let i = 0; i < N; i++) {
    const a0 = Math.PI + ((i + 0.5) / N) * Math.PI;
    const a1 = Math.PI + ((i + 1) / N) * Math.PI;
    ctx.quadraticCurveTo(cx + Math.cos(a0) * (r + 8), cy + Math.sin(a0) * (r + 8), cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
  }
  ctx.stroke();

  // 吊篮
  ctx.fillStyle = '#b57a3f';
  roundRect(ctx, p.x - 13, p.y + 28, 26, 20, 6);
  ctx.fill();
  ctx.strokeStyle = '#8a5527';
  ctx.lineWidth = 2.5;
  roundRect(ctx, p.x - 13, p.y + 28, 26, 20, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x - 13, p.y + 36);
  ctx.lineTo(p.x + 13, p.y + 36);
  ctx.stroke();

  // 携带的掉落物（挂在吊篮下方）
  p.carrying.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const ix = p.x + (col - 1) * 17;
    const iy = p.y + 58 + row * 17;
    const s = 9 - row * 1.2;
    ctx.save();
    ctx.globalAlpha = 0.98;
    if (c.kind === 'patrick') drawPatrick(ctx, ix, iy, s, 0);
    else if (c.kind === 'star') drawStar(ctx, ix, iy, s * 0.9, 0);
    else drawTrash(ctx, ix, iy, s * 0.9, 0);
    ctx.restore();
  });
  ctx.restore();
}

/** 顶部 HUD：分数 + 生命 + 携带数量 */
export function drawHUD(ctx, game) {
  ctx.save();

  // 分数
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  roundRect(ctx, 18, 16, 176, 54, 14);
  ctx.fill();
  ctx.fillStyle = '#2c6d8f';
  ctx.font = 'bold 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('得分', 34, 34);
  ctx.fillStyle = game.score < 0 ? '#e0455f' : '#1b4f68';
  ctx.font = 'bold 30px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(String(game.score), 34, 57);

  // 生命（5 颗心）
  const hearts = game.cfg.maxLives;
  const hx = VIEW.width - 30;
  for (let i = 0; i < hearts; i++) {
    const alive = i < game.lives;
    drawHeart(ctx, hx - i * 34, 44, 13, alive);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  roundRect(ctx, VIEW.width - 214, 68, 196, 26, 12);
  ctx.fill();
  ctx.fillStyle = '#2c6d8f';
  ctx.font = 'bold 15px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('派大星掉下去会扣 1 颗生命', VIEW.width - 30, 82);

  // 携带格 / 容量（一次只能带 1 个）
  const n = game.parachute.carrying.length;
  const cap = game.cfg.maxCarry || 1;
  const full = n >= cap;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  roundRect(ctx, 18, 84, 158, 40, 12);
  ctx.fill();
  ctx.fillStyle = full ? '#e0455f' : '#2c6d8f';
  ctx.textAlign = 'left';
  ctx.font = 'bold 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(full ? `携带 ${n}/${cap}` : `空手 可接 ${cap} 件`, 32, 104);
  ctx.fillStyle = full ? '#b06a92' : '#7d95a5';
  ctx.font = '13px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(full ? '送回救助站才能再接' : '接满 1 件后需先送回', 32, 118);
  ctx.restore();
}

export function drawHeart(ctx, x, y, r, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.75);
  ctx.bezierCurveTo(-r * 1.5, -r * 0.4, -r * 0.55, -r * 1.25, 0, -r * 0.42);
  ctx.bezierCurveTo(r * 0.55, -r * 1.25, r * 1.5, -r * 0.4, 0, r * 0.75);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = '#ff5d7e';
    ctx.fill();
    ctx.strokeStyle = '#c93455';
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,160,170,0.55)';
  }
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** 底部操作提示 */
export function drawHint(ctx, text) {
  ctx.save();
  ctx.fillStyle = 'rgba(30, 70, 100, 0.38)';
  roundRect(ctx, VIEW.width / 2 - 175, VIEW.height - 44, 350, 32, 16);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = 'bold 15px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, VIEW.width / 2, VIEW.height - 28);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function starPoints(x, y, r, innerRatio = 0.46, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * innerRatio;
    const a = rot + (i * Math.PI) / 5;
    pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]);
  }
  return pts;
}
