import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("footer navigation opens about and history", async ({ page }) => {
  await basicInit(page);

  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "The secret sauce" })).toBeVisible();

  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByRole("heading", { name: "Mama Rucci, my my" })).toBeVisible();
});
