---
ruleId: A11Y-8
title: Manage focus for modals and overlays
---

## [A11Y-8] Manage focus for modals and overlays

### Reasoning

When a modal, bottom sheet, or popover opens, screen reader users can still navigate to content behind it unless focus is trapped inside the overlay. On iOS, use `accessibilityViewIsModal={true}` to make VoiceOver ignore sibling views. Focus should move to the modal's first interactive element on open and return to the trigger element on close. Without this, screen reader users can interact with obscured content, creating a confusing and broken experience. (WCAG 2.4.3, WCAG 2.4.11)

### Incorrect

```tsx
// Modal with no focus management — screen reader can navigate behind it
<Modal visible={isVisible}>
    <View style={styles.modalContent}>
        <Text>Confirm deletion?</Text>
        <Pressable onPress={onConfirm}><Text>Delete</Text></Pressable>
        <Pressable onPress={onCancel}><Text>Cancel</Text></Pressable>
    </View>
</Modal>

// Bottom sheet that doesn't trap focus
{isSheetOpen && (
    <View style={styles.bottomSheet}>
        <Text>Options</Text>
        <Pressable onPress={onEdit}><Text>Edit</Text></Pressable>
    </View>
)}
```

### Correct

```tsx
// Modal with accessibility focus trapping
<Modal visible={isVisible} onRequestClose={onCancel}>
    <View
        style={styles.modalContent}
        accessibilityViewIsModal={true}
    >
        <Text accessibilityRole="header">Confirm deletion?</Text>
        <Pressable
            ref={firstFocusRef}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={translate('common.delete')}
        >
            <Text>Delete</Text>
        </Pressable>
        <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={translate('common.cancel')}
        >
            <Text>Cancel</Text>
        </Pressable>
    </View>
</Modal>

// Bottom sheet with focus management
{isSheetOpen && (
    <View
        style={styles.bottomSheet}
        accessibilityViewIsModal={true}
    >
        <Text accessibilityRole="header">Options</Text>
        <Pressable onPress={onEdit} accessibilityRole="button">
            <Text>Edit</Text>
        </Pressable>
    </View>
)}
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `<Modal>` or custom modal/overlay component with **no** `accessibilityViewIsModal` on the content container
- Bottom sheet or popover overlay with **no** `accessibilityViewIsModal`
- Modal/overlay that does **not** handle `onRequestClose` (Android back button dismissal)

**DO NOT flag if:**

- Using a shared modal/dialog component that already sets `accessibilityViewIsModal` internally
- Overlay is non-blocking (e.g., tooltip that doesn't obscure primary content)
- Component uses React Navigation modal which handles focus management

**Search Patterns** (hints for reviewers):
- `<Modal` without `accessibilityViewIsModal`
- Custom overlay/sheet components
- `visible={` / `isVisible` conditionally rendered overlays
