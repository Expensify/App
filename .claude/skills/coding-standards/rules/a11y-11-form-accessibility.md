---
ruleId: A11Y-11
title: Forms must have accessible labels, errors, and instructions
---

## [A11Y-11] Forms must have accessible labels, errors, and instructions

### Reasoning

Screen reader users navigate forms field by field. Each input must be associated with a descriptive label so users know what to enter. Error messages must be announced when they appear and linked to the relevant field. Without proper labeling, users hear "edit text" with no context. Without announced errors, users submit forms repeatedly without knowing what's wrong. (WCAG 1.3.1, 3.3.1, 3.3.2)

### Incorrect

```tsx
// Input with no accessible label — screen reader says "edit text"
<TextInput
    value={email}
    onChangeText={setEmail}
    placeholder="Email"
/>

// Error not announced, not associated with input
<TextInput value={email} onChangeText={setEmail} />
{emailError && <Text style={styles.error}>{emailError}</Text>}
```

### Correct

```tsx
// Input with accessible label
<TextInput
    value={email}
    onChangeText={setEmail}
    placeholder="Email"
    accessibilityLabel={translate('common.email')}
    accessibilityHint={translate('common.enterYourEmail')}
/>

// Android: label linked to input via nativeID
<Text nativeID="emailLabel">{translate('common.email')}</Text>
<TextInput
    value={email}
    onChangeText={setEmail}
    accessibilityLabelledBy="emailLabel"
/>

// Error announced and associated with the input
<TextInput
    value={email}
    onChangeText={setEmail}
    accessibilityLabel={translate('common.email')}
    accessibilityState={{disabled: false}}
/>
{emailError && (
    <Text
        style={styles.error}
        accessibilityLiveRegion="assertive"
        accessibilityRole="alert"
    >
        {emailError}
    </Text>
)}
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `<TextInput>` with **no** `accessibilityLabel`, **no** `accessibilityLabelledBy`, and **no** `aria-label`
- `<TextInput>` relying **only** on `placeholder` for labeling (placeholder disappears on input and is not reliably read by all screen readers)
- Form validation error text rendered without `accessibilityLiveRegion` or `accessibilityRole="alert"`

**DO NOT flag if:**

- Using a form component library that wraps inputs with labels internally
- `accessibilityLabel` is set on the input or a parent `accessible` container
- `accessibilityLabelledBy` / `aria-labelledby` links to a visible label

**Search Patterns** (hints for reviewers):
- `<TextInput` without `accessibilityLabel`
- `placeholder=` as sole labeling mechanism
- Error text rendering without `accessibilityLiveRegion`
