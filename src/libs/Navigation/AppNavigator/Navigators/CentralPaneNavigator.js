import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';
import getCurrentUrl from '../../currentUrl';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

function CentralPaneNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name={SCREENS.REPORT}

                // we do it this way to avoid adding this to url
                initialParams={{openOnAdminRoom: openOnAdminRoom ? 'true' : undefined}}
                options={{
                    headerShown: false,
                    title: 'New Expensify',

                    // Prevent unnecessary scrolling
                    cardStyle: {
                        overflow: 'hidden',
                        height: '100%',
                    },
                }}
                component={ReportScreenWrapper}
            />
        </Stack.Navigator>
    );
}

export default CentralPaneNavigator;
