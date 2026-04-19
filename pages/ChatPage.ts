import { Page, expect } from '@playwright/test';

export class ChatPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goToChat() {
        await this.page.goto('/chat');
        await this.page.getByPlaceholder('Search User...').waitFor({ state: 'visible' });
    }

    private chatListItems(userName: string) {
        return this.page.locator('.userItem').filter({ hasText: userName });
    }

    private chatListItem(userName: string) {
        return this.chatListItems(userName).first();
    }

    private addUserPanel() {
        return this.page.locator('.addUser');
    }

    private addUserResultItem(userName: string) {
        return this.addUserPanel().locator('.userList .user').filter({ hasText: userName }).first();
    }

    async openAddUserPanel() {
        await this.page.locator('.addUserBtn').click();
        await this.page.getByPlaceholder('Username...').waitFor({ state: 'visible' });
    }

    async searchUserInAddPanel(query: string) {
        await this.page.getByPlaceholder('Username...').fill(query);
        await this.page.getByRole('button', { name: 'Search' }).click();
    }

    async expectUserVisibleInSearchResults(userName: string) {
        await expect(this.addUserResultItem(userName)).toBeVisible();
    }

    async selectUserFromSearchResults(userName: string) {
        await this.addUserResultItem(userName).click();
    }

    async expectUserMarkedAsSelected(userName: string) {
        await expect(this.addUserResultItem(userName)).toHaveClass(/selected/);
    }

    async clickCreateChat() {
        await this.page.getByRole('button', { name: 'Create Chat' }).click();
    }

    async expectCreateChatToast() {
        await expect(this.page.getByText('ChatRoom created successfully.')).toBeVisible();
    }

    async expectChatVisibleOnLeftList(userName: string) {
        await expect(this.chatListItem(userName)).toBeVisible();
    }

    async openChatFromLeftList(userName: string) {
        await this.chatListItem(userName).click();
    }

    async expectOpenedChatHeaderContains(userName: string) {
        await expect(this.page.getByPlaceholder('Write message...')).toBeVisible();
        await expect(this.page.locator('.chat .top .user .userData span').first()).toContainText(userName);
    }

    async deleteChatIfExists(userName: string) {
        await this.deleteAllChatsWith(userName);
    }

    async deleteAllChatsWith(userName: string) {
        const searchInput = this.page.getByPlaceholder('Search User...');
        await searchInput.fill(userName);

        const items = this.chatListItems(userName);
        let guard = 0;

        while ((await items.count()) > 0 && guard < 10) {
            const before = await items.count();
            const listItem = items.first();
            await listItem.hover();

            const deleteTriggers = [
                listItem.locator('> i'),
                listItem.locator('i').last(),
            ];

            let clicked = false;
            for (const trigger of deleteTriggers) {
                if (await trigger.count()) {
                    this.page.once('dialog', async dialog => {
                        await dialog.accept();
                    });
                    await trigger.first().click({ force: true });
                    clicked = true;
                    break;
                }
            }

            if (!clicked) {
                break;
            }

            await expect(items).toHaveCount(before - 1, { timeout: 10000 });
            guard += 1;
        }

        await expect(items).toHaveCount(0, { timeout: 10000 });
        await searchInput.fill('');
    }

    async ensureChatExistsWith(userName: string) {
        const listSearchInput = this.page.getByPlaceholder('Search User...');
        await listSearchInput.fill(userName);

        await this.page.waitForTimeout(400);

        if ((await this.chatListItems(userName).count()) > 0) {
            console.log(`Czat z ${userName} już istnieje. Pomijam tworzenie.`);
            await listSearchInput.fill('');
            return;
        }

        console.log(`Brak czatu z ${userName}. Wyklikuję tworzenie...`);

        await this.page.locator('.addUserBtn').click();

        const addUserSearchInput = this.page.getByPlaceholder('Username...');
        await addUserSearchInput.fill(userName);
        await this.page.getByRole('button', { name: 'Search' }).click();

        const userResult = this.page.locator('.addUser .userList .user').filter({ hasText: userName }).first();
        await expect(userResult).toBeVisible();
        await userResult.click();

        await this.page.getByRole('button', { name: 'Create Chat' }).click();
        await expect(this.page.getByText('ChatRoom created successfully.')).toBeVisible();
        await expect(this.chatListItems(userName).first()).toBeVisible({ timeout: 10000 });
        await listSearchInput.fill('');
    }

    async selectChatUser(userName: string) {
        const searchInput = this.page.getByPlaceholder('Search User...');
        await searchInput.fill(userName);

        const userItem = this.chatListItems(userName).first();
        await expect(userItem).toBeVisible();
        await userItem.click();
    }

    async sendMessage(text: string, submitWith: 'click' | 'enter' = 'click') {
        const messageInput = this.page.getByPlaceholder('Write message...');
        
        await messageInput.focus();
        await messageInput.fill(text);

        if (submitWith === 'enter') {
            await messageInput.press('Enter');
        } else {
            await this.page.locator('.sendButton').click();
        }
    }


    async expectLatestMessage(text: string, isOwn: boolean) {
        const targetClass = isOwn ? 'messageOwn' : 'message';

        const preferred = this.page.locator(`.chat .center .${targetClass}`).filter({ hasText: text }).last();
        if (await preferred.count()) {
            await expect(preferred).toContainText(text, { timeout: 15000 });
            return;
        }

        const fallback = this.page.locator('.chat .center .message, .chat .center .messageOwn').filter({ hasText: text }).last();
        await expect(fallback).toContainText(text, { timeout: 15000 });
    }
}