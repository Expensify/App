import {useIsFocused, useRoute} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import MenuItem from '@components/MenuItem';
import type {MenuItemWithLink} from '@components/MenuItemList';
import MenuItemList from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAllFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import type {SavedSearchMenuItem} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON | undefined;
};

function SearchTypeMenu({queryJSON}: SearchTypeMenuProps) {
    const {hash, similarSearchHash} = queryJSON ?? {};

    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const {typeMenuSections, CreateReportConfirmationModal} = useSearchTypeMenuSections();
    const isFocused = useIsFocused();
    const {
        shouldShowProductTrainingTooltip: shouldShowSavedSearchTooltip,
        renderProductTrainingTooltip: renderSavedSearchTooltip,
        hideProductTrainingTooltip: hideSavedSearchTooltip,
    } = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH,
        !!typeMenuSections.find((section) => section.translationPath === 'search.savedSearchesMenuItemTitle') && isFocused,
    );
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark'] as const);
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const taxRates = getAllTaxRates(allPolicies);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});
    const {clearSelectedTransactions} = useSearchContext();
    const initialSearchKeys = useRef<string[]>([]);

    // The first time we render all of the sections the user can see, we need to mark these as 'rendered', such that we
    // dont animate them in. We only animate in items that a user gains access to later on
    useEffect(() => {
        if (initialSearchKeys.current.length) {
            return;
        }

        initialSearchKeys.current = typeMenuSections.flatMap((section) => {
            return section.menuItems.map((item) => item.key);
        });
    }, [typeMenuSections]);

    const getOverflowMenu = useCallback((itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal), [showDeleteModal]);
    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, index: number) => {
            let title = item.name;
            if (title === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                title = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards, allFeeds, allPolicies, currentUserAccountID);
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
                        hideProductTrainingTooltip={index === 0 && shouldShowSavedSearchTooltip ? hideSavedSearchTooltip : undefined}
                        shouldRenderTooltip={index === 0 && shouldShowSavedSearchTooltip}
                        renderTooltipContent={renderSavedSearchTooltip}
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
                renderTooltipContent: renderSavedSearchTooltip,
            };
        },
        [
            hash,
            getOverflowMenu,
            shouldShowSavedSearchTooltip,
            hideSavedSearchTooltip,
            renderSavedSearchTooltip,
            styles.alignItemsCenter,
            styles.mh4,
            styles.pv2,
            styles.productTrainingTooltipWrapper,
            personalDetails,
            reports,
            taxRates,
            allCards,
            allFeeds,
            currentUserAccountID,
            allPolicies,
        ],
    );

    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);
    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
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

    const {savedSearchesMenuItems, isSavedSearchActive} = useMemo(() => {
        let savedSearchFocused = false;

        if (!savedSearches) {
            return {
                isSavedSearchActive: false,
                savedSearchesMenuItems: [],
            };
        }

        const menuItems = Object.entries(savedSearches).map(([key, item], index) => {
            const baseMenuItem = createSavedSearchMenuItem(item, key, index);
            savedSearchFocused ||= !!baseMenuItem.focused;
            return baseMenuItem;
        });

        return {
            savedSearchesMenuItems: menuItems,
            isSavedSearchActive: savedSearchFocused,
        };
    }, [createSavedSearchMenuItem, savedSearches]);

    const renderSavedSearchesSection = useCallback(
        (menuItems: MenuItemWithLink[]) => (
            <MenuItemList
                menuItems={menuItems}
                wrapperStyle={styles.sectionMenuItem}
                icon={expensifyIcons.Bookmark}
                iconWidth={variables.iconSizeNormal}
                iconHeight={variables.iconSizeNormal}
                shouldUseSingleExecution
            />
        ),
        [expensifyIcons.Bookmark, styles.sectionMenuItem],
    );

    const activeItemIndex = useMemo(() => {
        // If we have a suggested search, then none of the menu items are active
        if (isSavedSearchActive) {
            return -1;
        }

        const flattenedMenuItems = typeMenuSections.map((section) => section.menuItems).flat();
        return flattenedMenuItems.findIndex((item) => item.similarSearchHash === similarSearchHash);
    }, [similarSearchHash, isSavedSearchActive, typeMenuSections]);

    return (
        <>
            {CreateReportConfirmationModal}
            <ScrollView
                onScroll={onScroll}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.pb4, styles.mh3, styles.gap4]}>
                    {typeMenuSections.map((section, sectionIndex) => (
                        <View key={section.translationPath}>
                            <Text style={styles.sectionTitle}>{translate(section.translationPath)}</Text>

                            {section.translationPath === 'search.savedSearchesMenuItemTitle' ? (
                                <>
                                    {renderSavedSearchesSection(savedSearchesMenuItems)}
                                    {/* DeleteConfirmModal is a stable JSX element returned by the hook.
                                    Returning the element directly keeps the component identity across re-renders so React
                                    can play its exit animation instead of removing it instantly. */}
                                    {DeleteConfirmModal}
                                </>
                            ) : (
                                <>
                                    {section.menuItems.map((item, itemIndex) => {
                                        const previousItemCount = typeMenuSections.slice(0, sectionIndex).reduce((acc, sec) => acc + sec.menuItems.length, 0);
                                        const flattenedIndex = previousItemCount + itemIndex;
                                        const focused = activeItemIndex === flattenedIndex;

                                        const onPress = singleExecution(() => {
                                            clearAllFilters();
                                            clearSelectedTransactions();
                                            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item.searchQuery}));
                                        });

                                        const isInitialItem = !initialSearchKeys.current.length || initialSearchKeys.current.includes(item.key);

                                        return (
                                            <Animated.View
                                                key={item.translationPath}
                                                entering={!isInitialItem ? FadeIn : undefined}
                                            >
                                                <MenuItem
                                                    key={item.key}
                                                    disabled={false}
                                                    interactive
                                                    title={translate(item.translationPath)}
                                                    icon={item.icon}
                                                    iconWidth={variables.iconSizeNormal}
                                                    iconHeight={variables.iconSizeNormal}
                                                    wrapperStyle={styles.sectionMenuItem}
                                                    focused={focused}
                                                    onPress={onPress}
                                                    shouldIconUseAutoWidthStyle
                                                />
                                            </Animated.View>
                                        );
                                    })}
                                </>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </>
    );
}

SearchTypeMenu.displayName = 'SearchTypeMenu';

export default SearchTypeMenu;
