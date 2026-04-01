import path from "path";
import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { PlaylistPage } from "../../pages/PlaylistPage";

//Maria Marta Kulesza
test.describe("Playlisty | REQ-PLAYLIST-01", () => {
  test("TC-PLAYLIST-01: Utworzenie playlisty z poprawnymi danymi", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const playlistPage = new PlaylistPage(page);
    const playlistName = `Test playlist ${Date.now()}`;
    const imagePath = path.resolve("tests/fixtures/test.jpg");

    await test.step("Warunek wstępny: użytkownik jest zalogowany i znajduje się na /home", async () => {
      await loginPage.login("test4@zuvoria.pl", "admin1111");
      await playlistPage.goToHome();
    });

    await test.step("Krok 1: otwarcie formularza tworzenia playlisty", async () => {
      await playlistPage.openCreatePlaylistModal();
      await playlistPage.expectCreatePlaylistModalVisible();
    });

    await test.step("Krok 2: dodanie obrazka playlisty", async () => {
      await playlistPage.uploadImage(imagePath);
    });

    await test.step("Krok 3: wpisanie poprawnego tytułu", async () => {
      await playlistPage.fillTitle(playlistName);
    });

    await test.step("Krok 4: wysłanie formularza", async () => {
      await playlistPage.clickSend();
    });

    await test.step("Krok 5: sprawdzenie komunikatu sukcesu", async () => {
      await playlistPage.expectPlaylistCreatedToast();
    });
  });
  //Maria Marta Kulesza
  test("TC-PLAYLIST-02: Próba utworzenia playlisty bez tytułu", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const playlistPage = new PlaylistPage(page);
    const imagePath = path.resolve("tests/fixtures/test.jpg");

    await test.step("Warunek wstępny: użytkownik jest zalogowany i znajduje się na /home", async () => {
      await loginPage.login("test4@zuvoria.pl", "admin1111");
      await playlistPage.goToHome();
    });

    await test.step("Krok 1: otwarcie formularza tworzenia playlisty", async () => {
      await playlistPage.openCreatePlaylistModal();
      await playlistPage.expectCreatePlaylistModalVisible();
    });

    await test.step("Krok 2: dodanie obrazka bez wpisywania tytułu", async () => {
      await playlistPage.uploadImage(imagePath);
    });

    await test.step("Krok 3: próba wysłania formularza bez tytułu", async () => {
      await playlistPage.clickSend();
    });

    await test.step("Krok 4: sprawdzenie komunikatu walidacji", async () => {
      await playlistPage.expectTitleRequiredToast();
    });
  });
});
