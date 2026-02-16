import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("franchise dashboard store lifecycle", async ({ page }) => {
  await basicInit(page, { initialUserEmail: "f@jwt.com", startPath: "/franchise-dashboard" });

  await expect(page.getByRole("heading", { name: "LotaPizza" })).toBeVisible();
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByPlaceholder("store name").fill("Downtown");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByRole("main")).toContainText("Downtown");
  await page.locator("tr", { hasText: "Downtown" }).getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("main")).not.toContainText("Downtown");
});
