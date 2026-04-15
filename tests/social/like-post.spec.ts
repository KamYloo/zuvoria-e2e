import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DiscoverPage } from "../../pages/DiscoverPage";
import { AddPostComponent } from "../../pages/AddPostComponent";

// Bobrykow Zuzanna
test.describe("TC-SOC-03 [REQ-SOC-03]", () => {
  test.use({ storageState: "storageState.json" });

  test("Polubienie posta lub komentarza", async ({ page }) => {
    // const loginPage = new LoginPage(page);
    const addPost = new AddPostComponent(page);
    const discover = new DiscoverPage(page);

    //const user = { email: "test1@zuvoria.pl", pass: "admin1111" };
    const postContent = `Post testowy ${Date.now()}`;

    await test.step("Warunki wstępne: Użytkownik jest zalogowany i na tablicy widoczny jest post (niepolubiony)", async () => {
     // await loginPage.login(user.email, user.pass);
      await discover.goto();

      await addPost.textarea.click();
      await addPost.textarea.fill(postContent);
      await addPost.fileInput.setInputFiles("tests/fixtures/test.jpg");
      await addPost.createPost();

      await addPost.expectSuccess();

      await discover.expectPostAtTop(postContent);
    });

    await test.step("Krok 1: Zlokalizowanie dolnej belki wybranego posta i kliknięcie ikony pustego kciuka", async () => {
      const { likeCount } = await discover.getPostElements(postContent);
      const before = await likeCount.textContent();

      await discover.likePost(postContent);

      const expected = (parseInt(before!) + 1).toString();
      await expect(likeCount).toHaveText(expected);
    });

    await test.step("Krok 2: Całkowite odświeżenie strony (F5) i ponowne pobranie danych z serwera", async () => {
      await page.reload();
    });

    await test.step("Oczekiwany rezultat: Ikona nadal jest wypełniona, a licznik wynosi N+1 (trwałość danych)", async () => {
      const { likeIcon, likeCount } =
        await discover.getPostElements(postContent);
      await expect(likeIcon).toBeVisible();
      await expect(likeCount).not.toHaveText("0");
    });
  });
});
