---
ruleId: UI-2
title: New pages must be scrollable
---

## [UI-2] New pages must be scrollable

### Reasoning

When a new page is added it must use the `ScrollView` component so it stays usable as more elements are added and on smaller screens. A page that lays out its content in plain `View`s will clip or trap content once it exceeds the viewport. Pages whose primary content is a virtualized list are already scrollable and are exempt.

### Incorrect

```tsx
function WorkspaceDetailsPage() {
    return (
        <ScreenWrapper testID={WorkspaceDetailsPage.displayName}>
            <HeaderWithBackButton title={translate('workspace.common.details')} />
            <View style={styles.flex1}>
                <MenuItem title={translate('common.name')} />
                <MenuItem title={translate('common.currency')} />
                {/* more fields keep getting added below... */}
            </View>
        </ScreenWrapper>
    );
}
```

### Correct

```tsx
function WorkspaceDetailsPage() {
    return (
        <ScreenWrapper testID={WorkspaceDetailsPage.displayName}>
            <HeaderWithBackButton title={translate('workspace.common.details')} />
            <ScrollView>
                <MenuItem title={translate('common.name')} />
                <MenuItem title={translate('common.currency')} />
            </ScrollView>
        </ScreenWrapper>
    );
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A newly added file under `src/pages/**` renders a page (e.g. wraps content in `ScreenWrapper`)
- Its content is laid out directly in `View`s that can grow as elements are added
- It does not render a `ScrollView`/`ScrollViewWithContext` and is not a list-based screen

**DO NOT flag if:**

- The page's primary content is a virtualized list (`FlatList`, `SectionList`, `FlashList`, `SelectionList`) - already scrollable
- The screen is intentionally fixed-height (full-screen loader, confirmation modal, RHP fragment that must not scroll)
- The change modifies an existing page rather than adding a new one

**Search Patterns** (hints for reviewers):
- Added files in `src/pages/**`
- Presence of `ScreenWrapper` without `ScrollView`/`FlatList`/`SectionList`/`FlashList`/`SelectionList`
