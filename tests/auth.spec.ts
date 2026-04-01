import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { ProfilePage } from './pages/ProfilePage';
import { pickNextAvatar } from './utils/avatar.helper';

test.describe('Autoryzacja i Profil', () => {
    test('TC-AUTH-01: Logowanie poprawnymi danymi (Happy Path)', async ({ page, context }) => {
        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);

        const user = {
            email: 'test1@zuvoria.pl',
            pass: 'admin1111',
        };

        const loginResponsePromise = loginPage.waitForLoginResponse();

        await test.step('Wejście na stronę logowania', async () => {
            await loginPage.goto();
            await loginPage.assertVisible();
        });

        await test.step('Wpisanie poprawnych danych i kliknięcie Login', async () => {
            await loginPage.login(user.email, user.pass);
        });

        await test.step('Weryfikacja odpowiedzi HTTP z logowania', async () => {
            const response = await loginResponsePromise;
            expect(response.status()).toBe(200);
        });

        await test.step('Weryfikacja komunikatu sukcesu', async () => {
            await homePage.assertLoginSuccessMessageVisible();
        });

        await test.step('Weryfikacja przekierowania po logowaniu', async () => {
            await homePage.assertRedirectAfterLogin();
        });

        await test.step('Weryfikacja profilu w prawym panelu', async () => {
            await homePage.assertProfileVisible();
        });

        await test.step('Weryfikacja zmiany Login na Logout', async () => {
            await homePage.assertLogoutVisible();
        });

        await test.step('Weryfikacja braku formularza logowania po zalogowaniu', async () => {
            await homePage.assertLoginFormAbsent();
        });

        await test.step('Weryfikacja ciasteczek sesyjnych', async () => {
            const cookies = await context.cookies();

            const jwtCookie = cookies.find((cookie) => cookie.name === 'jwt_zuvoria_v1');
            const refreshCookie = cookies.find((cookie) => cookie.name === 'refresh_zuvoria_v1');

            expect(jwtCookie, 'Brak ciasteczka jwt_zuvoria_v1').toBeTruthy();
            expect(refreshCookie, 'Brak ciasteczka refresh_zuvoria_v1').toBeTruthy();

            expect(jwtCookie?.httpOnly).toBeTruthy();
            expect(refreshCookie?.httpOnly).toBeTruthy();
        });
    });

    test('TC-AUTH-02: Próba logowania z błędnym hasłem (Negative Test)', async ({ page, context }) => {
        const loginPage = new LoginPage(page);

        const user = {
            email: 'test1@zuvoria.pl',
            wrongPass: 'ZleHaslo999',
        };

        await test.step('Upewnienie się, że użytkownik nie jest zalogowany', async () => {
            await context.clearCookies();
        });

        const loginResponsePromise = loginPage.waitForLoginResponse();

        await test.step('Wejście na stronę logowania', async () => {
            await loginPage.goto();
            await loginPage.assertOnLoginPage();
            await loginPage.assertVisible();
        });

        await test.step('Wpisanie poprawnego emaila i błędnego hasła', async () => {
            await loginPage.login(user.email, user.wrongPass);
        });

        await test.step('Weryfikacja odpowiedzi HTTP z logowania', async () => {
            const response = await loginResponsePromise;
            expect(response.status()).not.toBe(200);
        });

        await test.step('Weryfikacja komunikatu błędu', async () => {
            await loginPage.assertLoginErrorVisible();
        });

        await test.step('Weryfikacja braku przekierowania', async () => {
            await loginPage.assertOnLoginPage();
        });

        await test.step('Weryfikacja, że formularz logowania nadal jest widoczny', async () => {
            await loginPage.assertVisible();
            await expect(loginPage.loginButton).toHaveText('Login');
        });

        await test.step('Weryfikacja braku tokenów sesyjnych', async () => {
            const cookies = await context.cookies();

            const jwtCookie = cookies.find((cookie) => cookie.name === 'jwt_zuvoria_v1');
            const refreshCookie = cookies.find((cookie) => cookie.name === 'refresh_zuvoria_v1');

            expect(jwtCookie).toBeFalsy();
            expect(refreshCookie).toBeFalsy();
        });
    });

    test('TC-AUTH-03: Edycja profilu użytkownika', async ({ page, context }) => {
        const loginPage = new LoginPage(page);
        const homePage = new HomePage(page);
        const profileEditPage = new ProfileEditPage(page);
        const profilePage = new ProfilePage(page);

        const timestamp = Date.now();

        const user = {
            email: 'test1@zuvoria.pl',
            pass: 'admin1111',
        };

        const newFullName = `Nowe Imie ${timestamp}`;
        const newDescription = `Opis testowy ${timestamp}`;
        const avatarPath = pickNextAvatar();

        await test.step('Upewnienie się, że użytkownik startuje jako wylogowany', async () => {
            await context.clearCookies();
        });

        await test.step('Logowanie użytkownika', async () => {
            await loginPage.goto();
            await loginPage.login(user.email, user.pass);

            await homePage.assertRedirectAfterLogin();
            await homePage.assertLogoutVisible();
        });

        await test.step('Przejście na stronę edycji profilu', async () => {
            await profileEditPage.goto();
            await profileEditPage.assertVisible();
        });

        await test.step('Wypełnienie formularza nowymi danymi', async () => {
            await expect(profileEditPage.fullNameInput).toBeVisible();
            await expect(profileEditPage.descriptionInput).toBeVisible();
            await expect(profileEditPage.submitButton).toBeVisible();

            await profileEditPage.fillForm(newFullName, newDescription);
        });

        await test.step('Dodanie zdjęcia profilowego naprzemiennie', async () => {
            await profileEditPage.uploadAvatar(avatarPath);
        });

        const editResponsePromise = profileEditPage.waitForEditResponse();

        await test.step('Wysłanie formularza', async () => {
            await profileEditPage.submit();
        });

        await test.step('Weryfikacja requestu i odpowiedzi backendu', async () => {
            const response = await editResponsePromise;

            const headers = response.request().headers();
            const contentType =
                headers['content-type'] ||
                headers['Content-Type'] ||
                '';

            expect(contentType).toContain('multipart/form-data');
            expect(response.status()).toBe(202);
        });

        await test.step('Weryfikacja komunikatu sukcesu', async () => {
            await profileEditPage.assertSuccessMessageVisible();
        });

        await test.step('Weryfikacja przekierowania na profil użytkownika', async () => {
            await profilePage.assertRedirectedFromEditToProfile();
        });

        await test.step('Weryfikacja nowych danych na profilu', async () => {
            await profilePage.assertProfileData(newFullName, newDescription);
        });

        await test.step('Weryfikacja widoczności avatara na profilu', async () => {
            await profilePage.assertAvatarVisible();
        });
    });
});