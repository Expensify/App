import React from 'react';
import Modal from '@components/Modal';
import CONST from '@src/CONST';
import HelpContent from './HelpContent';
import type HelpProps from './types';

function Help({isPaneHidden, closeSidePane}: HelpProps) {
    return (
        <Modal
            onClose={() => closeSidePane()}
            isVisible={!isPaneHidden}
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
