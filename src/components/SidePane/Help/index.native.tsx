import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {BackHandler} from 'react-native';
import useSidePane from '@hooks/useSidePane';
import HelpContent from './HelpContent';

function Help() {
    const {closeSidePane} = useSidePane();

    // To block android native back button behavior
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

    return <HelpContent />;
}

Help.displayName = 'Help';

export default Help;
