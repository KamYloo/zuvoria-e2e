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

function buildMockPost(content: string, liked = false, likes = 0) {
  return {
    id: 699,
    description: content,
    creationDate: new Date().toISOString(),
    likeCount: likes,
    commentCount: 0,
    likedByUser: liked,
    user: MOCK_USER,
  };
}

function buildPostsResponse(posts: any[]) {
  return JSON.stringify({
    content: posts,
    firstPage: true,
    last: true,
    pageNumber: 0,
    pageSize: 10,
    sort: [
      { property: "creationDate", direction: "DESC" },
      { property: "updateDate", direction: "DESC" },
    ],
    totalElements: posts.length,
    totalPages: 1,
  });
}

//Zuzanna Bobrykow
test.describe("Mock- Posts", () => {
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
      Object.defineProperty(navigator, "serviceWorker", {
        get: () => swMock,
      });
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
        json: { content: [], totalElements: 0, last: true },
      });
    });
  });

  test("MOCK-POST-01: dodanie posta", async ({ page }) => {
    const discover = new DiscoverPage(page);
    const addPost = new AddPostComponent(page);

    await page.route("**/api/post*/create", async (route) => {
      await route.fulfill({
        status: 201,
        json: { message: "Post created successfully" },
      });
    });

    await discover.goto();
    await addPost.textarea.fill("Post testowy");
    await addPost.createPost();
    await addPost.expectSuccess();
  });

  test("MOCK-POST-02: walidacja (za długa treśc posta)", async ({ page }) => {
    const discover = new DiscoverPage(page);
    const addPost = new AddPostComponent(page);

    const errorMsg = "Content is too long";

    await page.route("**/api/post*/create", async (route) => {
      await route.fulfill({
        status: 400,
        json: { businessErrornDescription: errorMsg },
      });
    });

    await discover.goto();
    await addPost.textarea.fill("A".repeat(1001));
    await addPost.clickSend();

    await expect(page.getByText(errorMsg)).toBeVisible();
  });

  test("MOCK-POST-03: polubienie posta", async ({ page }) => {
    const discover = new DiscoverPage(page);

    const postContent = "Mockowany post";

    let liked = false;
    let likes = 0;

    await page.route("**/api/posts/all**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: buildPostsResponse([buildMockPost(postContent, liked, likes)]),
      });
    });

    await page.route("**/api/post/**/like", async (route) => {
      liked = true;
      likes += 1;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          postId: 699,
          likeCount: likes,
          commentCount: 0,
          likedByUser: true,
        }),
      });
    });

    await discover.goto();
    await discover.expectPostAtTop(postContent);

    const { likeIcon } = await discover.getPostElements(postContent);

    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/like")),
      likeIcon.click(),
    ]);

    await page.reload();
    const after = await discover.getPostElements(postContent);
    await expect(after.likeCount).toHaveText("1");
  });
});
