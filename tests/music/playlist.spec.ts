import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import path = require("node:path");

test.describe("Playlisty | REQ-PLAYLIST-01", () => {
  test("TC-PLAYLIST-01: Utworzenie playlisty z poprawnymi danymi", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const playlistName = `Test playlist ${Date.now()}`;
    const imagePath = path.resolve("tests/fixtures/test.jpg");

    await test.step("Warunek wstępny: użytkownik jest zalogowany i znajduje się na /home", async () => {
      await loginPage.login("test4@zuvoria.pl", "admin1111");
      await page.goto("/home");
    });

    await test.step("Krok 1: otwarcie formularza tworzenia playlisty", async () => {
      const plusButton = page.locator(".playListBox .nameBox i");
      await expect(plusButton).toBeVisible();
      await plusButton.click();

      await expect(page.getByText("Create PlayList")).toBeVisible();
    });

    await test.step("Krok 2: dodanie obrazka playlisty", async () => {
      await page.locator('input[type="file"]').setInputFiles(imagePath);
    });

    await test.step("Krok 3: wpisanie poprawnego tytułu", async () => {
      await page.getByRole("textbox").fill(playlistName);
    });

    await test.step("Krok 4: wysłanie formularza", async () => {
      await page.getByRole("button", { name: "Send" }).click();
    });

    await test.step("Krok 5: sprawdzenie komunikatu sukcesu", async () => {
      await expect(
        page.getByText("Playlist created successfully."),
      ).toBeVisible();
    });
  });

  test("TC-PLAYLIST-02: Próba utworzenia playlisty bez tytułu", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const imagePath = path.resolve("tests/fixtures/test.jpg");

    await test.step("Warunek wstępny: użytkownik jest zalogowany i znajduje się na /home", async () => {
      await loginPage.login("test4@zuvoria.pl", "admin1111");
      await page.goto("/home");
    });

    await test.step("Krok 1: otwarcie formularza tworzenia playlisty", async () => {
      const plusButton = page.locator(".playListBox .nameBox i");
      await expect(plusButton).toBeVisible();
      await plusButton.click();

      await expect(page.getByText("Create PlayList")).toBeVisible();
    });

    await test.step("Krok 2: dodanie obrazka bez wpisywania tytułu", async () => {
      await page.locator('input[type="file"]').setInputFiles(imagePath);
    });

    await test.step("Krok 3: próba wysłania formularza bez tytułu", async () => {
      await page.getByRole("button", { name: "Send" }).click();
    });

    await test.step("Krok 4: sprawdzenie komunikatu walidacji", async () => {
      await expect(page.getByText("Title is required")).toBeVisible();
    });
  });
});
