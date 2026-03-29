import { Page, Locator, expect } from "@playwright/test";

export class DiscoverPage {
  readonly page: Page;
  readonly posts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.posts = page.locator(".post");
  }

  async goto() {
    await this.page.goto("/discover");
  }

  async expectPostAtTop(content: string) {
    await expect(this.posts.first()).toContainText(content);
  }
}
