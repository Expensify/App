---
ruleId: CONSISTENCY-19
title: User-facing copy is grammatical and sentence case
---

## [CONSISTENCY-19] User-facing copy is grammatical and sentence case

### Reasoning

All user-visible copy lives in `src/languages/*` (`CONSISTENCY-7`), and the non-English files are generated from `src/languages/en.ts`, so a mistake in the English string ships to users and is carried into every translation. Two failures are mechanical to spot in a diff of that file. A grammar or spelling error reads as careless in the product. Title Case breaks the Expensify convention of capitalizing only the first word of a header, label, button or menu item, proper nouns and product names excepted, and once one Title Case entry lands the next contributor copies it.

### Incorrect

```ts
// src/languages/en.ts
export default {
    workspace: {
        inviteMessage: 'Invite a new members to you workspace',
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
        inviteMessage: 'Invite new members to your workspace',
        editCard: 'Edit card details',
        saveButton: 'Save changes',
    },
};
```

---

### Review Metadata

Flag ONLY when BOTH of these are true:

- The changed code adds or edits a user-visible string in `src/languages/en.ts`
- The string has at least one of these problems:
  - A clear grammar or spelling error: wrong agreement, a wrong or missing word, a misspelling, a wrong homophone (`you`/`your`, `its`/`it's`)
  - A word after the first is capitalized, and it is not a proper noun, product name, acronym, or interpolated variable

**DO NOT flag if:**

- The capitalized words are proper nouns or product names (`Expensify Card`, `QuickBooks Online`, `NetSuite`, `New Expensify`)
- The string is an acronym or initialism (`VBA`, `ACH`, `SSO`)
- The wording is grammatical and the concern is only style, tone, or a phrasing preference
- A label, button or menu item is a terse fragment by design (`Save`, `Add expense`), which is not a grammar error
- The copy comes verbatim from Figma or has marketing approval. The reviewer confirms that, and it overrides this rule
- The string is in a non-English language file. Those are generated from `en.ts`
- The string is not user-visible (log lines, test fixtures, keys, error codes)

**Search Patterns** (hints for reviewers):
- added or changed string literals in `src/languages/en.ts`
- `: '[A-Z][a-z]+ [A-Z]` (a second capitalized word in a quoted string)
