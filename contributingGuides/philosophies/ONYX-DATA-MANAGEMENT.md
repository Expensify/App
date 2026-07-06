# Onyx Data Management
This is how the application manages all the data stored in Onyx.

#### Related Philosophies
- [Data Flow Philosophy](/contributingGuides/philosophies/DATA-FLOW.md)
- [Data Binding Philosophy](/contributingGuides/philosophies/DATA-BINDING.md)

#### Terminology
- **Actions** - The files stored in `/src/libs/actions`
- **Derived Values** - Special Onyx keys containing values computed from other Onyx values
- **Collections** - Multiple related data objects stored as individual keys with IDs

## Rules
### - Actions MUST be the only means to write or read data from the server
### - Actions SHOULD use `Onyx.merge()` rather than `Onyx.set()`
This improves performance and lessens the chance that one action will overwrite the changes made by another action.

### - UI Components MUST NOT call Onyx methods directly and should call an action instead
### - Data SHOULD be optimistically stored on disk whenever possible without waiting for a server response
Example of creating a new optimistic comment:
1. User adds a comment
2. Comment is shown immediately in the UI with optimistic data
3. Comment is created in the server
4. Server responds
5. UI updates with data from the server

### - Collections SHOULD be stored as individual keys when components bind directly to them
Store collections as individual keys+ID (e.g., `report_1234`, `report_4567`) when a component will bind directly to one of those keys. For example: reports are stored as individual keys because `OptionRow.js` binds to the individual report keys for each link. However, report actions are stored as an array of objects because nothing binds directly to a single report action.

### - Onyx keys MUST be defined using constants in `ONYXKEYS`
Each Onyx key represents either a collection of items or a specific entry in storage. For example, since all reports are stored as individual keys like `report_1234`, if code needs to know about all the reports (e.g., display a list of them in the nav menu), then it MUST subscribe to the key `ONYXKEYS.COLLECTION.REPORT`.

### - Storage eviction MUST be configured for non-critical data
Different platforms come with varying storage capacities and Onyx has a way to gracefully fail when those storage limits are encountered.

**To flag a key as safe for removal:**
- Add the key to the `evictableKeys` option in `Onyx.init(options)`
- A least recently accessed key will only be deleted when an Onyx operation retries after failing.

## Onyx Derived Values

Derived values are special Onyx keys which contain values derived from other Onyx values. These are available as a performance optimization, so that if the result of a common computation of Onyx values is needed in many places across the app, the computation can be done only as needed in a centralized location, and then shared across the app. Once created, Onyx derived values are stored and consumed just like any other Onyx value.

### - Derived values SHOULD be used for complex computations across multiple components
When multiple components need the same computed value from one or more Onyx keys, and:
- The computation is expensive (e.g., filtering large arrays, complex object transformations)
- The result needs to be cached and shared to avoid redundant calculations
- The computation appears in frequently rendered components
- Profiling shows the same calculation being done repeatedly

### - Derived values SHOULD be used for data aggregation and transformation
When you need to:
- Combine data from multiple Onyx keys into a single, normalized structure
- The transformation logic is complex and reusable
- The derived data structure is used in multiple places
- The value depends on multiple pieces of state that can change independently

### - Derived values SHOULD NOT be used for simple or component-specific logic
Avoid derived values when:
- The computation is trivial (e.g., simple string manipulation, basic math)
- The value is only used in one component
- The computation is specific to a single component's UI state
- The logic involves component-local state
- The computed value is only needed temporarily
- The computation depends on non-Onyx values

### - New derived values MUST follow the proper creation process
1. Add the new Onyx key to `ONYXKEYS.ts` in the `ONYXKEYS.DERIVED` object
2. Declare the type for the derived value in `ONYXKEYS.ts` in the `OnyxDerivedValuesMapping` type
3. Add the derived value config to `ONYX_DERIVED_VALUES` in `src/libs/OnyxDerived.ts`

