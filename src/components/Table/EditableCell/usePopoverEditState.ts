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
    /** Padding between the anchor and the popover */
    padding?: number;
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
function usePopoverEditState({padding = 8}: UsePopoverEditStateOptions = {}) {
    const popoverHeight = CONST.POPOVER_DATE_MAX_HEIGHT;
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
                horizontal: x + width,
                vertical: y + (wouldExceedBottom ? 0 : height + padding),
            });
            setIsPopoverVisible(true);
        });
    }, [windowHeight, popoverHeight, padding]);

    const startEditing = useCallback(() => {
        setIsEditing(true);
        // Defer opening until after interactions so the anchor is measured correctly
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            openPopover();
        });
    }, [openPopover]);

    const closePopover = useCallback(() => {
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
        closePopover,
    };
}

export default usePopoverEditState;
