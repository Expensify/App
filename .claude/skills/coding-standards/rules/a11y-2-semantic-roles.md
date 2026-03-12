---
ruleId: A11Y-2
title: Use semantic accessibilityRole for interactive elements
---

## [A11Y-2] Use semantic accessibilityRole for interactive elements

### Reasoning

React Native components have no implicit semantic meaning — assistive technology treats them as generic containers. Interactive elements must declare their role via `accessibilityRole` or `role` so screen readers can convey what the element does. Note: `role` is a cross-platform alias that takes precedence over `accessibilityRole` when both are set. (WCAG 4.1.2)

### Incorrect

```tsx
// Pressable with no role — screen reader doesn't convey it's a button
<Pressable onPress={handleSubmit}>
    <Text>Submit</Text>
</Pressable>

// Pressable acting as link with no role
<Pressable onPress={() => openURL(href)}>
    <Text style={styles.link}>Learn more</Text>
</Pressable>

// Section heading with no role
<Text style={styles.heading}>Account Settings</Text>
```

### Correct

```tsx
<Pressable
    accessible
    accessibilityRole="button"
    accessibilityLabel={translate('common.submit')}
    onPress={handleSubmit}
>
    <Text>Submit</Text>
</Pressable>

<Pressable
    accessibilityRole="link"
    onPress={() => openURL(href)}
>
    <Text style={styles.link}>Learn more</Text>
</Pressable>

<Text
    accessibilityRole="header"
    style={styles.heading}
>
    Account Settings
</Text>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `<Pressable>` or interactive component with `onPress`/`onLongPress` handler but **no** `accessibilityRole` or `role` prop
- `<Pressable>` or `<TouchableOpacity>` navigating to a URL without `accessibilityRole="link"`
- Text styled as a heading (large/bold, section title) without `accessibilityRole="header"`
- Toggle/switch UI without `accessibilityRole="switch"` or `"checkbox"`
- Tab UI without `accessibilityRole="tab"`

**DO NOT flag if:**

- Component already has `accessibilityRole` or `role` set
- Using a design system component that sets the role internally (e.g., `<Button>`, `<Switch>`, `<Checkbox>`)
- Element is not interactive and not a semantic landmark

**Search Patterns** (hints for reviewers):
- `onPress` without `accessibilityRole` or `role`
- `<Pressable` without `accessibilityRole`
- Heading-styled `<Text` without `accessibilityRole="header"`
