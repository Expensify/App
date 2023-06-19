import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';
import getCurrentUrl from '../../currentUrl';
import styles from '../../../../styles/styles';
import FreezeWrapper from '../../FreezeWrapper';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

function CentralPaneNavigator() {
    return (
        <FreezeWrapper>
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
        </FreezeWrapper>
    );
}

export default CentralPaneNavigator;
