import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';
import navigateToWorkspacesPage, {getWorkspaceNavigationRouteState} from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import type {DomainSplitNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import getTabIconFill from './getTabIconFill';
import NAVIGATION_TABS from './NAVIGATION_TABS';

type WorkspacesTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function WorkspacesTabButton({selectedTab, isWideLayout}: WorkspacesTabButtonProps) {
    const theme = useTheme();
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

    const lastViewedPolicySelector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            if (!lastWorkspacesTabNavigatorRoute || lastWorkspacesTabNavigatorRoute.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || !paramsPolicyID) {
                return undefined;
            }

            return policies?.[`${ONYXKEYS.COLLECTION.POLICY}${paramsPolicyID}`];
        },
        [paramsPolicyID, lastWorkspacesTabNavigatorRoute],
    );

    const [lastViewedPolicy] = useOnyx(
        ONYXKEYS.COLLECTION.POLICY,
        {
            canBeMissing: true,
            selector: lastViewedPolicySelector,
        },
        [navigationState],
    );

    const lastViewedDomainSelector = useCallback(
        (domains: OnyxCollection<Domain>) => {
            if (!lastWorkspacesTabNavigatorRoute || lastWorkspacesTabNavigatorRoute.name !== NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR || !paramsDomainAccountID) {
                return undefined;
            }

            return domains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${paramsDomainAccountID}`];
        },
        [paramsDomainAccountID, lastWorkspacesTabNavigatorRoute],
    );

    const [lastViewedDomain] = useOnyx(
        ONYXKEYS.COLLECTION.DOMAIN,
        {
            canBeMissing: true,
            selector: lastViewedDomainSelector,
        },
        [navigationState],
    );

    const showWorkspaces = useCallback(() => {
        navigateToWorkspacesPage({shouldUseNarrowLayout, currentUserLogin, policy: lastViewedPolicy, domain: lastViewedDomain});
    }, [shouldUseNarrowLayout, currentUserLogin, lastViewedPolicy, lastViewedDomain]);

    const workspacesAccessibilityState = useMemo(() => ({selected: selectedTab === NAVIGATION_TABS.WORKSPACES}), [selectedTab]);

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={showWorkspaces}
                role={CONST.ROLE.TAB}
                accessibilityLabel={`${translate('common.workspacesTabTitle')}${workspacesTabIndicatorStatus ? `. ${translate('common.yourReviewIsRequired')}` : ''}`}
                accessibilityState={workspacesAccessibilityState}
                style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
            >
                {({hovered}) => (
                    <>
                        <View>
                            <Icon
                                src={expensifyIcons.Buildings}
                                fill={getTabIconFill(theme, {isSelected: selectedTab === NAVIGATION_TABS.WORKSPACES, isHovered: hovered})}
                                width={variables.iconBottomBar}
                                height={variables.iconBottomBar}
                            />
                            {!!workspacesTabIndicatorStatus && (
                                <View
                                    style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(workspacesTabIndicatorColor), hovered && {borderColor: theme.sidebarHover}]}
                                />
                            )}
                        </View>
                        <Text
                            numberOfLines={preferredLocale === CONST.LOCALES.DE || preferredLocale === CONST.LOCALES.NL ? 1 : 2}
                            style={[
                                styles.textSmall,
                                styles.textAlignCenter,
                                styles.mt1Half,
                                selectedTab === NAVIGATION_TABS.WORKSPACES ? styles.textBold : styles.textSupporting,
                                styles.navigationTabBarLabel,
                            ]}
                        >
                            {translate('common.workspacesTabTitle')}
                        </Text>
                    </>
                )}
            </PressableWithFeedback>
        );
    }

    return (
        <PressableWithFeedback
            onPress={showWorkspaces}
            role={CONST.ROLE.TAB}
            accessibilityLabel={`${translate('common.workspacesTabTitle')}${workspacesTabIndicatorStatus ? `. ${translate('common.yourReviewIsRequired')}` : ''}`}
            accessibilityState={workspacesAccessibilityState}
            wrapperStyle={styles.flex1}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
        >
            <View>
                <Icon
                    src={expensifyIcons.Buildings}
                    fill={selectedTab === NAVIGATION_TABS.WORKSPACES ? theme.iconMenu : theme.icon}
                    width={variables.iconBottomBar}
                    height={variables.iconBottomBar}
                />
                {!!workspacesTabIndicatorStatus && <View style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(workspacesTabIndicatorColor)]} />}
            </View>
            <Text
                numberOfLines={1}
                style={[
                    styles.textSmall,
                    styles.textAlignCenter,
                    styles.mt1Half,
                    selectedTab === NAVIGATION_TABS.WORKSPACES ? styles.textBold : styles.textSupporting,
                    styles.navigationTabBarLabel,
                ]}
            >
                {translate('common.workspacesTabTitle')}
            </Text>
        </PressableWithFeedback>
    );
}

export default WorkspacesTabButton;
