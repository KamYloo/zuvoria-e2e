import { test, expect, APIRequestContext, APIResponse } from "@playwright/test";
// @ts-ignore
import path from "path";
// @ts-ignore
import fs from "fs";

test.describe("Backend API - Posty", () => {
  let apiContext: APIRequestContext;
  let response: APIResponse;
  const filePath = path.resolve("tests/fixtures/test.jpg");

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: "https://api.zuvoria.pl",
      storageState: "storageState.json",
    });
  });

  test("API-POST-01: Publikacja nowego posta", async () => {
    await test.step("Wyslanie zadania POST /api/posts/create z poprawnymi danymi", async () => {
      response = await apiContext.post("/api/posts/create", {
        multipart: {
          description: "Test API post",
          file: {
            name: "test.jpg",
            mimeType: "image/jpeg",
            buffer: fs.readFileSync(filePath),
          },
        },
      });
    });

    await test.step("Weryfikacja kodu odpowiedzi 201 Created", async () => {
      expect(response.status()).toBe(201);
    });
  });

  test("API-POST-02: Proba publikacji posta przekraczajacego limit znakow (>1000)", async () => {
    await test.step("Wyslanie zadania z przekroczonym limitem znakow", async () => {
      response = await apiContext.post("/api/posts/create", {
        multipart: {
          description: "a".repeat(1001),
          file: {
            name: "test.jpg",
            mimeType: "image/jpeg",
            buffer: fs.readFileSync(filePath),
          },
        },
      });
    });

    await test.step("Weryfikacja bledu 400 Bad Request", async () => {
      expect(response.status()).toBe(400);
    });
  });

  test("API-POST-03: Polubienie posta", async () => {
    let postId: string;

    await test.step("Pobranie listy postow", async () => {
      const postsResponse = await apiContext.get(
        "/api/posts/all?sortDir=DESC&page=0&size=10",
      );

      const posts = await postsResponse.json();
      postId = posts.content[0]?.id;
    });

    await test.step("Wyslanie zadania PUT /api/post/{id}/like", async () => {
      response = await apiContext.put(`/api/post/${postId}/like`);
    });

    await test.step("Weryfikacja odpowiedzi 200 OK", async () => {
      expect(response.status()).toBe(200);
    });
  });
});
