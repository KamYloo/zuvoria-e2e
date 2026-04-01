import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AlbumPage } from '../../pages/AlbumPage';

test.describe('Muzyka | REQ-MUSIC-01', () => {
  test('TC-MUSIC-01: Wyszukiwanie istniejącego albumu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const albumPage = new AlbumPage(page);

    await test.step('Warunek wstępny: użytkownik jest zalogowany', async () => {
      await loginPage.login('test4@zuvoria.pl', 'admin1111');
    });

    await test.step('Krok 1: przejście do widoku albumów', async () => {
      await albumPage.goToAlbums();
    });

    await test.step('Krok 2: wyszukanie istniejącego albumu', async () => {
      await albumPage.searchAlbum('Cold Summer');
    });

    await test.step('Krok 3: sprawdzenie wyniku wyszukiwania', async () => {
      await albumPage.expectAlbumVisible('Cold Summer');
    });
  });
});