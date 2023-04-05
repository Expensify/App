import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';

const Stack = createStackNavigator();

function CentralPaneNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name={SCREENS.REPORT}
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
