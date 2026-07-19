import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const roleNames = ["港灣型", "燈塔型", "海風型", "珊瑚型", "浪花型"];

async function answerCurrentQuestion(page) {
  await page.locator(".option-label").first().click();
  await expect(page.locator("#next-button")).toBeEnabled();
  await page.locator("#next-button").click();
}

async function finishQuiz(page) {
  for (let question = 1; question <= 5; question += 1) {
    await expect(page.locator("#progress-label")).toHaveText(`第 ${question} 題，共 5 題`);
    await answerCurrentQuestion(page);
  }
  await expect(page.locator("#result-view")).toBeVisible();
}

async function expectNoAxeViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

test("可完整作答並在手機寬度顯示唯一結果", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#start-button").click();
  await finishQuiz(page);

  await expect(page.locator("#result-role-name")).toHaveText(new RegExp(roleNames.join("|")));
  await expect(page.locator("#result-card-image")).toBeVisible();
  await expect(page.locator("#result-card-image")).toHaveAttribute("src", /-preview\.webp\?v=1\.3\.0$/);
  await expect(page.locator("#download-button")).toBeVisible();
  await expect(page.locator("#other-roles")).not.toHaveAttribute("open", "");

  await page.getByRole("button", { name: "放大網頁文字" }).click();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test("續答為主要動作且重新開始前必須確認", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-button").click();
  await answerCurrentQuestion(page);
  await page.reload();

  await expect(page.locator("#resume-button")).toBeVisible();
  await expect(page.locator("#resume-button")).toHaveText("繼續上次進度（1/5）");
  await expect(page.locator("#resume-button")).toHaveClass(/button-primary/);
  await expect(page.locator("#start-button-label")).toHaveText("重新開始測驗");
  await expect(page.locator("#start-button")).toHaveClass(/button-quiet/);

  await page.locator("#start-button").click();
  await expect(page.locator("#restart-dialog")).toBeVisible();
  await page.getByRole("button", { name: "先不要" }).click();
  await expect(page.locator("#restart-dialog")).toBeHidden();
  await page.locator("#resume-button").click();
  await expect(page.locator("#progress-label")).toHaveText("第 2 題，共 5 題");
});

test("分享能力不足時明確改為分享連結且不下載圖卡", async ({ page }) => {
  await page.addInitScript(() => {
    window.__sharedPayload = null;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (payload) => { window.__sharedPayload = payload; }
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => false
    });
  });

  await page.goto("/");
  await page.locator("#start-button").click();
  await finishQuiz(page);

  await expect(page.locator("#share-button")).toBeVisible();
  await expect(page.locator("#share-button-label")).toHaveText("分享測驗連結");
  await page.locator("#share-button").click();
  await expect.poll(() => page.evaluate(() => window.__sharedPayload?.url)).toBe("https://jdiwen-lab.github.io/mentalhealth/");
  expect(await page.evaluate(() => window.__sharedPayload?.files)).toBeUndefined();
});

test("圖卡準備期間鎖定重複操作並在完成後分享 PNG", async ({ page }) => {
  await page.addInitScript(() => {
    window.__fileShare = null;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (payload) => {
        window.__fileShare = {
          fileCount: payload.files?.length ?? 0,
          fileName: payload.files?.[0]?.name,
          fileType: payload.files?.[0]?.type
        };
      }
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: (payload) => Array.isArray(payload.files) && payload.files.length === 1
    });
  });
  await page.route(/\/assets\/cards\/[^/]+\.png\?v=1\.3\.0$/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });

  await page.goto("/");
  await page.locator("#start-button").click();
  await finishQuiz(page);

  const shareButton = page.locator("#share-button");
  await expect(page.locator("#share-button-label")).toHaveText("分享圖卡");
  await shareButton.click();
  await expect(shareButton).toBeDisabled();
  await expect(page.locator("#download-button")).toBeDisabled();
  await expect(page.locator("#share-button-label")).toHaveText("正在準備圖卡…");
  await expect.poll(() => page.evaluate(() => window.__fileShare)).toEqual({
    fileCount: 1,
    fileName: expect.stringMatching(/^我的職場韌力角色-.+型\.png$/),
    fileType: "image/png"
  });
  await expect(shareButton).toBeEnabled();
  await expect(page.locator("#share-button-label")).toHaveText("分享圖卡");
});

test("尊重減少動態偏好並提供清楚鍵盤焦點", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => {
    window.__lastScrollBehavior = null;
    window.scrollTo = (options) => { window.__lastScrollBehavior = options?.behavior ?? null; };
  });

  await page.locator("#start-button").focus();
  await expect(page.locator("#start-button")).toHaveCSS("outline-color", "rgb(18, 54, 95)");
  await expect(page.locator("#start-button")).toHaveCSS("outline-width", "4px");
  await page.locator("#start-button").click();
  await expect.poll(() => page.evaluate(() => window.__lastScrollBehavior)).toBe("auto");

  await page.locator('.option-item input[type="radio"]').first().focus();
  await expect(page.locator(".option-label").first()).toHaveCSS("outline-color", "rgb(18, 54, 95)");
});

test("首頁、作答頁與結果頁皆無 WCAG A／AA 自動檢測問題", async ({ page }) => {
  await page.goto("/");
  await expectNoAxeViolations(page);

  await page.locator("#start-button").click();
  await expectNoAxeViolations(page);
  await finishQuiz(page);
  await expectNoAxeViolations(page);
});
