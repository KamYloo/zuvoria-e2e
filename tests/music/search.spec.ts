import { test } from "@playwright/test";
import { AlbumPage } from "../../pages/AlbumPage";

//Maria Marta Kulesza
test.describe("Muzyka | State Management", () => {
  test.use({ storageState: "storageState.json" });

  test("STATE-MUSIC-01: Wyszukiwanie istniejącego albumu bez ponownego logowania", async ({
    page,
  }) => {
    const albumPage = new AlbumPage(page);

    await test.step("Przejście do widoku albumów", async () => {
      await albumPage.goToAlbums();
    });

    await test.step("Wyszukanie istniejącego albumu", async () => {
      await albumPage.searchAlbum("Cold Summer");
    });

    await test.step("Sprawdzenie wyniku wyszukiwania", async () => {
      await albumPage.expectAlbumVisible("Cold Summer");
    });
  });
});
