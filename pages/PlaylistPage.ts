import { expect, Page, Locator } from '@playwright/test';

export class PlaylistPage {
  readonly page: Page;
  readonly plusButton: Locator;
  readonly fileInput: Locator;
  readonly titleInput: Locator;
  readonly sendButton: Locator;
  readonly createPlaylistModal: Locator;
  readonly successToast: Locator;
  readonly requiredToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.plusButton = page.locator('.playListBox .nameBox i');
    this.fileInput = page.locator('input[type="file"]');
    this.titleInput = page.getByRole('textbox');
    this.sendButton = page.getByRole('button', { name: 'Send' });
    this.createPlaylistModal = page.getByText('Create PlayList');
    this.successToast = page.getByText('Playlist created successfully.');
    this.requiredToast = page.getByText('Title is required');
  }

  async goToHome() {
    await this.page.goto('/home');
  }

  async openCreatePlaylistModal() {
    await expect(this.plusButton).toBeVisible();
    await this.plusButton.click();
  }

  async expectCreatePlaylistModalVisible() {
    await expect(this.createPlaylistModal).toBeVisible();
  }

  async uploadImage(imagePath: string) {
    await this.fileInput.setInputFiles(imagePath);
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async clickSend() {
    await this.sendButton.click();
  }

  async expectPlaylistCreatedToast() {
    await expect(this.successToast).toBeVisible();
  }

  async expectTitleRequiredToast() {
    await expect(this.requiredToast).toBeVisible();
  }
}