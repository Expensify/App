import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps, TextStyle, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as SearchUIUtils from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type IconAsset from '@src/types/utils/IconAsset';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';
import CannedSearchMenuNarrow from './SearchTypeMenuNarrow';

type SavedSearchMenuItem = MenuItemWithLink & {
    key: string;
    hash: string;
    query: string;
    styles: Array<ViewStyle | TextStyle>;
};

type CannedSearchMenuProps = {
    queryJSON: SearchQueryJSON;
    searchName?: string;
};

type CannedSearchItem = {
    title: string;
    icon: IconAsset;
    route: Route;
    hash: number | undefined;
};

function CannedSearchMenu({queryJSON, searchName}: CannedSearchMenuProps) {
    const {hash} = queryJSON;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {isOffline} = useNetwork();
    const shouldShowSavedSearchesMenuItemTitle = Object.values(savedSearches ?? {}).filter((s) => s.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length > 0;
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH,
        shouldShowSavedSearchesMenuItemTitle,
    );
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();

    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const cannedMenuItems: CannedSearchItem[] = useMemo(() => {
        const allExpensesQuery = SearchQueryUtils.buildCannedSearchQuery({policyID: queryJSON.policyID});
        const wainingOnYouQuery = SearchQueryUtils.buildCannedSearchQuery({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING, CONST.SEARCH.STATUS.EXPENSE.APPROVED],
            to: currentUserPersonalDetails.login,
            policyID: queryJSON.policyID,
        });

        return [
            {
                title: translate('search.cannedSearches.allExpenses'),
                icon: Expensicons.Receipt,
                route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: allExpensesQuery.queryString}),
                hash: allExpensesQuery.queryJSON?.hash,
            },
            {
                title: translate('search.cannedSearches.expensesWaitingOnYou'),
                icon: Expensicons.Hourglass,
                route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: wainingOnYouQuery.queryString}),
                hash: wainingOnYouQuery.queryJSON?.hash,
            },
        ];
    }, [currentUserPersonalDetails.login, queryJSON.policyID, translate]);

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => SearchUIUtils.getOverflowMenu(itemName, itemHash, itemQuery, showDeleteModal),
        [showDeleteModal],
    );

    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, isNarrow: boolean, index: number) => {
            let title = item.name;
            if (title === item.query) {
                const jsonQuery = SearchQueryUtils.buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                title = SearchQueryUtils.buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates);
            }

            const baseMenuItem: SavedSearchMenuItem = {
                key,
                title,
                hash: key,
                query: item.query,
                shouldShowRightComponent: true,
                focused: Number(key) === hash,
                onPress: () => {
                    SearchActions.clearAllFilters();
                    Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: item?.query ?? '', name: item?.name}));
                },
                rightComponent: (
                    <SavedSearchItemThreeDotMenu
                        menuItems={getOverflowMenu(title, Number(key), item.query)}
                        isDisabledItem={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    />
                ),
                styles: [styles.alignItemsCenter],
                pendingAction: item.pendingAction,
                disabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                shouldIconUseAutoWidthStyle: true,
            };

            if (!isNarrow) {
                return {
                    ...baseMenuItem,
                    shouldRenderTooltip: index === 0 && shouldShowProductTrainingTooltip,
                    tooltipAnchorAlignment: {
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    },
                    tooltipShiftHorizontal: -32,
                    tooltipShiftVertical: 15,
                    tooltipWrapperStyle: [styles.bgPaleGreen, styles.mh4, styles.pv2],
                    onHideTooltip: hideProductTrainingTooltip,
                    renderTooltipContent: renderProductTrainingTooltip,
                };
            }
            return baseMenuItem;
        },
        [
            hash,
            getOverflowMenu,
            styles.alignItemsCenter,
            styles.bgPaleGreen,
            styles.mh4,
            styles.pv2,
            personalDetails,
            reports,
            taxRates,
            shouldShowProductTrainingTooltip,
            hideProductTrainingTooltip,
            renderProductTrainingTooltip,
        ],
    );

    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);
    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the flashlist is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [route, saveScrollOffset],
    );

    useLayoutEffect(() => {
        const scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
    }, [getScrollOffset, route]);

    const savedSearchesMenuItems = useCallback(() => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item], index) => createSavedSearchMenuItem(item, key, shouldUseNarrowLayout, index));
    }, [createSavedSearchMenuItem, savedSearches, shouldUseNarrowLayout]);

    const renderSavedSearchesSection = useCallback(
        (menuItems: MenuItemWithLink[]) => (
            <View style={[styles.pb4, styles.mh3]}>
                <MenuItemList
                    menuItems={menuItems}
                    wrapperStyle={styles.sectionMenuItem}
                    icon={Expensicons.Bookmark}
                    iconWidth={variables.iconSizeNormal}
                    iconHeight={variables.iconSizeNormal}
                    shouldUseSingleExecution
                />
            </View>
        ),
        [styles],
    );

    if (shouldUseNarrowLayout) {
        const title = searchName ?? SearchQueryUtils.buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates);

        return (
            <CannedSearchMenuNarrow
                cannedMenuItems={cannedMenuItems}
                activeItemIndex={-1}
                queryJSON={queryJSON}
                title={title}
                savedSearchesMenuItems={savedSearchesMenuItems()}
            />
        );
    }

    return (
        <ScrollView
            onScroll={onScroll}
            ref={scrollViewRef}
        >
            <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                {cannedMenuItems.map((item) => {
                    const onPress = singleExecution(() => {
                        SearchActions.clearAllFilters();
                        Navigation.navigate(item.route);
                    });

                    return (
                        <MenuItem
                            key={item.title}
                            disabled={false}
                            interactive
                            title={item.title}
                            icon={item.icon}
                            iconWidth={variables.iconSizeNormal}
                            iconHeight={variables.iconSizeNormal}
                            wrapperStyle={styles.sectionMenuItem}
                            focused={hash === item.hash}
                            onPress={onPress}
                            shouldIconUseAutoWidthStyle
                        />
                    );
                })}
            </View>
            {shouldShowSavedSearchesMenuItemTitle && (
                <>
                    <Text style={[styles.sectionTitle, styles.pb1, styles.mh3, styles.mt3]}>{translate('search.savedSearchesMenuItemTitle')}</Text>
                    {renderSavedSearchesSection(savedSearchesMenuItems())}
                    <DeleteConfirmModal />
                </>
            )}
        </ScrollView>
    );
}

CannedSearchMenu.displayName = 'CannedSearchMenu';

export default CannedSearchMenu;
export type {CannedSearchItem};
