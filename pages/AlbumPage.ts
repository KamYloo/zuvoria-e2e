import { expect, Page, Locator } from '@playwright/test';

export class AlbumPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search album/i);
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  async goToAlbums() {
    await this.page.goto('/albums');
  }

  async searchAlbum(albumName: string) {
    await this.searchInput.fill(albumName);
    await this.searchButton.click();
  }

  async expectAlbumVisible(albumName: string) {
    await expect(this.page.getByText(albumName)).toBeVisible();
  }
}