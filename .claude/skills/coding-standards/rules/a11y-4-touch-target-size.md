---
ruleId: A11Y-4
title: Minimum touch target size of 44x44 points
---

## [A11Y-4] Minimum touch target size of 44x44 points

### Reasoning

Users with motor impairments, tremors, or limited dexterity struggle to tap small targets. WCAG 2.5.8 requires a minimum target size of 24x24 CSS pixels, but Apple HIG and Android guidelines recommend 44x44pt / 48x48dp respectively. React Native targets both platforms, so interactive elements should meet the 44x44pt minimum. Use `hitSlop` to enlarge the tappable area without changing visual layout when the visual element must be smaller.

### Incorrect

```tsx
// Small icon button with no hit area expansion
<Pressable onPress={onClose} style={{width: 24, height: 24}}>
    <Icon src={Expensicons.Close} width={16} height={16} />
</Pressable>

// Inline link-style button that's too small to tap reliably
<Pressable onPress={onRetry} style={{padding: 4}}>
    <Text style={styles.smallText}>Retry</Text>
</Pressable>
```

### Correct

```tsx
// Properly sized touch target
<Pressable
    onPress={onClose}
    accessibilityLabel={translate('common.close')}
    accessibilityRole="button"
    style={{width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}
>
    <Icon src={Expensicons.Close} width={16} height={16} />
</Pressable>

// Using hitSlop to expand tappable area without changing layout
<Pressable
    onPress={onRetry}
    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
    style={{padding: 4}}
>
    <Text style={styles.smallText}>Retry</Text>
</Pressable>
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Element is interactive (`Pressable`, `TouchableOpacity`, `TouchableWithoutFeedback`, or has `onPress`)
- Element has explicit dimensions (width/height in style) **less than 44** on either axis
- Element has **no** `hitSlop` prop to compensate

**DO NOT flag if:**

- Element uses `hitSlop` to expand the tappable area
- Element is within a larger tappable parent that meets the minimum
- Element is an inline text link within a paragraph (WCAG exception)
- Dimensions are not explicitly set (defaults may be adequate)

**Search Patterns** (hints for reviewers):
- Explicit `width` or `height` under 44 on interactive elements (e.g., `width: 24`, `height: 32`)
- `onPress` with small explicit sizing and no `hitSlop`
