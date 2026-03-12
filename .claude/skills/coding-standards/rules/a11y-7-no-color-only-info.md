---
ruleId: A11Y-7
title: Do not convey information through color alone
---

## [A11Y-7] Do not convey information through color alone

### Reasoning

Users with color vision deficiencies (8% of men, 0.5% of women) cannot distinguish information conveyed solely through color. Status indicators, error states, required fields, and success/failure feedback must include a non-color cue — text labels, icons, patterns, or shape changes. Text must also meet minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt bold+), and 3:1 for non-text UI components and graphical objects. (WCAG 1.3.3, 1.4.1, 1.4.3, 1.4.11)

### Incorrect

```tsx
// Status conveyed only by color — colorblind users can't distinguish
<View style={{backgroundColor: isOnline ? 'green' : 'red', width: 8, height: 8, borderRadius: 4}} />

// Error indicated only by red border color
<TextInput style={[styles.input, hasError && {borderColor: 'red'}]} />

// Required field indicated only by red asterisk color
<Text style={{color: 'red'}}>*</Text>
```

### Correct

```tsx
// Status uses color + icon + label
const statusLabel = isOnline ? translate('common.online') : translate('common.offline');
<View style={styles.statusContainer}>
    <View style={{backgroundColor: isOnline ? theme.success : theme.danger, width: 8, height: 8, borderRadius: 4}} />
    <Text accessibilityLabel={statusLabel}>{statusLabel}</Text>
</View>

// Error uses color + icon + text message
<TextInput
    style={[styles.input, hasError && styles.inputError]}
/>
{hasError && (
    <View style={styles.errorRow}>
        <Icon src={Expensicons.Exclamation} fill={theme.danger} />
        <Text style={styles.errorText} accessibilityLiveRegion="assertive">
            {errorMessage}
        </Text>
    </View>
)}

// Required field uses label text, not just color
<Text>
    {fieldLabel} <Text accessibilityLabel={translate('common.required')}>*</Text>
</Text>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- Status dot/indicator using **only** background color with **no** accompanying text or icon
- Error/validation state indicated **only** by changing border or text color with **no** error message text
- Success/failure feedback using **only** green/red color with **no** text or icon explanation
- Colored badge/tag with **no** text label inside it

**DO NOT flag if:**

- Color is supplementary — text label or icon also conveys the same information
- Element is purely decorative with no informational purpose
- Color distinction is between text and background (contrast issue, not color-only issue)

**Search Patterns** (hints for reviewers):
- `backgroundColor:` conditionally set based on status with no sibling `<Text`
- `borderColor: 'red'` / `borderColor: theme.danger` without error text
- Status indicators using only colored dots/circles
