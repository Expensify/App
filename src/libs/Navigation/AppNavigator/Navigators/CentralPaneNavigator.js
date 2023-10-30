import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import _ from 'underscore';
import ReportScreenWrapper from '@libs/Navigation/AppNavigator/ReportScreenWrapper';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import styles from '@styles/styles';
import SCREENS from '@src/SCREENS';

const Stack = createStackNavigator();

const url = getCurrentUrl();
const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : undefined;

const commonOptions = {
    headerShown: false,

    // Prevent unnecessary scrolling
    cardStyle: styles.cardStyleNavigator,
};

// We use an empty component for iframe screens because we handle rendering them differently in the custom StackNavigator.
function EmptyComponent() {
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

    // Breadcrumb screens
    SCREENS.WORKSPACE_OVERVIEW_OLDDOT,
    SCREENS.WORKSPACE_EXPENSES_OLDDOT,
    SCREENS.WORKSPACE_REPORTS_OLDDOT,
    SCREENS.WORKSPACE_CONNECTIONS_OLDDOT,
    SCREENS.WORKSPACE_CATEGORIES_OLDDOT,
    SCREENS.WORKSPACE_TAGS_OLDDOT,
    SCREENS.WORKSPACE_TAX_OLDDOT,
    SCREENS.WORKSPACE_MEMBERS_OLDDOT,
    SCREENS.WORKSPACE_REIMBURSEMENT_OLDDOT,
    SCREENS.WORKSPACE_TRAVEL_OLDDOT,
    SCREENS.WORKSPACE_PER_DIEM_OLDDOT,
    SCREENS.WORKSPACE_EXPORT_FORMATS_OLDDOT,
    SCREENS.WORKSPACE_INVOICES_OLDDOT,
    SCREENS.WORKSPACE_PLAN_OLDDOT,

    SCREENS.DOMAIN_COMPANY_CARDS_OLDDOT,
    SCREENS.DOMAIN_ADMINS_OLDDOT,
    SCREENS.DOMAIN_MEMBERS_OLDDOT,
    SCREENS.DOMAIN_GROUPS_OLDDOT,
    SCREENS.DOMAIN_REPORTING_TOOLS_OLDDOT,
    SCREENS.DOMAIN_SAML_OLDDOT,
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
                        component={EmptyComponent}
                    />
                ))}
            </Stack.Navigator>
        </FreezeWrapper>
    );
}

export default CentralPaneNavigator;
