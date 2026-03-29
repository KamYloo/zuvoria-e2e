import { Page, Locator, expect } from '@playwright/test';

export class PlayerPage {
  readonly page: Page;
  readonly songsBox: Locator;
  readonly playableSongs: Locator;
  readonly playingSongs: Locator;
  readonly musicPlayer: Locator;
  readonly progressCurrentTime: Locator;
  readonly pauseIconPath: Locator;

  constructor(page: Page) {
    this.page = page;
    this.songsBox = page.locator('.songsBox');
    this.playableSongs = page.locator('.songs:not(.disabled)');
    this.playingSongs = page.locator('.songs.playing');
    this.musicPlayer = page.locator('.musicPlayer');
    this.progressCurrentTime = page.locator('.musicPlayer .currentTime');
    this.pauseIconPath = page.locator('.musicPlayer .playPause svg path[d^="M144 479H48"]');
  }

  async goToArtistPopular(artistId: string = '2') {
    await this.page.goto(`/artist/${artistId}/popular`);
    await expect(this.page.getByRole('link', { name: 'Popular' })).toBeVisible();
  }

  async waitForPlayableSongs() {
    await expect(this.songsBox).toBeVisible();
    await expect(this.playableSongs.first()).toBeVisible({ timeout: 15000 });
  }

  async clickPlayableSongChangingSelection(): Promise<{ clickedSong: Locator; previouslyPlayingSong: Locator | null }> {
    const playableCount = await this.playableSongs.count();
    const firstPlayable = this.playableSongs.first();
    const firstIsPlaying = await firstPlayable.evaluate((el) => el.classList.contains('playing'));

    if (playableCount > 1 && firstIsPlaying) {
      const secondPlayable = this.playableSongs.nth(1);
      await secondPlayable.click();
      return {
        clickedSong: secondPlayable,
        previouslyPlayingSong: firstPlayable,
      };
    }

    await firstPlayable.click();
    return {
      clickedSong: firstPlayable,
      previouslyPlayingSong: null,
    };
  }

  async expectSongIsPlaying(song: Locator) {
    await expect(song).toHaveClass(/playing/);
  }

  async expectSongIsNotPlaying(song: Locator) {
    await expect(song).not.toHaveClass(/playing/);
  }

  async expectPlayerStarted() {
    await expect(this.musicPlayer).toBeVisible();
    await this.page.waitForFunction(() => {
      const audios = Array.from(document.querySelectorAll('.musicPlayer audio')) as HTMLAudioElement[];
      return audios.some((audio) => !audio.paused);
    });
  }

  async expectPauseIconVisible() {
    await expect(this.pauseIconPath).toBeVisible();
  }

  async expectProgressMoves() {
    await expect(this.progressCurrentTime).toBeVisible();
    await this.page.waitForFunction(() => {
      const timeElement = document.querySelector('.musicPlayer .currentTime');
      if (!timeElement) return false;

      const timeText = (timeElement.textContent || '').trim();
      const [minutesRaw, secondsRaw] = timeText.split(':');
      const minutes = Number(minutesRaw);
      const seconds = Number(secondsRaw);

      if (Number.isNaN(minutes) || Number.isNaN(seconds)) return false;
      return minutes * 60 + seconds > 0;
    }, null, { timeout: 15000 });
  }
}
