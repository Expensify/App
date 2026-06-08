---
ruleId: CONSISTENCY-9
title: Name files after what they export
---

## [CONSISTENCY-9] Name files after what they export

### Reasoning

Non-platform-specific files must be named after what they export, never `index.js`/`index.ts`, so the module is discoverable and searchable by its export name. Platform-specific files must be named for the platform they support (`.ios`, `.android`, `.native`, `.web`) as outlined in the README. A folder whose only purpose is to group platform variants is the one place an `index` entry is appropriate.

### Incorrect

```
// A single-export module dumped into a bare index file
src/libs/getReportName/index.ts        // exports getReportName()

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

Flag ONLY when ALL of these are true:

- A newly added (or renamed) source file is named `index.ts`/`index.tsx`/`index.js`
- It is NOT a platform-resolution barrel (it contains real implementation / a single named export, not just re-exports of platform variants)
- A more descriptive name matching the primary export is available

**DO NOT flag if:**

- The `index` file only re-exports sibling platform-specific files (`Foo.ios`, `Foo.android`, `Foo.web`, `Foo.native`)
- The file is platform-specific and correctly suffixed (`.ios`, `.android`, `.native`, `.web`, `.desktop`)
- It is an established directory entry point following the existing convention in that area

**Search Patterns** (hints for reviewers):
- Added files matching `/index\.(ts|tsx|js)$/`
- Check whether the file body is a real implementation vs a pure re-export barrel
