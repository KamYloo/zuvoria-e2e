// Gracjan Czyżewski

import { test, expect, Page } from "@playwright/test";
import { LoginPage } from "../../../pages/LoginPage";
import { HomePage } from "../../../pages/HomePage";
import { ProfileEditPage } from "../../../pages/ProfileEditPage";

const MOCK_USER = {
    id: 14,
    fullName: "Mockowany User",
    email: "test1@zuvoria.pl",
    nickName: "test1",
    profilePicture:
        "https://cdn.zuvoria.pl/uploads/userImages/mock-avatar.png",
    description: "Mockowany opis profilu",
    observed: false,
    observersCount: 0,
    observationsCount: 0,
    artist: false,
    premium: false,
    isArtist: false,
};

async function clearAuthCookies(page: Page) {
    await page.context().clearCookies();
}

test.describe("Mocking - Auth i Profil | Gracjan Czyżewski", () => {
    test.use({ storageState: "storageState.json" });

    test("MOCK-AUTH-01: mock sukcesu logowania", async ({ page }) => {
        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);

        let loggedIn = false;
        let loginRequestCount = 0;
        const checkAuthMatcher = /\/(?:api\/)?auth\/check(?:\?.*)?$/i;
        const loginMatcher = /\/(?:api\/)?auth\/login(?:\?.*)?$/i;

        await clearAuthCookies(page);

        await page.route(checkAuthMatcher, async (route) => {
            if (loggedIn) {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify(MOCK_USER),
                });
                return;
            }

            await route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({
                    businessErrornDescription: "Unauthorized",
                }),
            });
        });

        await page.route(loginMatcher, async (route) => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }

            loginRequestCount += 1;
            loggedIn = true;

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    user: MOCK_USER,
                }),
            });
        });

        await loginPage.goto();
        await loginPage.assertVisible();

        const loginResponsePromise = page.waitForResponse(
            (response) =>
                response.request().method() === "POST" &&
                loginMatcher.test(response.url()),
            { timeout: 10_000 },
        );

        await loginPage.attemptLogin("test1@zuvoria.pl", "admin1111");
        await loginResponsePromise;

        await expect.poll(() => loginRequestCount).toBe(1);
        await homePage.assertRedirectAfterLogin();
        await homePage.assertLogoutVisible();
        await homePage.assertProfileVisible();
    });

    test("MOCK-AUTH-02: mock błędu logowania", async ({ page }) => {
        const loginPage = new LoginPage(page);

        let loginRequestCount = 0;

        await clearAuthCookies(page);

        await page.route(/\/api\/auth\/check(?:\?|$)/, async (route) => {
            await route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({
                    businessErrornDescription: "Unauthorized",
                }),
            });
        });

        await page.route(/\/(?:auth\/login|login)(?:\?|$)/, async (route) => {
            if (route.request().method() !== "POST") {
                await route.continue();
                return;
            }

            loginRequestCount += 1;

            await route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({
                    businessErrornDescription: "Login and / or password is incorrect",
                }),
            });
        });

        await loginPage.goto();
        await loginPage.assertVisible();
        await loginPage.attemptLogin("test1@zuvoria.pl", "ZleHaslo999");

        await expect.poll(() => loginRequestCount).toBe(1);
        await loginPage.assertLoginErrorVisible();
        await loginPage.assertOnLoginPage();
        await expect(loginPage.loginButton).toHaveText("Login");
    });

    test("MOCK-PROFILE-01: mock błędu backendu przy edycji profilu", async ({
                                                                                page,
                                                                            }) => {
        const profileEditPage = new ProfileEditPage(page);

        const mockedErrorMessage = "Full name must not be blank.";
        let editRequestCount = 0;

        await page.route("**/api/user/profile/edit", async (route) => {
            if (route.request().method() !== "PUT") {
                await route.continue();
                return;
            }

            editRequestCount += 1;

            await route.fulfill({
                status: 400,
                contentType: "application/json",
                body: JSON.stringify({
                    businessErrornDescription: mockedErrorMessage,
                    validationErrors: [
                        mockedErrorMessage,
                        "Full name must be between 2 and 100 characters.",
                    ],
                }),
            });
        });

        await profileEditPage.goto();
        await profileEditPage.assertVisible();

        await profileEditPage.fillForm("", "");
        await profileEditPage.submit();

        await expect.poll(() => editRequestCount).toBe(1);
        await expect(page.getByText(mockedErrorMessage).first()).toBeVisible();
        await expect(page).toHaveURL(/\/profile\/edit(?:[/?#].*)?$/);
    });
});