import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import Modal from '@components/Modal';
import HelpContent from '@components/SidePanel/HelpComponents/HelpContent';
import CONST from '@src/CONST';
import type HelpProps from './types';

function Help({shouldHideSidePanel, closeSidePanel}: HelpProps) {
    // SidePanel isn't a native screen, this handles the back button press on Android
    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                closeSidePanel();
                // Return true to indicate that the back button press is handled here
                return true;
            });

            return () => backHandler.remove();
        }, [closeSidePanel]),
    );

    return (
        <Modal
            onClose={() => closeSidePanel()}
            isVisible={!shouldHideSidePanel}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            shouldHandleNavigationBack
        >
            <HelpContent closeSidePanel={closeSidePanel} />
        </Modal>
    );
}

Help.displayName = 'Help';

export default Help;
