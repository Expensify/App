import React, {useCallback, useRef} from 'react';
import FloatingActionButtonAndPopover from '@pages/home/sidebar/FloatingActionButtonAndPopover';
import type FloatingActionButtonPopoverMenuRef from './types';

type BottomTabBarFloatingActionButtonProps = {
    isTooltipAllowed: boolean;
};

function BottomTabBarFloatingActionButton({isTooltipAllowed}: BottomTabBarFloatingActionButtonProps) {
    const popoverModal = useRef<FloatingActionButtonPopoverMenuRef>(null);

    /**
     * Method to hide popover when dragover.
     */
    const hidePopoverOnDragOver = useCallback(() => {
        if (!popoverModal.current) {
            return;
        }
        popoverModal.current.hideCreateMenu();
    }, []);

    /**
     * Method create event listener
     */
    const createDragoverListener = () => {
        document.addEventListener('dragover', hidePopoverOnDragOver);
    };

    /**
     * Method remove event listener.
     */
    const removeDragoverListener = () => {
        document.removeEventListener('dragover', hidePopoverOnDragOver);
    };

    return (
        <FloatingActionButtonAndPopover
            ref={popoverModal}
            isTooltipAllowed={isTooltipAllowed}
            onShowCreateMenu={createDragoverListener}
            onHideCreateMenu={removeDragoverListener}
        />
    );
}

export default BottomTabBarFloatingActionButton;
