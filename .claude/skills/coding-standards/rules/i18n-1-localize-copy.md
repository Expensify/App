---
ruleId: I18N-1
title: Localize all user-visible copy
---

## [I18N-1] Localize all user-visible copy

### Reasoning

All copy/text shown in the product must be localized by adding it to the `src/languages/*` files and rendering it through the translation method (`useLocalize`'s `translate`, or `<Text>` fed a translated string). Hardcoded user-facing strings cannot be translated and break the localized experience.

### Incorrect

```tsx
function SaveButton() {
    return <Button text="Save changes" />;
}

function EmptyState() {
    return (
        <View>
            <Text>No results found</Text>
        </View>
    );
}
```

### Correct

```tsx
function SaveButton() {
    const {translate} = useLocalize();
    return <Button text={translate('common.saveChanges')} />;
}

function EmptyState() {
    const {translate} = useLocalize();
    return (
        <View>
            <Text>{translate('search.noResultsFound')}</Text>
        </View>
    );
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A user-visible JSX text node, or a user-facing string prop (`text`, `title`, `label`, `placeholder`, `header`, `description`, `accessibilityLabel`, `alternateText`), is assigned a hardcoded non-empty string literal
- The string is rendered in product code (not a test, story, or dev-only path)
- The string is not passed through the translation method (`translate(...)`, `useLocalize`)

**DO NOT flag if:**

- The string is an identifier, key, route, test ID, style token, icon name, or `CONST` value (not shown to the user)
- The value is already wrapped in `translate(...)` or comes from a `src/languages/*` entry
- The string is a `console.*` / logging message
- The text is a proper noun or brand name intentionally not translated (e.g. `Expensify`)

**Search Patterns** (hints for reviewers):
- `<Text>` / `<Text ...>` containing a bare string literal
- `(text|title|label|placeholder|header|description|alternateText|accessibilityLabel)=["'][A-Za-z]`
