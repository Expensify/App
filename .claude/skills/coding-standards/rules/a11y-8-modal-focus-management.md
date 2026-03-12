---
ruleId: A11Y-8
title: Manage focus for modals and overlays
---

## [A11Y-8] Manage focus for modals and overlays

### Reasoning

When a modal, bottom sheet, or popover opens, screen reader users can still navigate to content behind it unless focus is trapped inside the overlay. Platform-specific handling is required:

- **iOS**: Use `accessibilityViewIsModal={true}` on the modal container — VoiceOver will ignore sibling views.
- **Android**: Use `importantForAccessibility="no-hide-descendants"` on the background content to hide it from TalkBack.

Focus should move to the modal's first interactive element on open and return to the trigger on close. (WCAG 2.4.3, 2.1.2)

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
// Modal with cross-platform focus trapping
<Modal visible={isVisible} onRequestClose={onCancel}>
    <View
        style={styles.modalContent}
        accessibilityViewIsModal={true}  // iOS: VoiceOver ignores siblings
    >
        <Text accessibilityRole="header">Confirm deletion?</Text>
        <Pressable
            ref={firstFocusRef}
            onPress={onConfirm}
            accessibilityRole="button"
        >
            <Text>Delete</Text>
        </Pressable>
        <Pressable
            onPress={onCancel}
            accessibilityRole="button"
        >
            <Text>Cancel</Text>
        </Pressable>
    </View>
</Modal>
{/* Android: hide background from TalkBack when modal is open */}
<View
    style={styles.backgroundContent}
    importantForAccessibility={isVisible ? 'no-hide-descendants' : 'auto'}
>
    {/* ... app content ... */}
</View>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `<Modal>` or custom modal/overlay component with **no** `accessibilityViewIsModal` (iOS) and **no** `importantForAccessibility="no-hide-descendants"` on background (Android)
- Bottom sheet or popover overlay with **no** focus trapping mechanism
- Modal/overlay that does **not** handle `onRequestClose` (Android back button dismissal)

**DO NOT flag if:**

- Using a shared modal/dialog component that already sets `accessibilityViewIsModal` internally
- Overlay is non-blocking (e.g., tooltip that doesn't obscure primary content)
- Component uses React Navigation modal which handles focus management

**Search Patterns** (hints for reviewers):
- `<Modal` without `accessibilityViewIsModal` or `importantForAccessibility`
- Custom overlay/sheet components
- `visible={` / `isVisible` conditionally rendered overlays
