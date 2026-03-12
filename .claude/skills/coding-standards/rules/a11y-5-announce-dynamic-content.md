---
ruleId: A11Y-5
title: Announce dynamic content changes to assistive technology
---

## [A11Y-5] Announce dynamic content changes to assistive technology

### Reasoning

Screen reader users cannot see visual changes — toast messages, success/error banners, loading completions, and counter updates are invisible unless explicitly announced. On Android, use `accessibilityLiveRegion` on the changing text node. On iOS, use `AccessibilityInfo.announceForAccessibility()`. Without announcements, dynamic feedback is silently lost. (WCAG 4.1.3)

### Incorrect

```tsx
// Success message appears but screen reader is not informed
{showSuccess && (
    <View style={styles.toast}>
        <Text>Changes saved successfully</Text>
    </View>
)}

// Error message rendered without live region
{error && (
    <Text style={styles.errorText}>{error}</Text>
)}

// Loading completes with no announcement
{!isLoading && <Text>Data loaded</Text>}
```

### Correct

```tsx
// Android: live region announces when text content changes
{showSuccess && (
    <View style={styles.toast}>
        <Text accessibilityLiveRegion="polite">Changes saved successfully</Text>
    </View>
)}

// Error messages should interrupt — use assertive for errors
{error && (
    <Text accessibilityLiveRegion="assertive" accessibilityRole="alert">
        {error}
    </Text>
)}

// iOS: programmatic announcement for transient messages
useEffect(() => {
    if (showSuccess) {
        AccessibilityInfo.announceForAccessibility(translate('common.changesSaved'));
    }
}, [showSuccess]);

// Cross-platform: announce loading completion
useEffect(() => {
    if (!isLoading) {
        AccessibilityInfo.announceForAccessibility(translate('common.loaded'));
    }
}, [isLoading]);
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- Toast, snackbar, banner, or success/error message rendered conditionally with **no** `accessibilityLiveRegion` and **no** `AccessibilityInfo.announceForAccessibility` call
- Form validation error text appears dynamically with **no** live region or announcement
- Loading state transitions (loading -> loaded) with **no** announcement
- Counter or status text updates with **no** live region

**DO NOT flag if:**

- Component uses a shared notification/toast system that already handles announcements internally
- Focus is explicitly moved to the new content via `AccessibilityInfo.setAccessibilityFocus()`
- Content change is within a focused input field (screen reader already tracks it)

**Search Patterns** (hints for reviewers):
- Conditional rendering of success/error messages without `accessibilityLiveRegion`
- `Toast` / `Growl` / `Banner` / `SnackBar` components
- `AccessibilityInfo.announceForAccessibility` (presence = good)
