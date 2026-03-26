import { test } from "@playwright/test";
import { AddPostComponent } from "../../pages/AddPostComponent";
import { DiscoverPage } from "../../pages/DiscoverPage";
import { LoginPage } from "../../pages/LoginPage";

test.describe("TC-SOC-01 [REQ-SOC-01]", () => {
  test("Publikacja posta i widoczność w feedzie", async ({ browser }) => {
    const user = {
      email: "test1@zuvoria.pl",
      pass: "admin1111",
      fullName: "test1",
    };

    const contextUser = await browser.newContext();
    const page = await contextUser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, user.pass);
    await page.goto("/discover");

    const addPost = new AddPostComponent(page);
    const discover = new DiscoverPage(page);

    const content = `Post testowy ${Date.now()}`;

    await addPost.createPost(content);

    await addPost.expectSuccess();
    await discover.expectPostAtTop(content);
  });
});
