import { test, expect } from "@playwright/test";
import { DiscoverPage } from "../../pages/DiscoverPage";
import { AddPostComponent } from "../../pages/AddPostComponent";

const MOCK_USER = {
  id: 4,
  fullName: "test4",
  nickName: "test4",
  email: "test4@zuvoria.pl",
  profilePicture: null,
};

const MOCK_DATE = [2024, 5, 20, 10, 0, 0];

test.describe("Posty - Pełna Izolacja Mock", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const swMock = {
        register: () =>
          Promise.resolve({
            addEventListener: () => {},
            active: { postMessage: () => {} },
          }),
        addEventListener: () => {},
        getRegistration: () => Promise.resolve(null),
      };
      Object.defineProperty(navigator, "serviceWorker", { get: () => swMock });
    });

    await page.route("**/api.zuvoria.pl/api/**", async (route) => {
      const url = route.request().url();

      if (url.includes("/auth/check")) {
        return route.fulfill({ status: 200, json: MOCK_USER });
      }

      if (url.includes("/stories")) {
        return route.fulfill({ status: 200, json: [] });
      }

      if (url.includes("/info")) {
        return route.fulfill({
          status: 200,
          json: { websocket: true, origins: ["*:*"], cookie_needed: false },
        });
      }

      return route.fulfill({
        status: 200,
        json: { content: [], stories: [], totalElements: 0, last: true },
      });
    });
  });

  test("MOCK-POST-01: Sukces publikacji nowego posta", async ({ page }) => {
    const discoverPage = new DiscoverPage(page);
    const addPost = new AddPostComponent(page);

    await page.route("**/api/post*/create", async (route) => {
      await route.fulfill({
        status: 201,
        json: { message: "Post created successfully" },
      });
    });

    await discoverPage.goto();
    await addPost.textarea.fill("Post testowy");
    await addPost.createPost();
    await addPost.expectSuccess();
  });

  test("MOCK-POST-02: Błąd walidacji (za długi post)", async ({ page }) => {
    const discoverPage = new DiscoverPage(page);
    const addPost = new AddPostComponent(page);
    const errorMsg = "Content is too long";

    await page.route("**/api/post*/create", async (route) => {
      await route.fulfill({
        status: 400,
        json: { businessErrornDescription: errorMsg },
      });
    });

    await discoverPage.goto();
    await addPost.textarea.fill("A".repeat(1001));
    await addPost.clickSend();
    await expect(page.getByText(errorMsg)).toBeVisible();
  });
});
