import { expect, Page, Locator, Response } from '@playwright/test';

export class ProfileEditPage {
    readonly page: Page;
    readonly root: Locator;
    readonly fullNameInput: Locator;
    readonly descriptionInput: Locator;
    readonly fileInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.root = page.locator('.profileEdit');
        this.fullNameInput = page.locator('.profileEdit .editFullName input');
        this.descriptionInput = page.locator('.profileEdit .editDescription textarea');
        this.fileInput = page.locator('.profileEdit .editAvatar input[type="file"]');
        this.submitButton = page.locator('.profileEdit button.submit');
    }

    async goto() {
        await this.page.goto('/profile/edit', { waitUntil: 'domcontentloaded', timeout: 45000 });
    }

    async assertVisible() {
        await expect(this.page).toHaveURL(/\/profile\/edit(?:[/?#].*)?$/);
        await expect(this.root).toBeVisible();
    }

    async fillFullName(fullName: string) {
        await this.fullNameInput.fill(fullName);
    }

    async fillDescription(description: string) {
        await this.descriptionInput.fill(description);
    }

    async fillForm(fullName: string, description: string) {
        await this.fillFullName(fullName);
        await this.fillDescription(description);
    }

    async uploadAvatar(filePath: string) {
        await this.fileInput.setInputFiles(filePath);
    }

    async submit() {
        await this.submitButton.click();
    }

    waitForEditResponse(): Promise<Response> {
        return this.page.waitForResponse((response) => {
            const url = response.url();
            const method = response.request().method();

            return (
                ['POST', 'PUT', 'PATCH'].includes(method) &&
                /\/profile\/edit(?:\?|$)/.test(url)
            );
        });
    }

    async assertSuccessMessageVisible() {
        await expect(this.page.getByText('Profile updated successfully.')).toBeVisible();
    }
}