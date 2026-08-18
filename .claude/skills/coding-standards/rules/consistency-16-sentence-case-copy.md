---
ruleId: CONSISTENCY-16
title: User-facing copy is sentence case
---

## [CONSISTENCY-16] User-facing copy is sentence case

### Reasoning

Expensify copy capitalizes only the first word of a header, label, button or menu item - proper nouns and product names excepted. Title Case entries look imported from another product, and once one lands the next contributor copies it, so the inconsistency spreads through the language files. This is mechanical to check on the strings added to `src/languages/*`, which is where all user-visible copy lives (`CONSISTENCY-7`).

### Incorrect

```ts
// src/languages/en.ts
export default {
    workspace: {
        inviteMessage: 'Invite New Member',
        editCard: 'Edit Card Details',
        saveButton: 'Save Changes',
    },
};
```

### Correct

```ts
// src/languages/en.ts
export default {
    workspace: {
        inviteMessage: 'Invite new member',
        editCard: 'Edit card details',
        saveButton: 'Save changes',
    },
};
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds or edits a user-visible string in `src/languages/*`
- A word after the first is capitalized, and it is not a proper noun, product name, acronym, or interpolated variable

**DO NOT flag if:**

- The capitalized words are proper nouns or product names (`Expensify Card`, `QuickBooks Online`, `NetSuite`, `New Expensify`)
- The string is an acronym or initialism (`VBA`, `ACH`, `SSO`)
- The copy comes verbatim from Figma or has marketing approval - the reviewer confirms that, and it overrides this rule
- The string is a non-English language file mirroring a translation convention of that language (German noun capitalization, for example)
- The string is not user-visible (log lines, test fixtures, keys, error codes)

**Search Patterns** (hints for reviewers):
- added string literals in `src/languages/en.ts`
- `: '[A-Z][a-z]+ [A-Z]` (a second capitalized word in a quoted string)
