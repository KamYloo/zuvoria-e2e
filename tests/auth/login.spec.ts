import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function pickNextAvatar(): string {
    const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
    const stateFile = path.join(fixturesDir, '.last-avatar.txt');

    const avatars = [
        path.join(fixturesDir, 'avatar-test-1.png'),
        path.join(fixturesDir, 'avatar-test-2.png'),
    ];

    const lastUsed = fs.existsSync(stateFile)
        ? fs.readFileSync(stateFile, 'utf-8').trim()
        : '';

    const nextAvatar = lastUsed === avatars[0] ? avatars[1] : avatars[0];

    fs.writeFileSync(stateFile, nextAvatar, 'utf-8');

    return nextAvatar;
}

test.describe('Autoryzacja i Profil', () => {
    test('TC-AUTH-01: Logowanie poprawnymi danymi (Happy Path)', async ({ page, context }) => {
        const user = {
            email: 'test1@zuvoria.pl',
            pass: 'admin1111',
        };

        const loginResponsePromise = page.waitForResponse((response) => {
            const url = response.url();
            const method = response.request().method();

            return (
                method === 'POST' &&
                (/\/login(?:\?|$)/.test(url) || /\/auth\/login(?:\?|$)/.test(url))
            );
        });

        await test.step('Wejście na stronę logowania', async () => {
            await page.goto('/login');

            await expect(page.locator('input[name="email"]')).toBeVisible();
            await expect(page.locator('input[name="password"]')).toBeVisible();
            await expect(page.locator('button.login-btn')).toBeVisible();
        });

        await test.step('Wpisanie poprawnych danych i kliknięcie Login', async () => {
            await page.locator('input[name="email"]').fill(user.email);
            await page.locator('input[name="password"]').fill(user.pass);
            await page.locator('button.login-btn').click();
        });

        await test.step('Weryfikacja odpowiedzi HTTP z logowania', async () => {
            const response = await loginResponsePromise;
            expect(response.status()).toBe(200);
        });

        await test.step('Weryfikacja komunikatu sukcesu', async () => {
            await expect(page.getByText('You have logged in successfully.')).toBeVisible();
        });

        await test.step('Weryfikacja przekierowania po logowaniu', async () => {
            await page.waitForURL(/\/home(?:[/?#].*)?$|\/(?:[?#].*)?$/);
            await expect(page).not.toHaveURL(/\/login$/);
        });

        await test.step('Weryfikacja profilu w prawym panelu', async () => {
            await expect(page.locator('.rightMenu .profile')).toBeVisible();
            await expect(page.locator('.rightMenu .profile .profileImg')).toBeVisible();
            await expect(page.locator('.rightMenu .profile .profileImg img[alt="Profilowe"]')).toBeVisible();
        });

        await test.step('Weryfikacja zmiany Login na Logout', async () => {
            await expect(page.locator('.rightMenu .profile .loginBtn')).toHaveText('Logout');
            await expect(page.locator('.rightMenu .profile .loginBtn')).toBeVisible();
        });

        await test.step('Weryfikacja braku formularza logowania po zalogowaniu', async () => {
            await expect(page.locator('input[name="email"]')).toHaveCount(0);
            await expect(page.locator('input[name="password"]')).toHaveCount(0);
            await expect(page.locator('button.login-btn')).toHaveCount(0);
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
        const user = {
            email: 'test1@zuvoria.pl',
            wrongPass: 'ZleHaslo999',
        };

        await test.step('Upewnienie się, że użytkownik nie jest zalogowany', async () => {
            await context.clearCookies();
        });

        const loginResponsePromise = page.waitForResponse((response) => {
            const url = response.url();
            const method = response.request().method();

            return (
                method === 'POST' &&
                (/\/login(?:\?|$)/.test(url) || /\/auth\/login(?:\?|$)/.test(url))
            );
        });

        await test.step('Wejście na stronę logowania', async () => {
            await page.goto('/login');

            await expect(page).toHaveURL(/\/login(?:[/?#].*)?$/);
            await expect(page.locator('input[name="email"]')).toBeVisible();
            await expect(page.locator('input[name="password"]')).toBeVisible();
            await expect(page.locator('button.login-btn')).toBeVisible();
        });

        await test.step('Wpisanie poprawnego emaila i błędnego hasła', async () => {
            await page.locator('input[name="email"]').fill(user.email);
            await page.locator('input[name="password"]').fill(user.wrongPass);
            await page.locator('button.login-btn').click();
        });

        await test.step('Weryfikacja odpowiedzi HTTP z logowania', async () => {
            const response = await loginResponsePromise;
            expect(response.status()).not.toBe(200);
        });

        await test.step('Weryfikacja komunikatu błędu', async () => {
            await expect(page.getByText('Login and / or password is incorrect')).toBeVisible();
        });

        await test.step('Weryfikacja braku przekierowania', async () => {
            await expect(page).toHaveURL(/\/login(?:[/?#].*)?$/);
        });

        await test.step('Weryfikacja, że formularz logowania nadal jest widoczny', async () => {
            await expect(page.locator('input[name="email"]')).toBeVisible();
            await expect(page.locator('input[name="password"]')).toBeVisible();
            await expect(page.locator('button.login-btn')).toBeVisible();
            await expect(page.locator('button.login-btn')).toHaveText('Login');
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
            await page.goto('/login');

            await page.locator('input[name="email"]').fill(user.email);
            await page.locator('input[name="password"]').fill(user.pass);
            await page.locator('button.login-btn').click();

            await page.waitForURL(/\/home(?:[/?#].*)?$|\/(?:[?#].*)?$/);
            await expect(page.locator('.rightMenu .profile .loginBtn')).toHaveText('Logout');
        });

        await test.step('Przejście na stronę edycji profilu', async () => {
            await page.goto('/profile/edit');

            await expect(page).toHaveURL(/\/profile\/edit(?:[/?#].*)?$/);
            await expect(page.locator('.profileEdit')).toBeVisible();
        });

        const fullNameInput = page.locator('.profileEdit .editFullName input');
        const descriptionInput = page.locator('.profileEdit .editDescription textarea');
        const fileInput = page.locator('.profileEdit .editAvatar input[type="file"]');
        const sendButton = page.locator('.profileEdit button.submit');

        await test.step('Wypełnienie formularza nowymi danymi', async () => {
            await expect(fullNameInput).toBeVisible();
            await expect(descriptionInput).toBeVisible();
            await expect(sendButton).toBeVisible();

            await fullNameInput.fill(newFullName);
            await descriptionInput.fill(newDescription);
        });

        await test.step('Dodanie zdjęcia profilowego naprzemiennie', async () => {
            await fileInput.setInputFiles(avatarPath);
        });

        const editResponsePromise = page.waitForResponse((response) => {
            const url = response.url();
            const method = response.request().method();

            return (
                ['POST', 'PUT', 'PATCH'].includes(method) &&
                /\/profile\/edit(?:\?|$)/.test(url)
            );
        });

        await test.step('Wysłanie formularza', async () => {
            await sendButton.click();
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
            await expect(page.getByText('Profile updated successfully.')).toBeVisible();
        });

        await test.step('Weryfikacja przekierowania na profil użytkownika', async () => {
            await page.waitForURL(/\/profile\/[^/?#]+(?:[/?#].*)?$/);
            await expect(page).not.toHaveURL(/\/profile\/edit(?:[/?#].*)?$/);
        });

        await test.step('Weryfikacja nowych danych na profilu', async () => {
            await expect(page.locator('.profileSite .description p')).toHaveText(newFullName);
            await expect(page.locator('.profileSite .description span')).toHaveText(newDescription);
        });

        await test.step('Weryfikacja widoczności avatara na profilu', async () => {
            await expect(page.locator('.profileSite .userData img').first()).toBeVisible();
        });
    });
});