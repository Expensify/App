---
ruleId: CONSISTENCY-14
title: Non-trivial new files start with a header description
---

## [CONSISTENCY-14] Non-trivial new files start with a header description

### Reasoning

Per the PR checklist, when a new file is added it should carry a short description of what it does and/or why it is needed at the top of the file, unless the code is self explanatory. A one-line header comment on a new module, component, hook, or util orients the next reader immediately instead of forcing them to reverse-engineer the file's purpose from its exports.

### Incorrect

A new `src/libs/CardUtils/deriveLimit.ts` that opens straight into code:

```tsx
import type {Card} from '@src/types/onyx';

function deriveLimit(card: Card): number {
    // ...
}
```

### Correct

```tsx
/**
 * Helpers for deriving a card's spend limit from its Onyx data.
 */
import type {Card} from '@src/types/onyx';

function deriveLimit(card: Card): number {
    // ...
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The change **adds a new file** (not a modification of an existing one) under `src/**`
- The file contains non-trivial logic (more than a few lines; not a pure re-export or a single constant)
- Its first non-import, non-directive token is not a comment - there is no header comment describing the file

**DO NOT flag if:**

- The file is a barrel / `index.*` re-export file, a platform-suffixed variant (`.ios`/`.android`/`.native`/`.web`) of a file documented in its base variant, or a type-only declaration file
- The file is short and self explanatory (e.g. a tiny constant, a one-line util whose name says everything)
- The file is a test, story, snapshot, or generated/config file
- A header comment is already present

**Search Patterns** (hints for reviewers):
- Newly added files under `src/**` whose first line is `import`/`export` with no leading `/** */` or `//` header
