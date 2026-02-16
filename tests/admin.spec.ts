import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("admin dashboard and docs", async ({ page }) => {
  await basicInit(page, { initialUserEmail: "a@jwt.com", startPath: "/admin-dashboard" });

  await expect(page.getByRole("heading", { name: "Mama Ricci's kitchen" })).toBeVisible();
  await page.getByPlaceholder("Filter franchises").fill("Lota");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("main")).toContainText("LotaPizza");

  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByPlaceholder("franchise name").fill("Orbit Pizza");
  await page.getByPlaceholder("franchisee admin email").fill("orbit@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("main")).toContainText("Orbit Pizza");

  await page.goto("/docs/service");
  await expect(page.getByRole("heading", { name: /\[GET\] \/api\/order\/menu/ })).toBeVisible();
});
