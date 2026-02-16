// import { test, expect } from "playwright-test-coverage";

// test("test", async ({ page }) => {
//   const menuResponse = [
//     { title: "Veggie", description: "A garden of delight" },
//   ];

//   // Mock out the service
//   await page.route("*/**/api/order/menu", async (route) => {
//     expect(route.request().method()).toBe("GET");
//     await route.fulfill({ json: menuResponse });
//   });

//   await page.goto("https://pizza.pizzagavinshelley3.click/");

//   await expect(page.getByText("Pizza").first()).toBeVisible();
//   await page.getByRole("button", { name: "Order now" }).click();
//   await page.locator("select[required]").click();

//   await expect(page.getByRole("list")).toContainText("Dad Pod");

//   await page.getByRole("option", { name: "Dad Pod" }).click();
//   await expect(page.getByRole("list")).toContainText(
//     "Veggie - A garden of delight",
//   );
// });
