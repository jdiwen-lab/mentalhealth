const ASSET_VERSION = "__ASSET_VERSION__";
const versionedAsset = (path) => `${path}?v=${ASSET_VERSION}`;

const CARD_ASSETS = {
  harbor: {
    preview: versionedAsset("assets/cards/harbor-preview.webp"),
    original: versionedAsset("assets/cards/harbor.png")
  },
  lighthouse: {
    preview: versionedAsset("assets/cards/lighthouse-preview.webp"),
    original: versionedAsset("assets/cards/lighthouse.png")
  },
  breeze: {
    preview: versionedAsset("assets/cards/breeze-preview.webp"),
    original: versionedAsset("assets/cards/breeze.png")
  },
  coral: {
    preview: versionedAsset("assets/cards/coral-preview.webp"),
    original: versionedAsset("assets/cards/coral.png")
  },
  wave: {
    preview: versionedAsset("assets/cards/wave-preview.webp"),
    original: versionedAsset("assets/cards/wave.png")
  }
};

export function getResultCardAsset(roleId) {
  const asset = CARD_ASSETS[roleId];
  if (!asset) throw new TypeError(`未知的圖卡角色：${roleId}`);
  return asset;
}

export async function fetchResultCardBlob(roleId) {
  const { original } = getResultCardAsset(roleId);
  const response = await fetch(original);
  if (!response.ok) throw new Error(`無法載入圖卡（${response.status}）`);
  const blob = await response.blob();
  if (blob.type && blob.type !== "image/png") throw new Error("圖卡格式不正確");
  return blob;
}

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
