import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps, TextStyle, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
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
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';
import SearchTypeMenuNarrow from './SearchTypeMenuNarrow';

type SavedSearchMenuItem = MenuItemWithLink & {
    key: string;
    hash: string;
    query: string;
    styles: Array<ViewStyle | TextStyle>;
};

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
    const [shouldShowSavedSearchRenameTooltip] = useOnyx(ONYXKEYS.SHOULD_SHOW_SAVED_SEARCH_RENAME_TOOLTIP);
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();

    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);

    const typeMenuItems: SearchTypeMenuItem[] = [
        {
            title: translate('common.expenses'),
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Receipt,
            getRoute: (policyID?: string) => {
                const query = SearchQueryUtils.buildCannedSearchQuery({policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
            },
        },
        {
            title: translate('common.chats'),
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            icon: Expensicons.ChatBubbles,
            getRoute: (policyID?: string) => {
                const query = SearchQueryUtils.buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.CHAT, status: CONST.SEARCH.STATUS.CHAT.ALL, policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
            },
        },
        {
            title: translate('workspace.common.invoices'),
            type: CONST.SEARCH.DATA_TYPES.INVOICE,
            icon: Expensicons.InvoiceGeneric,
            getRoute: (policyID?: string) => {
                const query = SearchQueryUtils.buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.INVOICE, status: CONST.SEARCH.STATUS.INVOICE.ALL, policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
            },
        },
        {
            title: translate('travel.trips'),
            type: CONST.SEARCH.DATA_TYPES.TRIP,
            icon: Expensicons.Suitcase,
            getRoute: (policyID?: string) => {
                const query = SearchQueryUtils.buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.TRIP, status: CONST.SEARCH.STATUS.TRIP.ALL, policyID});
                return ROUTES.SEARCH_CENTRAL_PANE.getRoute({query});
            },
        },
    ];

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => SearchUIUtils.getOverflowMenu(itemName, itemHash, itemQuery, showDeleteModal),
        [showDeleteModal],
    );

    const createSavedSearchMenuItem = (item: SaveSearchItem, key: string, isNarrow: boolean, index: number) => {
        let title = item.name;
        if (title === item.query) {
            const jsonQuery = SearchQueryUtils.buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
            title = SearchQueryUtils.buildUserReadableQueryString(jsonQuery, personalDetails, cardList, reports, taxRates);
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
        };

        if (!isNarrow) {
            return {
                ...baseMenuItem,
                shouldRenderTooltip: index === 0 && shouldShowSavedSearchRenameTooltip === true,
                tooltipAnchorAlignment: {
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                },
                tooltipShiftHorizontal: -32,
                tooltipShiftVertical: 15,
                tooltipWrapperStyle: [styles.bgPaleGreen, styles.mh4, styles.pv2],
                onHideTooltip: SearchActions.dismissSavedSearchRenameTooltip,
                renderTooltipContent: () => {
                    return (
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Expensicons.Lightbulb
                                width={16}
                                height={16}
                                fill={styles.colorGreenSuccess.color}
                            />
                            <Text style={[styles.ml1, styles.quickActionTooltipSubtitle]}>{translate('search.saveSearchTooltipText')}</Text>
                        </View>
                    );
                },
            };
        }

        return baseMenuItem;
    };

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

    const savedSearchesMenuItems = () => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item], index) => createSavedSearchMenuItem(item, key, shouldUseNarrowLayout, index));
    };

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

    const isCannedQuery = SearchQueryUtils.isCannedSearchQuery(queryJSON);
    const activeItemIndex = isCannedQuery ? typeMenuItems.findIndex((item) => item.type === type) : -1;

    if (shouldUseNarrowLayout) {
        const title = searchName ?? (isCannedQuery ? undefined : SearchQueryUtils.buildUserReadableQueryString(queryJSON, personalDetails, cardList, reports, taxRates));

        return (
            <SearchTypeMenuNarrow
                typeMenuItems={typeMenuItems}
                activeItemIndex={activeItemIndex}
                queryJSON={queryJSON}
                title={title}
                savedSearchesMenuItems={savedSearchesMenuItems()}
            />
        );
    }

    return (
        <>
            <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                {typeMenuItems.map((item, index) => {
                    const onPress = singleExecution(() => {
                        SearchActions.clearAllFilters();
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
                        />
                    );
                })}
            </View>
            {savedSearches && Object.keys(savedSearches).length > 0 && (
                <>
                    <Text style={[styles.sectionTitle, styles.pb1, styles.mh3, styles.mt3]}>{translate('search.savedSearchesMenuItemTitle')}</Text>
                    <ScrollView
                        onScroll={onScroll}
                        ref={scrollViewRef}
                    >
                        {renderSavedSearchesSection(savedSearchesMenuItems())}
                    </ScrollView>
                    <DeleteConfirmModal />
                </>
            )}
        </>
    );
}

SearchTypeMenu.displayName = 'SearchTypeMenu';

export default SearchTypeMenu;
export type {SearchTypeMenuItem};
