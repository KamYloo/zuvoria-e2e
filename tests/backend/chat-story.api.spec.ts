import { test, expect } from "@playwright/test";
import { AuthApi } from "../../pages/api/AuthApi";
import { ChatApi } from "../../pages/api/ChatApi";
import { StoryApi } from "../../pages/api/StoryApi";
import { ChatRoomDto, StoryDto } from "../../pages/api/types";

const API_BASE_URL = "https://api.zuvoria.pl/api";
const API_USER_EMAIL = "test2@zuvoria.pl";
const API_USER_PASSWORD = "admin1111";
const API_CHAT_TARGET_USER_ID = 2;

test.describe("Backend API - Chat i Story Kamil Mieczkowski", () => {
  test.describe.configure({ mode: "serial" });

  test("API-CHAT-01: Tworzenie pokoju czatu zwraca 201 i ID pokoju", async ({ request }) => {
    const authApi = new AuthApi(request, API_BASE_URL);
    const chatApi = new ChatApi(request, API_BASE_URL);

    await authApi.loginAndExpect200({
      email: API_USER_EMAIL,
      password: API_USER_PASSWORD,
    });

    let createdChatId: number | null = null;

    try {
      const response = await chatApi.createChat([API_CHAT_TARGET_USER_ID], "");

      expect(response.status()).toBe(201);

      const body = (await response.json()) as ChatRoomDto;
      expect(body.id).toBeGreaterThan(0);
      expect(Array.isArray(body.participants)).toBeTruthy();
      expect(body.participants.length).toBe(2);

      createdChatId = body.id;
    } finally {
      if (createdChatId) {
        const deleteResponse = await chatApi.deleteChat(createdChatId);
        expect(deleteResponse.ok()).toBeTruthy();
      }
    }
  });

  test("API-CHAT-02: Pobranie listy czatow usera zwraca 200 i poprawna strukture", async ({ request }) => {
    const authApi = new AuthApi(request, API_BASE_URL);
    const chatApi = new ChatApi(request, API_BASE_URL);

    await authApi.loginAndExpect200({
      email: API_USER_EMAIL,
      password: API_USER_PASSWORD,
    });

    const response = await chatApi.getUserChats();
    expect(response.status()).toBe(200);

    const body = (await response.json()) as ChatRoomDto[];
    expect(Array.isArray(body)).toBeTruthy();

    if (body.length > 0) {
      const firstChat = body[0];
      expect(firstChat).toHaveProperty("id");
      expect(firstChat).toHaveProperty("participants");
      expect(Array.isArray(firstChat.participants)).toBeTruthy();
    }
  });

  test("API-STORY-01: Tworzenie story zwraca 201 oraz pola czasowe i obraz", async ({ request }) => {
    const authApi = new AuthApi(request, API_BASE_URL);
    const storyApi = new StoryApi(request, API_BASE_URL);

    await authApi.loginAndExpect200({
      email: API_USER_EMAIL,
      password: API_USER_PASSWORD,
    });

    let createdStoryId: number | null = null;

    try {
      const response = await storyApi.createStoryFromFixture("tests/fixtures/test.jpg");

      expect(response.status()).toBe(201);

      const body = (await response.json()) as StoryDto;
      expect(body.id).toBeGreaterThan(0);

      const imageField = body.imageUrl ?? body.image;
      expect(imageField, "Brak imageUrl/image w odpowiedzi").toBeTruthy();

      const dateField = body.expiresAt ?? body.timestamp;
      expect(dateField, "Brak expiresAt/timestamp w odpowiedzi").toBeTruthy();

      if (body.expiresAt) {
        const expiresAtMs = new Date(body.expiresAt).getTime();
        expect(expiresAtMs).toBeGreaterThan(Date.now());
      }

      createdStoryId = body.id;
    } finally {
      if (createdStoryId) {
        const deleteResponse = await storyApi.deleteStory(createdStoryId);
        expect([200, 204]).toContain(deleteResponse.status());
      }
    }
  });
});
