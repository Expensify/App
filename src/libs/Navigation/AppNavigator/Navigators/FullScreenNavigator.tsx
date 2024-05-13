import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import createCustomFullScreenNavigator from '@libs/Navigation/AppNavigator/createCustomFullScreenNavigator';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const loadWorkspaceInitialPage = () => require('../../../../pages/workspace/WorkspaceInitialPage').default as React.ComponentType;

const RootStack = createCustomFullScreenNavigator();

type Screens = Partial<Record<keyof FullScreenNavigatorParamList, () => React.ComponentType>>;

const centralPaneWorkspaceScreens = {
    [SCREENS.WORKSPACE.PROFILE]: () => require('../../../../pages/workspace/WorkspaceProfilePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CARD]: () => require('../../../../pages/workspace/card/WorkspaceCardPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.WORKFLOWS]: () => require('../../../../pages/workspace/workflows/WorkspaceWorkflowsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.REIMBURSE]: () => require('../../../../pages/workspace/reimburse/WorkspaceReimbursePage').default as React.ComponentType,
    [SCREENS.WORKSPACE.BILLS]: () => require('../../../../pages/workspace/bills/WorkspaceBillsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.INVOICES]: () => require('../../../../pages/workspace/invoices/WorkspaceInvoicesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TRAVEL]: () => require('../../../../pages/workspace/travel/WorkspaceTravelPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.MEMBERS]: () => require('../../../../pages/workspace/WorkspaceMembersPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require('../../../../pages/workspace/accounting/PolicyAccountingPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.CATEGORIES]: () => require('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.MORE_FEATURES]: () => require('../../../../pages/workspace/WorkspaceMoreFeaturesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAGS]: () => require('../../../../pages/workspace/tags/WorkspaceTagsPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.TAXES]: () => require('../../../../pages/workspace/taxes/WorkspaceTaxesPage').default as React.ComponentType,
    [SCREENS.WORKSPACE.DISTANCE_RATES]: () => require('../../../../pages/workspace/distanceRates/PolicyDistanceRatesPage').default as React.ComponentType,
} satisfies Screens;

function FullScreenNavigator() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = getRootNavigatorScreenOptions(isSmallScreenWidth, styles, StyleUtils);

    return (
        <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
            <RootStack.Navigator screenOptions={screenOptions.centralPaneNavigator}>
                <RootStack.Screen
                    name={SCREENS.WORKSPACE.INITIAL}
                    options={screenOptions.homeScreen}
                    getComponent={loadWorkspaceInitialPage}
                />
                {Object.entries(centralPaneWorkspaceScreens).map(([screenName, componentGetter]) => (
                    <RootStack.Screen
                        key={screenName}
                        name={screenName as keyof Screens}
                        getComponent={componentGetter}
                    />
                ))}
            </RootStack.Navigator>
        </View>
    );
}

FullScreenNavigator.displayName = 'FullScreenNavigator';

export default FullScreenNavigator;
