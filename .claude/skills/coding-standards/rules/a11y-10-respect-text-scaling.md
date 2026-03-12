---
ruleId: A11Y-10
title: Respect user text scaling preferences
---

## [A11Y-10] Respect user text scaling preferences

### Reasoning

Users with low vision rely on system-level font size settings (iOS Dynamic Type / Android Font Size) to enlarge text. Setting `allowFontScaling={false}` or `maxFontSizeMultiplier={1}` disables this, making text unreadable for these users. Layouts must accommodate scaled text using flexible containers (`minHeight`, `flexWrap`) instead of fixed pixel heights. (WCAG 1.4.4)

### Incorrect

```tsx
// Globally disabling font scaling
<Text allowFontScaling={false}>Account Balance</Text>

// Capping font scaling to prevent layout issues instead of fixing the layout
<Text maxFontSizeMultiplier={1}>$2,450.00</Text>

// Fixed height container that clips scaled text
<View style={{height: 40}}>
    <Text style={{fontSize: 16}}>This text will be clipped at larger scales</Text>
</View>
```

### Correct

```tsx
// Text respects system scaling (default behavior — don't override it)
<Text>Account Balance</Text>

// Flexible container that accommodates scaled text
<View style={{minHeight: 40, paddingVertical: 8}}>
    <Text style={{fontSize: 16}}>
        This text grows with the container at larger scales
    </Text>
</View>

// Acceptable: limiting scaling on tiny decorative text only (e.g., badge count)
<Text maxFontSizeMultiplier={1.5} style={styles.badgeCount}>3</Text>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `allowFontScaling={false}` on `<Text>` or `<TextInput>` displaying user-facing content
- `maxFontSizeMultiplier={1}` effectively disabling scaling on readable text
- Fixed `height` on a container with text content and no `minHeight` or overflow accommodation

**DO NOT flag if:**

- `allowFontScaling={false}` on purely decorative text (icons rendered as text, single-character badges)
- `maxFontSizeMultiplier` set to a reasonable value (>= 1.5) to prevent extreme layout breakage
- Container uses `minHeight` instead of `height`
- Text is inside a component that manages scaling internally

**Search Patterns** (hints for reviewers):
- `allowFontScaling={false}`
- `maxFontSizeMultiplier={1}`
- `maxFontSizeMultiplier={1.0}`
- Fixed `height:` on text containers
