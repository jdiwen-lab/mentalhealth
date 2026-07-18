import test from "node:test";
import assert from "node:assert/strict";

import { roleOrder } from "../js/quiz-data.js";
import { getResultCardAsset } from "../js/result-card.js";

test("五種結果各自使用唯一的自製圖卡", () => {
  const assets = roleOrder.map((roleId) => getResultCardAsset(roleId));

  assert.equal(new Set(assets.map(({ original }) => original)).size, roleOrder.length);
  assert.equal(new Set(assets.map(({ preview }) => preview)).size, roleOrder.length);

  roleOrder.forEach((roleId, index) => {
    assert.equal(assets[index].original, `assets/cards/${roleId}.png`);
    assert.equal(assets[index].preview, `assets/cards/${roleId}-preview.webp`);
  });
});

test("未知角色不會誤用其他人的圖卡", () => {
  assert.throws(() => getResultCardAsset("unknown"), /未知的圖卡角色/);
});
