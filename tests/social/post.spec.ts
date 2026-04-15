import { test } from "@playwright/test";
import { AddPostComponent } from "../../pages/AddPostComponent";
import { DiscoverPage } from "../../pages/DiscoverPage";
import { LoginPage } from "../../pages/LoginPage";

//Bobrykow Zuzanna
test.describe("TC-SOC-01 [REQ-SOC-01]", () => {
  test.use({ storageState: "storageState.json" });
  test("Publikacja nowego posta", async ({ page }) => {
    // const loginPage = new LoginPage(page);
    const addPost = new AddPostComponent(page);
    const discover = new DiscoverPage(page);

    // const user = { email: "test1@zuvoria.pl", pass: "admin1111" };
    const content = `Post testowy ${Date.now()}`;

    await test.step("Warunki wstępne: Użytkownik jest poprawnie zalogowany i otwarta jest zakładka widoku odkrywania (/discover)", async () => {
      // await loginPage.login(user.email, user.pass);
      await discover.goto();
    });

    await test.step("Krok 1: Kliknięcie w pole tekstowe (textarea) w sekcji dodawania nowego posta", async () => {
      await addPost.textarea.click();
    });

    await test.step("Krok 2: Wpisanie treści o prawidłowej długości (od 1 do 1000 znaków)", async () => {
      await addPost.textarea.fill(content);
    });

    await test.step("Krok 3: Załączenie pliku graficznego za pomocą ikony 'Photo'", async () => {
      await addPost.fileInput.setInputFiles("tests/fixtures/test.jpg");
    });

    await test.step("Krok 4: Kliknięcie przycisku 'Send' i weryfikacja żądania POST na /posts/create", async () => {
      await addPost.createPost();
    });

    await test.step("Oczekiwany rezultat: Wyświetlenie zielonego komunikatu sukcesu, wyczyszczenie pola i pojawienie się posta na tablicie", async () => {
      await addPost.expectSuccess();
      await discover.expectPostAtTop(content);
    });
  });
});
