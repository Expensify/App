---
ruleId: A11Y-1
title: Interactive elements must have accessible labels
---

## [A11Y-1] Interactive elements must have accessible labels

### Reasoning

Screen readers (VoiceOver/TalkBack) cannot convey the purpose of an interactive element without a text label. Icon-only buttons, image-only touchables, and components whose visible text is insufficient for context must provide `accessibilityLabel`. Without it, assistive technology announces the element as an unnamed control, making the app unusable for screen reader users. (WCAG 1.1.1, 4.1.2)

### Incorrect

```tsx
// Icon-only button with no label — screen reader says "button"
<Pressable onPress={onClose}>
    <Icon src={Expensicons.Close} />
</Pressable>

// Image-only touchable with no description
<TouchableOpacity onPress={openProfile}>
    <Avatar source={avatarURL} />
</TouchableOpacity>
```

### Correct

```tsx
<Pressable
    onPress={onClose}
    accessibilityLabel={translate('common.close')}
    accessibilityRole="button"
>
    <Icon src={Expensicons.Close} />
</Pressable>

<TouchableOpacity
    onPress={openProfile}
    accessibilityLabel={translate('common.profile')}
    accessibilityRole="imagebutton"
>
    <Avatar source={avatarURL} />
</TouchableOpacity>
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Element is interactive (`Pressable`, `TouchableOpacity`, `TouchableWithoutFeedback`, `PressableWithFeedback`, `Button`, or has `onPress`/`onLongPress`)
- Element contains **no visible `<Text>` child** (icon-only, image-only, or SVG-only)
- Element has **no** `accessibilityLabel` or `aria-label` prop

**DO NOT flag if:**

- Element has a `<Text>` child that clearly describes the action
- Element is explicitly hidden from accessibility (`accessible={false}`, `aria-hidden={true}`, `importantForAccessibility="no"`)
- Element is a list item wrapper where the child component handles its own accessibility

**Search Patterns** (hints for reviewers):
- `<Pressable` / `<TouchableOpacity` / `<TouchableWithoutFeedback`
- `<Icon` without sibling `<Text`
- `onPress` without `accessibilityLabel`
