import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SCREENS from '../../../../SCREENS';

const Stack = createStackNavigator();

function CentralPaneNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name={SCREENS.REPORT}
                options={{
                    headerShown: false,
                    title: 'New Expensify',

                    // prevent unnecessary scrolling
                    cardStyle: {
                        overflow: 'hidden',
                        height: '100%',
                    },
                }}
                getComponent={() => {
                    const ReportScreen = require('../../../../pages/home/ReportScreen').default;
                    return ReportScreen;
                }}
            />
        </Stack.Navigator>
    );
}

export default CentralPaneNavigator;
