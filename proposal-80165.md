# Proposal for Issue #80165

## Please re-state the problem that we are trying to solve in this issue.

When using keyboard navigation to reorder waypoints in the distance tracking feature, the "Please remove duplicate waypoints" error message persists after dropping an item with the **Enter** key. For example, when waypoints A > B > B (which shows the duplicate error) are reordered to B > A > B, the error remains visible until the user tabs away from the moved item.

**Key observation:** The feature works correctly when pressing **Space** to finalize the reorder instead of Enter. The error properly clears in that case.

This was introduced by PR #79793 which added keyboard reordering support to the DraggableList component.

## What is the root cause of that problem?

The root cause is related to how @dnd-kit handles the Enter vs Space key for finalizing a drag operation, and the focus/blur cycle that follows.

Looking at `src/components/DraggableList/SortableItem.tsx`, the component spreads `listeners` from `useSortable` which includes keyboard event handlers. When:

1. **Space is pressed**: The drag operation ends cleanly. The `onDragEnd` callback fires, waypoints state updates, and `duplicateWaypointsError` is recalculated correctly to `false`.

2. **Enter is pressed**: The drag operation ends, but Enter key has additional behaviors in @dnd-kit. The Enter key can trigger a "click" or "activation" on the focused element after the drag ends. This causes the error recalculation to be interrupted or the component to be in a transitional focus state where the error doesn't update until focus changes.

The evidence for this:
- Error clears immediately with Space
- Error persists with Enter but clears when tabbing away (focus change)
- The same behavior affects issue #80166 (waypoint cannot be dragged after Enter)

In `src/pages/iou/request/step/IOURequestStepDistanceMap.tsx`, the `duplicateWaypointsError` is computed in a `useMemo` that depends on `waypoints`. When Enter is used, there appears to be a focus-related timing issue where React doesn't re-render with the updated error state until the focus changes.

## What changes do you think we should make in order to solve the problem?

In `src/components/DraggableList/SortableItem.tsx`, we should intercept the Enter key during an active drag to prevent any additional click/activation behavior after the drop completes:

```typescript
function SortableItem({id, children, disabled = false}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id, disabled});
    const wasDraggingRef = useRef(false);

    // Track if we were just dragging to prevent Enter from triggering click
    useEffect(() => {
        if (isDragging) {
            wasDraggingRef.current = true;
        }
    }, [isDragging]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Call the original listener first
        listeners?.onKeyDown?.(e);

        // If Enter was pressed while dragging or just after dropping,
        // prevent additional activation behavior
        if (e.key === 'Enter' && wasDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
            // Reset the flag after a brief delay to allow normal Enter behavior later
            setTimeout(() => {
                wasDraggingRef.current = false;
            }, 0);
        }
    };

    // ... rest of component
}
```

This ensures Enter behaves consistently with Space by preventing any post-drop activation that interferes with state updates.

## What alternative solutions did you explore? (Optional)

1. **Configure KeyboardSensor to only use Space for drop**: We could restrict the drop key to only Space via `keyboardCodes.end`. However, Enter is a standard and expected key for confirming actions, so this would reduce accessibility.

2. **Force blur after keyboard drop**: We could programmatically blur the element after a keyboard drop, but this would be jarring for keyboard users who expect focus to remain on the item they just moved.

3. **Debounce error display**: This would mask the symptom rather than fix the root cause.

**Note:** Per the discussion in the issue thread, this is a UX improvement rather than a deploy blocker since:
- The feature works correctly with Space
- The error clears when tabbing away
- The core functionality is not broken
