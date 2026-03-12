---
ruleId: A11Y-9
title: Provide single-pointer alternatives for drag interactions
---

## [A11Y-9] Provide single-pointer alternatives for drag interactions

### Reasoning

Drag-and-drop, swipe-to-delete, pinch-to-zoom, and other gesture-based interactions are inaccessible to users relying on screen readers, switch controls, or keyboard navigation. WCAG 2.5.7 requires that every dragging operation has a single-pointer alternative (tap/click). Provide buttons, menus, or other accessible controls that achieve the same result. (WCAG 2.5.1, 2.5.7)

### Incorrect

```tsx
// Reorderable list with drag-only reordering — no alternative for assistive tech
<DraggableFlatList
    data={items}
    renderItem={({item, drag}) => (
        <Pressable onLongPress={drag}>
            <Text>{item.name}</Text>
        </Pressable>
    )}
    onDragEnd={({data}) => setItems(data)}
/>

// Swipe-to-delete with no button alternative
<Swipeable renderRightActions={() => <DeleteAction />}>
    <ListItem title={item.name} />
</Swipeable>
```

### Correct

```tsx
// Reorderable list with move up/down buttons as accessible alternative
<DraggableFlatList
    data={items}
    renderItem={({item, drag, isActive}) => {
        const index = items.indexOf(item);
        return (
            <View style={styles.row}>
                <Pressable onLongPress={drag} accessibilityLabel={translate('common.dragToReorder')}>
                    <Icon src={Expensicons.DragHandle} />
                </Pressable>
                <Text>{item.name}</Text>
                <Pressable
                    onPress={() => moveItem(index, 'up')}
                    accessibilityLabel={translate('common.moveUp')}
                    accessibilityRole="button"
                >
                    <Icon src={Expensicons.UpArrow} />
                </Pressable>
                <Pressable
                    onPress={() => moveItem(index, 'down')}
                    accessibilityLabel={translate('common.moveDown')}
                    accessibilityRole="button"
                >
                    <Icon src={Expensicons.DownArrow} />
                </Pressable>
            </View>
        );
    }}
    onDragEnd={({data}) => setItems(data)}
/>

// Swipeable with accessible delete action via context menu or button
<Swipeable renderRightActions={() => <DeleteAction />}>
    <ListItem
        title={item.name}
        accessibilityActions={[{name: 'delete', label: translate('common.delete')}]}
        onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'delete') {
                deleteItem(item.id);
            }
        }}
    />
</Swipeable>
```

---

### Review Metadata

Flag ONLY when ANY of these patterns is found:

- `DraggableFlatList` or drag-and-drop with **no** visible move/reorder buttons or `accessibilityActions`
- `Swipeable` component with **no** accessible alternative (button, menu item, or `accessibilityActions`)
- Pinch-to-zoom with **no** zoom buttons
- Any gesture-only interaction (`onLongPress` for drag, pan gestures for reorder) with **no** tap-based alternative

**DO NOT flag if:**

- Accessible alternative controls are provided (buttons, menus, accessibility actions)
- The gesture is supplementary to an existing tap-based primary interaction
- Component is purely decorative or non-functional (e.g., animation)

**Search Patterns** (hints for reviewers):
- `DraggableFlatList` / `Draggable` / `drag`
- `Swipeable` / `SwipeableRow`
- `onLongPress` used for drag initiation
- `PanGestureHandler` for reordering
