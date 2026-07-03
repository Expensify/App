---
ruleId: CONSISTENCY-9
title: Name files after what they export
---

## [CONSISTENCY-9] Name files after what they export

### Reasoning

Per `contributingGuides/philosophies/DIRECTORIES.md`, non-platform-specific files must be named after what they export, never `index.js`/`index.ts`, so the module is discoverable and searchable by its export name. Platform-specific files must be named for the platform they support (`.ios`, `.android`, `.native`, `.web`) as outlined in `contributingGuides/philosophies/CROSS-PLATFORM.md`. A folder whose only purpose is to group platform variants is the one place an `index` entry is appropriate.

### Incorrect

```
// A single-export module dumped into a bare index file
src/libs/getReportName/index.ts        // exports getReportName()

// File name doesn't match its primary export
src/libs/helpers.ts                    // default-exports getReportName()

// React-syntax file with the wrong extension
src/components/Banner/index.js         // contains JSX
```

### Correct

```
src/libs/getReportName.ts              // named after its export
src/components/Banner/Banner.tsx       // named after the component, .tsx for JSX

// index is fine ONLY as a platform-variant barrel:
src/components/Picker/index.ts         // re-exports the resolved platform file
src/components/Picker/Picker.tsx
src/components/Picker/Picker.ios.tsx
```

---

### Review Metadata

Flag when ANY of these is true for a newly added or renamed source file:

- It is named `index.ts`/`index.tsx`/`index.js`, contains a real single-export implementation (not just re-exports of platform variants), and a descriptive name matching its primary export is available.
- Its basename does not match its primary/default export (e.g. `helpers.ts` whose main export is `getReportName` → should be `getReportName.ts`; `Card.tsx` default-exporting `Banner` → should be `Banner.tsx`).
- It is platform-specific but not named with the correct platform suffix (`.ios`, `.android`, `.native`, `.web`, `.desktop`) as outlined in `contributingGuides/philosophies/CROSS-PLATFORM.md`.

**DO NOT flag if:**

- The `index` file only re-exports sibling platform-specific files (`Foo.ios`, `Foo.android`, `Foo.web`, `Foo.native`)
- The file is platform-specific and correctly suffixed (`.ios`, `.android`, `.native`, `.web`, `.desktop`)
- The file aggregates multiple exports with no single primary export (barrel/utilities module), so no single name applies
- The file is a test, mock, story, type-only (`types.ts`), or config file following an established convention
- It is an established directory entry point following the existing convention in that area

**Search Patterns** (hints for reviewers):
- Added/renamed files matching `/index\.(ts|tsx|js)$/` that aren't platform-variant barrels
- Added/renamed files whose basename differs from their default/primary export name
- Platform-specific files missing a `.ios`/`.android`/`.native`/`.web`/`.desktop` suffix
