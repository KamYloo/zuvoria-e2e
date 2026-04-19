import { test, expect } from "@playwright/test";
import { AuthApi } from "../../pages/api/AuthApi";
import path from "path";
import { PostApi } from "../../pages/api/PostApi";

const API_BASE_URL = "https://api.zuvoria.pl/api";
const API_USER_EMAIL = "test1@zuvoria.pl";
const API_USER_PASSWORD = "admin1111";

//Zuzanna Bobrykow
test.describe("Backend API - Posts", () => {
  let authApi: AuthApi;
  let postApi: PostApi;
  const filePath = path.resolve("tests/fixtures/test.jpg");

  test.beforeEach(async ({ request }) => {
    authApi = new AuthApi(request, API_BASE_URL);
    postApi = new PostApi(request, API_BASE_URL);

    await authApi.loginAndExpect200({
      email: API_USER_EMAIL,
      password: API_USER_PASSWORD,
    });
  });

  test("API-POST-01: Publikacja nowego posta zwraca 201", async () => {
    const response = await postApi.createPost("Testowy post API", filePath);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("id");
  });

  test("API-POST-02: Błąd 400 przy przekroczeniu limitu znaków (>1000)", async () => {
    const longContent = "a".repeat(1001);
    const response = await postApi.createPost(longContent, filePath);

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.businessErrornDescription).toBeTruthy();
  });

  test("API-POST-03: Polubienie posta zwraca 200", async () => {
    const listResponse = await postApi.getAllPosts();
    expect(listResponse.status()).toBe(200);

    const posts = await listResponse.json();
    const postId = posts.content[0]?.id;

    expect(postId, "Brak postów w bazie do polubienia").toBeDefined();

    const likeResponse = await postApi.likePost(postId);
    expect(likeResponse.status()).toBe(200);
  });
});
