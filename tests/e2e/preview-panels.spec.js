import { expect, test } from "@playwright/test";

test.describe("DCF preview switcher", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dcf-model.html");
  });

  test("summary panel is active on load", async ({ page }) => {
    await expect(page.locator('[data-preview-panel="summary"]')).toBeVisible();
    await expect(page.locator('[data-preview-panel="inputs"]')).toBeHidden();
    await expect(page.locator('[data-preview-panel="checks"]')).toBeHidden();
  });

  test("clicking a tab swaps the visible panel and aria-selected", async ({ page }) => {
    await page.locator('[data-preview-button="inputs"]').click();

    await expect(page.locator('[data-preview-button="inputs"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(page.locator('[data-preview-button="summary"]')).toHaveAttribute(
      "aria-selected",
      "false"
    );
    await expect(page.locator('[data-preview-panel="inputs"]')).toBeVisible();
    await expect(page.locator('[data-preview-panel="summary"]')).toBeHidden();
  });

  test("tabpanels are linked back to their tab via aria-labelledby", async ({ page }) => {
    const panels = page.locator('[role="tabpanel"]');
    const count = await panels.count();
    expect(count).toBe(3);

    for (let i = 0; i < count; i += 1) {
      const labelledBy = await panels.nth(i).getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      const tab = page.locator(`#${labelledBy}`);
      await expect(tab).toHaveAttribute("role", "tab");
    }
  });
});
