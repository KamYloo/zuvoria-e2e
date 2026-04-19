import { test, expect } from "@playwright/test";
import { AddPostComponent } from "../../../pages/AddPostComponent";
import { LoginPage } from "../../../pages/LoginPage";
import { DiscoverPage } from "../../../pages/DiscoverPage";

// Bobrykow Zuzanna
test.describe("TC-SOC-02 [REQ-SOC-02]", () => {
  test.use({ storageState: "storageState.json" });

  test("Próba publikacji posta przekraczającego limit znaków (>1000 znaków)", async ({
    page,
  }) => {
    //const loginPage = new LoginPage(page);
    const addPost = new AddPostComponent(page);
    const discover = new DiscoverPage(page);

    //const user = { email: "test1@zuvoria.pl", pass: "admin1111" };
    const longContent = "a".repeat(1001);

    await test.step("Warunki wstępne: Użytkownik jest poprawnie zalogowany i otwarta jest zakładka widoku odkrywania (/discover)", async () => {
      //await loginPage.login(user.email, user.pass);
      await discover.goto();
    });

    await test.step("Krok 1: Wklejenie do głównego pola tekstowego przygotowanego ciągu 1001 znaków", async () => {
      await addPost.textarea.fill(longContent);
    });

    await test.step("Krok 2: Kliknięcie przycisku 'Send' i przechwycenie błędu walidacji (400 Bad Request)", async () => {
      await addPost.clickSend();
    });

    await test.step("Oczekiwany rezultat: Wyświetlenie czerwonego komunikatu błędu i wyczyszczenie pola tekstowego", async () => {
      await expect(addPost.errorToast).toBeVisible();
      await expect(addPost.textarea).toHaveValue("");
    });
  });
});
