# PR Review: ROOT_TAB_NAVIGATOR - Plan poprawek i scenariusze testowe

## Podsumowanie PR

PR wprowadza `ROOT_TAB_NAVIGATOR` (BottomTabNavigator) jako glowny nawigator zamiast dotychczasowego podejscia, gdzie split navigatory (Reports, Search, Settings, Workspaces, Domain) byly bezposrednio w root stack. Teraz sa zagniezdzone w tab navigatorze.

---

## BUGI DO NAPRAWIENIA

### BUG 1: RHP_TO_DOMAIN nie owrapowany w getRootTabNavigatorState [KRYTYCZNY]
- **Plik**: `src/libs/Navigation/helpers/getAdaptedStateFromPath.ts:199-212`
- **Problem**: Handler `RHP_TO_DOMAIN` zwraca `getInitialSplitNavigatorState(...)` bezposrednio, BEZ owrapowania w `getRootTabNavigatorState()`. Wszystkie inne handlery (WORKSPACE, SETTINGS, SIDEBAR, SEARCH) sa poprawnie owrapowane. To spowoduje ze deep-linki do stron Domain nie beda mialy poprawnego stanu taba.
- **Fix**: Zmienic `return getInitialSplitNavigatorState(...)` na `return getRootTabNavigatorState(getInitialSplitNavigatorState(...))` analogicznie do RHP_TO_WORKSPACE
- [x] Naprawione — owrapowano w `getRootTabNavigatorState()` w `getAdaptedStateFromPath.ts:202`

### ~~BUG 2: Podwojne renderowanie NavigationTabBar na native~~ [NIE BUG — BY DESIGN]
- **Pliki**: `RootTabNavigator.tsx` (renderTabBar) + `TabBarBottomContent/index.native.tsx`
- **Wyjasnienie**: Celowy design. Na native, kiedy tab bar jest ukryty (bo uzytkownik jest na zagnieżdżonym ekranie), `TabBarBottomContent` zapewnia tab bar widoczny podczas animacji swipe-back gesture — tab bar "wjezdza" razem z ekranem pod spodem. Bez tego swipe-back pokazywalby puste miejsce zamiast tab bara.
- [x] Zweryfikowane — by design

### ~~BUG 3: Animacja tab bara moze powodowac miganie~~ [NIE BUG — BY DESIGN]
- **Plik**: `RootTabNavigator.tsx:54-71`
- **Wyjasnienie**: Celowy mechanizm powiazany z BUG 2. Delay przez `requestAnimationFrame` zapobiega przedwczesnemu pokazaniu tab bara podczas animacji swipe-back (kiedy tab bar przechodzi z ukrytego na widoczny). Bez tego delay tab bar migalby przed zakonczeniem animacji.
- [x] Zweryfikowane — by design

---

## POTENCJALNE PROBLEMY DO ZWERYFIKOWANIA

### PROBLEM 1: Swipe gesture disabling na zagnieżdżonych ekranach
- **Plik**: `RootTabNavigator.tsx:166-172`
- **Problem**: `TAB_ROOT_SCREENS_WITHOUT_GESTURE` sprawdza `focusedRouteName` (z `findFocusedRoute`), ktory moze zwrocic nazwe zagniezdzonego ekranu (np. `SCREENS.REPORT` zamiast `NAVIGATORS.REPORTS_SPLIT_NAVIGATOR`). Jezeli uzytkownik jest na ekranie raportu, `isRootScreen` bedzie `false`, wiec gesture bedzie wlaczony, a swipe moze niespodziewanie zamknac caly ROOT_TAB_NAVIGATOR.
- **Test**: Na mobile, wejsc do raportu w Inbox, przesunac palcem w prawo — czy wraca do listy raportow (dobrze) czy zamyka caly tab navigator (zle)?
- [ ] Zweryfikowane

### PROBLEM 2: FreezeWrapper na native jest no-op
- **Plik**: `FreezeWrapper/index.native.tsx`
- **Problem**: Na native `FreezeWrapper` jest po prostu passthrough (`return children`). Freezing zalezy calkowicie od `freezeOnBlur: true` w opcjach BottomTabNavigator (ktore uzywa react-native-screens). Jezeli react-native-screens nie jest zainstalowany lub ta opcja nie dziala poprawnie, nieaktywne taby nie beda zamrazane i beda zuzyac pamiec/CPU.
- **Test**: Przelaczac miedzy tabami i sprawdzic w profilerze React ze nieaktywne taby nie re-renderuja sie
- [ ] Zweryfikowane

### PROBLEM 3: getLastRoute — podwojne przeszukiwanie
- **Plik**: `NavigationTabBar/getLastRoute.ts`
- **Problem**: Szuka navigatora najpierw na root level, potem w ROOT_TAB_NAVIGATOR. Jezeli z jakiegos powodu navigator jest w obu miejscach (np. stary stan), funkcja znajdzie niewlasciwy.
- **Ryzyko**: Niski, ale moze powodowac ze tab bar podswietli nieprawidlowy tab po nawigacji
- [ ] Zweryfikowane

