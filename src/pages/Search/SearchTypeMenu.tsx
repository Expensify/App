import {useRoute} from '@react-navigation/native';
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
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAllFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, isCannedSearchQuery} from '@libs/SearchQueryUtils';
import {createBaseSavedSearchMenuItem, createTypeMenuItems, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import type {SavedSearchMenuItem, SearchTypeMenuItem} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON;
};

function SearchTypeMenu({queryJSON}: SearchTypeMenuProps) {
    const {type, hash} = queryJSON;
    const styles = useThemeStyles();
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
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const taxRates = getAllTaxRates();

    const typeMenuItems: SearchTypeMenuItem[] = useMemo(() => createTypeMenuItems(allPolicies, session?.email), [allPolicies, session?.email]);

    const getOverflowMenu = useCallback((itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal), [showDeleteModal]);
    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, index: number) => {
            let title = item.name;
            if (title === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                title = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards);
            }

            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, title, hash);
            return {
                ...baseMenuItem,
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
            hash,
            getOverflowMenu,
            shouldShowProductTrainingTooltip,
            hideProductTrainingTooltip,
            styles.alignItemsCenter,
            styles.mh4,
            styles.pv2,
            styles.productTrainingTooltipWrapper,
            renderProductTrainingTooltip,
            personalDetails,
            reports,
            taxRates,
            allCards,
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

    const isCannedQuery = isCannedSearchQuery(queryJSON);
    const activeItemIndex = isCannedQuery ? typeMenuItems.findIndex((item) => item.type === type) : -1;

    return (
        <ScrollView
            onScroll={onScroll}
            ref={scrollViewRef}
        >
            <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                {typeMenuItems.map((item, index) => {
                    const onPress = singleExecution(() => {
                        clearAllFilters();
                        Navigation.navigate(item.getRoute(queryJSON.policyID));
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
                            focused={index === activeItemIndex}
                            onPress={onPress}
                            shouldIconUseAutoWidthStyle
                        />
                    );
                })}
            </View>
            {shouldShowSavedSearchesMenuItemTitle && (
                <>
                    <Text style={[styles.sectionTitle, styles.pb1, styles.mh3, styles.mt3]}>{translate('search.savedSearchesMenuItemTitle')}</Text>
                    {renderSavedSearchesSection(savedSearchesMenuItems)}
                    <DeleteConfirmModal />
                </>
            )}
        </ScrollView>
    );
}

SearchTypeMenu.displayName = 'SearchTypeMenu';

export default SearchTypeMenu;
