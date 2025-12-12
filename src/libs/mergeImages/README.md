# Image Merging Implementation

## Problem
`expo-image-manipulator` nie obsługuje akcji `compose` ani `overlay`, więc nie można bezpośrednio łączyć dwóch obrazów.

## Rozwiązanie w kontekście tego projektu

### Opcja 1: Rozszerzyć istniejący natywny kod (ZALECANE)
W projekcie już istnieje `ImageCombineTask` (Java/Kotlin) dla vertical merge. Można:
1. Rozszerzyć `ImageCombineTask` o obsługę horizontal merge
2. Utworzyć React Native TurboModule, który wywołuje ten kod
3. Użyć go w `mergeImages/index.native.ts`

**Zalety:**
- Wykorzystuje istniejący, przetestowany kod
- Szybkie i wydajne (natywne)
- Nie wymaga dodatkowych bibliotek

**Wady:**
- Wymaga modyfikacji natywnego kodu (Java/Kotlin + iOS Swift/ObjC)

### Opcja 2: Użyć react-native-view-shot (NIE ZALECANE przez użytkownika)
Renderować obrazy obok siebie w komponencie React Native i zrobić screenshot.

### Opcja 3: Dodać patch do expo-image-manipulator
Dodać obsługę `compose` w patche, ale to wymaga głębokiej znajomości biblioteki.

## Aktualny stan
Implementacja używa `compose`, które nie jest obsługiwane, więc nie działa.

