import {useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type PopoverPosition = {
    horizontal: number;
    vertical: number;
};

type UsePopoverEditStateOptions<T> = {
    /** Whether editing is currently permitted. When false, editing will be cancelled. */
    canEdit: boolean | undefined;

    /** The current value being edited */
    value?: T;

    /** Callback when the value is saved */
    onSave?: (value: T) => void;

    /** Custom equality function. If not provided, Object.is is used. */
    isEqual?: (newValue: T, originalValue: T) => boolean;

    /** Height of the popover content (used for overflow detection). Defaults to CONST.POPOVER_DATE_MAX_HEIGHT */
    popoverHeight?: number;

    /** Padding between the anchor and the popover */
    padding?: number;

    /**
     * Which horizontal edge of the anchor to use as the popover's x-origin.
     */
    anchorEdge?: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
};

/**
 * Hook for managing popover-based editing state (date picker, category picker, etc.).
 *
 * Handles:
 *   - Anchor ref for popover positioning
 *   - measureInWindow-based position calculation
 *   - Overflow detection (inverts when too close to bottom)
 *   - Adaptive height calculation (shrinks popover when space is limited)
 *   - Auto-open after layout via InteractionManager
 *   - isEditing + isPopoverVisible toggling
 *   - Auto-cancel when canEdit becomes false
 *   - Value comparison to prevent no-op saves
 */
function usePopoverEditState<T>({
    canEdit,
    value,
    onSave,
    isEqual,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    padding = CONST.MODAL.POPOVER_MENU_PADDING,
    anchorEdge = CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
}: UsePopoverEditStateOptions<T>) {
    const {windowHeight} = useWindowDimensions();
    const anchorRef = useRef<View>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({horizontal: 0, vertical: 0});
    const [isInverted, setIsInverted] = useState(false);

    const openPopover = () => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            const wouldExceedBottom = y + popoverHeight + padding > windowHeight;
            setIsInverted(wouldExceedBottom);
            setPopoverPosition({
                horizontal: anchorEdge === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT ? x : x + width,
                vertical: y + (wouldExceedBottom ? 0 : height + padding),
            });
            setIsPopoverVisible(true);
        });
    };

    const startEditing = () => {
        setIsEditing(true);
        // EditableCell renders conditionally based on isEditing, defer measurement until that render completes and the anchor is laid out
        requestAnimationFrame(() => {
            openPopover();
        });
    };

    const cancelEditing = () => {
        setIsPopoverVisible(false);
        setIsEditing(false);
    };

    /**
     * Handles saving a new value.
     * Compares the new value with the original value and only calls onSave if they differ.
     * Always closes the popover after handling.
     */
    const handleSave = (newValue: T) => {
        if (value !== undefined && onSave) {
            const shouldSave = isEqual ? !isEqual(newValue, value) : !Object.is(newValue, value);
            if (shouldSave) {
                onSave(newValue);
            }
        }
        cancelEditing();
    };

    // Cancel editing when permission is revoked (e.g., transaction status changed)
    useEffect(() => {
        if (canEdit || !isEditing) {
            return;
        }
        queueMicrotask(() => {
            cancelEditing();
        });
    }, [canEdit, isEditing, cancelEditing]);

    return {
        isEditing,
        anchorRef,
        isPopoverVisible,
        popoverPosition,
        isInverted,
        startEditing,
        cancelEditing,
        handleSave,
    };
}

export default usePopoverEditState;
