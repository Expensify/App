import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ReportScreenWrapper from '@libs/Navigation/AppNavigator/ReportScreenWrapper';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import styles from '@styles/styles';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

function CentralPaneNavigator() {
    return (
        <FreezeWrapper>
            <Stack.Navigator>
                <Stack.Screen
                    name={SCREENS.REPORT}
                    // We do it this way to avoid adding the url params to url
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
        </FreezeWrapper>
    );
}

export default CentralPaneNavigator;