A derived value config MUST include:
1. The Onyx key for the derived value
2. An array of Onyx key dependencies (which can be any keys, including other derived values)
3. A `compute` function that takes an array of Onyx values for the dependencies and returns a derived value matching the declared type

### - Derived value computations MUST be pure and predictable
```typescript
// GOOD ✅
compute: ([reports, personalDetails]) => {
  // Pure function, only depends on input
  return reports.map(report => ({
    ...report,
    authorName: personalDetails[report.authorID]?.displayName
  }));
}

// BAD ❌
compute: ([reports]) => {
  // Don't use external state or cause side effects
  const currentUser = getCurrentUser(); // External dependency!
  sendAnalytics('computation-done'); // Side effect!
  return reports;
}
```

### - Derived value computations SHOULD handle edge cases properly
```typescript
// GOOD ✅
compute: ([reports, personalDetails]: [Report[], PersonalDetails]): DerivedType => {
  if (!reports?.length || !personalDetails) {
    return { items: [], count: 0 };
  }
  // Rest of computation...
}

// BAD ❌
compute: ([reports, personalDetails]) => {
  // Missing type safety and edge cases
  return reports.map(report => personalDetails[report.id]);
}
```

### - Derived values SHOULD be well-documented
- Explain the purpose and dependencies
- Document any special cases or performance considerations
- Include type annotations for better developer experience

## Onyx State Export

Users can export their full Onyx state from **Settings → Troubleshoot → Export Onyx state** (used mainly to attach state to bug reports). Because Onyx holds sensitive data (credentials, tokens, banking data, personal details), the export is passed through `maskOnyxState` (`src/libs/ExportOnyxState/common.ts`) which removes or masks fragile data before it ever leaves the device.

### - Every Onyx key MUST be deliberately categorized for export
There is no safe implicit default: a key that leaks credentials and a key holding a harmless boolean flag both need an explicit decision. To make that decision impossible to skip, every top-level and `COLLECTION.*` key in `ONYXKEYS` is placed into exactly one of four mutually-exclusive buckets in `src/libs/ExportOnyxState/common.ts`:

1. **`onyxKeysToRemove`** — keys that must never leave the device (push notification ID, Stripe customer ID, Plaid/merge-HR link tokens, Onfido token/applicant ID, billing dispute/status, and all `DERIVED` keys). Dropped entirely from the export.
2. **`ONYX_KEY_EXPORT_RULES`** — keys with a per-field `allowList`/`maskList` for PII-aware export (e.g. `SESSION`, `ACCOUNT`, `COLLECTION.REPORT`, `COLLECTION.TRANSACTION`, `USER_WALLET`, `CARD_LIST`).
3. **`safeOnyxKeys`** — keys confirmed PII-free that are exported as-is (boolean flags, loading states, feature flags, simple IDs, config values, timestamps). At runtime these skip `maskFragileData`.
4. **`onyxKeysToMaskFragileData`** — keys with no explicit rule that fall through to the default `maskFragileData` treatment.

### - When adding a new Onyx key you MUST place it in one of the four buckets
The coverage test in `tests/unit/ExportOnyxStateTest.ts` fails whenever a key exists in `ONYXKEYS` but in none of the four buckets, so a newly-added key cannot silently inherit a default. That failure is the forcing function: it requires whoever adds the key to make an explicit masked-vs-unmasked decision.

Note that `onyxKeysToMaskFragileData` is a hand-maintained mirror of the runtime `maskFragileData` fallback — it is **not** read at runtime, and listing a key there does not by itself mask anything. It exists only so the coverage test can tell "deliberately falls through to `maskFragileData`" apart from "the author forgot to categorize this key".

### - Marking a key as safe is a security judgment, not a structural one
Membership in `safeOnyxKeys` means the key is exported with no masking at all, so it MUST only contain data that carries no credentials, tokens, banking data, or personal details. No structural test can validate this (nothing in the suite knows which fields a key actually holds), so the decision is a manual review. A `knownSensitiveKeys` denylist test re-encodes that judgment for known-sensitive keys and fails loudly if any of them is ever moved into `safeOnyxKeys`.
