import { Page, expect } from '@playwright/test';

export class ChatPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goToChat() {
        await this.page.goto('/chat');
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

        const userItem = this.page.locator('.userItem').filter({ hasText: userName }).first();
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