import { test, expect, Page } from "@playwright/test";
import { ChatPage } from "../../pages/ChatPage";
import { DiscoverPage } from "../../pages/DiscoverPage";
import { ProfilePage } from "../../pages/ProfilePage";

const UI_PROFILE_NICKNAME = "test4";

async function expectNotRedirectedToLogin(page: Page) {
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 10_000 });
}

test.describe("Kamil Mieczkowski", () => {
  test.use({ storageState: "storageState.json" });

  test("MOCK-CHAT-01: mock listy czatow", async ({
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

  test("MOCK-STORY-01: mock stories obserwowanych", async ({
    page,
  }) => {
    const discoverPage = new DiscoverPage(page);
    const now = Date.now();
    const mockStoriesByFollowedUser = {
      "followed-alpha": [
        {
          id: 88101,
          image:
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600",
          timestamp: new Date(now).toISOString(),
          user: {
            id: 301,
            fullName: "Followed Alpha",
            nickName: "followed-alpha",
            profilePicture: null,
          },
        },
      ],
      "followed-beta": [
        {
          id: 88102,
          image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
          timestamp: new Date(now + 60_000).toISOString(),
          user: {
            id: 302,
            fullName: "Followed Beta",
            nickName: "followed-beta",
            profilePicture: null,
          },
        },
      ],
    };

    let followedStoriesRequestCount = 0;

    await page.route(/\/stories\/followed(?:\?|$)/, async (route) => {
      followedStoriesRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockStoriesByFollowedUser),
      });
    });

    await discoverPage.goto();
    await expectNotRedirectedToLogin(page);

    await expect
      .poll(() => followedStoriesRequestCount, { timeout: 10_000 })
      .toBeGreaterThan(0);

    await discoverPage.expectAddStoryVisible();
    await discoverPage.expectStoryUserVisible(/followed-alpha/i);
    await discoverPage.expectStoryUserVisible(/followed-beta/i);

    await page.unroute(/\/stories\/followed(?:\?|$)/);
  });

  test("MOCK-VER-01: mock bledu walidacji weryfikacji artysty", async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    const mockedErrorMessage = "ArtistName is required";

    await page.route("**/api/user/verify-request**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ businessErrornDescription: mockedErrorMessage }),
        });
        return;
      }

      await route.continue();
    });

    await profilePage.gotoProfile(UI_PROFILE_NICKNAME);
    await expectNotRedirectedToLogin(page);
    await profilePage.openVerifyModal();
    await profilePage.fillArtistName("Mock Artist Name");

    const verifyRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().includes("/api/user/verify-request"),
      { timeout: 10_000 },
    );

    await profilePage.submitArtistVerification();
    await verifyRequestPromise;

    await profilePage.expectVerificationErrorVisible(mockedErrorMessage);
    await profilePage.expectArtistVerificationModalVisible();
    await expect(page).toHaveURL(new RegExp(`/profile/${UI_PROFILE_NICKNAME}`));

    await page.unroute("**/api/user/verify-request**");
  });
});
