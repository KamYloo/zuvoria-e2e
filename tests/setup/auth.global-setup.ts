import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(_: FullConfig) {
  const browser = await chromium.launch();
  const baseURL = process.env.UI_BASE_URL ?? "https://frontend.zuvoria.pl";
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  const userEmail = process.env.UI_USER_EMAIL ?? "test4@zuvoria.pl";
  const userPassword = process.env.UI_USER_PASSWORD ?? "admin1111";

  await page.goto(`${baseURL}/login`);
  await page.locator('input[name="email"]').fill(userEmail);
  await page.locator('input[name="password"]').fill(userPassword);
  await page.locator('button[type="submit"].login-btn').click();
  await page.waitForURL("**/home");

  await context.storageState({ path: "storageState.json" });
  await context.close();
  await browser.close();
}

export default globalSetup;
