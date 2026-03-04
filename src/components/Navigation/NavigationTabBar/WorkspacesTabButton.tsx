import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {PressableWithFeedback} from '@components/Pressable';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';
import navigateToWorkspacesPage, {getWorkspaceNavigationRouteState} from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import type {DomainSplitNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type WorkspacesTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function WorkspacesTabButton({selectedTab, isWideLayout}: WorkspacesTabButtonProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Buildings']);
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const navigationState = useNavigationState(findFocusedRoute);
    const {lastWorkspacesTabNavigatorRoute, workspacesTabState} = getWorkspaceNavigationRouteState();
    const params = workspacesTabState?.routes?.at(0)?.params as
        | WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL]
        | DomainSplitNavigatorParamList[typeof SCREENS.DOMAIN.INITIAL];

    const paramsPolicyID = params && 'policyID' in params ? params.policyID : undefined;
    const paramsDomainAccountID = params && 'domainAccountID' in params ? params.domainAccountID : undefined;

    const lastViewedPolicySelector = (policies: OnyxCollection<Policy>) => {
        if (!lastWorkspacesTabNavigatorRoute || lastWorkspacesTabNavigatorRoute.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || !paramsPolicyID) {
            return undefined;
        }
        return policies?.[`${ONYXKEYS.COLLECTION.POLICY}${paramsPolicyID}`];
    };
    const [lastViewedPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: lastViewedPolicySelector}, [navigationState]);

    const lastViewedDomainSelector = (domains: OnyxCollection<Domain>) => {
        if (!lastWorkspacesTabNavigatorRoute || lastWorkspacesTabNavigatorRoute.name !== NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR || !paramsDomainAccountID) {
            return undefined;
        }
        return domains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${paramsDomainAccountID}`];
    };
    const [lastViewedDomain] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {selector: lastViewedDomainSelector}, [navigationState]);

    const navigateToWorkspaces = () => {
        navigateToWorkspacesPage({shouldUseNarrowLayout, currentUserLogin, policy: lastViewedPolicy, domain: lastViewedDomain});
    };

    const workspacesAccessibilityState = {selected: selectedTab === NAVIGATION_TABS.WORKSPACES};
    const workspacesStatusIndicatorColor = workspacesTabIndicatorStatus ? workspacesTabIndicatorColor : undefined;

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={navigateToWorkspaces}
                role={CONST.ROLE.TAB}
                accessibilityLabel={`${translate('common.workspacesTabTitle')}${workspacesTabIndicatorStatus ? `. ${translate('common.yourReviewIsRequired')}` : ''}`}
                accessibilityState={workspacesAccessibilityState}
                style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
            >
                {({hovered}) => (
                    <TabBarItem
                        icon={expensifyIcons.Buildings}
                        label={translate('common.workspacesTabTitle')}
                        isSelected={selectedTab === NAVIGATION_TABS.WORKSPACES}
                        isHovered={hovered}
                        statusIndicatorColor={workspacesStatusIndicatorColor}
                        numberOfLines={preferredLocale === CONST.LOCALES.DE || preferredLocale === CONST.LOCALES.NL ? 1 : 2}
                    />
                )}
            </PressableWithFeedback>
        );
    }

    return (
        <PressableWithFeedback
            onPress={navigateToWorkspaces}
            role={CONST.ROLE.TAB}
            accessibilityLabel={`${translate('common.workspacesTabTitle')}${workspacesTabIndicatorStatus ? `. ${translate('common.yourReviewIsRequired')}` : ''}`}
            accessibilityState={workspacesAccessibilityState}
            wrapperStyle={styles.flex1}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
        >
            <TabBarItem
                icon={expensifyIcons.Buildings}
                label={translate('common.workspacesTabTitle')}
                isSelected={selectedTab === NAVIGATION_TABS.WORKSPACES}
                statusIndicatorColor={workspacesStatusIndicatorColor}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default WorkspacesTabButton;
