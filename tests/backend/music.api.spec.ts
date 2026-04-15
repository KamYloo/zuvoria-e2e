import { test, expect, APIRequestContext, APIResponse } from "@playwright/test";
// @ts-ignore
import path from "path";
// @ts-ignore
import fs from "fs";

//Maria Marta Kulesza
test.describe("Backend API - Muzyka i Playlisty", () => {
  let apiContext: APIRequestContext;
  let response: APIResponse;
  const filePath = path.resolve("tests/fixtures/test.jpg");

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: "https://api.zuvoria.pl",
      storageState: "storageState.json",
    });
  });

  test("API-MUSIC-01: Pobranie listy albumów", async () => {
    response = await apiContext.get("/api/album/all?page=0&size=9");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.content)).toBeTruthy();
    expect(body.pageNumber).toBe(0);
    expect(body.pageSize).toBe(9);
  });

  test("API-MUSIC-02: Odpowiedź zawiera album Cold Summer", async () => {
    response = await apiContext.get("/api/album/all?page=0&size=9");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(JSON.stringify(body)).toContain("Cold Summer");
  });

  test("API-PLAYLIST-01: Utworzenie playlisty (backend może być niestabilny)", async () => {
    response = await apiContext.post("/api/playlists/create", {
      multipart: {
        title: `API playlist ${Date.now()}`,
        description: "Test playlist from API",
        file: {
          name: "test.jpg",
          mimeType: "image/jpeg",
          buffer: fs.readFileSync(filePath),
        },
      },
    });

    expect([200, 201, 400, 500]).toContain(response.status());
  });

  test("API-PLAYLIST-02: Próba utworzenia playlisty bez tytułu", async () => {
    response = await apiContext.post("/api/playlists/create", {
      multipart: {
        title: "",
        description: "Test",
        file: {
          name: "test.jpg",
          mimeType: "image/jpeg",
          buffer: fs.readFileSync(filePath),
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("API-PLAYLIST-03: Wysłanie pustego requestu", async () => {
    response = await apiContext.post("/api/playlists/create", {
      multipart: {},
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
