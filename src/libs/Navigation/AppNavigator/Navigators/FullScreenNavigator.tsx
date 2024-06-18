import React from 'react';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const loadWorkspaceInitialPage = () => require('../../../../pages/workspace/WorkspaceInitialPage').default as React.ComponentType;

const RootStack = createSplitNavigator<FullScreenNavigatorParamList>();

type Screens = Partial<Record<keyof FullScreenNavigatorParamList, () => React.ComponentType>>;

const CENTRAL_PANE_WORKSPACE_SCREENS = {
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
    return (
        <RootStack.Navigator
            sidebarScreen={SCREENS.WORKSPACE.INITIAL}
            initialCentralPaneScreen={SCREENS.WORKSPACE.PROFILE}
        >
            <RootStack.Screen
                name={SCREENS.WORKSPACE.INITIAL}
                getComponent={loadWorkspaceInitialPage}
            />
            {Object.entries(CENTRAL_PANE_WORKSPACE_SCREENS).map(([screenName, componentGetter]) => (
                <RootStack.Screen
                    key={screenName}
                    name={screenName as keyof Screens}
                    getComponent={componentGetter}
                />
            ))}
        </RootStack.Navigator>
    );
}

FullScreenNavigator.displayName = 'FullScreenNavigator';

export {CENTRAL_PANE_WORKSPACE_SCREENS};
export default FullScreenNavigator;
