---
ruleId: A11Y-6
title: Images must have labels or be hidden from assistive technology
---

## [A11Y-6] Images must have labels or be hidden from assistive technology

### Reasoning

Screen readers attempt to announce every image. Informative images (photos, charts, meaningful icons) need descriptive `accessibilityLabel` so users understand the content. Decorative images (background patterns, visual separators, ornamental icons) must be hidden with `accessible={false}` to avoid cluttering the screen reader experience with meaningless announcements. (WCAG 1.1.1)

### Incorrect

```tsx
// Informative image with no label — screen reader says "image"
<Image source={{uri: receiptURL}} style={styles.receiptImage} />

// Decorative separator announced to screen reader unnecessarily
<Image source={require('./divider.png')} style={styles.divider} />

// Avatar with no description
<Avatar source={avatarURL} size={CONST.AVATAR_SIZE.DEFAULT} />
```

### Correct

```tsx
// Informative image with descriptive label
<Image
    source={{uri: receiptURL}}
    style={styles.receiptImage}
    accessibilityLabel={translate('common.receipt')}
    accessibilityRole="image"
/>

// Decorative image hidden from screen reader
<Image
    source={require('./divider.png')}
    style={styles.divider}
    accessible={false}
/>

// Avatar with meaningful label
<Avatar
    source={avatarURL}
    size={CONST.AVATAR_SIZE.DEFAULT}
    accessibilityLabel={`${displayName} avatar`}
/>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `<Image>` with a meaningful `source` (not a decorative pattern) and **no** `accessibilityLabel` and **not** hidden (`accessible={false}`)
- Icon used to convey information (status, type, category) with **no** label and **not** hidden
- Decorative/ornamental image that is **not** hidden from assistive technology

**DO NOT flag if:**

- Image is inside an interactive parent that already has an `accessibilityLabel`
- Image component internally handles accessibility (design system components)
- Image is part of a group wrapped with `accessible={true}` and a group label

**Search Patterns** (hints for reviewers):
- `<Image` without `accessibilityLabel` or `accessible={false}`
- `<Avatar` without `accessibilityLabel`
- `<Icon` used for status indication without parent label
