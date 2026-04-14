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

    async gotoProfile(username: string) {
        await this.page.goto(`/profile/${username}`);
        await this.page.locator('.profileInfo .top').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async openVerifyModal() {
        const topSection = this.page.locator('.profileInfo .top').first();
        await topSection.waitFor({ state: 'visible', timeout: 10000 });

        const candidates = [
            this.page.getByRole('button', { name: /^verify$/i }),
            this.page.locator('.profileInfo .top button').filter({ hasText: /^verify$/i }),
            this.page.getByRole('button', { name: /verify|artist/i }),
            this.page.locator('button').filter({ hasText: /verify|artist/i }),
            this.page.locator('.profileInfo .top *').filter({ hasText: /^verify$/i }),
        ];

        for (const candidate of candidates) {
            try {
                await candidate.first().waitFor({ state: 'visible', timeout: 2500 });
                await candidate.first().click();
                return;
            } catch {
                // try next candidate
            }
        }

        const hasEditProfileButton = await this.page.getByRole('button', { name: /edit profile/i }).count();
        const visibleButtons = await this.page
            .locator('button, [role="button"], .profileInfo i, .profileInfo span, .profileInfo p')
            .allTextContents();
        const sample = visibleButtons.map(t => t.trim()).filter(Boolean).slice(0, 20).join(' | ');
        throw new Error(`Nie znaleziono przycisku otwierajacego modal weryfikacji artysty. Edit Profile widoczny: ${hasEditProfileButton > 0}. Widoczne teksty: ${sample}`);
    }

    async fillArtistName(value: string) {
        const candidates = [
            this.page.getByLabel(/artist\s*name/i),
            this.page.getByPlaceholder(/artist\s*name/i),
            this.page.getByPlaceholder(/enter the artist'?s name/i),
            this.page.locator('.verifyArtist input[type="text"]'),
            this.page.locator('input[name*="artist" i]'),
            this.page.locator('input[id*="artist" i]'),
        ];

        for (const candidate of candidates) {
            if (await candidate.count()) {
                await candidate.first().fill(value);
                return;
            }
        }

        throw new Error('Nie znaleziono pola Artist Name w formularzu weryfikacji');
    }

    async submitArtistVerification() {
        const candidates = [
            this.page.locator('.verifyArtist button[type="submit"]'),
            this.page.locator('.verifyArtist').getByRole('button', { name: /send application|send|submit/i }),
            this.page.locator('.verifyArtist').locator('button.submit').first(),
        ];

        for (const candidate of candidates) {
            if (await candidate.count()) {
                await candidate.first().click();
                return;
            }
        }

        throw new Error('Nie znaleziono przycisku wysylki formularza weryfikacji');
    }

    async expectVerificationErrorVisible(message: string) {
        await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 10000 });
    }

    async expectArtistVerificationModalVisible() {
        const candidates = [
            this.page.getByRole('dialog'),
            this.page.locator('.verifyArtist'),
            this.page.locator('.modal, .ant-modal, [class*="modal"]'),
        ];

        for (const candidate of candidates) {
            if (await candidate.count()) {
                await expect(candidate.first()).toBeVisible();
                return;
            }
        }

        throw new Error('Nie znaleziono widocznego modala weryfikacji artysty');
    }
}