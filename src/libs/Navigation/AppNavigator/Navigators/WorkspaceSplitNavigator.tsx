import React, {useEffect} from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import {workspaceSplitsWithoutEnteringAnimation} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type Screens = Partial<Record<keyof WorkspaceSplitNavigatorParamList, () => React.ComponentType>>;

const loadWorkspaceInitialPage = () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceInitialPage').default;

const CENTRAL_PANE_WORKSPACE_SCREENS = {
    [SCREENS.WORKSPACE.PROFILE]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceProfilePage').default,
    [SCREENS.WORKSPACE.WORKFLOWS]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/WorkspaceWorkflowsPage').default,
    [SCREENS.WORKSPACE.INVOICES]: () => require<ReactComponentModule>('../../../../pages/workspace/invoices/WorkspaceInvoicesPage').default,
    [SCREENS.WORKSPACE.MEMBERS]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceMembersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/PolicyAccountingPage').default,
    [SCREENS.WORKSPACE.CATEGORIES]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default,
    [SCREENS.WORKSPACE.MORE_FEATURES]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceMoreFeaturesPage').default,
    [SCREENS.WORKSPACE.TAGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceTagsPage').default,
    [SCREENS.WORKSPACE.TAXES]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxesPage').default,
    [SCREENS.WORKSPACE.REPORT_FIELDS]: () => require<ReactComponentModule>('../../../../pages/workspace/reportFields/WorkspaceReportFieldsPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardsPage').default,
    [SCREENS.WORKSPACE.PER_DIEM]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/WorkspacePerDiemPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATES]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRatesPage').default,
    [SCREENS.WORKSPACE.RULES]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/PolicyRulesPage').default,
} satisfies Screens;

const Split = createSplitNavigator<WorkspaceSplitNavigatorParamList>();

function WorkspaceSplitNavigator({route, navigation}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR>) {
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionEnd', () => {
            // We want to call this function only once.
            unsubscribe();

            // If we open this screen from a different tab, then it won't have animation.
            if (!workspaceSplitsWithoutEnteringAnimation.has(route.key)) {
                return;
            }

            // We want to set animation after mounting so it will animate on going UP to the settings split.
            navigation.setOptions({animation: Animations.SLIDE_FROM_RIGHT});
        });

        return unsubscribe;
    }, [navigation, route.key]);

    return (
        <FocusTrapForScreens>
            <Split.Navigator
                sidebarScreen={SCREENS.WORKSPACE.INITIAL}
                defaultCentralScreen={SCREENS.WORKSPACE.PROFILE}
                parentRoute={route}
                screenOptions={splitNavigatorScreenOptions.centralScreen}
            >
                <Split.Screen
                    name={SCREENS.WORKSPACE.INITIAL}
                    getComponent={loadWorkspaceInitialPage}
                    options={splitNavigatorScreenOptions.sidebarScreen}
                />
                {Object.entries(CENTRAL_PANE_WORKSPACE_SCREENS).map(([screenName, componentGetter]) => (
                    <Split.Screen
                        key={screenName}
                        name={screenName as keyof Screens}
                        getComponent={componentGetter}
                    />
                ))}
            </Split.Navigator>
        </FocusTrapForScreens>
    );
}

WorkspaceSplitNavigator.displayName = 'WorkspaceSplitNavigator';

export {CENTRAL_PANE_WORKSPACE_SCREENS};
export default WorkspaceSplitNavigator;
