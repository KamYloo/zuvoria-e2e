import { test, expect, APIRequestContext, APIResponse } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("POSTS API", () => {
  let apiContext: APIRequestContext;
  let response: APIResponse;
  const filePath = path.resolve("tests/fixtures/test.jpg");

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: "https://api.zuvoria.pl",
      storageState: "storageState.json",
    });
  });

  //TC-SOC-01
  test("API - Publikacja nowego posta", async () => {
    await test.step("Wysłanie żądania POST /api/posts/create z poprawnymi danymi", async () => {
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

  //TC-SOC-02
  test("API - Próba publikacji posta przekraczającego limit znaków (>1000 znaków)", async () => {
    await test.step("Wysłanie żądania z przekroczonym limitem znaków", async () => {
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

    await test.step("Weryfikacja błędu 400 Bad Request", async () => {
      expect(response.status()).toBe(400);
    });
  });

  //TC-SOC-03
  test("API - Polubienie posta", async () => {
    let postId: string;

    await test.step("Pobranie listy postów", async () => {
      const postsResponse = await apiContext.get(
        "/api/posts/all?sortDir=DESC&page=0&size=10",
      );

      const posts = await postsResponse.json();
      postId = posts.content[0]?.id;
    });

    await test.step("Wysłanie żądania PUT /api/post/{id}/like", async () => {
      response = await apiContext.put(`/api/post/${postId}/like`);
    });

    await test.step("Weryfikacja odpowiedzi 200 OK", async () => {
      expect(response.status()).toBe(200);
    });
  });
});
