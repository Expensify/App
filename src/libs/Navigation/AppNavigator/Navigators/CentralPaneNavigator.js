import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Freeze} from 'react-freeze';
import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';
import getCurrentUrl from '../../currentUrl';
import styles from '../../../../styles/styles';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

function CentralPaneNavigator() {
    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    // we need to know the screen index to determine if the screen can be frozen
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
            // if the screen is more than 1 screen away from the current screen, freeze it,
            // we don't want to freeze the screen if it's the previous screen because the freeze placeholder
            // would be visible at the beginning of the back animation then
            if (navigation.getState().index - screenIndex > 1) {
                setIsScreenBlurred(true);
            } else {
                setIsScreenBlurred(false);
            }
        });
        return () => unsubscribe();
    }, [isFocused, isScreenBlurred, navigation, screenIndex]);

    return (
        <Freeze freeze={!isFocused && isScreenBlurred}>
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
        </Freeze>
    );
}

export default CentralPaneNavigator;
