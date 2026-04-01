import {expect, test} from '@playwright/test';
import {LoginPage} from '../../pages/LoginPage';
import {ChatPage} from '../../pages/ChatPage';

//Mieczkowski Kamil
test.describe('Komunikacja | REQ-CHAT-02', () => {
    test('TC-CHAT-02: Wysyłanie i odbieranie wiadomości tekstowej na czacie (WebSockets)', async ({ browser }) => {
        test.setTimeout(90000);

        const userA = { email: 'test5@zuvoria.pl', pass: 'admin1111', fullName: 'test5' };
        const userB = { email: 'test6@zuvoria.pl', pass: 'admin1111', fullName: 'test6' };

        const contextUserA = await browser.newContext();
        const contextUserB = await browser.newContext();
        const pageA = await contextUserA.newPage();
        const pageB = await contextUserB.newPage();

        const loginPageA = new LoginPage(pageA);
        const loginPageB = new LoginPage(pageB);
        const chatPageA = new ChatPage(pageA);
        const chatPageB = new ChatPage(pageB);

        await test.step('Warunki wstępne: logowanie użytkownika A i B', async () => {
            await loginPageA.login(userA.email, userA.pass);
            await loginPageB.login(userB.email, userB.pass);
        });

        await test.step('Warunki wstępne: obie sesje otwierają moduł czatu', async () => {
            await chatPageA.goToChat();
            await chatPageB.goToChat();
        });

        await test.step('Warunek wstępny: cleanup po stronie A', async () => {
            await chatPageA.deleteAllChatsWith(userB.fullName);
        });

        await test.step('Warunki wstępne: para użytkowników ma aktywny pokój czatu i obie strony mają otwarte to samo okno rozmowy', async () => {
            await chatPageA.ensureChatExistsWith(userB.fullName);
            await chatPageA.selectChatUser(userB.fullName);

            await pageB.reload();
            await chatPageB.goToChat();
            await chatPageB.selectChatUser(userA.fullName);
            await expect(pageA.getByPlaceholder('Write message...')).toBeVisible();
            await expect(pageB.getByPlaceholder('Write message...')).toBeVisible();
            await pageA.waitForTimeout(1500);
            await pageB.waitForTimeout(1500);
        });

        const uniqueMessage = `Testowa wiadomosc ${Date.now()}`;

        await test.step('Krok 1-2: użytkownik A wpisuje wiadomość i wysyła Enter', async () => {
            await chatPageA.sendMessage(uniqueMessage, 'enter');
            await chatPageA.expectLatestMessage(uniqueMessage, true);
        });

        await test.step('Oczekiwany rezultat 1: nadawca widzi własną wiadomość i widok jest przewinięty na dół', async () => {

            const centerA = pageA.locator('.chat .center');
            await expect
                .poll(async () => {
                    return centerA.evaluate(el => {
                        return el.scrollHeight - el.scrollTop - el.clientHeight;
                    });
                })
                .toBeLessThan(80);
        });

        await test.step('Oczekiwany rezultat 2: odbiorca B dostaje wiadomość w czasie rzeczywistym po odświeżeniu listy pokoi', async () => {
            await chatPageB.expectLatestMessage(uniqueMessage, false);

            const latestIncoming = pageB.locator('.message').last();
            await expect(latestIncoming.locator('strong')).toContainText(`${userA.fullName}:`);
            await expect(latestIncoming).toContainText(uniqueMessage);
            await expect(latestIncoming.locator('.info span')).toBeVisible();
        });

        await test.step('Warunek końcowy - cleanup', async () => {
            await chatPageA.deleteAllChatsWith(userB.fullName);
        });

        await contextUserA.close();
        await contextUserB.close();
    });
});