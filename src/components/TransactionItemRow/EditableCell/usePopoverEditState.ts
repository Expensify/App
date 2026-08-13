import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';

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
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function usePopoverEditStateImpl({
    canEdit,
    value,
    onSave,
    isEqual,
    popoverHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
    padding = CONST.MODAL.POPOVER_MENU_PADDING,
    anchorEdge = CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
}: UsePopoverEditStateOptions) {
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
 *   - Overflow detection (inverts when too close to bottom)
 *   - Adaptive height calculation (shrinks popover when space is limited)
 *   - Auto-open after layout via InteractionManager
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