### PROBLEM 4: Brak preloading nieaktywnych tabow
- **Plik**: `RootTabNavigator.tsx:97-101`
- **Problem**: Wszystkie taby (poza Home i WorkspacesList) sa lazy-loaded z `Suspense`. Przy pierwszym wejsciu w tab Settings/Search/Workspaces, uzytkownik widzi FullScreenLoadingIndicator. Usuniety zostal `usePreloadFullScreenNavigators.ts`.
- **Pytanie**: Czy cold-start latency na pierwszym otwarciu kazdego taba jest akceptowalny?
- [ ] Zweryfikowane

### PROBLEM 5: Workspace i Domain mapowane na ten sam tab
- **Plik**: `RootTabNavigator.tsx:31-32`
- **Problem**: Oba `WORKSPACE_SPLIT_NAVIGATOR` i `DOMAIN_SPLIT_NAVIGATOR` mapowane sa na `NAVIGATION_TABS.WORKSPACES`. Przelaczenie miedzy Workspace a Domain nie zmienia wizualnie zaznaczonego taba. Czy to zamierzone?
- [ ] Zweryfikowane

---

## SCENARIUSZE TESTOWE

### Kategoria 1: Podstawowa nawigacja miedzy tabami

- [ ] **T1.1** Web wide: Kliknij kolejno Home -> Inbox -> Search -> Workspaces -> Settings. Kazdy tab laduje poprawnie, tab bar podswietla wlasciwy tab.
- [ ] **T1.2** Web narrow: Jak wyzej ale w waskim oknie
- [ ] **T1.3** Mobile (iOS): Jak wyzej na telefonie
- [ ] **T1.4** Mobile (Android): Jak wyzej na Androidzie
- [ ] **T1.5** Szybkie przelaczanie tabow: Klikac szybko miedzy tabami 5-10 razy. Brak crashy, brak migania tab bara.

### Kategoria 2: Nawigacja wglab + powrot

- [ ] **T2.1** Inbox -> otworz raport -> przycisk wstecz -> wraca do listy raportow (nie zamyka calego taba)
- [ ] **T2.2** Search -> klikni wynik -> przycisk wstecz -> wraca do Search (nie zamyka calego taba)
- [ ] **T2.3** Settings -> klikni podstrone (np. Profile) -> wstecz -> wraca do Settings
- [ ] **T2.4** Workspaces -> otworz workspace -> wstecz -> wraca do listy workspace'ow

### Kategoria 3: Swipe back gesture (mobile only)

- [ ] **T3.1** Na Inbox (lista raportow) — swipe w prawo NIE powinien zamknac taba
- [ ] **T3.2** Na raporcie wewnatrz Inbox — swipe w prawo powinien wrocic do listy raportow
- [ ] **T3.3** Na Home — swipe w prawo NIE powinien zamknac taba
- [ ] **T3.4** Na zagnieźdżonym ekranie Settings (np. Profile) — swipe wraca do Settings root
- [ ] **T3.5** Na Workspace.Initial — swipe wraca do listy workspace'ow (zamierzone zachowanie)

### Kategoria 4: Deep linking

- [ ] **T4.1** Deep link do raportu: `expensify/r/123` — otwiera w Inbox tab z poprawnym stanem
- [ ] **T4.2** Deep link do Search: `expensify/search/...` — otwiera Search tab
- [ ] **T4.3** Deep link do Settings: `expensify/settings/profile` — otwiera Settings tab z Profile
- [ ] **T4.4** Deep link do Workspace: `expensify/settings/workspaces/123/members` — otwiera workspace
- [ ] **T4.5** Deep link do Domain: `expensify/settings/domains/123/...` — **UWAGA: prawdopodobnie zepsuty z powodu BUG 1**
- [ ] **T4.6** Refresh strony na kazdym tabie — stan przywracany poprawnie

### Kategoria 5: RHP (Right Hand Panel) interakcje

- [ ] **T5.1** Otworz RHP z Inbox -> zamknij RHP -> wraca do Inbox (nie do Home)
- [ ] **T5.2** Otworz RHP z Settings -> zamknij -> wraca do Settings
- [ ] **T5.3** Otworz RHP -> przelacz tab -> zamknij RHP -> poprawny stan taba
- [ ] **T5.4** Deep link z RHP + backTo parametrem — poprawnie rozwiazuje background screen

### Kategoria 6: Freeze/Unfreeze ekranow

