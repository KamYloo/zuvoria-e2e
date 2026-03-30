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

  async getPostElements(content: string) {
    const post = this.posts.filter({ hasText: content }).first();
    await post.waitFor({ state: "visible", timeout: 10000 });

    const likeIcon = post.locator(".bottom .likes i");
    const likeCount = post.locator(".bottom .likes span");

    await expect(likeIcon).toBeVisible();
    await expect(likeCount).toBeVisible();

    return { post, likeIcon, likeCount };
  }

  async likePost(content: string) {
    const { likeIcon, likeCount } = await this.getPostElements(content);
    const before = await likeCount.textContent();
    await likeIcon.click();
    await expect(likeCount).not.toHaveText(before!);
  }

  async expectLikeCount(content: string, expectedCount: string) {
    const { likeCount } = await this.getPostElements(content);
    await expect(likeCount).toHaveText(expectedCount);
  }
}
