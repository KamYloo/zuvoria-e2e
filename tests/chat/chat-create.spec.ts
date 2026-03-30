import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ChatPage } from '../../pages/ChatPage';

test.describe('Komunikacja | REQ-CHAT-01', () => {
  test('TC-CHAT-01: Wyszukanie użytkownika i utworzenie czatu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const chatPage = new ChatPage(page);

    const user = { email: 'test4@zuvoria.pl', pass: 'admin1111', username: 'test4' };
    const targetUsername = 'test5';

    await test.step('Warunek wstępny: użytkownik test4 jest zalogowany i znajduje się na /chat', async () => {
      await loginPage.login(user.email, user.pass);
      await chatPage.goToChat();
    });

    await test.step('Warunek wstępny: czat test4-test5 nie istnieje (cleanup przed testem)', async () => {
      await chatPage.deleteChatIfExists(targetUsername);
    });

    await test.step('Kroki 1-4: przejście na /chat, otwarcie panelu dodawania, wpisanie test5 i Search', async () => {
      await chatPage.openAddUserPanel();
      await chatPage.searchUserInAddPanel(targetUsername);
    });

    await test.step('Kroki 5-6: wynik test5 jest widoczny i można go zaznaczyć', async () => {
      await chatPage.expectUserVisibleInSearchResults(targetUsername);
      await chatPage.selectUserFromSearchResults(targetUsername);
      await chatPage.expectUserMarkedAsSelected(targetUsername);
    });

    await test.step('Krok 7: Create Chat', async () => {
      await chatPage.clickCreateChat();
      await chatPage.expectCreateChatToast();
    });

    await test.step('Kroki 8-9: nowy czat jest na liście i otwiera okno rozmowy z nagłówkiem test5', async () => {
      await chatPage.expectChatVisibleOnLeftList(targetUsername);
      await chatPage.openChatFromLeftList(targetUsername);
      await chatPage.expectOpenedChatHeaderContains(targetUsername);
    });

    await test.step('Warunek końcowy: cleanup - usuń nowo utworzony czat', async () => {
      await chatPage.deleteChatIfExists(targetUsername);
    });
  });
});
