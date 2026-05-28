import { expect, test } from "@playwright/test";

test.describe("interactive DCF model", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dcf-model.html");
  });

  test("loads and renders the workbook base case", async ({ page }) => {
    const app = page.locator("[data-dcf-app]");
    await expect(app).toBeVisible();

    await expect(page.locator('[data-dcf-out="impliedPrice"]')).toHaveText("$173.76");
    await expect(page.locator('[data-dcf-out="enterpriseValue"]')).toHaveText("$2.55T");
    await expect(page.locator('[data-dcf-out="equityValue"]')).toHaveText("$2.61T");
    await expect(page.locator('[data-dcf-out="wacc"]')).toHaveText("9.68%");
    await expect(page.locator('[data-dcf-out="upside"]')).toHaveText("-35.8%");

    // Forecast and sensitivity tables are populated.
    await expect(page.locator("[data-dcf-forecast] tr")).toHaveCount(5);
    await expect(page.locator("[data-dcf-sens-body] tr")).toHaveCount(5);
  });

  test("base-case engine reproduces workbook cached outputs", async ({ page }) => {
    const result = await page.evaluate(() => {
      const D = window.DCF;
      const i = {
        revenueGrowthShift: 0,
        ebitMarginShift: 0,
        taxRate: D.BASE.taxRate,
        dnaPctRev: D.BASE.dnaPctRev,
        capexPctRev: D.BASE.capexPctRev,
        nwcPctChgRev: D.BASE.nwcPctChgRev,
        terminalGrowth: D.BASE.terminalGrowth,
        terminalTiming: D.BASE.terminalTiming,
        riskFreeRate: D.BASE.riskFreeRate,
        equityRiskPremium: D.BASE.equityRiskPremium,
        beta: D.BASE.beta,
        preTaxCostOfDebt: D.BASE.preTaxCostOfDebt,
        cash: D.BASE.cash,
        grossDebt: D.BASE.grossDebt,
        dilutedShares: D.BASE.dilutedShares,
        currentPrice: D.BASE.currentPrice
      };
      return D.runModel(i, "base");
    });

    expect(result.impliedPrice).toBeCloseTo(173.75915910846811, 6);
    expect(result.enterpriseValue).toBeCloseTo(2552459533397.354, -3);
    expect(result.equityValue).toBeCloseTo(2607203533397.354, -3);
    expect(result.effWacc).toBeCloseTo(0.09684463892079634, 10);
    expect(result.upside).toBeCloseTo(-0.35813542496225437, 8);
  });

  test("changing an assumption updates the implied share price", async ({ page }) => {
    const price = page.locator('[data-dcf-out="impliedPrice"]');
    await expect(price).toHaveText("$173.76");

    const beta = page.locator("#dcf-beta");
    await beta.fill("1.5");
    await beta.blur();

    await expect(price).not.toHaveText("$173.76");
  });

  test("reset restores the base case", async ({ page }) => {
    const price = page.locator('[data-dcf-out="impliedPrice"]');
    const beta = page.locator("#dcf-beta");

    await beta.fill("1.5");
    await beta.blur();
    await expect(price).not.toHaveText("$173.76");

    await page.locator("[data-dcf-reset]").click();
    await expect(price).toHaveText("$173.76");
    await expect(beta).toHaveValue("1.11");
  });

  test("scenario buttons are accessible and switch the valuation", async ({ page }) => {
    const group = page.locator(".dcf-scenario");
    await expect(group).toHaveAttribute("role", "group");

    const base = group.locator('[data-dcf-scenario="base"]');
    const bull = group.locator('[data-dcf-scenario="bull"]');
    await expect(base).toHaveAttribute("aria-pressed", "true");

    await bull.click();
    await expect(bull).toHaveAttribute("aria-pressed", "true");
    await expect(base).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-dcf-out="impliedPrice"]')).not.toHaveText("$173.76");
  });

  test("model-check statuses render with an overall verdict", async ({ page }) => {
    const overall = page.locator("[data-dcf-overall]");
    await expect(overall).toHaveText("FAIL");
    await expect(overall).toHaveAttribute("data-status", "FAIL");

    const statuses = page.locator("[data-dcf-checks] .dcf-status");
    expect(await statuses.count()).toBeGreaterThan(8);
    await expect(
      page.locator('[data-dcf-checks] .dcf-status[data-status="PASS"]').first()
    ).toBeVisible();
  });

  test("scenario state is shareable via the URL hash", async ({ page }) => {
    await page.locator('[data-dcf-scenario="bull"]').click();
    await expect(page).toHaveURL(/#.*s=bull/);

    await page.goto("/dcf-model.html#s=bull");
    await expect(page.locator('[data-dcf-scenario="bull"]')).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
