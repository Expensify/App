---
ruleId: A11Y-3
title: Communicate component state to assistive technology
---

## [A11Y-3] Communicate component state to assistive technology

### Reasoning

Screen readers must announce the current state of interactive elements — whether a button is disabled, a checkbox is checked, an accordion is expanded, or a tab is selected. Without `accessibilityState`, state changes are invisible to assistive technology users. They cannot determine if a toggle is on/off, a form field is disabled, or a section is expanded. (WCAG 4.1.2)

### Incorrect

```tsx
// Disabled button — screen reader doesn't know it's disabled
<Pressable
    onPress={onSubmit}
    style={isDisabled && styles.disabled}
    disabled={isDisabled}
>
    <Text>Submit</Text>
</Pressable>

// Checkbox with no checked state communicated
<Pressable onPress={toggleCheck} accessibilityRole="checkbox">
    <Icon src={isChecked ? Expensicons.Checkmark : Expensicons.Square} />
    <Text>I agree</Text>
</Pressable>

// Expandable section with no expanded state
<Pressable onPress={toggleExpand}>
    <Text>Details</Text>
    <Icon src={isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow} />
</Pressable>
```

### Correct

```tsx
<Pressable
    onPress={onSubmit}
    style={isDisabled && styles.disabled}
    disabled={isDisabled}
    accessibilityRole="button"
    accessibilityState={{disabled: isDisabled}}
>
    <Text>Submit</Text>
</Pressable>

<Pressable
    onPress={toggleCheck}
    accessibilityRole="checkbox"
    accessibilityState={{checked: isChecked}}
>
    <Icon src={isChecked ? Expensicons.Checkmark : Expensicons.Square} />
    <Text>I agree</Text>
</Pressable>

<Pressable
    onPress={toggleExpand}
    accessibilityRole="button"
    accessibilityState={{expanded: isExpanded}}
>
    <Text>Details</Text>
    <Icon src={isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow} />
</Pressable>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- Element has `disabled` prop but **no** `accessibilityState={{disabled: ...}}` (only on custom components — `Pressable`, `TouchableOpacity`, and `TouchableWithoutFeedback` auto-merge `disabled` into `accessibilityState`)
- Element has `accessibilityRole="checkbox"` or `"switch"` but **no** `accessibilityState={{checked: ...}}`
- Element visually toggles expanded/collapsed but **no** `accessibilityState={{expanded: ...}}`
- Element visually indicates selection (active tab, selected item) but **no** `accessibilityState={{selected: ...}}`

**DO NOT flag if:**

- Using a design system component that handles state internally (e.g., `<Switch>`, `<Checkbox>`, `<RadioButton>`)
- Using `Pressable`, `TouchableOpacity`, or `TouchableWithoutFeedback` with `disabled` prop (these auto-merge `disabled` into `accessibilityState`)
- Using Expensify's `GenericPressable` or `PressableWithFeedback` (they set `accessibilityState={{disabled}}` internally)
- State is already communicated via `accessibilityState` on a parent or wrapper component

**Search Patterns** (hints for reviewers):
- `disabled={` without `accessibilityState`
- `accessibilityRole="checkbox"` without `checked`
- `accessibilityRole="switch"` without `checked`
- Visual expand/collapse toggling without `expanded`
