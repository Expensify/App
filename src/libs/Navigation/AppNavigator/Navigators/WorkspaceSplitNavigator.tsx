import type {RouteProp} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import WorkspaceSidebar from '@components/Navigation/WorkspaceSidebar';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import {SidebarWidthContext} from '@libs/Navigation/AppNavigator/createSplitNavigator/SidebarSpacerWrapper';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type Screens = Partial<Record<keyof WorkspaceSplitNavigatorParamList, () => React.ComponentType>>;

const loadWorkspaceInitialPage = () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceInitialPage').default;
const loadEmptyComponent = () => require<ReactComponentModule>('@components/EmptyComponent').default;

const CENTRAL_PANE_WORKSPACE_SCREENS = {
    [SCREENS.WORKSPACE.PROFILE]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceOverviewPage').default,
    [SCREENS.WORKSPACE.WORKFLOWS]: () => require<ReactComponentModule>('../../../../pages/workspace/workflows/WorkspaceWorkflowsPage').default,
    [SCREENS.WORKSPACE.INVOICES]: () => require<ReactComponentModule>('../../../../pages/workspace/invoices/WorkspaceInvoicesPage').default,
    [SCREENS.WORKSPACE.MEMBERS]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceMembersPage').default,
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: () => require<ReactComponentModule>('../../../../pages/workspace/accounting/PolicyAccountingPage').default,
    [SCREENS.WORKSPACE.HR]: () => require<ReactComponentModule>('../../../../pages/workspace/hr/WorkspaceHRPage').default,
    [SCREENS.WORKSPACE.CATEGORIES]: () => require<ReactComponentModule>('../../../../pages/workspace/categories/WorkspaceCategoriesPage').default,
    [SCREENS.WORKSPACE.MORE_FEATURES]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceMoreFeaturesPage').default,
    [SCREENS.WORKSPACE.TAGS]: () => require<ReactComponentModule>('../../../../pages/workspace/tags/WorkspaceTagsPage').default,
    [SCREENS.WORKSPACE.TAXES]: () => require<ReactComponentModule>('../../../../pages/workspace/taxes/WorkspaceTaxesPage').default,
    [SCREENS.WORKSPACE.REPORTS]: () => require<ReactComponentModule>('../../../../pages/workspace/reports/WorkspaceReportsPage').default,
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: () => require<ReactComponentModule>('../../../../pages/workspace/expensifyCard/WorkspaceExpensifyCardPage').default,
    [SCREENS.WORKSPACE.COMPANY_CARDS]: () => require<ReactComponentModule>('../../../../pages/workspace/companyCards/WorkspaceCompanyCardsPage').default,
    [SCREENS.WORKSPACE.PER_DIEM]: () => require<ReactComponentModule>('../../../../pages/workspace/perDiem/WorkspacePerDiemPage').default,
    [SCREENS.WORKSPACE.RECEIPT_PARTNERS]: () => require<ReactComponentModule>('../../../../pages/workspace/receiptPartners/WorkspaceReceiptPartnersPage').default,
    [SCREENS.WORKSPACE.DISTANCE_RATES]: () => require<ReactComponentModule>('../../../../pages/workspace/distanceRates/PolicyDistanceRatesPage').default,
    [SCREENS.WORKSPACE.TRAVEL]: () => require<ReactComponentModule>('../../../../pages/workspace/travel/PolicyTravelPage').default,
    [SCREENS.WORKSPACE.RULES]: () => require<ReactComponentModule>('../../../../pages/workspace/rules/PolicyRulesPage').default,
    [SCREENS.WORKSPACE.TIME_TRACKING]: () => require<ReactComponentModule>('../../../../pages/workspace/timeTracking/WorkspaceTimeTrackingPage').default,
} satisfies Screens;

const Split = createSplitNavigator<WorkspaceSplitNavigatorParamList>();

function WorkspaceSplitNavigator({route}: PlatformStackScreenProps<WorkspaceNavigatorParamList, typeof NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // On wide, the sidebar lives OUTSIDE the navigator (see WorkspaceSidebar). Pass 0 so
    // the SidebarSpacerWrapper and sidebar card don't reserve / collide with that space —
    // the outside sidebar's animated width is what shifts the central content.
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions(shouldUseNarrowLayout ? undefined : 0);
    const styles = useThemeStyles();

    // WorkspaceSplitNavigator's route.params has the nested shape
    // `{screen, params: {policyID, backTo}}` when navigation targets a specific central
    // screen, or `{policyID, backTo}` directly when landing on the workspace root. Flatten
    // both into a synthetic route the outside WorkspaceInitialPage can consume — it
    // expects `route.params.policyID` (used by withPolicyAndFullscreenLoading) and
    // `route.params.backTo` (used by the header back button).
    const sidebarRoute: RouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL> | undefined = useMemo(() => {
        const rawParams = (route.params ?? {}) as {
            screen?: string;
            params?: WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];
        } & WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];
        const params = rawParams.params ?? rawParams;
        if (!params.policyID) {
            return undefined;
        }
        return {
            key: `${route.key}-sidebar`,
            name: SCREENS.WORKSPACE.INITIAL,
            params: {policyID: params.policyID, backTo: params.backTo},
        };
    }, [route.key, route.params]);

    return (
        <FocusTrapForScreens>
            <View style={shouldUseNarrowLayout ? styles.flex1 : [styles.flex1, styles.flexRow]}>
                {!shouldUseNarrowLayout && !!sidebarRoute && <WorkspaceSidebar route={sidebarRoute} />}
                <View style={styles.flex1}>
                    <SidebarWidthContext.Provider value={shouldUseNarrowLayout ? variables.sideBarWithLHBWidth : 0}>
                        <Split.Navigator
                            persistentScreens={[SCREENS.WORKSPACE.INITIAL]}
                            sidebarScreen={SCREENS.WORKSPACE.INITIAL}
                            defaultCentralScreen={SCREENS.WORKSPACE.PROFILE}
                            parentRoute={route}
                            screenOptions={splitNavigatorScreenOptions.centralScreen}
                        >
                            <Split.Screen
                                name={SCREENS.WORKSPACE.INITIAL}
                                getComponent={shouldUseNarrowLayout ? loadWorkspaceInitialPage : loadEmptyComponent}
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
                    </SidebarWidthContext.Provider>
                </View>
            </View>
        </FocusTrapForScreens>
    );
}

export default WorkspaceSplitNavigator;
