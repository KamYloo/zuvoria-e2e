// Gracjan Czyżewski

import { test, expect } from "@playwright/test";
import { AuthApi } from "../../pages/api/AuthApi";
import { ProfileApi } from "../../pages/api/ProfileApi";

const API_BASE_URL = "https://api.zuvoria.pl/api";
const USER_EMAIL = "test1@zuvoria.pl";
const USER_PASSWORD = "admin1111";
const WRONG_PASSWORD = "ZleHaslo999";

type UserDto = {
    id: number;
    fullName: string;
    email: string;
    nickName: string;
    profilePicture?: string | null;
    description?: string | null;
    observed?: boolean;
    observersCount?: number;
    observationsCount?: number;
    artist?: boolean;
    premium?: boolean;
    isArtist?: boolean;
};

test.describe("Backend API - Auth i Profil | Gracjan Czyżewski", () => {
    test.describe.configure({ mode: "serial" });

    test("API-AUTH-01: poprawne logowanie zwraca HTTP 200", async ({
                                                                       request,
                                                                   }) => {
        const authApi = new AuthApi(request, API_BASE_URL);

        const response = await authApi.login({
            email: USER_EMAIL,
            password: USER_PASSWORD,
        });

        expect(response.status()).toBe(200);
    });

    test("API-AUTH-02: błędne logowanie nie zwraca HTTP 200", async ({
                                                                         request,
                                                                     }) => {
        const authApi = new AuthApi(request, API_BASE_URL);

        const response = await authApi.login({
            email: USER_EMAIL,
            password: WRONG_PASSWORD,
        });

        expect(response.status()).not.toBe(200);
    });

    test("API-PROFILE-01: edycja profilu zwraca 202 i zapisuje nowe dane", async ({
                                                                                      request,
                                                                                  }) => {
        const authApi = new AuthApi(request, API_BASE_URL);
        const profileApi = new ProfileApi(request, API_BASE_URL);

        await authApi.loginAndExpect200({
            email: USER_EMAIL,
            password: USER_PASSWORD,
        });

        const currentUserResponse = await profileApi.getCurrentUser();
        expect(currentUserResponse.status()).toBe(200);

        const currentUser = (await currentUserResponse.json()) as UserDto;

        const newFullName = `API FullName ${Date.now()}`;
        const newDescription = `API Description ${Date.now()}`;

        try {
            const editResponse = await profileApi.editProfile(
                {
                    fullName: newFullName,
                    description: newDescription,
                },
                "tests/fixtures/avatar-test-1.png",
            );

            expect(editResponse.status()).toBe(202);

            const body = (await editResponse.json()) as UserDto;
            expect(body.fullName).toBe(newFullName);
            expect(body.description).toBe(newDescription);
            expect(body.email).toBe(USER_EMAIL);
        } finally {
            const restoreResponse = await profileApi.editProfile({
                fullName: currentUser.fullName,
                description: currentUser.description ?? "",
            });

            expect([200, 202]).toContain(restoreResponse.status());
        }
    });
});