import React, {useCallback, useRef} from 'react';
import FloatingActionButtonAndPopover from '@pages/inbox/sidebar/FloatingActionButtonAndPopover';
import type FloatingActionButtonPopoverMenuRef from './types';

function NavigationTabBarFloatingActionButton() {
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
            onShowCreateMenu={createDragoverListener}
            onHideCreateMenu={removeDragoverListener}
        />
    );
}

export default NavigationTabBarFloatingActionButton;
