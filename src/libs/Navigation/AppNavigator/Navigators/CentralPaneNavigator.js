import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import _ from 'underscore';
import SCREENS from '../../../../SCREENS';
import ReportScreenWrapper from '../ReportScreenWrapper';
import getCurrentUrl from '../../currentUrl';
import styles from '../../../../styles/styles';
import FreezeWrapper from '../../FreezeWrapper';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

const commonOptions = {
    headerShown: false,
    title: 'New Expensify',

    // Prevent unnecessary scrolling
    cardStyle: styles.cardStyleNavigator,
};

function DummyScreen() {
    return null;
}

const iframeScreens = [
    SCREENS.HOME_OLDDOT,
    SCREENS.EXPENSES_OLDDOT,
    SCREENS.REPORTS_OLDDOT,
    SCREENS.INSIGHTS_OLDDOT,
    SCREENS.INDIVIDUAL_WORKSPACE_OLDDOT,
    SCREENS.GROUPS_WORKSPACES_OLDDOT,
    SCREENS.DOMAINS_OLDDOT,
    SCREENS.WORKSPACE_OLDDOT,
];

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
                {_.map(iframeScreens, (screen) => (
                    <Stack.Screen
                        key={screen}
                        name={screen}
                        component={DummyScreen}
                    />
                ))}
            </Stack.Navigator>
        </FreezeWrapper>
    );
}

export default CentralPaneNavigator;
