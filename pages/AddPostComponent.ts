import { Page, Locator, expect } from "@playwright/test";

export class AddPostComponent {
  readonly page: Page;
  readonly textarea: Locator;
  readonly sendButton: Locator;
  readonly toast: Locator;
  readonly fileInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.textarea = page.locator("textarea");
    this.sendButton = page.locator('button:has-text("Send")');
    this.toast = page.locator("text=Post created successfully");
    this.fileInput = page.locator('input[type="file"]');
  }

  async createPost(content: string) {
    await this.textarea.click();

    await this.textarea.fill(content);
    await this.fileInput.setInputFiles("tests/fixtures/test.jpg");

    await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes("/posts/create") && resp.status() === 201,
      ),
      this.sendButton.click(),
    ]);
  }

  async expectPostAtTop(content: string) {
    await expect(this.page.locator(".post")).toContainText(content, {
      timeout: 10000,
    });
  }
  async expectSuccess() {
    await expect(this.toast).toBeVisible();
    await expect(this.textarea).toHaveValue("");
  }
}
