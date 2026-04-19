// @ts-ignore
import path from "path";
import { test } from "@playwright/test";
import { PlaylistPage } from "../../../pages/PlaylistPage";

//Maria Marta Kulesza
test.describe("Playlisty | State Management", () => {
  test.use({ storageState: "storageState.json" });

  test("STATE-PLAYLIST-01: Utworzenie playlisty z poprawnymi danymi bez ponownego logowania", async ({
    page,
  }) => {
    const playlistPage = new PlaylistPage(page);
    const playlistName = `Test playlist ${Date.now()}`;
    const imagePath = path.resolve("tests/fixtures/test.jpg");

    await test.step("Przejście na /home", async () => {
      await playlistPage.goToHome();
    });

    await test.step("Otwarcie formularza tworzenia playlisty", async () => {
      await playlistPage.openCreatePlaylistModal();
      await playlistPage.expectCreatePlaylistModalVisible();
    });

    await test.step("Dodanie obrazka playlisty", async () => {
      await playlistPage.uploadImage(imagePath);
    });

    await test.step("Wpisanie poprawnego tytułu", async () => {
      await playlistPage.fillTitle(playlistName);
    });

    await test.step("Wysłanie formularza", async () => {
      await playlistPage.clickSend();
    });

    await test.step("Sprawdzenie komunikatu sukcesu", async () => {
      await playlistPage.expectPlaylistCreatedToast();
    });
  });

  test("STATE-PLAYLIST-02: Próba utworzenia playlisty bez tytułu bez ponownego logowania", async ({
    page,
  }) => {
    const playlistPage = new PlaylistPage(page);
    const imagePath = path.resolve("tests/fixtures/test.jpg");

    await test.step("Przejście na /home", async () => {
      await playlistPage.goToHome();
    });

    await test.step("Otwarcie formularza tworzenia playlisty", async () => {
      await playlistPage.openCreatePlaylistModal();
      await playlistPage.expectCreatePlaylistModalVisible();
    });

    await test.step("Dodanie obrazka bez wpisywania tytułu", async () => {
      await playlistPage.uploadImage(imagePath);
    });

    await test.step("Wysłanie formularza bez tytułu", async () => {
      await playlistPage.clickSend();
    });

    await test.step("Sprawdzenie komunikatu walidacji", async () => {
      await playlistPage.expectTitleRequiredToast();
    });
  });
});
