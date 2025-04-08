import React from 'react';
import Modal from '@components/Modal';
import HelpContent from '@components/SidePanel/HelpComponents/HelpContent';
import CONST from '@src/CONST';
import type HelpProps from './types';

function Help({shouldHideSidePanel, closeSidePanel}: HelpProps) {
    return (
        <Modal
            onClose={() => closeSidePanel()}
            isVisible={!shouldHideSidePanel}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            shouldHandleNavigationBack
            propagateSwipe
            swipeDirection={CONST.SWIPE_DIRECTION.RIGHT}
        >
            <HelpContent closeSidePanel={closeSidePanel} />
        </Modal>
    );
}

Help.displayName = 'Help';
export default Help;
