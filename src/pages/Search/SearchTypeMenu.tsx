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
import * as SearchUtils from '@libs/SearchUtils';
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
};

type SearchTypeMenuItem = {
    title: string;
    type: SearchDataTypes;
    icon: IconAsset;
    route?: Route;
};

function SearchTypeMenu({queryJSON}: SearchTypeMenuProps) {
    const {type, hash} = queryJSON;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [shouldHideSavedSearchRenameTooltip] = useOnyx(ONYXKEYS.NVP_SHOULD_HIDE_SAVED_SEARCH_RENAME_TOOLTIP, {initialValue: true});
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
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}),
        },
        {
            title: translate('common.chats'),
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            icon: Expensicons.ChatBubbles,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.TRIP.ALL)}),
        },
        {
            title: translate('workspace.common.invoices'),
            type: CONST.SEARCH.DATA_TYPES.INVOICE,
            icon: Expensicons.InvoiceGeneric,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.INVOICE.ALL)}),
        },
        {
            title: translate('travel.trips'),
            type: CONST.SEARCH.DATA_TYPES.TRIP,
            icon: Expensicons.Suitcase,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.ALL)}),
        },
    ];

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => SearchUtils.getOverflowMenu(itemName, itemHash, itemQuery, showDeleteModal),
        [showDeleteModal],
    );

    const createSavedSearchMenuItem = (item: SaveSearchItem, key: string, isNarrow: boolean) => {
        let title = item.name;
        if (title === item.query) {
            const jsonQuery = SearchUtils.buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
            title = SearchUtils.getSearchHeaderTitle(jsonQuery, personalDetails, cardList, reports, taxRates);
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
                Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: item?.query ?? ''}));
            },
            rightComponent: <SavedSearchItemThreeDotMenu menuItems={getOverflowMenu(item.name, Number(key), item.query)} />,
            styles: [styles.alignItemsCenter],
            pendingAction: item.pendingAction,
        };

        if (!isNarrow) {
            return {
                ...baseMenuItem,
                shouldRenderTooltip: !shouldHideSavedSearchRenameTooltip,
                tooltipAnchorAlignment: {
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                },
                tooltipShiftHorizontal: -32,
                tooltipShiftVertical: 15,
                tooltipWrapperStyle: [styles.bgPaleGreen, styles.mh4, styles.pv2],
                renderTooltipContent: () => {
                    SearchActions.dismissSavedSearchRenameTooltip();
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
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        return Object.entries(savedSearches).map(([key, item]) => createSavedSearchMenuItem(item as SaveSearchItem, key, shouldUseNarrowLayout));
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
                    isPaneMenu
                />
            </View>
        ),
        [styles],
    );

    const isCannedQuery = SearchUtils.isCannedSearchQuery(queryJSON);
    const activeItemIndex = isCannedQuery ? typeMenuItems.findIndex((item) => item.type === type) : -1;

    if (shouldUseNarrowLayout) {
        const title = isCannedQuery ? undefined : SearchUtils.getSearchHeaderTitle(queryJSON, personalDetails, cardList, reports, taxRates);

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
                            focused={index === activeItemIndex}
                            onPress={onPress}
                            isPaneMenu
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
