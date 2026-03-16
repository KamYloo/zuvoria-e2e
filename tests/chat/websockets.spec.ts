import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ChatPage } from '../../pages/ChatPage';

test.describe('Moduł Czatu i WebSockets', () => {

    test('Powinien utworzyć nowy czat i przesłać wiadomość na żywo (WebSockets)', async ({ browser }) => {

        const user1 = { email: 'test1@zuvoria.pl', pass: 'admin1111', fullName: 'test1' };
        const user2 = { email: 'test2@zuvoria.pl', pass: 'admin1111', fullName: 'test2' };

        const contextUser1 = await browser.newContext();
        const contextUser2 = await browser.newContext();
        const page1 = await contextUser1.newPage();
        const page2 = await contextUser2.newPage();

        const loginPage1 = new LoginPage(page1);
        const loginPage2 = new LoginPage(page2);
        const chatPage1 = new ChatPage(page1);
        const chatPage2 = new ChatPage(page2);

        await loginPage1.login(user1.email, user1.pass);
        await loginPage2.login(user2.email, user2.pass);

        await chatPage1.goToChat();
        await chatPage2.goToChat();


        await chatPage1.ensureChatExistsWith(user2.fullName);

        await chatPage1.selectChatUser(user2.fullName);

        await page2.reload();

        await chatPage2.selectChatUser(user1.fullName);


        await page2.waitForTimeout(1500);

        const uniqueMessage = `Zuvoria Playwright Test! ID: ${Date.now()}`;

        await chatPage1.sendMessage(uniqueMessage);
        await chatPage1.expectLatestMessage(uniqueMessage, true);

        await chatPage2.expectLatestMessage(uniqueMessage, false);

        const replyMessage = `Odebrałem! WebSockets działają!`;
        await chatPage2.sendMessage(replyMessage);

        await chatPage1.expectLatestMessage(replyMessage, false);

        await contextUser1.close();
        await contextUser2.close();
    });
});