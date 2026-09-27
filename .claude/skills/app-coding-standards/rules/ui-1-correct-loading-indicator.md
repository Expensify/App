---
ruleId: UI-1
title: Use the correct loading indicator based on navigation context
---

## [UI-1] Use the correct loading indicator based on navigation context

### Reasoning

If loading hangs, users need an escape route. When navigation (back button, close) is visible alongside the loader, users can escape - use `ActivityIndicator`. When no navigation is visible, users are trapped - use `FullscreenLoadingIndicator` with `shouldUseGoBackButton={true}` which shows an emergency "Go Back" button after timeout. This prop is being migrated to become default, so set it explicitly for now.

### Incorrect

```tsx
// Header and FullscreenLoadingIndicator in SAME return - use ActivityIndicator
<ScreenWrapper>
    <HeaderWithBackButton title="Settings" />
    <FullscreenLoadingIndicator />
</ScreenWrapper>

// No navigation, missing shouldUseGoBackButton - user trapped if loading hangs
function ValidateLoginPage() {
    return <FullscreenLoadingIndicator />;
}

// ActivityIndicator as sole content without navigation - use FullscreenLoadingIndicator
function AuthLoadingPage() {
    return (
        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <ActivityIndicator size="large" />
        </View>
    );
}
```

### Correct

```tsx
// No navigation in return - FullscreenLoadingIndicator with shouldUseGoBackButton
function ValidateLoginPage() {
    return <FullscreenLoadingIndicator shouldUseGoBackButton />;
}

// Loader and navigation in DIFFERENT returns - OK to use FullscreenLoadingIndicator
function SettingsPage() {
    if (isLoading) {
        return <FullscreenLoadingIndicator shouldUseGoBackButton />;
    }
    return (
        <ScreenWrapper>
            <HeaderWithBackButton title="Settings" />
            <Content />
        </ScreenWrapper>
    );
}

// Header visible during loading - use ActivityIndicator
function SettingsPage() {
    return (
        <ScreenWrapper>
            <HeaderWithBackButton title="Settings" />
            {isLoading ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <Content />
            )}
        </ScreenWrapper>
    );
}
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `FullscreenLoadingIndicator` and `HeaderWithBackButton` (or other navigation like close button) are **both under the same JSX tree** (not separated by conditionals)
- `FullscreenLoadingIndicator` without `shouldUseGoBackButton` prop when **no navigation component** (e.g., `HeaderWithBackButton`, close button) **is rendered in the same return statement or conditional branch**
- `ActivityIndicator` as the **sole/main screen content** (flex:1 container, early return) without any navigation component (e.g., `HeaderWithBackButton`, close button) **in the same return statement or conditional branch**

**DO NOT flag if:**

**For `FullscreenLoadingIndicator`:**
- Visibility is controlled by `FullScreenLoaderContext`
- Navigation visible in different conditional branches (separate return statement) AND has `shouldUseGoBackButton={true}`

**For `ActivityIndicator`:**
- Used within interactive UI elements (buttons, list items, cards) where user can still interact with surrounding navigation

**Search Patterns** (hints for reviewers):
- `FullscreenLoadingIndicator`
- `FullScreenLoadingIndicator`
- `ActivityIndicator`
