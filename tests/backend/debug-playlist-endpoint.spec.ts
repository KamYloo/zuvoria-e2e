import path from "path";
import { test } from "@playwright/test";
import { PlaylistPage } from "../../pages/PlaylistPage";

test.use({ storageState: "storageState.json" });

//Maria Marta Kulesza
test("debug playlist endpoint", async ({ page }) => {
  const playlistPage = new PlaylistPage(page);
  const imagePath = path.resolve("tests/fixtures/test.jpg");
  const playlistName = `Debug playlist ${Date.now()}`;

  page.on("request", (request) => {
    if (request.method() !== "GET") {
      console.log("REQUEST:", request.method(), request.url());
    }
  });

  await playlistPage.goToHome();
  await playlistPage.openCreatePlaylistModal();
  await playlistPage.expectCreatePlaylistModalVisible();
  await playlistPage.uploadImage(imagePath);
  await playlistPage.fillTitle(playlistName);
  await playlistPage.clickSend();

  await page.waitForTimeout(3000);
});
