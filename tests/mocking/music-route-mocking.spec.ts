import { test, expect, Page } from "@playwright/test";
import { AlbumPage } from "../../pages/AlbumPage";

//Maria Marta Kulesza
async function expectNotRedirectedToLogin(page: Page) {
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 10_000 });
}

function buildMockAlbum(id: number, title: string, pseudonym: string) {
  return {
    id,
    title,
    releaseDate: "2025-10-31",
    albumImage: "https://cdn.zuvoria.pl/uploads/albumImages/mock-album.jpg",
    artist: {
      id,
      pseudonym,
      bannerImg: "https://cdn.zuvoria.pl/uploads/artistBanners/mock-banner.jpg",
      artistBio: "mock-bio",
      profilePicture: "https://cdn.zuvoria.pl/uploads/userImages/mock-user.jpg",
      observed: false,
      totalFans: 0,
      monthlyPlays: 82,
    },
    tracksCount: 8,
    totalDuration: 1068,
  };
}

function buildAlbumsResponse(albums: ReturnType<typeof buildMockAlbum>[]) {
  return JSON.stringify({
    content: albums,
    firstPage: true,
    last: true,
    pageNumber: 0,
    pageSize: 9,
    sort: [],
    totalElements: albums.length,
    totalPages: 1,
  });
}

test.describe("Mockowanie | Muzyka", () => {
  test.use({ storageState: "storageState.json" });

  test("MOCK-MUSIC-01: mock listy albumów", async ({ page }) => {
    const albumPage = new AlbumPage(page);

    const mockAlbums = [
      buildMockAlbum(99101, "Mock Album 1", "Mock Artist 1"),
      buildMockAlbum(99102, "Mock Album 2", "Mock Artist 2"),
    ];

    let albumsRequestCount = 0;

    await page.route("**/api/album/all**", async (route) => {
      albumsRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: buildAlbumsResponse(mockAlbums),
      });
    });

    await albumPage.goToAlbums();
    await expectNotRedirectedToLogin(page);

    await expect
      .poll(() => albumsRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    await albumPage.expectSearchVisible();
    await expect(page.getByText("Mock Album 1")).toBeVisible();
    await expect(page.getByText("Mock Album 2")).toBeVisible();

    await page.unroute("**/api/album/all**");
  });

  test("MOCK-MUSIC-02: mock wyszukiwania albumu Cold Summer", async ({
    page,
  }) => {
    const albumPage = new AlbumPage(page);

    const mockAlbums = [buildMockAlbum(99103, "Cold Summer", "Mocked Artist")];

    let albumsRequestCount = 0;

    await page.route("**/api/album/all**", async (route) => {
      albumsRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: buildAlbumsResponse(mockAlbums),
      });
    });

    await albumPage.goToAlbums();
    await expectNotRedirectedToLogin(page);

    await expect
      .poll(() => albumsRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    await albumPage.expectSearchVisible();
    await albumPage.searchAlbum("Cold Summer");
    await albumPage.expectAlbumVisible("Cold Summer");

    await page.unroute("**/api/album/all**");
  });

  test("MOCK-MUSIC-03: mock pustej listy albumów", async ({ page }) => {
    const albumPage = new AlbumPage(page);

    let albumsRequestCount = 0;

    await page.route("**/api/album/all**", async (route) => {
      albumsRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: buildAlbumsResponse([]),
      });
    });

    await albumPage.goToAlbums();
    await expectNotRedirectedToLogin(page);

    await expect
      .poll(() => albumsRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    await albumPage.expectSearchVisible();
    await expect(page.getByText("Cold Summer")).not.toBeVisible();

    await page.unroute("**/api/album/all**");
  });
});
