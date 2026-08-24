---
ruleId: CONSISTENCY-18
title: Pluralize with PluralForm, not ternaries on a count
---

## [CONSISTENCY-18] Pluralize with PluralForm, not ternaries on a count

### Reasoning

A translation entry that picks a word form with a ternary (`count === 1 ? 'expense' : 'expenses'`) hardcodes English's two-form plural rule into the source of truth. Because the other language files mirror `en.ts`'s shape, that rule is then forced onto every locale we ship, and it is wrong for most of them:

| Locale | Cardinal categories |
|---|---|
| `ja`, `zh-hans` | `other` only |
| `en`, `de`, `it`, `nl`, `es`, `pt-BR` | `one` / `other` |
| `fr` | `one` / `other`, but `one` covers **both 0 and 1** |
| `pl` | `one` / `few` / `many` / `other` |

Return a `PluralForm` object instead. `Localize` selects the correct category with `Intl.PluralRules` for the active locale, so each language can supply exactly the forms its grammar needs.

Ternaries using `> 1` are also wrong in English: zero takes the plural, so `${count} member${count > 1 ? 's' : ''}` renders "0 member".

### Incorrect

```ts
// Hardcodes a two-form rule; `pl` can never select `few`/`many`
reviewExpenses: ({count}: {count: number}) => `Review ${count} ${count === 1 ? 'expense' : 'expenses'}`,

// `> 1` also breaks English: renders "0 member"
workspaceMemberList: ({count}: {count: number}) => `${count} member${count > 1 ? 's' : ''}`,

// Whole-sentence ternary is the same problem
importTagsSuccessfulDescription: ({count}: {count: number}) => (count > 1 ? `${count} tags have been added.` : '1 tag has been added.'),
```

### Correct

```ts
reviewExpenses: ({count}: {count: number}) => ({
    one: 'Review 1 expense',
    other: `Review ${count} expenses`,
}),

workspaceMemberList: ({count, policyOwner}: {count: number; policyOwner: string}) => ({
    one: `1 member • ${policyOwner}`,
    other: `${count} members • ${policyOwner}`,
}),
```

A single `PluralForm` carries a single `count`. When a sentence has two independent quantities, split it into one key per quantity and put the branching in the calling code, not in the translation file:

```ts
// Incorrect - no plural rule can cover two counts at once
importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) =>
    `${added} ${added === 1 ? 'category' : 'categories'} added, ${updated} ${updated === 1 ? 'category' : 'categories'} updated.`,

// Correct - one key per quantity, selected by the caller
importCategoriesAdded: ({count}: {count: number}) => ({
    one: '1 category has been added.',
    other: `${count} categories have been added.`,
}),
importCategoriesUpdated: ({count}: {count: number}) => ({
    one: '1 category has been updated.',
    other: `${count} categories have been updated.`,
}),
```

### Does the entry need to declare `count`?

`Localize.getTranslatedPhrase` reads `parameters[0].count` at runtime and throws `Invalid plural form for '<key>'` if it is not a number. Whether TypeScript prevents that depends on one thing: **does the function return a `PluralForm` on every path?**

| Shape | Enforced by TypeScript? | Must declare `count`? |
|---|---|---|
| `() => ({one, other})` | yes | no |
| `({memberName}) => ({one, other})` | yes | no |
| returns a string on some paths, `PluralForm` on others | **no** | **yes** |
| `(days: number) => ({one, other})` | n/a — always broken | see below |

When every path returns a `PluralForm`, `TranslationParameters` resolves the caller's arguments to `[PluralParams]` or `[First & PluralParams]`, so the call site is required to pass `{count}` and the entry does not need to declare it. Most existing entries rely on this.

When some path returns a plain string, the return type is `string | PluralForm`. The conditional in `TranslationParameters` distributes over that union — the `string` branch yields the parameters unchanged, with no `count` — so the caller may legally omit it and the runtime check will throw. **In that shape the entry must declare `count` itself.**

```ts
// Correct - mixed return, so `count` is declared explicitly
importMerchantRulesSuccessfulDescription: ({count, duplicates = 0}: {count: number; duplicates?: number}) => {
    if (count === 0) {
        return duplicates > 0 ? 'No merchant rules have been added, since they all already exist.' : 'No merchant rules have been added.';
    }

    return {
        one: '1 merchant rule has been added.',
        other: `${count} merchant rules have been added.`,
    };
},
```

A **positional primitive** first parameter is broken in every case, because `TranslationParameters` intersects it with `{count: number}` and a primitive cannot satisfy that, leaving the caller nowhere to pass the count:

```ts
// Incorrect - throws "Invalid plural form" at runtime
freeTrialTitle: (numOfDays: number) => ({
    one: 'Trial: 1 day left!',
    other: `Trial: ${numOfDays} days left!`,
}),

// Correct - object parameter
freeTrialTitle: ({count}: {count: number}) => ({
    one: 'Trial: 1 day left!',
    other: `Trial: ${count} days left!`,
}),
```

---

### Review Metadata

**Flag a ternary** when ALL of these are true:

- The changed code is a translation entry in `src/languages/*.ts`
- The entry is a function that receives a numeric parameter
- It chooses between two word forms, noun endings, or whole sentences using a conditional on that number (`=== 1`, `!== 1`, `> 1`, `>= 2`, `< 2`), instead of returning a `PluralForm` object
- The differing text is grammatical number agreement (singular vs plural wording), not a different message

**Flag a missing `count`** in exactly two cases:

- The first parameter is a **positional primitive** (`(days: number) => ({one, other})`)
- The function returns a **plain string on some paths and a `PluralForm` on others**, and does not declare `count` in its parameters

**DO NOT flag if:**

- The conditional is not about grammatical number — presence or threshold checks such as `count > 0 ? `${summary}, +${count} more` : summary`, or conditionally showing a segment
- The entry returns a `PluralForm` on every path and does not declare `count`. This is correct and common; TypeScript requires the caller to pass it. Do not search for entries lacking a `count` parameter — roughly 60 entries in `en.ts` are legitimately in this shape
- The number appears only next to an invariant unit abbreviation (`${days}d`, `${hours}h`) where no word inflects
- The change is in a generated language file (`de.ts`, `es.ts`, `fr.ts`, …) and merely mirrors an existing `en.ts` ternary — flag the `en.ts` source instead, since the generator follows its shape
- The file is a test, story, or fixture

**Guidance when flagging:**

- Renaming a parameter to `count` requires updating the same key in every `src/languages/*.ts` file and all call sites. Changing only the return type to a `PluralForm` does not, because the generated files are typed as `=> string | PluralForm` regardless
- `one` should use a literal `1` only where that category matches exactly the number 1. In locales whose `one` also covers 0 (`fr`, `pt-BR`), it must use `${count}`

**Search Patterns** (hints for reviewers):

- `(===|!==|>|>=|<|<=) 1 \?` within `src/languages/`
- `\? '[a-z]+' : '[a-z]+s'` — singular/plural word pair
- `\? 's' : ''` or `\? '' : 's'` — suffix toggle
- `count > 1` anywhere in a translation entry
- `: \([a-zA-Z]+: number\) => \(\{` — positional numeric parameter on an entry returning a `PluralForm`
