import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import Modal from '@components/Modal';
import HelpContent from '@components/SidePane/HelpComponents/HelpContent';
import CONST from '@src/CONST';
import type HelpProps from './types';

function Help({shouldHideSidePane, closeSidePane}: HelpProps) {
    // SidePane isn't a native screen, this handles the back button press on Android
    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                closeSidePane();
                // Return true to indicate that the back button press is handled here
                return true;
            });

            return () => backHandler.remove();
        }, [closeSidePane]),
    );

    return (
        <Modal
            onClose={() => closeSidePane()}
            isVisible={!shouldHideSidePane}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            shouldHandleNavigationBack
        >
            <HelpContent closeSidePane={closeSidePane} />
        </Modal>
    );
}

Help.displayName = 'Help';

export default Help;
