import React from 'react';
import Modal from '@components/Modal';
import HelpContent from '@components/SidePane/HelpComponents/HelpContent';
import CONST from '@src/CONST';
import type HelpProps from './types';

function Help({shouldHideSidePane, closeSidePane}: HelpProps) {
    return (
        <Modal
            onClose={() => closeSidePane()}
            isVisible={!shouldHideSidePane}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            shouldHandleNavigationBack
            propagateSwipe
            swipeDirection={CONST.SWIPE_DIRECTION.RIGHT}
        >
            <HelpContent closeSidePane={closeSidePane} />
        </Modal>
    );
}

Help.displayName = 'Help';
export default Help;
