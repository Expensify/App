import React, {createRef, useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScrollView from '@components/ScrollView';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as SearchUtils from '@libs/SearchUtils';
import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchTypeMenuNarrow from './SearchTypeMenuNarrow';

type SavedSearchMenuItem = MenuItemBaseProps & {
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
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const threeDotsMenuContainerRef = useRef({});

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
            if (!threeDotsMenuContainerRef.current?.[key]) {
                threeDotsMenuContainerRef.current = {...threeDotsMenuContainerRef.current, [key]: createRef()};
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
            rightComponent: (
                    <View ref={threeDotsMenuContainerRef?.current?.[key]}>
                    <ThreeDotsMenu
                            onIconPress={() => {
                                threeDotsMenuContainerRef.current[key].current?.measureInWindow((x, y, width, height) => {
                                    setThreeDotsMenuPosition({
                                        horizontal: x + width,
                                        vertical: y + height,
                                    });
                                });
                            }}
                        menuItems={getOverflowMenu(item.name, Number(key), item.query)}
                        anchorPosition={threeDotsMenuPosition}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                    />
                    </View>
            ),
            styles: [styles.alignItemsCenter],
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

    const savedSearchesMenuItems = () => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item]) => createSavedSearchMenuItem(item as SaveSearchItem, key, shouldUseNarrowLayout));
    };

    const renderSavedSearchesSection = useCallback(
        (menuItems: MenuItemWithLink[]) => (
            <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                <Text style={[styles.sectionTitle, styles.pb1]}>{translate('search.savedSearchesMenuItemTitle')}</Text>
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
        [styles, translate],
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
                            hoverAndPressStyle={styles.hoveredComponentBG}
                            onPress={onPress}
                            isPaneMenu
                        />
                    );
                })}
            </View>
            {savedSearches && Object.keys(savedSearches).length > 0 && (
                <>
                    <ScrollView>{renderSavedSearchesSection(savedSearchesMenuItems())}</ScrollView>
                    <DeleteConfirmModal />
                </>
            )}
        </>
    );
}

SearchTypeMenu.displayName = 'SearchTypeMenu';

export default SearchTypeMenu;
export type {SearchTypeMenuItem};
