import { Page, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async login(email: string, pass: string) {
        await this.page.goto('/login');

        await this.page.locator('input[name="email"]').fill(email);
        await this.page.locator('input[name="password"]').fill(pass);

        await this.page.locator('button[type="submit"].login-btn').click();

        await expect(this.page.getByText('You have logged in successfully.')).toBeVisible();

        await this.page.waitForURL('**/home');
    }
}