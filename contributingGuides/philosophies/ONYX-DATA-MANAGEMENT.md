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

Users can export their Onyx state from **Settings → Troubleshoot → Export Onyx state** (used mainly to attach state to bug reports). Because Onyx holds sensitive data (credentials, tokens, banking data, personal details), the export is passed through `maskOnyxState` (`src/libs/ExportOnyxState/common.ts`) which removes or masks fragile data before it ever leaves the device.

### - There are two ways the export masks data
The buckets below make more sense once you know how the two masking treatments differ.

**`maskFragileData` masks only what it recognizes.** It walks through a value and:
- Replaces fields whose *name* it knows (`firstName`, `lastName`, `phoneNumber`, `addressStreet`, `accountNumber`, `routingNumber`, `cardNumber`, `validateCode`, `source`, `name`, and others in `keysToMask`) with a random string of the same length.
- Swaps email addresses for fake ones, whether they appear as a value, as an object key, or inside a longer string.
- Randomizes amount fields like `amount` and `total`, and replaces report action `text` and `html` with `***`.
- Leaves everything else exactly as it was.

That last point matters. If a secret is stored under a field name it doesn't know about, it gets exported in cleartext. `MAPBOX_ACCESS_TOKEN` is the example: its secret lives in a field called `token`, which isn't in `keysToMask`, so it has to be removed instead.

**An export rule masks everything you don't ask to keep.** A rule lists an `allowList` of fields to keep and a `maskList` of fields to replace with a random string of the same length. Fields in neither list still get handled: objects are walked, numbers are randomized, dates become today's date, strings are masked, and anything else becomes `***`. Forgetting about a field means it gets masked rather than exported.

In short, write a rule when you can't be sure what every field holds, and use `maskFragileData` when you can.

### - Every Onyx key MUST be deliberately categorized for export
A key holding credentials and a key holding a boolean flag both need a decision made about them, and there's no default that's safe for both. So every top-level and `COLLECTION.*` key in `ONYXKEYS` goes into exactly one of four buckets in `src/libs/ExportOnyxState/common.ts`.

**1. `onyxKeysToRemove` — dropped from the export.**
This is the most sensitive data that belongs to a user, so use this bucket for anything that might cause a security concern if it was leaked: credentials, access tokens and third-party secrets like the push notification ID, Stripe customer ID, Plaid and merge-HR link tokens, Onfido token and applicant ID, and the Mapbox access token. It's also the right choice when a value is a secret that neither masking treatment would catch. All `DERIVED` keys live here too, since they're recomputed from other keys and add nothing to a bug report.

**2. `ONYX_KEY_EXPORT_RULES` — keep some fields, mask the rest.**
Use this when a key holds a mix of PII and fields that are genuinely useful for debugging, like `SESSION` (where `accountID` is kept and the auth token is masked), `ACCOUNT`, `COLLECTION.REPORT`, `COLLECTION.TRANSACTION`, `USER_WALLET` and `CARD_LIST`. It's also the safer choice for a large or growing object, because a field added later gets masked on its own instead of quietly ending up in the export.

**3. `safeOnyxKeys` — exported as-is.**
Only use this when you're sure the value holds nothing personal: booleans, loading states, feature flags, enums, numeric IDs, timestamps and config values. Nothing is masked here, so one sensitive field anywhere in the value ends up in the export. If the value is a free-form string, or an object that's likely to grow, pick a different bucket.

**4. `onyxKeysToMaskFragileData` — handled by `maskFragileData`.**
Use this for everyday user data whose sensitive fields are ones `maskFragileData` already knows by name, such as personal details, drafts, report actions and policy data. Don't use it for a key holding a secret under a field name it won't recognize, as that belongs in `onyxKeysToRemove` or needs its own rule. When you're not sure every sensitive field is covered, write a rule.

### - When adding a new Onyx key you MUST place it in one of the four buckets
The coverage test in `tests/unit/ExportOnyxStateTest.ts` fails when a key exists in `ONYXKEYS` but isn't in any bucket, so a new key can't quietly pick up a default. Whoever adds it has to decide whether it should be masked.

Keep in mind that nothing reads `onyxKeysToMaskFragileData` at runtime, and adding a key to it doesn't mask anything by itself. It's written out by hand so the coverage test can tell the difference between a key that's meant to fall through to `maskFragileData` and one nobody has categorized yet.

### - Deciding a key is safe is a judgment call
A key in `safeOnyxKeys` is exported with no masking, so it MUST NOT hold credentials, tokens, banking data or personal details. No test can check this for you, because nothing in the test suite knows what fields a key actually holds, which makes it a decision someone has to make by reading the type. The `knownSensitiveKeys` denylist test covers the keys we already know are sensitive, and fails if one of them is ever moved into `safeOnyxKeys`.
