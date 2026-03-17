import React from 'react';
import Modal from '@components/Modal';
import CONST from '@src/CONST';
import type SidePanelModalProps from './types';

function SidePanelModal({shouldHideSidePanel, closeSidePanel, children}: SidePanelModalProps) {
    return (
        <Modal
            onClose={() => closeSidePanel()}
            isVisible={!shouldHideSidePanel}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            shouldHandleNavigationBack
            swipeDirection={CONST.SWIPE_DIRECTION.RIGHT}
        >
            {children}
        </Modal>
    );
}

export default SidePanelModal;
