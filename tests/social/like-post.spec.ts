import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DiscoverPage } from "../../pages/DiscoverPage";
import { AddPostComponent } from "../../pages/AddPostComponent";

test.describe("TC-SOC-03 [REQ-SOC-03]", () => {
  test("powinien polubić posta i sprawdzić trwałość po reload", async ({
    browser,
  }) => {
    const user = {
      email: "test1@zuvoria.pl",
      pass: "admin1111",
      fullName: "test1",
    };
    const context = await browser.newContext();
    const page = await context.newPage();

    const loginPage = new LoginPage(page);
    const addPost = new AddPostComponent(page);
    const discover = new DiscoverPage(page);

    await loginPage.login(user.email, user.pass);
    await page.goto("/discover");

    const postContent = `Post ${Date.now()}`;
    await addPost.createPost(postContent);
    await discover.expectPostAtTop(postContent);

    await discover.likePost(postContent);
    const { likeCount } = await discover.getPostElements(postContent);
    const before = await likeCount.textContent();

    await page.reload();
    const { likeCount: likeCountAfter } =
      await discover.getPostElements(postContent);
    await expect(likeCountAfter).toHaveText(before!);
  });
});
