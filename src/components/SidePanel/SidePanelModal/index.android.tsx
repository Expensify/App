import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {BackHandler} from 'react-native';
import Modal from '@components/Modal';
import CONST from '@src/CONST';
import type SidePanelModalProps from './types';

function SidePanelModal({shouldHideSidePanel, closeSidePanel, children}: SidePanelModalProps) {
    // SidePanel isn't a native screen, this handles the back button press on Android
    useFocusEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            closeSidePanel();
            // Return true to indicate that the back button press is handled here
            return true;
        });

        return () => backHandler.remove();
    });

    return (
        <Modal
            onClose={() => closeSidePanel()}
            isVisible={!shouldHideSidePanel}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            shouldHandleNavigationBack
        >
            {children}
        </Modal>
    );
}

export default SidePanelModal;
