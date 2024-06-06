import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import createCustomFullScreenNavigator from '@libs/Navigation/AppNavigator/createCustomFullScreenNavigator';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type RequireReactComponent from '@src/types/utils/RequireReactComponent';

const loadWorkspaceInitialPage = () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceInitialPage').default;

const RootStack = createCustomFullScreenNavigator();

type Screens = Partial<Record<keyof FullScreenNavigatorParamList, () => React.ComponentType>>;

const centralPaneWorkspaceScreens = {
    [SCREENS.WORKSPACE.PROFILE]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceProfilePage').default,
    [SCREENS.WORKSPACE.CARD]: () => require<RequireReactComponent>('../../../../pages/workspace/card/WorkspaceCardPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS]: () => require<RequireReactComponent>('../../../../pages/workspace/workflows/WorkspaceWorkflowsPage').default,
    [SCREENS.WORKSPACE.REIMBURSE]: () => require<RequireReactComponent>('../../../../pages/workspace/reimburse/WorkspaceReimbursePage').default,
    [SCREENS.WORKSPACE.BILLS]: () => require<RequireReactComponent>('../../../../pages/workspace/bills/WorkspaceBillsPage').default,
    [SCREENS.WORKSPACE.INVOICES]: () => require<RequireReactComponent>('../../../../pages/workspace/invoices/WorkspaceInvoicesPage').default,
    [SCREENS.WORKSPACE.TRAVEL]: () => require<RequireReactComponent>('../../../../pages/workspace/travel/WorkspaceTravelPage').default,
    [SCREENS.WORKSPACE.MEMBERS]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceMembersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require<RequireReactComponent>('../../../../pages/workspace/accounting/PolicyAccountingPage').default,
    [SCREENS.WORKSPACE.CATEGORIES]: () => require<RequireReactComponent>('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default,
    [SCREENS.WORKSPACE.MORE_FEATURES]: () => require<RequireReactComponent>('../../../../pages/workspace/WorkspaceMoreFeaturesPage').default,
    [SCREENS.WORKSPACE.TAGS]: () => require<RequireReactComponent>('../../../../pages/workspace/tags/WorkspaceTagsPage').default,
    [SCREENS.WORKSPACE.TAXES]: () => require<RequireReactComponent>('../../../../pages/workspace/taxes/WorkspaceTaxesPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATES]: () => require<RequireReactComponent>('../../../../pages/workspace/distanceRates/PolicyDistanceRatesPage').default,
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
