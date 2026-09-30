import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type InsightsTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function InsightsTabButton({selectedTab, isWideLayout}: InsightsTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['PieChart']);
    const isSelected = selectedTab === NAVIGATION_TABS.INSIGHTS;

    const navigateToInsights = () => {
        if (isSelected) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.INSIGHTS.getRoute(CONST.INSIGHTS.DASHBOARD.SPEND));
        });
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
            wrapperStyle={styles.flex1}
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
