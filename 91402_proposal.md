## Proposal

### Please re-state the problem that we are trying to solve in this issue.

The Travel setup flow fails with a generic "Something went wrong. Please try again later." error when the user clicks Continue after entering required Travel setup information (company address → terms acceptance). This blocks the user from completing Travel configuration. The error appears on the DynamicTravelTerms page after calling AcceptSpotnanaTerms.

### What is the root cause of that problem?

There are two distinct code paths that produce this error, and the current implementation handles neither correctly:

**Path 1 — Transport-level failure (HTTP non-2xx):** The `failureData` of `acceptSpotnanaTerms()` sets `TRAVEL_PROVISIONING.errors` to `getMicroSecondOnyxErrorWithTranslationKey('travel.errorMessage')`. This shows the generic error text to the user but discards any backend error details.

**Path 2 — Application-level failure (HTTP 200 with missing/invalid response):** In `DynamicTravelTerms.tsx`, `acceptTermsAndOpenTravelDot()` calls `acceptSpotnanaTerms()` and processes the response in `.then()`:
  - If `response?.jsonCode !== 200` → `Promise.reject()`
  - If `!response?.spotnanaToken` → `Promise.reject()`

When the API returns HTTP 200 with either of these conditions, Expensify's `makeRequestWithSideEffects` applies `successData` (not `failureData`), so `TRAVEL_PROVISIONING.isLoading` is set to `false` but `hasAcceptedTerms` stays `true` (from optimisticData) and no error is written into Onyx state. The empty `.catch()` does nothing to clean up. On the next attempt, the optimistic merge no-ops because `hasAcceptedTerms` is already `true`, breaking the retry flow entirely.

The "Something went wrong" error text visible in the report matches the transport-level failure path (Path 1). The root cause is that `AcceptSpotnanaTerms` is returning an HTTP error response — likely because the policy address update from the previous step (`WorkspaceAddressForTravelPage` → `updateAddress()`) has not completed when the terms API is called. `WorkspaceAddressForTravelPage` navigates to `DynamicTravelTerms` immediately without awaiting the `updateAddress` response, and no `cleanupTravelProvisioningSession()` is called on entry, so the provisioning state from a previous attempt can also interfere.

### What changes do you think we should make in order to solve the problem?

1. **In `DynamicTravelTerms.tsx`, call `cleanupTravelProvisioningSession()` on component mount** (via `useEffect`) to ensure stale provisioning state from a previous attempt does not persist:

```tsx
useEffect(() => {
    cleanupTravelProvisioningSession();
}, []);
```

2. **In `acceptTermsAndOpenTravelDot()`, update the `.catch()` handler to roll back Onyx state** when the API returns a successful HTTP response but missing/invalid data:

```tsx
.catch(() => {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('travel.errorMessage')});
});
```

(This ensures Path 2 failures also show the error to the user instead of silently leaving optimistic state.)

3. If the specific backend error code from the regression can be identified from the API response, add a dedicated handler for it in the `.then()` chain alongside `ERROR_PERMISSION_DENIED` and `ERROR_ADDITIONAL_VERIFICATION_REQUIRED`, so the user sees a meaningful error instead of the generic fallback.
