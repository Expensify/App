import {useCallback, useRef, useState} from 'react';
import type {View} from 'react-native';
import {InteractionManager} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type PopoverPosition = {
    horizontal: number;
    vertical: number;
};

type UsePopoverEditStateOptions = {
    /** Height of the popover content (used for overflow detection). Defaults to CONST.POPOVER_DATE_MAX_HEIGHT */
    popoverHeight?: number;

    /** Padding between the anchor and the popover */
    padding?: number;

    /**
     * Which horizontal edge of the anchor to use as the popover's x-origin.
     * 'right' (default) = x + width (right edge of anchor)
     * 'left' = x (left edge of anchor)
     */
    anchorEdge?: 'left' | 'right';
};

/**
 * Hook for managing popover-based editing state (date picker, category picker, etc.).
 *
 * Handles:
 *   - Anchor ref for popover positioning
 *   - measureInWindow-based position calculation
 *   - Overflow detection (inverts when too close to bottom)
 *   - Auto-open after layout via InteractionManager
 *   - isEditing + isPopoverVisible toggling
 */
function usePopoverEditState({popoverHeight = CONST.POPOVER_DATE_MAX_HEIGHT, padding = 8, anchorEdge = 'right'}: UsePopoverEditStateOptions = {}) {
    const {windowHeight} = useWindowDimensions();
    const anchorRef = useRef<View>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({horizontal: 0, vertical: 0});
    const [isInverted, setIsInverted] = useState(false);

    const openPopover = useCallback(() => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            const wouldExceedBottom = y + popoverHeight + padding > windowHeight;
            setIsInverted(wouldExceedBottom);
            setPopoverPosition({
                horizontal: anchorEdge === 'left' ? x : x + width,
                vertical: y + (wouldExceedBottom ? 0 : height + padding),
            });
            setIsPopoverVisible(true);
        });
    }, [windowHeight, popoverHeight, padding, anchorEdge]);

    const startEditing = useCallback(() => {
        setIsEditing(true);
        // Defer opening until after interactions so the anchor is measured correctly
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            openPopover();
        });
    }, [openPopover]);

    const cancelEditing = useCallback(() => {
        setIsPopoverVisible(false);
        setIsEditing(false);
    }, []);

    return {
        isEditing,
        anchorRef,
        isPopoverVisible,
        popoverPosition,
        isInverted,
        startEditing,
        cancelEditing,
    };
}

export default usePopoverEditState;
