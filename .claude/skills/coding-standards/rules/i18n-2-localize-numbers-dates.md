---
ruleId: I18N-2
title: Localize numbers, amounts, dates and phone numbers
---

## [I18N-2] Localize numbers, amounts, dates and phone numbers

### Reasoning

All numbers, amounts, dates and phone numbers shown in the product must be formatted through the project's localization methods so they respect the user's locale (separators, currency placement, date order, phone formatting). Raw `Intl.*`, manual currency concatenation, or `toLocale*` calls bypass the shared locale and produce inconsistent output.

### Incorrect

```tsx
function Amount({value, currency}: {value: number; currency: string}) {
    return <Text>{new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(value)}</Text>;
}

function DueDate({date}: {date: Date}) {
    return <Text>Due {date.toLocaleDateString()}</Text>;
}

function Total({amount}: {amount: number}) {
    return <Text>{`$${amount}`}</Text>;
}
```

### Correct

```tsx
function Amount({value, currency}: {value: number; currency: string}) {
    return <Text>{convertToDisplayString(value, currency)}</Text>;
}

function DueDate({date}: {date: string}) {
    const {datetimeToCalendarTime} = useLocalize();
    return <Text>{datetimeToCalendarTime(date)}</Text>;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code formats a number, monetary amount, date/time, or phone number for display
- It does so with `new Intl.NumberFormat`/`Intl.DateTimeFormat`, `.toLocaleString`/`.toLocaleDateString`/`.toLocaleTimeString`, or manual string concatenation of a currency symbol with a number (e.g. `` `$${amount}` ``)
- It does not go through the project localization helpers (currency/number/date/phone utils or `useLocalize`)

**DO NOT flag if:**

- The value is internal/non-display (logging, sorting keys, API payloads, IDs)
- The code is inside the localization utilities themselves
- The code is in a test or story

**Search Patterns** (hints for reviewers):
- `Intl.NumberFormat` / `Intl.DateTimeFormat`
- `toLocaleDateString` / `toLocaleTimeString` / `toLocaleString`
- `` `$${ `` or `'$' +` style currency concatenation
