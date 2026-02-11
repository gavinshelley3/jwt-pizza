// import { test, expect } from "@playwright/test";
import { test, expect } from "playwright-test-coverage";

test("test", async ({ page }) => {
  await page.goto("https://pizza.pizzagavinshelley3.click/");
  await expect(page.getByText("JWT Pizza", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
  await page.getByRole("button", { name: "Order now" }).click();
  await page.getByRole("combobox").selectOption("18");
  await expect(page.locator("form")).toContainText("A garden of delight");
  await expect(page.locator("form")).toContainText("Spicy treat");
  await expect(page.locator("form")).toContainText("Essential classic");
  await expect(page.locator("form")).toContainText("A dry mouthed favorite");
  await expect(page.locator("form")).toContainText(
    "For those with a darker side",
  );
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("link", { name: "Image Description Margarita" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 3");
  await page.getByRole("link", { name: "Image Description Crusty A" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 4");
  await page.getByRole("link", { name: "Image Description Charred" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 5");
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("gavinshelley3@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("password");
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  await expect(page.getByText("Are you new? Register instead.")).toBeVisible();
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("cell", { name: "Veggie" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Pepperoni" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Margarita" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Crusty" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Charred Leopard" }),
  ).toBeVisible();
  await expect(page.locator("tfoot")).toContainText("5 pies");
  await expect(page.getByRole("button", { name: "Pay now" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page.getByText("Here is your JWT Pizza!")).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Order more" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("pie count:");
  await expect(page.getByRole("main")).toContainText("5");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText("valid")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Order more" }).click();
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
});
