import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';

import getTabAccessibilityLabel from './getTabAccessibilityLabel';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';
import useSignedInLinkRoute from './useSignedInLinkRoute';

type WorkspacesTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;

    /** Whether the wide-layout button uses the shorter row, for windows too short to fit the full-height rows */
    isCompact?: boolean;
};

function WorkspacesTabButton({selectedTab, isWideLayout, isCompact = false}: WorkspacesTabButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, preferredLocale} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Buildings']);
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();

    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();
    const getSignedInLinkRoute = useSignedInLinkRoute();
    const workspacesLinkRoute = getSignedInLinkRoute(ROUTES.WORKSPACES_LIST.route);

    const workspacesAccessibilityState = {selected: selectedTab === NAVIGATION_TABS.WORKSPACES};
    const workspacesStatusIndicatorColor = workspacesTabIndicatorStatus ? workspacesTabIndicatorColor : undefined;

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={navigateToWorkspaces}
                linkRoute={workspacesLinkRoute}
                role={CONST.ROLE.TAB}
                accessibilityLabel={getTabAccessibilityLabel(translate('common.workspacesTabTitle'), !!workspacesTabIndicatorStatus, translate)}
                accessibilityState={workspacesAccessibilityState}
                style={({hovered}) => [
                    styles.leftNavigationTabBarItem,
                    isCompact && StyleUtils.getHeight(variables.navigationTabBarCompactItemHeight),
                    hovered && styles.navigationTabBarItemHovered,
                ]}
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
            linkRoute={workspacesLinkRoute}
            role={CONST.ROLE.TAB}
            accessibilityLabel={getTabAccessibilityLabel(translate('common.workspacesTabTitle'), !!workspacesTabIndicatorStatus, translate)}
            accessibilityState={workspacesAccessibilityState}
            wrapperStyle={styles.navigationTabBarSlot}
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
