import { expect, test } from "@playwright/test";

test.describe("command menu", () => {
  test("opens via the header trigger button", async ({ page }) => {
    await page.goto("/index.html");
    await page.locator("[data-command-open]").click();
    await expect(page.locator("[data-command-dialog]")).toBeVisible();
  });

  test("opens via Ctrl+K", async ({ page }) => {
    await page.goto("/index.html");
    await page.keyboard.press("Control+K");
    await expect(page.locator("[data-command-dialog]")).toBeVisible();
    await expect(page.locator("[data-command-search]")).toBeFocused();
  });

  test("filters items as the user types", async ({ page }) => {
    await page.goto("/index.html");
    await page.keyboard.press("Control+K");
    await page.locator("[data-command-search]").fill("resume");

    const filtered = page.locator('[data-command-item].is-filtered');
    const visible = page.locator('[data-command-item]:not(.is-filtered)');
    await expect(filtered.first()).toBeAttached();
    await expect(visible).toHaveCount(1);
  });

  test("Escape closes and resets the command menu filter", async ({ page }) => {
    await page.goto("/index.html");
    await page.keyboard.press("Control+K");
    await page.locator("[data-command-search]").fill("resume");
    await page.keyboard.press("Escape");

    await expect(page.locator("[data-command-dialog]")).toBeHidden();

    await page.keyboard.press("Control+K");
    await expect(page.locator("[data-command-search]")).toHaveValue("");
    await expect(page.locator("[data-command-item].is-filtered")).toHaveCount(0);
  });
});

test.describe("strategy brief dialog", () => {
  test("renders content from data attributes including bullet points", async ({ page }) => {
    await page.goto("/index.html");
    const trigger = page.locator('[data-brief-open]').first();
    const expectedTitle = await trigger.getAttribute("data-brief-title");
    const expectedPointsRaw = (await trigger.getAttribute("data-brief-points")) ?? "";
    const expectedPoints = expectedPointsRaw.split("|||");

    await trigger.click();

    const dialog = page.locator("[data-brief-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-brief-title]")).toHaveText(expectedTitle ?? "");
    await expect(dialog.locator("[data-brief-list] li")).toHaveCount(expectedPoints.length);
  });

  test("each project lab brief opens with the matching title", async ({ page }) => {
    await page.goto("/index.html");
    const triggers = await page.locator("[data-brief-open]").all();
    for (const trigger of triggers) {
      const expectedTitle = await trigger.getAttribute("data-brief-title");
      await trigger.click();
      const dialog = page.locator("[data-brief-dialog]");
      await expect(dialog.locator("[data-brief-title]")).toHaveText(expectedTitle ?? "");
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });
});
