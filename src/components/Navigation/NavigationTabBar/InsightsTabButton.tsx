import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import navigationRef from '@navigation/navigationRef';

import useAccessibleDashboards from '@pages/Insights/useAccessibleDashboards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {ValueOf} from 'type-fest';

import React from 'react';

import getInsightsTabRoute from './getInsightsTabRoute';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type InsightsTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function InsightsTabButton({selectedTab, isWideLayout}: InsightsTabButtonProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['PieChart']);
    const [accessibleDashboards = getEmptyArray<InsightsDashboardID>()] = useAccessibleDashboards();
    const isSelected = selectedTab === NAVIGATION_TABS.INSIGHTS;

    const navigateToInsights = () => {
        if (isSelected) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            const rootState = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
            Navigation.navigate(getInsightsTabRoute(rootState, accessibleDashboards));
        }, session);
    };

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={navigateToInsights}
                role={CONST.ROLE.TAB}
                accessibilityLabel={translate('common.insights')}
                accessibilityState={{selected: isSelected}}
                style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
            >
                {({hovered}) => (
                    <TabBarItem
                        icon={expensifyIcons.PieChart}
                        label={translate('common.insights')}
                        isSelected={isSelected}
                        isHovered={hovered}
                    />
                )}
            </PressableWithFeedback>
        );
    }

    return (
        <PressableWithFeedback
            onPress={navigateToInsights}
            role={CONST.ROLE.TAB}
            accessibilityLabel={translate('common.insights')}
            accessibilityState={{selected: isSelected}}
            wrapperStyle={styles.navigationTabBarSlot}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
        >
            <TabBarItem
                icon={expensifyIcons.PieChart}
                label={translate('common.insights')}
                isSelected={isSelected}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default InsightsTabButton;
