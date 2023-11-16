import {createStackNavigator} from '@react-navigation/stack';
import lodashGet from 'lodash/get';
import React from 'react';
import ReportScreenWrapper from '@libs/Navigation/AppNavigator/ReportScreenWrapper';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import styles from '@styles/styles';
import * as Report from '@userActions/Report';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

function BaseCentralPaneNavigator() {
    return (
        <Stack.Navigator
            screenListeners={{
                state: (e) => {
                    const reportID = lodashGet(e, 'data.state.routes[0].params.reportID', '');
                    if (reportID) {
                        Report.updateLastVisitTime(reportID);
                    }
                },
            }}
        >
            <Stack.Screen
                name={SCREENS.REPORT}
                // We do it this way to avoid adding the url params to url
                initialParams={{openOnAdminRoom: openOnAdminRoom === 'true' || undefined}}
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

export default BaseCentralPaneNavigator;
