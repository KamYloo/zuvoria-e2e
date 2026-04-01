import { expect, Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly profileBox: Locator;
    readonly profileImgWrapper: Locator;
    readonly profileAvatar: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.profileBox = page.locator('.rightMenu .profile');
        this.profileImgWrapper = page.locator('.rightMenu .profile .profileImg');
        this.profileAvatar = page.locator('.rightMenu .profile .profileImg img[alt="Profilowe"]');
        this.logoutButton = page.locator('.rightMenu .profile .loginBtn');
    }

    async assertLoginSuccessMessageVisible() {
        await expect(this.page.getByText('You have logged in successfully.')).toBeVisible();
    }

    async assertRedirectAfterLogin() {
        await this.page.waitForURL(/\/home(?:[/?#].*)?$|\/(?:[?#].*)?$/);
        await expect(this.page).not.toHaveURL(/\/login$/);
    }

    async assertProfileVisible() {
        await expect(this.profileBox).toBeVisible();
        await expect(this.profileImgWrapper).toBeVisible();
        await expect(this.profileAvatar).toBeVisible();
    }

    async assertLogoutVisible() {
        await expect(this.logoutButton).toHaveText('Logout');
        await expect(this.logoutButton).toBeVisible();
    }

    async assertLoginFormAbsent() {
        await expect(this.page.locator('input[name="email"]')).toHaveCount(0);
        await expect(this.page.locator('input[name="password"]')).toHaveCount(0);
        await expect(this.page.locator('button.login-btn')).toHaveCount(0);
    }
}