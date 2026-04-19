import { test } from "@playwright/test";
import { PlayerPage } from "../../../pages/PlayerPage";

//Mieczkowski Kamil
test.describe("Odtwarzacz | REQ-PLAYER-01", () => {
  test("TC-PLAYER-01: Uruchomienie odtwarzacza i weryfikacja startu HLS po kliknięciu aktywnego utworu", async ({
    page,
  }) => {
    const playerPage = new PlayerPage(page);

    await test.step("Powiązanie z wymaganiem: REQ-PLAYER-01", async () => {});

    await test.step("Użytkownik przechodzi na listę utworów artysty", async () => {
      await playerPage.goToArtistPopular("2");
      await playerPage.waitForPlayableSongs();
    });

    await test.step("Kliknij utwór, który zmienia aktualny wybór odtwarzania", async () => {
      const manifestResponsePromise = page.waitForResponse(
        (response) => {
          const url = response.url();
          const method = response.request().method();
          return (
            /\.m3u8(\?|$)|manifest/i.test(url) &&
            method === "GET" &&
            response.status() === 200
          );
        },
        { timeout: 15000 },
      );
      const segmentRequestPromise = page.waitForRequest(
        (request) => /\.(ts|m4s|aac)(\?|$)|segment|chunk/i.test(request.url()),
        { timeout: 15000 },
      );

      const { clickedSong, previouslyPlayingSong } =
        await playerPage.clickPlayableSongChangingSelection();

      await test.step("Oczekiwany rezultat- przeglądarka wysyła GET do manifestu HLS i otrzymuje 200", async () => {
        await manifestResponsePromise;
      });

      await test.step("Oczekiwany rezultat - wysyłane są żądania fragmentów HLS", async () => {
        await segmentRequestPromise;
      });

      await test.step("Oczekiwany rezultat - kliknięty utwór ma klasę .playing", async () => {
        await playerPage.expectSongIsPlaying(clickedSong);
      });

      if (previouslyPlayingSong) {
        await test.step("Oczekiwany rezultat - poprzedni utwór traci klasę .playing", async () => {
          await playerPage.expectSongIsNotPlaying(previouslyPlayingSong);
        });
      }
    });

    await test.step("Oczekiwany rezultat - player startuje i pasek czasu zaczyna się przesuwać", async () => {
      await playerPage.expectPlayerStarted();
      await playerPage.expectPauseIconVisible();
      await playerPage.expectProgressMoves();
    });
  });
});
