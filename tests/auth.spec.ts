import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("register then logout", async ({ page }) => {
  await basicInit(page);

  await page.getByRole("link", { name: "Register" }).click();
  await page.getByPlaceholder("Full name").fill("New Tester");
  await page.getByPlaceholder("Email address").fill("new@jwt.com");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByRole("navigation", { name: "Global" })).toContainText("NT");
  await page.getByRole("link", { name: "Logout" }).click();

  await expect(page.getByRole("button", { name: "Order now" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});
