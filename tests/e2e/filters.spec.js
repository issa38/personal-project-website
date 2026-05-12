import { expect, test } from "@playwright/test";

test.describe("case study filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html");
  });

  test("default state shows all case studies", async ({ page }) => {
    const status = page.locator("[data-case-filter-status]");
    await expect(status).toContainText(/Showing all/i);
    await expect(page.locator(".case-card.is-hidden")).toHaveCount(0);
  });

  test("clicking finance filter hides cards without finance tag", async ({ page }) => {
    await page.locator('[data-filter="finance"]').click();

    const financeButton = page.locator('[data-filter="finance"]');
    await expect(financeButton).toHaveAttribute("aria-pressed", "true");
    await expect(financeButton).toHaveClass(/active/);

    const allButton = page.locator('[data-filter="all"]');
    await expect(allButton).toHaveAttribute("aria-pressed", "false");

    await expect(page.locator("[data-case-filter-status]")).toContainText(/finance/i);
  });

  test("filter status copy updates with visible count", async ({ page }) => {
    await page.locator('[data-filter="operations"]').click();
    await expect(page.locator("[data-case-filter-status]")).toContainText(/operations/i);
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
    await expect(archiveCard).toHaveClass(/is-hidden/);
    await expect(devCard).not.toHaveClass(/is-hidden/);
  });

  test("all button restores every project card", async ({ page }) => {
    await page.locator('[data-project-filter="concept"]').click();
    await page.locator('[data-project-filter="all"]').click();

    await expect(page.locator(".lab-card.is-hidden")).toHaveCount(0);
  });
});
