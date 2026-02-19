import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./helpers/mockApi";

test("diner can update user profile and it persists after relogin", async ({ page }) => {
  await basicInit(page, { initialUserEmail: "d@jwt.com", startPath: "/diner-dashboard" });

  await expect(page.getByRole("main")).toContainText("Kai Chen");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("heading", { name: "Edit user" })).toBeVisible();
  await page.getByLabel("name").fill("Kai Updated");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });
  await expect(page.getByRole("main")).toContainText("Kai Updated");

  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();
  await page.goto("/diner-dashboard");

  await expect(page.getByRole("main")).toContainText("Kai Updated");
});

test("admin can list users with filter and pagination", async ({ page }) => {
  await basicInit(page, { initialUserEmail: "a@jwt.com", startPath: "/admin-dashboard" });

  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Kai Chen");

  await page.getByPlaceholder("Filter users").fill("Ada");
  await page.getByRole("button", { name: "Search Users" }).click();
  await expect(page.getByRole("main")).toContainText("Ada Min");
  await expect(page.getByRole("main")).not.toContainText("Kai Chen");

  await page.getByPlaceholder("Filter users").fill("");
  await page.getByRole("button", { name: "Search Users" }).click();
  await page.getByRole("button", { name: "Next users page" }).click();

  await expect(page.getByRole("main")).toContainText("Ivy Slice");
});

test("admin can delete a user", async ({ page }) => {
  await basicInit(page, { initialUserEmail: "a@jwt.com", startPath: "/admin-dashboard" });

  await expect(page.getByRole("main")).toContainText("Kai Chen");
  await page.locator("tr", { hasText: "Kai Chen" }).getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("main")).not.toContainText("Kai Chen");
});
