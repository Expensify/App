import {useIsFocused, useRoute} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import React, {useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps} from 'react-native';
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
import useSuggestedSearchDefaultNavigation from '@hooks/useSuggestedSearchDefaultNavigation';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, shouldSkipSuggestedSearchNavigation as shouldSkipSuggestedSearchNavigationForQuery} from '@libs/SearchQueryUtils';
import type {SavedSearchMenuItem} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';
import SuggestedSearchSkeleton from './SuggestedSearchSkeleton';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON | undefined;
};

function SearchTypeMenu({queryJSON}: SearchTypeMenuProps) {
    const {hash, similarSearchHash} = queryJSON ?? {};
    const shouldSkipSuggestedSearchNavigation = useMemo(() => shouldSkipSuggestedSearchNavigationForQuery(queryJSON), [queryJSON]);

    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const {typeMenuSections, CreateReportConfirmationModal, shouldShowSuggestedSearchSkeleton} = useSearchTypeMenuSections();
    const isFocused = useIsFocused();
    const {
        shouldShowProductTrainingTooltip: shouldShowSavedSearchTooltip,
        renderProductTrainingTooltip: renderSavedSearchTooltip,
        hideProductTrainingTooltip: hideSavedSearchTooltip,
    } = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH,
        !!typeMenuSections.find((section) => section.translationPath === 'search.savedSearchesMenuItemTitle') && isFocused,
    );
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Basket',
        'Bookmark',
        'Pencil',
        'Receipt',
        'ChatBubbles',
        'MoneyBag',
        'CreditCard',
        'MoneyHourglass',
        'CreditCardHourglass',
        'Bank',
        'User',
        'Folder',
    ] as const);
    const {showDeleteModal} = useDeleteSavedSearch();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {canBeMissing: true});
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const taxRates = getAllTaxRates(allPolicies);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});
    const {clearSelectedTransactions} = useSearchContext();

    const flattenedMenuItems = useMemo(() => typeMenuSections.flatMap((section) => section.menuItems), [typeMenuSections]);

    useSuggestedSearchDefaultNavigation({
        shouldShowSkeleton: shouldShowSuggestedSearchSkeleton,
        flattenedMenuItems,
        similarSearchHash,
        clearSelectedTransactions,
        shouldSkipNavigation: shouldSkipSuggestedSearchNavigation,
    });

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(expensifyIcons, itemName, itemHash, itemQuery, translate, showDeleteModal),
        [translate, showDeleteModal, expensifyIcons],
    );
    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, index: number) => {
            let title = item.name;
            if (title === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                title = buildUserReadableQueryString({
                    queryJSON: jsonQuery,
                    PersonalDetails: personalDetails,
                    reports,
                    taxRates,
                    cardList: nonPersonalAndWorkspaceCards,
                    cardFeeds: allFeeds,
                    policies: allPolicies,
                    currentUserAccountID,
                    autoCompleteWithSpace: false,
                    translate,
                });
            }

            const isItemFocused = Number(key) === hash;
            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, title, isItemFocused);

            return {
                ...baseMenuItem,
                onPress: () => {
                    setSearchContext(false);
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
            nonPersonalAndWorkspaceCards,
            allFeeds,
            currentUserAccountID,
            allPolicies,
            translate,
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

        return flattenedMenuItems.findIndex((item) => item.similarSearchHash === similarSearchHash);
    }, [similarSearchHash, isSavedSearchActive, flattenedMenuItems]);

    return (
        <>
            {CreateReportConfirmationModal}
            <ScrollView
                onScroll={onScroll}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
            >
                {shouldShowSuggestedSearchSkeleton ? (
                    <View style={[styles.pb4, styles.mh3, styles.gap4]}>
                        <SuggestedSearchSkeleton />
                    </View>
                ) : (
                    <View style={[styles.pb4, styles.mh3, styles.gap4]}>
                        {typeMenuSections.map((section, sectionIndex) => (
                            <View key={section.translationPath}>
                                <Text style={styles.sectionTitle}>{translate(section.translationPath)}</Text>

                                {section.translationPath === 'search.savedSearchesMenuItemTitle' ? (
                                    renderSavedSearchesSection(savedSearchesMenuItems)
                                ) : (
                                    <>
                                        {section.menuItems.map((item, itemIndex) => {
                                            const previousItemCount = typeMenuSections.slice(0, sectionIndex).reduce((acc, sec) => acc + sec.menuItems.length, 0);
                                            const flattenedIndex = previousItemCount + itemIndex;
                                            const focused = activeItemIndex === flattenedIndex;
                                            const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon] : item.icon;

                                            const onPress = singleExecution(() => {
                                                clearSelectedTransactions();
                                                setSearchContext(false);
                                                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item.searchQuery}));
                                            });

                                            return (
                                                <MenuItem
                                                    key={item.key}
                                                    disabled={false}
                                                    interactive
                                                    title={translate(item.translationPath)}
                                                    badgeStyle={styles.todoBadge}
                                                    icon={icon}
                                                    iconWidth={variables.iconSizeNormal}
                                                    iconHeight={variables.iconSizeNormal}
                                                    wrapperStyle={styles.sectionMenuItem}
                                                    badgeText={item.badgeText}
                                                    focused={focused}
                                                    onPress={onPress}
                                                    shouldIconUseAutoWidthStyle
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </>
    );
}

export default SearchTypeMenu;
