import { test as setup } from "@playwright/test";

setup("login and save state", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="email"]', "test1@zuvoria.pl");
  await page.fill('input[name="password"]', "admin1111");

  await page.click('button:has-text("Login")');

  await page.waitForURL("**/home");

  await page.context().storageState({ path: "storageState.json" });
});
