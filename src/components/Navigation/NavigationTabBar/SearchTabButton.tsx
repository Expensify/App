import React from 'react';
import type {ValueOf} from 'type-fest';
import {PressableWithFeedback} from '@components/Pressable';
import useDefaultSearchQuery from '@hooks/useDefaultSearchQuery';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import navigationRef from '@navigation/navigationRef';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getLastRoute from './getLastRoute';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type SearchTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function SearchTabButton({selectedTab, isWideLayout}: SearchTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MoneySearch']);
    const defaultSearchQuery = useDefaultSearchQuery();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);

    const searchAccessibilityState = {selected: selectedTab === NAVIGATION_TABS.SEARCH};
    const lastQueryJSON = lastSearchParams?.queryJSON;

    const navigateToSearch = () => {
        if (selectedTab === NAVIGATION_TABS.SEARCH) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            const parentSpan = startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB, {
                name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB,
                op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB,
            });
            parentSpan?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_ROUTE_FROM, selectedTab ?? '');

            startSpan(CONST.TELEMETRY.SPAN_ON_LAYOUT_SKELETON_REPORTS, {
                name: CONST.TELEMETRY.SPAN_ON_LAYOUT_SKELETON_REPORTS,
                op: CONST.TELEMETRY.SPAN_ON_LAYOUT_SKELETON_REPORTS,
                parentSpan,
            });

            const lastSearchRoute = getLastRoute(navigationRef.getRootState(), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT);

            if (lastSearchRoute) {
                const {q, ...rest} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
                const queryJSON = buildSearchQueryJSON(q);
                if (queryJSON) {
                    const query = buildSearchQueryString(queryJSON);
                    Navigation.navigate(
                        ROUTES.SEARCH_ROOT.getRoute({
                            query,
                            ...rest,
                        }),
                    );
                    return;
                }
            }

            const savedSearchQuery = Object.values(savedSearches ?? {}).at(0)?.query;
            const lastQueryFromOnyx = lastQueryJSON ? buildSearchQueryString(lastQueryJSON) : undefined;
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: lastQueryFromOnyx ?? defaultSearchQuery ?? savedSearchQuery ?? buildCannedSearchQuery()}));
        });
    };

    if (isWideLayout) {
        return (
            <PressableWithFeedback
                onPress={navigateToSearch}
                role={CONST.ROLE.TAB}
                accessibilityLabel={translate('common.reports')}
                accessibilityState={searchAccessibilityState}
                style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
            >
                {({hovered}) => (
                    <TabBarItem
                        icon={expensifyIcons.MoneySearch}
                        label={translate('common.reports')}
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
            accessibilityLabel={translate('common.reports')}
            accessibilityState={searchAccessibilityState}
            wrapperStyle={styles.flex1}
            style={styles.navigationTabBarItem}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
        >
            <TabBarItem
                icon={expensifyIcons.MoneySearch}
                label={translate('common.reports')}
                isSelected={selectedTab === NAVIGATION_TABS.SEARCH}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default SearchTabButton;
