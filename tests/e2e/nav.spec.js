import { expect, test } from "@playwright/test";

test.describe("active nav highlight", () => {
  test("nav link becomes active as the matching section enters the viewport", async ({ page }) => {
    await page.goto("/index.html");

    await page.locator("#method").scrollIntoViewIfNeeded();
    await expect(page.locator('.sidebar-nav a[href="#method"]')).toHaveClass(/is-active/, {
      timeout: 5_000,
    });

    await page.locator("#lab").scrollIntoViewIfNeeded();
    await expect(page.locator('.sidebar-nav a[href="#lab"]')).toHaveClass(/is-active/, {
      timeout: 5_000,
    });
  });
});