- [ ] **T6.1** Web: Otworz Inbox, wejdz w raport. Przelacz na Search. Wroc do Inbox — raport nadal otwarty (stan zachowany)
- [ ] **T6.2** Web: Sprawdz w React DevTools/Profiler ze nieaktywne taby nie re-renderuja sie
- [ ] **T6.3** Native: Jak T6.1
- [ ] **T6.4** Native: Sprawdz ze freezeOnBlur dziala (React Profiler/Flipper)

### Kategoria 7: Responsive layout (resize okna)

- [ ] **T7.1** Web: Zmniejsz okno z wide na narrow — tab bar przeskakuje z lewej strony na dol
- [ ] **T7.2** Web: Zwieksz okno z narrow na wide — tab bar przeskakuje z dolu na lewą stronę
- [ ] **T7.3** Przelacz tab w narrow, resize na wide — poprawny stan
- [ ] **T7.4** Floating buttons (FAB, GPS) widoczne i klikalne w obu layoutach

### Kategoria 8: Tab bar widocznosc na narrow

- [ ] **T8.1** Narrow: Na root ekranie taba — tab bar widoczny
- [ ] **T8.2** Narrow: Wejdz w zagnieżdżony ekran (raport) — tab bar ukryty
- [ ] **T8.3** Narrow: Wroc z zagniezdzonego ekranu — tab bar pojawia sie bez migania
- [ ] **T8.4** Narrow: Floating buttons ukryte kiedy tab bar jest ukryty

### Kategoria 9: Logout / zmiana sesji

- [ ] **T9.1** Zaloguj sie -> przelacz miedzy tabami -> wyloguj -> logowanie powinno przekierowac na login
- [ ] **T9.2** Po zalogowaniu ponownie -> czy domyslny tab to Home (nie ostatnio uzyty)

### Kategoria 10: Edge cases

- [ ] **T10.1** Otworz wiele raportow w Inbox (nawiguj: raport A -> raport B -> raport C). Wstecz powinien isc C -> B -> A -> lista
- [ ] **T10.2** Przelacz tab Inbox -> Search -> Inbox — Inbox zachowuje stan (otwarty raport)
- [ ] **T10.3** Brak polaczenia z internetem — nawigacja miedzy tabami nadal dziala (offline-first)
- [ ] **T10.4** Onboarding flow — po zakonczeniu onboardingu, ROOT_TAB_NAVIGATOR sie poprawnie inicjalizuje

---

## CODE QUALITY DO POPRAWY

### CQ1: Typo w commicie
- Commit `9e164add766`: "ROOT_TAB_NACIGATOR" zamiast "ROOT_TAB_NAVIGATOR"
- Nie wplywna na kod, ale warto naprawic w opisie PR

### CQ2: Brak komentarza dlaczego "magic number" w tabBar animation delay
- **Plik**: `RootTabNavigator.tsx:62` — `shouldApplyDelay` logika jest skomplikowana, brak komentarza wyjasniajacego dlaczego uzyto `requestAnimationFrame` (jeden frame delay) a nie np. `setTimeout` lub animacja
- [ ] Dodac komentarz

### CQ3: FreezeWrapper native — dodac komentarz o fallback
- **Plik**: `FreezeWrapper/index.native.tsx`
- Komentarz jest, ale warto dodac informacje co sie stanie jezeli `freezeOnBlur` nie zadziala (np. w przyszlych wersjach react-native-screens)
- [ ] Opcjonalne

### CQ4: ROOT_TAB_SCREENS vs Tab.Screen order — runtime validation
- Compile-time check (linie 130-135 w RootTabNavigator.tsx) jest dobry, ale nie weryfikuje KOLEJNOSCI. Jezeli kolejnosc w ROOT_TAB_SCREENS bedzie inna niz w Tab.Navigator, deep-linki beda otwierac zle taby.
- [ ] Rozwazyc dodanie runtime assertion w __DEV__

---

## PRIORYTETY

| # | Item | Priorytet | Czas |
|---|------|-----------|------|
| 1 | BUG 1: RHP_TO_DOMAIN fix | KRYTYCZNY | 5 min |
| 2 | T4.5: Test deep-link Domain | KRYTYCZNY | 10 min |
| 3 | T3.1-T3.5: Swipe gesture testy | WYSOKI | 30 min |
| 4 | BUG 3: Tab bar animation | SREDNI | 20 min |
| 5 | T1.1-T1.5: Podstawowa nawigacja | WYSOKI | 20 min |
| 6 | T2.1-T2.4: Nawigacja wglab | WYSOKI | 20 min |
| 7 | T6.1-T6.4: Freeze testy | SREDNI | 30 min |
| 8 | T5.1-T5.4: RHP testy | SREDNI | 20 min |
| 9 | T7.1-T7.4: Responsive testy | SREDNI | 15 min |
| 10 | BUG 2: Podwojny tab bar | NISKI | badanie |
| 11 | CQ1-CQ4: Code quality | NISKI | 15 min |
