import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {startSpan} from '@libs/telemetry/activeSpans';
import {startNavigateToReportsSpans} from '@libs/telemetry/navigateToReportsSpans';

import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React from 'react';

import getSearchTabRoute from './getSearchTabRoute';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type SearchTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function SearchTabButton({selectedTab, isWideLayout}: SearchTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ReceiptMultiple']);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const searchAccessibilityState = {selected: selectedTab === NAVIGATION_TABS.SEARCH};

    const navigateToSearch = () => {
        if (selectedTab === NAVIGATION_TABS.SEARCH) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {
                name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
                op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
                forceTransaction: true,
            });
            startNavigateToReportsSpans();

            Navigation.navigate(getSearchTabRoute(navigationRef.getRootState(), lastSearchParams));
        });
    };

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={navigateToSearch}
                role={CONST.ROLE.TAB}
                accessibilityLabel={translate('common.spend')}
                accessibilityState={searchAccessibilityState}
                style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
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
            wrapperStyle={styles.flex1}
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
