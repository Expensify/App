import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useDefaultSearchQuery from '@hooks/useDefaultSearchQuery';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import navigationRef from '@navigation/navigationRef';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getLastRoute from './getLastRoute';
import getTabIconFill from './getTabIconFill';
import NAVIGATION_TABS from './NAVIGATION_TABS';

type SearchTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isWideLayout: boolean;
};

function SearchTabButton({selectedTab, isWideLayout}: SearchTabButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MoneySearch']);
    const defaultSearchQuery = useDefaultSearchQuery();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {canBeMissing: true});

    const searchAccessibilityState = useMemo(() => ({selected: selectedTab === NAVIGATION_TABS.SEARCH}), [selectedTab]);
    const lastQueryJSON = lastSearchParams?.queryJSON;

    const navigateToSearch = useCallback(() => {
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
    }, [selectedTab, defaultSearchQuery, savedSearches, lastQueryJSON]);

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
                    <>
                        <View>
                            <Icon
                                src={expensifyIcons.MoneySearch}
                                fill={getTabIconFill(theme, {isSelected: selectedTab === NAVIGATION_TABS.SEARCH, isHovered: hovered})}
                                width={variables.iconBottomBar}
                                height={variables.iconBottomBar}
                            />
                        </View>
                        <Text
                            numberOfLines={2}
                            style={[
                                styles.textSmall,
                                styles.textAlignCenter,
                                styles.mt1Half,
                                selectedTab === NAVIGATION_TABS.SEARCH ? styles.textBold : styles.textSupporting,
                                styles.navigationTabBarLabel,
                            ]}
                        >
                            {translate('common.reports')}
                        </Text>
                    </>
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
            <View>
                <Icon
                    src={expensifyIcons.MoneySearch}
                    fill={selectedTab === NAVIGATION_TABS.SEARCH ? theme.iconMenu : theme.icon}
                    width={variables.iconBottomBar}
                    height={variables.iconBottomBar}
                />
            </View>
            <Text
                numberOfLines={1}
                style={[
                    styles.textSmall,
                    styles.textAlignCenter,
                    styles.mt1Half,
                    selectedTab === NAVIGATION_TABS.SEARCH ? styles.textBold : styles.textSupporting,
                    styles.navigationTabBarLabel,
                ]}
            >
                {translate('common.reports')}
            </Text>
        </PressableWithFeedback>
    );
}

export default SearchTabButton;
