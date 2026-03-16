# Zuvoria E2E - Automatyzacja Testów 🎵🤖

Ten projekt zawiera testy automatyczne End-to-End (E2E) dla platformy muzyczno-społecznościowej **Zuvoria**. Testy zostały napisane w frameworku [Playwright](https://playwright.dev/) (TypeScript) i weryfikują poprawne działanie aplikacji wdrożonej na środowisku produkcyjnym (VPS).

## 🚀 Wymagania wstępne

Aby uruchomić projekt lokalnie na swoim komputerze, upewnij się, że masz zainstalowane:
* [Node.js](https://nodejs.org/) (wersja LTS)
* Edytor kodu, np. Visual Studio Code, WebStorm

## 📦 Instalacja

1. Sklonuj repozytorium na swój komputer:
```
git clone https://github.com/KamYloo/zuvoria-e2e.git
```

2. Wejdź do folderu z testami:
```
 cd zuvoria-e2e
```

3. Zainstaluj paczki i zależności:
```
npm install
```

4. Zainstaluj przeglądarki wymagane przez Playwrighta (Chromium, Firefox, WebKit):
```
npx playwright install --with-deps
```

## Uruchamianie testów (Komendy)
Oto najważniejsze komendy, z których będziemy korzystać podczas pracy:

- Uruchomienie wszystkich testów z interfejsem graficznym (ZALECANE):
```
npx playwright test --ui
```
(Otworzy się panel, w którym można klikać testy krok po kroku i podglądać przeglądarkę).

- Uruchomienie wszystkich testów w tle (headless):
```
 npx playwright test
```

- Uruchomienie tylko jednego, konkretnego pliku testowego(Przykład):
```
npx playwright test tests/auth/login.spec.ts
```

- Generator kodu (Codegen):

Jeśli chcesz wyklikać test w przeglądarce, a Playwright sam wygeneruje dla ciebie kod, użyj:
```
npx playwright install --with-deps
```

- Przeglądanie wyników i raportów:
```
npx playwright show-report
```

Otwiera w przeglądarce piękny, wygenerowany raport HTML z ostatniego uruchomienia testów. Zobaczysz tam wykresy, czas trwania każdego testu oraz błędy.
