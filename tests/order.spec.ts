import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("purchase with login and verify", async ({ page }) => {
  await basicInit(page);

  await page.getByRole("button", { name: "Order now" }).click();
  await expect(page.getByRole("heading", { name: "Awesome is a click away" })).toBeVisible();

  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: /Veggie/ }).click();
  await page.getByRole("link", { name: /Pepperoni/ }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");

  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("main")).toContainText("Send me those 2 pizzas right now!");
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008");

  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page.getByRole("main")).toContainText("Here is your JWT Pizza!");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText("valid")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
});
