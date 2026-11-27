import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';
import useHomeTabNavigation from './useHomeTabNavigation';

type HomeTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;

    /** Whether the tab shows as selected, which the flat nav bar decides. Defaults to Home being the selected tab. */
    isSelected?: boolean;
};

/** The Home tab of the narrow tab bar. */
function HomeTabButton({selectedTab, isSelected: isSelectedProp}: HomeTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Home']);
    const navigateToNewDotHome = useHomeTabNavigation(selectedTab === NAVIGATION_TABS.HOME);
    const isSelected = isSelectedProp ?? selectedTab === NAVIGATION_TABS.HOME;

    return (
        <PressableWithFeedback
            onPress={navigateToNewDotHome}
            linkRoute={ROUTES.HOME}
            role={CONST.ROLE.TAB}
            accessibilityLabel={translate('common.home')}
            accessibilityState={{selected: isSelected}}
            wrapperStyle={styles.navigationTabBarSlot}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
        >
            <TabBarItem
                icon={expensifyIcons.Home}
                label={translate('common.home')}
                isSelected={isSelected}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default HomeTabButton;
