import { test, expect } from "@playwright/test";
import { AddPostComponent } from "../../pages/AddPostComponent";
import { LoginPage } from "../../pages/LoginPage";

test.describe("TC-SOC-02 [REQ-SOC-02]", () => {
  test("Powinien wyświetlić błąd dla posta >1000 znaków", async ({
    browser,
  }) => {
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

    const longContent = "a".repeat(1001);

    await addPost.textarea.click();
    await addPost.textarea.fill(longContent);

    const requestPromise = page
      .waitForRequest((req) => req.url().includes("/posts/create"), {
        timeout: 2000,
      })
      .catch(() => null);

    await addPost.sendButton.click();

    await expect(
      page.getByText("Description must be at most", { exact: false }),
    ).toBeVisible({ timeout: 10000 });

    // const request = await requestPromise;
    // expect(request).toBeNull();

    //await expect(addPost.textarea).toHaveValue(longContent);
    await expect(addPost.errorToast).toBeVisible();
  });
});
