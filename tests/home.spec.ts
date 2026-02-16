import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("home page", async ({ page }) => {
  await basicInit(page);

  await expect(page).toHaveTitle("JWT Pizza");
  await expect(page.getByRole("heading", { name: "The web's best pizza" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("Version: 20260216.000000");
});
