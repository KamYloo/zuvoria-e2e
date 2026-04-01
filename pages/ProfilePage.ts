import { expect, Page, Locator } from '@playwright/test';

export class ProfilePage {
    readonly page: Page;
    readonly fullNameText: Locator;
    readonly descriptionText: Locator;
    readonly firstUserImage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.fullNameText = page.locator('.profileSite .description p');
        this.descriptionText = page.locator('.profileSite .description span');
        this.firstUserImage = page.locator('.profileSite .userData img').first();
    }

    async assertRedirectedFromEditToProfile() {
        await this.page.waitForURL(/\/profile\/[^/?#]+(?:[/?#].*)?$/);
        await expect(this.page).not.toHaveURL(/\/profile\/edit(?:[/?#].*)?$/);
    }

    async assertProfileData(fullName: string, description: string) {
        await expect(this.fullNameText).toHaveText(fullName);
        await expect(this.descriptionText).toHaveText(description);
    }

    async assertAvatarVisible() {
        await expect(this.firstUserImage).toBeVisible();
    }
}