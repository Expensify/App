import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';
import getCurrentUrl from '../../currentUrl';
import styles from '../../../../styles/styles';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

function CentralPaneNavigator() {
    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    const [screenIndex, setScreenIndex] = useState(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    useEffect(() => {
        if (screenIndex !== null) {
            return;
        }
        setScreenIndex(navigation.getState().index);
    }, [navigation, screenIndex]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            if (navigation.getState().index - screenIndex > 2) {
                setIsScreenBlurred(true);
            } else {
                setIsScreenBlurred(false);
            }
        });
        return () => unsubscribe();
    }, [isFocused, isScreenBlurred, navigation, screenIndex]);

    if (!isFocused && isScreenBlurred) {
        return null;
    }

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={SCREENS.REPORT}
                // We do it this way to avoid adding this to url
                initialParams={{openOnAdminRoom: openOnAdminRoom ? 'true' : undefined}}
                options={{
                    headerShown: false,
                    title: 'New Expensify',

                    // Prevent unnecessary scrolling
                    cardStyle: styles.cardStyleNavigator,
                }}
                component={ReportScreenWrapper}
            />
        </Stack.Navigator>
    );
}

export default CentralPaneNavigator;
