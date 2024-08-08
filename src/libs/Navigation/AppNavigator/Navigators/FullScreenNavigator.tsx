import React from 'react';
import createSplitStackNavigator from '@libs/Navigation/AppNavigator/createSplitStackNavigator';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadWorkspaceInitialPage = () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceInitialPage').default;

const RootStack = createSplitStackNavigator<FullScreenNavigatorParamList>();

type Screens = Partial<Record<keyof FullScreenNavigatorParamList, () => React.ComponentType>>;

const CENTRAL_PANE_WORKSPACE_SCREENS = {
    [SCREENS.WORKSPACE.PROFILE]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceProfilePage').default,
    [SCREENS.WORKSPACE.CARD]: () => require<ReactComponentModule>('../../../../pages/workspace/card/WorkspaceCardPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/WorkspaceWorkflowsPage').default,
    [SCREENS.WORKSPACE.REIMBURSE]: () => require<ReactComponentModule>('../../../../pages/workspace/reimburse/WorkspaceReimbursePage').default,
    [SCREENS.WORKSPACE.BILLS]: () => require<ReactComponentModule>('../../../../pages/workspace/bills/WorkspaceBillsPage').default,
    [SCREENS.WORKSPACE.INVOICES]: () => require<ReactComponentModule>('../../../../pages/workspace/invoices/WorkspaceInvoicesPage').default,
    [SCREENS.WORKSPACE.TRAVEL]: () => require<ReactComponentModule>('../../../../pages/workspace/travel/WorkspaceTravelPage').default,
    [SCREENS.WORKSPACE.MEMBERS]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceMembersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/PolicyAccountingPage').default,
    [SCREENS.WORKSPACE.CATEGORIES]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default,
    [SCREENS.WORKSPACE.MORE_FEATURES]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceMoreFeaturesPage').default,
    [SCREENS.WORKSPACE.TAGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceTagsPage').default,
    [SCREENS.WORKSPACE.TAXES]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxesPage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS]: () => require<ReactComponentModule>('../../../../pages/workspace/reportFields/WorkspaceReportFieldsPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATES]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRatesPage').default,
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
