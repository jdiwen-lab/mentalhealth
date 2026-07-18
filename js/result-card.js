const CARD_WIDTH = 1200;
const CARD_HEIGHT = 1500;

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const bigint = Number.parseInt(value, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function splitText(ctx, text, maxWidth) {
  const segments = typeof Intl?.Segmenter === "function"
    ? [...new Intl.Segmenter("zh-Hant", { granularity: "word" }).segment(text)].map(({ segment }) => segment)
    : [...text];
  const lines = [];
  let line = "";

  for (const segment of segments) {
    const candidate = `${line}${segment}`;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line.trim());
      line = segment;
    } else {
      line = candidate;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function drawLines(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const lines = splitText(ctx, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return lines.length;
}

function drawHarbor(ctx, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.arc(0, 15, 148, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.lineWidth = 16;
  for (let i = 0; i < 3; i += 1) {
    const y = 62 + i * 38;
    ctx.beginPath();
    ctx.moveTo(-145, y);
    ctx.bezierCurveTo(-85, y - 34, -35, y + 34, 18, y);
    ctx.bezierCurveTo(70, y - 34, 110, y + 27, 150, y - 4);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -92, 29, 0, Math.PI * 2);
  ctx.fill();
}

function drawLighthouse(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-72, 130);
  ctx.lineTo(-45, -54);
  ctx.lineTo(45, -54);
  ctx.lineTo(72, 130);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-62, -90, 124, 42);
  ctx.beginPath();
  ctx.moveTo(-78, -90);
  ctx.lineTo(0, -142);
  ctx.lineTo(78, -90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.82)";
  ctx.fillRect(-18, 52, 36, 78);
  ctx.fillRect(-21, -40, 42, 34);
  ctx.strokeStyle = color;
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  [[-92, -125, -182, -163], [92, -125, 182, -163], [-106, -82, -208, -74], [106, -82, 208, -74]].forEach((points) => {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    ctx.lineTo(points[2], points[3]);
    ctx.stroke();
  });
}

function drawBreeze(ctx, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  [(-70), 0, 72].forEach((y, index) => {
    ctx.lineWidth = 22 - index * 3;
    ctx.beginPath();
    ctx.moveTo(-185, y);
    ctx.bezierCurveTo(-80, y - 70, 20, y + 70, 105, y);
    ctx.bezierCurveTo(148, y - 34, 180, y - 10, 188, y + 12);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(144, 12, 46, -0.4, Math.PI * 1.55);
  ctx.stroke();
}

function drawCoral(ctx, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 28;
  const branches = [
    [[0, 150], [0, -135]],
    [[-8, 45], [-76, -15], [-93, -92]],
    [[-54, 4], [-132, -23], [-156, -76]],
    [[9, 65], [78, 5], [96, -82]],
    [[50, 27], [135, 2], [157, -53]]
  ];
  branches.forEach((points) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
  });
  ctx.fillStyle = color;
  [[-94, -102], [-158, -84], [98, -94], [160, -64], [0, -145]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawWave(ctx, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(-190, 62);
  ctx.bezierCurveTo(-110, 45, -58, -22, 4, -82);
  ctx.bezierCurveTo(72, -148, 158, -104, 170, -25);
  ctx.bezierCurveTo(126, -53, 77, -52, 45, -11);
  ctx.bezierCurveTo(5, 40, -45, 72, -105, 68);
  ctx.stroke();
  ctx.lineWidth = 17;
  ctx.beginPath();
  ctx.moveTo(-160, 112);
  ctx.bezierCurveTo(-58, 75, 44, 142, 160, 88);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(116, -118, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(163, -88, 11, 0, Math.PI * 2);
  ctx.fill();
}

const illustrationDrawers = {
  harbor: drawHarbor,
  lighthouse: drawLighthouse,
  breeze: drawBreeze,
  coral: drawCoral,
  wave: drawWave
};

export function roleSymbolSvg(roleId) {
  const symbols = {
    harbor: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="27" r="8" fill="currentColor"/><path d="M20 58c10-18 20-18 30 0s20 18 30 0M24 72c9-10 18-10 27 0s18 10 27 0" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>',
    lighthouse: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M38 82h24L58 36H42l-4 46Zm4-51h16l-8-9-8 9Z" fill="currentColor"/><path d="M19 31 35 38M81 31 65 38M18 50h17M82 50H65" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
    breeze: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M16 35c18-13 34 10 51-1 12-8 23 2 18 12-4 8-16 6-18-1M14 54c24-9 37 13 59 1M24 72c18-7 29 6 44 1" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>',
    coral: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 84V22M48 54 29 38l-7-15M49 45l19-17 5-13M31 40l-14 2M66 30l17 3M50 62l20 15" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wave: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M14 59c16-2 25-19 39-29 17-12 35 1 34 20-9-8-19-7-26 1-11 13-24 19-43 16M23 79c19-7 35 9 57-1" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  return symbols[roleId] ?? symbols.harbor;
}

export async function renderResultCard(canvas, role, strengthLine) {
  if (document.fonts?.ready) await document.fonts.ready;
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  const serif = '"Noto Serif TC", "Songti TC", "PMingLiU", serif';
  const sans = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';

  const background = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  background.addColorStop(0, role.colorSoft);
  background.addColorStop(0.56, "#fffaf1");
  background.addColorStop(1, hexToRgba(role.color, 0.2));
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.17;
  ctx.fillStyle = role.color;
  ctx.beginPath();
  ctx.arc(1100, 130, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(40, 1370, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = hexToRgba(role.color, 0.15);
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const y = 250 + i * 245;
    ctx.beginPath();
    ctx.moveTo(-70, y);
    ctx.bezierCurveTo(250, y - 120, 440, y + 110, 710, y);
    ctx.bezierCurveTo(900, y - 90, 1070, y + 55, 1270, y - 18);
    ctx.stroke();
  }

  roundedRect(ctx, 72, 72, CARD_WIDTH - 144, CARD_HEIGHT - 144, 58);
  ctx.fillStyle = "rgba(255,255,255,.54)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = role.colorDark;
  ctx.font = `700 28px ${sans}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("職場韌力角色心理測驗", 120, 148);
  ctx.letterSpacing = "0px";

  ctx.save();
  ctx.translate(CARD_WIDTH / 2, 390);
  ctx.fillStyle = hexToRgba(role.color, 0.12);
  ctx.beginPath();
  ctx.arc(0, 0, 235, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.58)";
  ctx.beginPath();
  ctx.arc(0, 0, 190, 0, Math.PI * 2);
  ctx.fill();
  illustrationDrawers[role.id](ctx, role.colorDark);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = hexToRgba(role.colorDark, 0.72);
  ctx.font = `700 25px ${sans}`;
  ctx.fillText("你的職場韌力角色是", CARD_WIDTH / 2, 672);

  ctx.fillStyle = role.colorDark;
  ctx.font = `900 110px ${serif}`;
  ctx.fillText(role.name, CARD_WIDTH / 2, 796);

  ctx.fillStyle = role.color;
  ctx.font = `800 30px ${sans}`;
  ctx.fillText(role.tagline, CARD_WIDTH / 2, 860);

  roundedRect(ctx, 135, 935, 930, 260, 42);
  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.fill();

  ctx.fillStyle = role.colorDark;
  ctx.font = `700 24px ${sans}`;
  ctx.fillText(strengthLine, CARD_WIDTH / 2, 998);

  ctx.fillStyle = "#29454d";
  ctx.font = `600 34px ${serif}`;
  const lineCount = drawLines(ctx, role.cardLine, CARD_WIDTH / 2, 1065, 790, 53, 3);

  const pillY = 1065 + lineCount * 53 + 28;
  ctx.font = `700 23px ${sans}`;
  const pillWidths = role.keywords.map((keyword) => ctx.measureText(keyword).width + 54);
  const totalPillWidth = pillWidths.reduce((sum, width) => sum + width, 0) + (pillWidths.length - 1) * 14;
  let pillX = (CARD_WIDTH - totalPillWidth) / 2;
  role.keywords.forEach((keyword, index) => {
    const width = pillWidths[index];
    roundedRect(ctx, pillX, pillY, width, 52, 26);
    ctx.fillStyle = hexToRgba(role.color, 0.13);
    ctx.fill();
    ctx.fillStyle = role.colorDark;
    ctx.fillText(keyword, pillX + width / 2, pillY + 34);
    pillX += width + 14;
  });

  ctx.fillStyle = "rgba(41,69,77,.68)";
  ctx.font = `500 22px ${sans}`;
  ctx.fillText("結果僅供自我探索 · 不含原始答案與分數", CARD_WIDTH / 2, 1358);
  ctx.fillStyle = role.colorDark;
  ctx.font = `800 21px ${sans}`;
  ctx.fillText("jdiwen-lab.github.io/mentalhealth", CARD_WIDTH / 2, 1408);
  ctx.textAlign = "start";
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("無法產生 PNG 圖卡"));
    }, "image/png", 0.96);
  });
}
