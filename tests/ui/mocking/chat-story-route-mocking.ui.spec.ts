import { test, expect, Page } from "@playwright/test";
import { ChatPage } from "../../../pages/ChatPage";
import { DiscoverPage } from "../../../pages/DiscoverPage";

async function expectNotRedirectedToLogin(page: Page) {
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 10_000 });
}

test.describe("Kamil Mieczkowski", () => {
  test.use({ storageState: "storageState.json" });

  test("MOCK-CHAT-01: mock tworzenia pokoju czatu", async ({
    page,
  }) => {
    test.setTimeout(30_000);
    const chatPage = new ChatPage(page);

    const targetUser = "mock-user-1";
    const mockSearchUserResult = [
      {
        id: 993,
        fullName: "Mock User 1",
        nickName: targetUser,
        profilePicture: null,
      },
    ];

    const mockCreatedChat = {
      id: 99111,
      chatRoomName: "Mock User 1",
      participants: [
        {
          id: 4,
          fullName: "test4",
          nickName: "test4",
          profilePicture: null,
        },
        {
          id: 993,
          fullName: "Mock User 1",
          nickName: targetUser,
          profilePicture: null,
        },
      ],
    };

    const mockChats = [mockCreatedChat];

    const searchUserMatcher = /\/api\/(?:user|users)\/search(?:\?.*)?$/i;
    let searchUserRequestCount = 0;
    let createChatRequestCount = 0;

    await page.route(searchUserMatcher, async (route) => {
      searchUserRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSearchUserResult),
      });
    });

    await page.route(/\/chats\/user(?:\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockChats),
      });
    });

    const createChatMatcher = /\/chats\/create(?:\?.*)?$/;

    await page.route(createChatMatcher, async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      createChatRequestCount += 1;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(mockCreatedChat),
      });
    });

    await chatPage.goToChat();
    await expectNotRedirectedToLogin(page);

    await chatPage.openAddUserPanel();
    await chatPage.searchUserInAddPanel(targetUser);

    await expect
      .poll(() => searchUserRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    await chatPage.expectUserVisibleInSearchResults("Mock User 1");
    await chatPage.selectUserFromSearchResults("Mock User 1");
    await chatPage.expectUserMarkedAsSelected("Mock User 1");

    const createChatRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === "POST" && createChatMatcher.test(request.url()),
      { timeout: 10_000 },
    );

    await chatPage.clickCreateChat();
    await createChatRequestPromise;

    await expect
      .poll(() => createChatRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    await chatPage.expectCreateChatToast();
    await chatPage.expectChatVisibleOnLeftList("Mock User 1");

    await page.unroute(searchUserMatcher);
    await page.unroute(/\/chats\/user(?:\?|$)/);
    await page.unroute(createChatMatcher);
  });

  test("MOCK-CHAT-02: mock listy czatow", async ({
    page,
  }) => {
    test.setTimeout(30_000);
    const chatPage = new ChatPage(page);

    const mockChats = [
      {
        id: 99101,
        chatRoomName: "Mock User 1",
        participants: [
          {
            id: 993,
            fullName: "Mock User 1",
            nickName: "mock-user-1",
            profilePicture: null,
          },
          {
            id: 4,
            fullName: "test4",
            nickName: "test4",
            profilePicture: null,
          },
        ],
      },
      {
        id: 99102,
        chatRoomName: "Mock User 2",
        participants: [
          {
            id: 994,
            fullName: "Mock User 2",
            nickName: "mock-user-2",
            profilePicture: null,
          },
          {
            id: 4,
            fullName: "test4",
            nickName: "test4",
            profilePicture: null,
          },
        ],
      },
    ];

    let chatsUserRequestCount = 0;

    await page.route(/\/chats\/user(?:\?|$)/, async (route) => {
      chatsUserRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockChats),
      });
    });

    await chatPage.goToChat();
    await expectNotRedirectedToLogin(page);

    await expect
      .poll(() => chatsUserRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    await chatPage.expectChatVisibleOnLeftList("Mock User 1");
    await chatPage.expectChatVisibleOnLeftList("Mock User 2");

    await page.unroute(/\/chats\/user(?:\?|$)/);
  });

  test("MOCK-STORY-01: mock tworzenia story", async ({
    page,
  }) => {
    const discoverPage = new DiscoverPage(page);

    const now = Date.now();
    const mockCreatedStory = {
      id: 88201,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600",
      timestamp: new Date(now + 60_000).toISOString(),
      expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    };

    let createStoryRequestCount = 0;

    await page.route(/\/stories(?:\?|$)/, async (route) => {
      if (route.request().method() === "POST") {
        createStoryRequestCount += 1;
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(mockCreatedStory),
        });
        return;
      }

      await route.continue();
    });

    await discoverPage.goto();
    await expectNotRedirectedToLogin(page);

    const createStoryRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        /\/stories(?:\?|$)/.test(request.url()),
      { timeout: 10_000 },
    );

    const createdStoryResponse = await page.evaluate(async () => {
      const formData = new FormData();
      const file = new File(["mock-story"], "mock-story.jpg", {
        type: "image/jpeg",
      });

      formData.append("storyImage", file);

      const response = await fetch("/api/stories", {
        method: "POST",
        body: formData,
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    });

    await createStoryRequestPromise;

    await expect
      .poll(() => createStoryRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    expect(createdStoryResponse.status).toBe(201);
    expect(createdStoryResponse.body.id).toBeGreaterThan(0);
    expect(createdStoryResponse.body.image ?? createdStoryResponse.body.imageUrl).toBeTruthy();
    expect(createdStoryResponse.body.expiresAt ?? createdStoryResponse.body.timestamp).toBeTruthy();

    await page.unroute(/\/stories(?:\?|$)/);
  });
});
