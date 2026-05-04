import React from 'react';
import type {ValueOf} from 'type-fest';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';
import CONST from '@src/CONST';
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

    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

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
