import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useEffect, useRef, useState} from 'react';

import type {InlineEditSaveResult} from './types';

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
    onSave?: (value: unknown) => InlineEditSaveResult;

    /** Custom equality function. If not provided, Object.is is used. */
    isEqual?: (newValue: unknown, originalValue: unknown) => boolean;

    /** Preferred popover height. Shrunk when the chosen side has less room. */
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
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({horizontal: 0, vertical: 0});
    const [shouldOpenAbove, setShouldOpenAbove] = useState(false);
    const [popoverHeight, setPopoverHeight] = useState(preferredPopoverHeight);

    const openPopover = () => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            // Reserve `padding` next to the anchor and next to the window edge.
            const spaceBelow = windowHeight - (y + height + padding) - padding;
            const spaceAbove = y - padding - padding;

            const shouldOpenPopoverAbove = spaceBelow < preferredPopoverHeight && spaceAbove > spaceBelow;
            const availableSpace = shouldOpenPopoverAbove ? spaceAbove : spaceBelow;

            setShouldOpenAbove(shouldOpenPopoverAbove);
            setPopoverHeight(Math.min(preferredPopoverHeight, Math.max(availableSpace, CONST.POPOVER_DROPDOWN_MIN_USABLE_HEIGHT)));
            setPopoverPosition({
                horizontal: anchorEdge === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT ? x : x + width,
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
    onSave?: (value: T) => InlineEditSaveResult;
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
 *   - Side selection (opens above the anchor when the popover can't fit below it)
 *   - Adaptive height calculation (shrinks popover when space is limited)
 *
 * Callers should pass `shouldSwitchPositionIfOverflow={false}` to the popover, since flipping the chosen side would cover the anchor.
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
