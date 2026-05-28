import { expect, test } from "@playwright/test";

test.describe("case study filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html");
  });

  test("default state shows all case studies", async ({ page }) => {
    const status = page.locator("[data-case-filter-status]");
    await expect(status).toContainText(/Showing all 3 proof entries/i);
    await expect(page.locator(".case-card.is-hidden")).toHaveCount(0);
  });

  test("clicking valuation filter shows only the DCF proof card", async ({ page }) => {
    await page.locator('[data-filter="valuation"]').click();

    const valuationButton = page.locator('[data-filter="valuation"]');
    await expect(valuationButton).toHaveAttribute("aria-pressed", "true");
    await expect(valuationButton).toHaveClass(/active/);

    const allButton = page.locator('[data-filter="all"]');
    await expect(allButton).toHaveAttribute("aria-pressed", "false");

    await expect(page.locator("[data-case-filter-status]")).toContainText(/valuation proof entry/i);
    await expect(page.locator(".case-card:not(.is-hidden)")).toHaveCount(1);
    await expect(page.locator(".case-card:not(.is-hidden)").first()).toContainText("Dynamic DCF Valuation Model");
  });

  test("filter status copy updates with visible count", async ({ page }) => {
    await page.locator('[data-filter="decision"]').click();
    await expect(page.locator("[data-case-filter-status]")).toContainText(/Showing 2 decision support proof entries/i);
  });

  test("workflow filter surfaces the operational framework only", async ({ page }) => {
    await page.locator('[data-filter="workflow"]').click();

    await expect(page.locator("[data-case-filter-status]")).toContainText(/workflow proof entry/i);
    await expect(page.locator(".case-card:not(.is-hidden)")).toHaveCount(1);
    await expect(page.locator(".case-card:not(.is-hidden)").first()).toContainText("routine work");
  });
});

test.describe("project lab filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html");
  });

  test("in-development filter hides concept and archive cards", async ({ page }) => {
    await page.locator('[data-project-filter="in-development"]').click();

    const conceptCard = page.locator('[data-project-status="concept"]');
    const archiveCard = page.locator('[data-project-status="archive"]');
    const devCard = page.locator('[data-project-status="in-development"]');

    await expect(conceptCard).toHaveClass(/is-hidden/);
    if ((await archiveCard.count()) > 0) {
      await expect(archiveCard).toHaveClass(/is-hidden/);
    }
    await expect(devCard).not.toHaveClass(/is-hidden/);
  });

  test("all button restores every project card", async ({ page }) => {
    await page.locator('[data-project-filter="concept"]').click();
    await page.locator('[data-project-filter="all"]').click();

    await expect(page.locator(".lab-card.is-hidden")).toHaveCount(0);
  });
});
