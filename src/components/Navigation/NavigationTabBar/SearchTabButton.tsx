import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {setIsSearchTabHovered} from '@libs/Navigation/helpers/searchTabPreloadStore';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React, {useEffect} from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';
import useSearchTabNavigation from './useSearchTabNavigation';

type SearchTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function SearchTabButton({selectedTab, isWideLayout}: SearchTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ReceiptMultiple']);
    const searchAccessibilityState = {selected: selectedTab === NAVIGATION_TABS.SEARCH};
    const navigateToSearch = useSearchTabNavigation(selectedTab === NAVIGATION_TABS.SEARCH);

    // The wide button gets no hover out when it goes away while hovered, on a switch to the narrow layout or an unmount.
    useEffect(() => () => setIsSearchTabHovered(false), [isWideLayout]);

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={navigateToSearch}
                role={CONST.ROLE.TAB}
                accessibilityLabel={translate('common.spend')}
                accessibilityState={searchAccessibilityState}
                style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
                onHoverIn={() => setIsSearchTabHovered(true)}
                onHoverOut={() => setIsSearchTabHovered(false)}
            >
                {({hovered}) => (
                    <TabBarItem
                        icon={expensifyIcons.ReceiptMultiple}
                        label={translate('common.spend')}
                        isSelected={selectedTab === NAVIGATION_TABS.SEARCH}
                        isHovered={hovered}
                    />
                )}
            </PressableWithFeedback>
        );
    }

    return (
        <PressableWithFeedback
            onPress={navigateToSearch}
            role={CONST.ROLE.TAB}
            accessibilityLabel={translate('common.spend')}
            accessibilityState={searchAccessibilityState}
            wrapperStyle={styles.navigationTabBarSlot}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
        >
            <TabBarItem
                icon={expensifyIcons.ReceiptMultiple}
                label={translate('common.spend')}
                isSelected={selectedTab === NAVIGATION_TABS.SEARCH}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default SearchTabButton;
