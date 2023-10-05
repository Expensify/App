import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';
import getCurrentUrl from '../../currentUrl';
import styles from '../../../../styles/styles';
import FreezeWrapper from '../../FreezeWrapper';
import IframeTest from '../IframeTest';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

const commonOptions = {
    headerShown: false,
    title: 'New Expensify',

    // Prevent unnecessary scrolling
    cardStyle: styles.cardStyleNavigator,
};

function CentralPaneNavigator() {
    return (
        <FreezeWrapper>
            <Stack.Navigator screenOptions={commonOptions}>
                <Stack.Screen
                    name={SCREENS.REPORT}
                    // We do it this way to avoid adding the url params to url
                    initialParams={{openOnAdminRoom: openOnAdminRoom ? 'true' : undefined}}
                    component={ReportScreenWrapper}
                />

                {/* Iframe screens */}
                <Stack.Screen
                    name={SCREENS.HOME_OLDDOT}
                    component={IframeTest}
                />
                <Stack.Screen
                    name={SCREENS.EXPENSES_OLDDOT}
                    component={IframeTest}
                />
                <Stack.Screen
                    name={SCREENS.REPORTS_OLDDOT}
                    component={IframeTest}
                />
                <Stack.Screen
                    name={SCREENS.INSIGHTS_OLDDOT}
                    component={IframeTest}
                />
                <Stack.Screen
                    name={SCREENS.INDIVIDUAL_WORKSPACES_OLDDOT}
                    component={IframeTest}
                />
                <Stack.Screen
                    name={SCREENS.GROUPS_WORKSPACES_OLDDOT}
                    component={IframeTest}
                />
                <Stack.Screen
                    name={SCREENS.CARDS_AND_DOMAINS_OLDDOT}
                    component={IframeTest}
                />
            </Stack.Navigator>
        </FreezeWrapper>
    );
}

export default CentralPaneNavigator;
