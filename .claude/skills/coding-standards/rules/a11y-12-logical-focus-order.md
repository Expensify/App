---
ruleId: A11Y-12
title: Maintain logical focus order matching visual layout
---

## [A11Y-12] Maintain logical focus order matching visual layout

### Reasoning

Screen readers traverse elements in JSX/DOM order, not visual order. When absolute positioning, `flexDirection: 'row-reverse'`, or `zIndex` rearranges elements visually, the screen reader focus order diverges from what sighted users see. This creates a confusing navigation experience where focus jumps unpredictably. JSX order must match the intended reading/interaction order. (WCAG 2.4.3, 1.3.2)

### Incorrect

```tsx
// Visual order: [Cancel] [Submit] but JSX order is reversed
<View style={{flexDirection: 'row-reverse'}}>
    <Pressable onPress={onSubmit}><Text>Submit</Text></Pressable>
    <Pressable onPress={onCancel}><Text>Cancel</Text></Pressable>
</View>

// Header visually on top via absolute positioning, but last in JSX
<View>
    <View style={styles.content}><Text>Body content</Text></View>
    <View style={[styles.header, {position: 'absolute', top: 0}]}>
        <Text accessibilityRole="header">Title</Text>
    </View>
</View>
```

### Correct

```tsx
// JSX order matches visual reading order
<View style={{flexDirection: 'row'}}>
    <Pressable onPress={onCancel}><Text>Cancel</Text></Pressable>
    <Pressable onPress={onSubmit}><Text>Submit</Text></Pressable>
</View>

// Header first in JSX, matching visual order
<View>
    <View style={styles.header}>
        <Text accessibilityRole="header">Title</Text>
    </View>
    <View style={styles.content}><Text>Body content</Text></View>
</View>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `flexDirection: 'row-reverse'` or `'column-reverse'` on a container with multiple interactive children
- Absolute positioning causing an element to appear visually before its JSX siblings
- `zIndex` layering that places interactive elements in a different visual order than JSX order

**DO NOT flag if:**

- `row-reverse` is used on a container with a single child or non-interactive children
- Visual reordering is purely decorative (no interactive elements affected)
- The component uses `experimental_accessibilityOrder` to explicitly control focus order

**Search Patterns** (hints for reviewers):
- `flexDirection: 'row-reverse'` / `'column-reverse'`
- `position: 'absolute'` on interactive elements
- `zIndex` on containers with multiple interactive children
