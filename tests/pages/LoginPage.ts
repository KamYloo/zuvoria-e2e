import { expect, Page, Locator, Response } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('button.login-btn');
    }

    async goto() {
        await this.page.goto('/login');
    }

    async assertVisible() {
        await expect(this.emailInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }

    async assertOnLoginPage() {
        await expect(this.page).toHaveURL(/\/login(?:[/?#].*)?$/);
    }

    async fillEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async fillPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async login(email: string, password: string) {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.clickLogin();
    }

    waitForLoginResponse(): Promise<Response> {
        return this.page.waitForResponse((response) => {
            const url = response.url();
            const method = response.request().method();

            return (
                method === 'POST' &&
                (/\/login(?:\?|$)/.test(url) || /\/auth\/login(?:\?|$)/.test(url))
            );
        });
    }

    async assertLoginErrorVisible() {
        await expect(this.page.getByText('Login and / or password is incorrect')).toBeVisible();
    }
}