import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAllFilters} from '@libs/actions/Search';
import {getCardFeedNamesWithType} from '@libs/CardFeedUtils';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {
    buildSearchQueryJSON,
    buildUserReadableQueryString,
    buildUserReadableQueryStringWithPolicyID,
    isCannedSearchQuery,
    isCannedSearchQueryWithPolicyIDCheck,
} from '@libs/SearchQueryUtils';
import {createBaseSavedSearchMenuItem, createTypeMenuSections, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import type {SavedSearchMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON | undefined;
};

function SearchTypeMenu({queryJSON}: SearchTypeMenuProps) {
    const {type, groupBy, hash} = queryJSON ?? {};
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const {canUseLeftHandBar} = usePermissions();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const shouldShowSavedSearchesMenuItemTitle = Object.values(savedSearches ?? {}).filter((s) => s.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length > 0;
    const isFocused = useIsFocused();
    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH,
        shouldShowSavedSearchesMenuItemTitle && isFocused,
    );
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const taxRates = getAllTaxRates();
    const {clearSelectedTransactions} = useSearchContext();
    const cardFeedNamesWithType = useMemo(() => {
        return getCardFeedNamesWithType({workspaceCardFeeds, translate});
    }, [translate, workspaceCardFeeds]);

    const typeMenuSections: SearchTypeMenuSection[] = useMemo(() => createTypeMenuSections(), []);

    const getOverflowMenu = useCallback((itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal), [showDeleteModal]);
    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, index: number) => {
            let title = item.name;
            if (title === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                if (canUseLeftHandBar) {
                    title = buildUserReadableQueryStringWithPolicyID(jsonQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies);
                } else {
                    title = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType);
                }
            }

            const isItemFocused = Number(key) === hash;
            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, title, isItemFocused);

            return {
                ...baseMenuItem,
                onPress: () => {
                    clearAllFilters();
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item?.query ?? '', name: item?.name}));
                },
                rightComponent: (
                    <SavedSearchItemThreeDotMenu
                        menuItems={getOverflowMenu(title, Number(key), item.query)}
                        isDisabledItem={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                        hideProductTrainingTooltip={index === 0 && shouldShowProductTrainingTooltip ? hideProductTrainingTooltip : undefined}
                        shouldRenderTooltip={index === 0 && shouldShowProductTrainingTooltip}
                        renderTooltipContent={renderProductTrainingTooltip}
                    />
                ),
                style: [styles.alignItemsCenter],
                tooltipAnchorAlignment: {
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                },
                tooltipShiftHorizontal: variables.savedSearchShiftHorizontal,
                tooltipShiftVertical: variables.savedSearchShiftVertical,
                tooltipWrapperStyle: [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper],
                renderTooltipContent: renderProductTrainingTooltip,
            };
        },
        [
            allCards,
            hash,
            getOverflowMenu,
            styles.alignItemsCenter,
            styles.mh4,
            styles.pv2,
            styles.productTrainingTooltipWrapper,
            personalDetails,
            reports,
            taxRates,
            shouldShowProductTrainingTooltip,
            hideProductTrainingTooltip,
            renderProductTrainingTooltip,
            cardFeedNamesWithType,
            allPolicies,
            canUseLeftHandBar,
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

    const savedSearchesMenuItems = useMemo(() => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item], index) => createSavedSearchMenuItem(item, key, index));
    }, [createSavedSearchMenuItem, savedSearches]);

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

    let isCannedQuery = false;

    if (queryJSON) {
        if (canUseLeftHandBar) {
            isCannedQuery = isCannedSearchQueryWithPolicyIDCheck(queryJSON);
        } else {
            isCannedQuery = isCannedSearchQuery(queryJSON);
        }
    }

    const activeItemIndex = useMemo(() => {
        if (!isCannedQuery) {
            return -1;
        }

        const flattenedMenuItems = typeMenuSections.map((section) => section.menuItems).flat();

        return flattenedMenuItems.findIndex((item) => {
            if (groupBy === CONST.SEARCH.GROUP_BY.REPORTS) {
                return item.translationPath === 'common.expenseReports' && item.type === type;
            }
            return item.type === type;
        });
    }, [isCannedQuery, groupBy, type, typeMenuSections]);

    return (
        <ScrollView
            onScroll={onScroll}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.pb4, styles.mh3, styles.gap4]}>
                {typeMenuSections.map((section, sectionIndex) => (
                    <View key={section.translationPath}>
                        <Text style={[styles.sectionTitle, styles.pb2]}>{translate(section.translationPath)}</Text>
                        {section.menuItems.map((item, itemIndex) => {
                            const flattenedIndex = sectionIndex * section.menuItems.length + itemIndex;

                            const onPress = singleExecution(() => {
                                clearAllFilters();
                                clearSelectedTransactions();
                                Navigation.navigate(item.getRoute());
                            });

                            return (
                                <MenuItem
                                    key={item.translationPath}
                                    disabled={false}
                                    interactive
                                    title={translate(item.translationPath)}
                                    icon={item.icon}
                                    iconWidth={variables.iconSizeNormal}
                                    iconHeight={variables.iconSizeNormal}
                                    wrapperStyle={styles.sectionMenuItem}
                                    focused={flattenedIndex === activeItemIndex}
                                    onPress={onPress}
                                    shouldIconUseAutoWidthStyle
                                />
                            );
                        })}
                    </View>
                ))}
                {shouldShowSavedSearchesMenuItemTitle && (
                    <View>
                        <Text style={[styles.sectionTitle, styles.pb1, styles.mh3, styles.mt3]}>{translate('search.savedSearchesMenuItemTitle')}</Text>
                        {renderSavedSearchesSection(savedSearchesMenuItems)}
                        <DeleteConfirmModal />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

SearchTypeMenu.displayName = 'SearchTypeMenu';

export default SearchTypeMenu;
