import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useEffect, useRef, useState} from 'react';

type PopoverPosition = {
    horizontal: number;
    vertical: number;
};

type UsePopoverEditStateOptions = {
    /** Whether editing is currently permitted. When false, editing will be cancelled. */
    canEdit: boolean | undefined;

    /** The current value being edited */
    value?: unknown;

    /** Callback when the value is saved */
    onSave?: (value: unknown) => void;

    /** Custom equality function. If not provided, Object.is is used. */
    isEqual?: (newValue: unknown, originalValue: unknown) => boolean;

    /** Preferred height of the popover content. It is used to pick the side to open on, and is shrunk when that side can't fit it. */
    popoverHeight?: number;

    /** Padding between the anchor and the popover */
    padding?: number;

    /**
     * Which horizontal edge of the anchor to use as the popover's x-origin.
     */
    anchorEdge?: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function usePopoverEditStateImpl({
    canEdit,
    value,
    onSave,
    isEqual,
    popoverHeight: preferredPopoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    padding = CONST.MODAL.POPOVER_MENU_PADDING,
    anchorEdge = CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
}: UsePopoverEditStateOptions) {
    const {windowHeight} = useWindowDimensions();
    const anchorRef = useRef<View>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({horizontal: 0, vertical: 0});
    const [shouldOpenAbove, setShouldOpenAbove] = useState(false);
    const [popoverHeight, setPopoverHeight] = useState(preferredPopoverHeight);

    const openPopover = () => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            // Space usable on either side of the anchor, reserving `padding` between the popover and the anchor plus the
            // same gap between the popover and the window edge.
            const spaceBelow = windowHeight - (y + height + padding) - padding;
            const spaceAbove = y - padding - padding;

            // Open below whenever the preferred height fits there, otherwise take whichever side has more room.
            const shouldOpenPopoverAbove = spaceBelow < preferredPopoverHeight && spaceAbove > spaceBelow;
            const availableSpace = shouldOpenPopoverAbove ? spaceAbove : spaceBelow;

            setShouldOpenAbove(shouldOpenPopoverAbove);
            setPopoverHeight(Math.max(Math.min(preferredPopoverHeight, availableSpace), CONST.POPOVER_DROPDOWN_MIN_USABLE_HEIGHT));
            setPopoverPosition({
                horizontal: anchorEdge === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT ? x : x + width,
                // When opening above, this is the popover's bottom edge (see `anchorAlignment` below), so the popover
                // ends `padding` above the anchor instead of starting on top of it.
                vertical: shouldOpenPopoverAbove ? y - padding : y + height + padding,
            });
            setIsPopoverVisible(true);
        });
    };

    const startEditing = () => {
        setIsEditing(true);
        requestAnimationFrame(() => {
            openPopover();
        });
    };

    const cancelEditing = () => {
        setIsPopoverVisible(false);
        setIsEditing(false);
    };

    const handleSave = (newValue: unknown) => {
        if (value !== undefined && onSave) {
            const shouldSave = isEqual ? !isEqual(newValue, value) : !Object.is(newValue, value);
            if (shouldSave) {
                onSave(newValue);
            }
        }
        cancelEditing();
    };

    useEffect(() => {
        if (canEdit || !isEditing) {
            return;
        }
        queueMicrotask(() => {
            cancelEditing();
        });
    }, [canEdit, isEditing]);

    // Pin the popover's bottom edge to `popoverPosition.vertical` when opening above, so the popover is placed fully
    // outside the anchor regardless of how tall its content ends up being.
    const anchorAlignment: AnchorAlignment = {
        horizontal: anchorEdge,
        vertical: shouldOpenAbove ? CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM : CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    };

    return {
        isEditing,
        anchorRef,
        isPopoverVisible,
        popoverPosition,
        popoverHeight,
        anchorAlignment,
        shouldOpenAbove,
        startEditing,
        cancelEditing,
        handleSave,
    };
}

type UsePopoverEditStateOptionsGeneric<T> = {
    canEdit: boolean | undefined;
    value?: T;
    onSave?: (value: T) => void;
    isEqual?: (newValue: T, originalValue: T) => boolean;
    popoverHeight?: number;
    padding?: number;
    anchorEdge?: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
};

/**
 * Hook for managing popover-based editing state (date picker, category picker, etc.).
 *
 * Handles:
 *   - Anchor ref for popover positioning
 *   - measureInWindow-based position calculation
 *   - Side selection (opens above the anchor, bottom-edge aligned, when the popover can't fit below it)
 *   - Adaptive height calculation (shrinks popover when space is limited)
 *   - Auto-open after layout via requestAnimationFrame
 *   - isEditing + isPopoverVisible toggling
 *   - Auto-cancel when canEdit becomes false
 *   - Value comparison to prevent no-op saves
 */
function usePopoverEditState<T>(options: UsePopoverEditStateOptionsGeneric<T>) {
    return usePopoverEditStateImpl(options as UsePopoverEditStateOptions) as ReturnType<typeof usePopoverEditStateImpl> & {
        handleSave: (newValue: T) => void;
    };
}

export default usePopoverEditState;
