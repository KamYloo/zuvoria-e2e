import { Page, Locator, expect } from "@playwright/test";

export class DiscoverPage {
  readonly page: Page;
  readonly posts: Locator;
  readonly addStoryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.posts = page.locator(".post");
    this.addStoryButton = page.getByRole("button", { name: /add story|story/i });
  }

  async goto() {
    await this.page.goto("/discover");
  }
  async expectPostAtTop(content: string) {
    const firstPost = this.posts.first();
    await expect(firstPost).toContainText(content, { timeout: 10000 });
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

  async expectAddStoryVisible() {
    if (await this.addStoryButton.count()) {
      await expect(this.addStoryButton.first()).toBeVisible();
      return;
    }

    await expect(this.page.getByText(/add story|story/i).first()).toBeVisible();
  }

  async expectStoryUserVisible(userText: string | RegExp) {
    await expect(this.page.getByText(userText).first()).toBeVisible({ timeout: 10000 });
  }
}
