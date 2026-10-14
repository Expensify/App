import {PressableWithFeedback} from '@components/Pressable';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {isSearchBehindMore} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';
import useOpenMoreTab from './useOpenMoreTab';

type MoreTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/**
 * Bottom-bar tab for the destinations that don't fit across five slots. It opens the More page, unless the user has
 * already been into one of its destinations this session - then it drops them back where they left off.
 */
function MoreTabButton({selectedTab}: MoreTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots']);

    const {currentSearchKey} = useSearchQueryContext();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const openMoreTab = useOpenMoreTab();

    const isOnMorePage = selectedTab === NAVIGATION_TABS.MORE;
    // The tab stands for everything behind it, so it stays lit while the user is inside one of its destinations.
    const isInMoreDestination =
        (selectedTab === NAVIGATION_TABS.SEARCH && isSearchBehindMore(currentSearchKey)) || selectedTab === NAVIGATION_TABS.INSIGHTS || selectedTab === NAVIGATION_TABS.WORKSPACES;
    const isSelected = isOnMorePage || isInMoreDestination;

    return (
        <PressableWithFeedback
            onPress={() => openMoreTab({isInMoreDestination, isOnMorePage})}
            role={CONST.ROLE.TAB}
            accessibilityLabel={translate('common.more')}
            accessibilityState={{selected: isSelected}}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE}
            wrapperStyle={styles.flex1}
            style={styles.navigationTabBarItem}
        >
            <TabBarItem
                icon={icons.ThreeDots}
                label={translate('common.more')}
                isSelected={isSelected}
                // Workspaces lives behind this tab, so its attention dot has to surface here.
                statusIndicatorColor={workspacesIndicatorStatus ? workspacesIndicatorColor : undefined}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default MoreTabButton;
