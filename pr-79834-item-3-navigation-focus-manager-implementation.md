# PR 79834 Item 3 Implementation

## Summary

Implemented the item `3` cleanup for `NavigationFocusManager` by removing the unused metadata API and the internal metadata state that only existed to support it.

This was implemented as a deletion refactor, not as a behavior change.

## Code Changes

### 1. Removed dead exported API from `types.ts`

File:

- `src/libs/NavigationFocusManager/types.ts`

Removed:

- `RetrievalMode`
- `ElementRefCandidateMetadata`
- `IdentifierCandidateMetadata`
- `RouteFocusMetadata`
- `getRetrievalModeForRoute` from `NavigationFocusManagerModule`
- `getRouteFocusMetadata` from `NavigationFocusManagerModule`

Kept:

- `InteractionProvenance`
- `NavigationFocusManagerModule`
- `setElementQueryStrategyForTests`
- `getInteractionProvenanceForTests`

Reason:

- the removed types were only used by the deleted metadata getters and metadata scaffolding
- the kept types/hooks still support explicit deterministic tests

### 2. Removed no-op stubs for the deleted API

File:

- `src/libs/NavigationFocusManager/index.ts`

Removed:

- `getRetrievalModeForRoute: () => 'legacy'`
- `getRouteFocusMetadata: () => null`

Reason:

- the non-web implementation must match the real public contract
- once the API is removed from `types.ts`, these stubs become dead surface

### 3. Removed metadata-only implementation from the web manager

File:

- `src/libs/NavigationFocusManager/index.web.ts`

Removed:

- `routeFocusMetadataMap`
- `ElementRefCandidateSource`
- `createRouteFocusMetadata()`
- `resolveInteractionMetadataForRoute()`
- metadata threading inside immediate capture paths
- metadata threading inside `captureForRoute()`
- `getRetrievalModeForRoute()`
- `getRouteFocusMetadata()`

Adjusted:

- `RouteFocusEntryUpdate` now tracks only `element` and `identifier`
- `clearRouteFocusEntry()` now clears only runtime-used state
- `clearLocalStateOnDestroy()` no longer clears deleted metadata state
- `cleanupRemovedRoutes()` now only considers the live focus maps plus provenance route cleanup

Reason:

- `retrieveForRoute()` never used the metadata map
- live focus restore behavior depends on stored elements, stored identifiers, anchor capture, keyboard flag state, and route/provenance cleanup

### 4. Removed metadata-only unit assertions

File:

- `tests/unit/libs/NavigationFocusManagerTest.tsx`

Removed test coverage for:

- pointer metadata writes
- keyboard metadata writes
- retrieval-mode classification
- metadata lifecycle assertions
- missing-metadata default assertions

Kept test coverage for:

- escape provenance tracking
- provenance cleanup in `cleanupRemovedRoutes()`
- provenance reset through `destroy()`
- all live focus capture/restore behavior
- keyboard intent arbitration behavior
- focus trap restore behavior

Reason:

- the removed tests only validated the deleted API
- the kept tests continue to cover the live runtime behavior and the explicit test hook

## Validation

Ran after the implementation:

```bash
npx prettier --write src/libs/NavigationFocusManager/types.ts src/libs/NavigationFocusManager/index.ts src/libs/NavigationFocusManager/index.web.ts tests/unit/libs/NavigationFocusManagerTest.tsx
npx eslint src/libs/NavigationFocusManager/types.ts src/libs/NavigationFocusManager/index.ts src/libs/NavigationFocusManager/index.web.ts tests/unit/libs/NavigationFocusManagerTest.tsx tests/unit/libs/KeyboardIntentArbitrationIntegrationTest.tsx tests/unit/components/FocusTrap/FocusTrapForScreenTest.tsx --max-warnings=0
npx jest tests/unit/libs/NavigationFocusManagerTest.tsx --runInBand
npx jest tests/unit/libs/KeyboardIntentArbitrationIntegrationTest.tsx --runInBand
npx jest tests/unit/components/FocusTrap/FocusTrapForScreenTest.tsx --runInBand
```

Observed results:

- `eslint` passed
- `NavigationFocusManagerTest` passed with `77/77` tests
- `KeyboardIntentArbitrationIntegrationTest` passed with `3/3` tests
- `FocusTrapForScreenTest` passed with `11/11` tests

## Not Included

Did not remove:

- `setElementQueryStrategyForTests`
- `getInteractionProvenanceForTests`

Reason:

- both are explicitly named test hooks
- they still support deterministic focused tests
- they were not part of the reviewer’s unused exported metadata API concern

## Follow-up

If additional confidence is needed beyond unit coverage, the next best manual smoke checks are:

- `Add category` -> RHP `Back` -> focus returns to `Add category`
- `More` -> `Settings` -> RHP `Back` -> focus returns to `More`
- keyboard-opened variant of one of the above flows to confirm focus restoration still behaves correctly after `Enter` / `Space`
