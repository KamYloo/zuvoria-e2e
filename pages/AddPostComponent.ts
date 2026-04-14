import { Page, Locator, expect } from "@playwright/test";

export class AddPostComponent {
  readonly page: Page;
  readonly textarea: Locator;
  readonly sendButton: Locator;
  readonly toast: Locator;
  readonly fileInput: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = page.locator("textarea");
    this.sendButton = page.locator('button:has-text("Send")');
    this.toast = page.locator("text=Post created successfully");
    this.fileInput = page.locator('input[type="file"]');
    this.errorToast = page.locator(
      "text=Description must be at most 1000 characters",
    );
  }

  async createPost() {
    await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes("/posts/create") && resp.status() === 201,
      ),
      this.sendButton.click(),
    ]);
  }

  async clickSend() {
    await this.sendButton.click();
  }

  async expectSuccess() {
    await expect(this.toast).toBeVisible();
    await this.toast.waitFor({ state: "hidden", timeout: 5000 });
    await expect(this.textarea).toHaveValue("");
  }
}
