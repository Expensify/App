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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAllFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canSendInvoice, getAllTaxRates} from '@libs/PolicyUtils';
import {hasInvoiceReports} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildUserReadableQueryString, isCannedSearchQuery} from '@libs/SearchQueryUtils';
import {getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';
import SearchTypeMenuNarrow from './SearchTypeMenuNarrow';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON;
    searchName?: string;
};

type SearchTypeMenuItem = {
    title: string;
    type: SearchDataTypes;
    icon: IconAsset;
    getRoute: (policyID?: string) => Route;
};

function SearchTypeMenu({queryJSON, searchName}: SearchTypeMenuProps) {
    const {type, hash} = queryJSON;
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
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [userCardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds = {}] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds, userCardList), [userCardList, workspaceCardFeeds]);
    const taxRates = getAllTaxRates();

    const typeMenuItems: SearchTypeMenuItem[] = [
        {
            title: translate('common.expenses'),
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Receipt,
            getRoute: (policyID?: string) => {
                const query = buildCannedSearchQuery({policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
            },
        },
        {
            title: translate('common.chats'),
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            icon: Expensicons.ChatBubbles,
            getRoute: (policyID?: string) => {
                const query = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.CHAT, status: CONST.SEARCH.STATUS.CHAT.ALL, policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
            },
        },
    ];

    if (canSendInvoice(allPolicies, session?.email) || hasInvoiceReports()) {
        typeMenuItems.push({
            title: translate('workspace.common.invoices'),
            type: CONST.SEARCH.DATA_TYPES.INVOICE,
            icon: Expensicons.InvoiceGeneric,
            getRoute: (policyID?: string) => {
                const query = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.INVOICE, status: CONST.SEARCH.STATUS.INVOICE.ALL, policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
            },
        });
    }
    typeMenuItems.push({
        title: translate('travel.trips'),
        type: CONST.SEARCH.DATA_TYPES.TRIP,
        icon: Expensicons.Suitcase,
        getRoute: (policyID?: string) => {
            const query = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.TRIP, status: CONST.SEARCH.STATUS.TRIP.ALL, policyID});
            return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
        },
    });

    const getOverflowMenu = useCallback((itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal), [showDeleteModal]);

    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, isNarrow: boolean, index: number) => {
            let title = item.name;
            if (title === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                title = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards);
            }

            return {
                key,
                title,
                hash: key,
                query: item.query,
                shouldShowRightComponent: true,
                focused: Number(key) === hash,
                onPress: () => {
                    clearAllFilters();
                    Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: item?.query ?? '', name: item?.name}));
                },
                rightComponent: (
                    <SavedSearchItemThreeDotMenu
                        menuItems={getOverflowMenu(title, Number(key), item.query)}
                        isDisabledItem={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                        hideProductTrainingTooltip={index === 0 && shouldShowProductTrainingTooltip ? hideProductTrainingTooltip : undefined}
                        shouldRenderTooltip={!isNarrow && index === 0 && shouldShowProductTrainingTooltip}
                        renderTooltipContent={renderProductTrainingTooltip}
                    />
                ),
                styles: [styles.alignItemsCenter],
                pendingAction: item.pendingAction,
                disabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                shouldIconUseAutoWidthStyle: true,
            };
        },
        [
            allCards,
            hash,
            getOverflowMenu,
            styles.alignItemsCenter,
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

    const savedSearchesMenuItems = useMemo(() => {
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

    const isCannedQuery = isCannedSearchQuery(queryJSON);
    const activeItemIndex = isCannedQuery ? typeMenuItems.findIndex((item) => item.type === type) : -1;

    if (shouldUseNarrowLayout) {
        const title = searchName ?? (isCannedQuery ? undefined : buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates, allCards));

        return (
            <SearchTypeMenuNarrow
                typeMenuItems={typeMenuItems}
                activeItemIndex={activeItemIndex}
                queryJSON={queryJSON}
                title={title}
                savedSearchesMenuItems={savedSearchesMenuItems}
            />
        );
    }

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
                            key={item.title}
                            disabled={false}
                            interactive
                            title={item.title}
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
export type {SearchTypeMenuItem};
