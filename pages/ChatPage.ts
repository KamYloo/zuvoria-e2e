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

    private chatListItem(userName: string) {
        return this.page.locator('.userItem').filter({ hasText: userName }).first();
    }

    private addUserResultItem(userName: string) {
        return this.page.locator('.addUser .userList .user').filter({ hasText: userName }).first();
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
        const listItem = this.chatListItem(userName);
        if (!(await listItem.count()) || !(await listItem.isVisible())) {
            return;
        }

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
            return;
        }

        await expect(this.chatListItem(userName)).toHaveCount(0, { timeout: 10000 });
    }

    async ensureChatExistsWith(userName: string) {
        await this.page.waitForSelector('.userItem', { timeout: 3000 }).catch(() => {});

        const userItem = this.page.locator('.userItem').filter({ hasText: userName }).first();

        if (await userItem.isVisible()) {
            console.log(`Czat z ${userName} już istnieje. Pomijam tworzenie.`);
            return;
        }

        console.log(`Brak czatu z ${userName}. Wyklikuję tworzenie...`);

        await this.page.locator('.addUserBtn').click();

        const searchInput = this.page.getByPlaceholder('Username...');
        await searchInput.fill(userName);
        await this.page.getByRole('button', { name: 'Search' }).click();

        const userResult = this.page.locator('.addUser .userList .user').filter({ hasText: userName }).first();
        await expect(userResult).toBeVisible();
        await userResult.click();

        await this.page.getByRole('button', { name: 'Create Chat' }).click();
        await expect(this.page.getByText('ChatRoom created successfully.')).toBeVisible();
    }

    async selectChatUser(userName: string) {
        const searchInput = this.page.getByPlaceholder('Search User...');
        await searchInput.fill(userName);

        const userItem = this.chatListItem(userName);
        await expect(userItem).toBeVisible();
        await userItem.click();
    }

    async sendMessage(text: string) {
        const messageInput = this.page.getByPlaceholder('Write message...');
        await messageInput.fill(text);
        await this.page.locator('.sendButton').click();
    }

    async expectLatestMessage(text: string, isOwn: boolean) {
        const bubbleClass = isOwn ? '.messageOwn' : '.message';
        const latestBubble = this.page.locator(bubbleClass).last();
        await expect(latestBubble).toContainText(text);
    }
}