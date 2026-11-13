---
ruleId: CONSISTENCY-21
title: Type a forwarded sentryLabel with the SentryLabel helpers
---

## [CONSISTENCY-21] Type a forwarded sentryLabel with the SentryLabel helpers

### Reasoning

Sentry and FullStory identify interactions by `sentryLabel`, and TypeScript is the only check that makes every pressable carry one. A component that forwards the label to a pressable through an optional `sentryLabel?: SentryLabel` prop turns that check off for all of its usages, so new usages ship without a label and their interactions can't be told apart in the INP dashboard. The helpers in `src/types/utils/SentryLabel.ts` keep the check on. See [SENTRY_LABEL.md](../../../../contributingGuides/SENTRY_LABEL.md).

### Incorrect

```tsx
type ReviewButtonProps = {
    onPress: () => void;
    sentryLabel?: SentryLabel;
};
```

### Correct

```tsx
type ReviewButtonProps = WithRequiredSentryLabel & {
    onPress: () => void;
};

// Renders read-only without onPress, so the label is required only with it.
type ReviewRowProps = WithSentryLabelWhenPressable & {
    onPress?: () => void;
};
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds or changes a component's props type or a menu, dropdown or tab item type
- The component forwards `sentryLabel` to a pressable, `Button`, `MenuItem` or another component that renders one, or the item type is rendered as one
- The label is typed as optional (`sentryLabel?: SentryLabel`, `WithSentryLabel`), or a type is derived with `Omit`/`Pick` from a props type that uses `WithSentryLabelWhenPressable`

**DO NOT flag if:**

- The component is an input whose press only focuses it (e.g. `TextInput`, `DatePicker`)
- The component falls back to a default label when none is passed (e.g. `RadioButton`, `FormProvider`)
- The type uses `WithRequiredSentryLabel`, `WithSentryLabelWhenPressable` or `WithExplicitSentryLabel`
- The file is a test or story

**Search Patterns** (hints for reviewers):
- `sentryLabel?: SentryLabel`
- `WithSentryLabel &`
- `Omit<.*Props` / `Pick<.*Props` near `sentryLabel`
