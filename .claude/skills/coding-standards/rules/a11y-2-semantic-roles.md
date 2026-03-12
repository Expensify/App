---
ruleId: A11Y-2
title: Use semantic accessibilityRole for interactive elements
---

## [A11Y-2] Use semantic accessibilityRole for interactive elements

### Reasoning

React Native `<View>` has no semantic meaning — assistive technology treats it as a generic container. When a `<View>` handles `onPress` or acts as a button, link, header, checkbox, switch, or tab, it must declare its role via `accessibilityRole` (or `role`). Without this, screen reader users cannot understand what the element does or how to interact with it. (WCAG 4.1.2)

### Incorrect

```tsx
// View acting as button with no role — screen reader doesn't know it's tappable
<View accessible onPress={handleSubmit}>
    <Text>Submit</Text>
</View>

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

- `<View>` or generic container with `onPress`/`onLongPress` handler but **no** `accessibilityRole` or `role` prop
- `<Pressable>` or `<TouchableOpacity>` navigating to a URL without `accessibilityRole="link"`
- Text styled as a heading (large/bold, section title) without `accessibilityRole="header"`
- Toggle/switch UI without `accessibilityRole="switch"` or `"checkbox"`
- Tab UI without `accessibilityRole="tab"`

**DO NOT flag if:**

- Component already has `accessibilityRole` or `role` set
- Using a design system component that sets the role internally (e.g., `<Button>`, `<Switch>`, `<Checkbox>`)
- Element is not interactive and not a semantic landmark

**Search Patterns** (hints for reviewers):
- `onPress` without `accessibilityRole`
- `<View` with `onPress`
- Heading-styled `<Text` without `accessibilityRole="header"`
