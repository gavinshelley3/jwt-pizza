import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("diner dashboard shows user and order history", async ({ page }) => {
  await basicInit(page, { initialUserEmail: "d@jwt.com", startPath: "/diner-dashboard" });

  await expect(page.getByRole("heading", { name: "Your pizza kitchen" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Kai Chen");
  await expect(page.getByRole("main")).toContainText("d@jwt.com");
  await expect(page.getByRole("main")).toContainText("diner");
  await expect(page.locator("tbody")).toContainText("10");
  await expect(page.locator("tbody")).toContainText("0.004");
});

test("admin can close a franchise", async ({ page }) => {
  await basicInit(page, { initialUserEmail: "a@jwt.com", startPath: "/admin-dashboard" });

  await page
    .locator("tr", { hasText: "LotaPizza" })
    .getByRole("button", { name: "Close" })
    .click();

  await expect(page.getByRole("heading", { name: "Sorry to see you go" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("LotaPizza");
  await page.getByRole("button", { name: "Close" }).click();

  await expect(page.getByRole("heading", { name: "Mama Ricci's kitchen" })).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText("LotaPizza");
});
