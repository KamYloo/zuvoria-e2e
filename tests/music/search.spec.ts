import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test.describe("Muzyka | REQ-MUSIC-01", () => {
  test("TC-MUSIC-01: Wyszukiwanie istniejącego albumu", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("Logowanie", async () => {
      await loginPage.login("test4@zuvoria.pl", "admin1111");
    });

    await test.step("Przejście do albumów", async () => {
      await page.goto("/albums");
    });

    await test.step("Wpisanie nazwy albumu", async () => {
      await page.getByPlaceholder(/search album/i).fill("Cold Summer");
    });

    await test.step("Kliknięcie Search", async () => {
      await page.getByRole("button", { name: /search/i }).click();
    });

    await test.step("Sprawdzenie wyniku", async () => {
      await expect(page.getByText("Cold Summer")).toBeVisible();
    });
  });
});
