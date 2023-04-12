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
                options={{
                    headerShown: false,
                    title: 'New Expensify',

                    // Prevent unnecessary scrolling
                    cardStyle: {
                        overflow: 'hidden',
                        height: '100%',
                    },
                }}
                // eslint-disable-next-line react/jsx-props-no-spreading
                component={props => <ReportScreenWrapper openOnAdminRoom={openOnAdminRoom === 'true'} {...props} />}
            />
        </Stack.Navigator>
    );
}

export default CentralPaneNavigator;
