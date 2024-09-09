import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchTypeMenuNarrow from './SearchTypeMenuNarrow';

type SavedSearchMenuItem = MenuItemBaseProps & {
    key: string;
    hash: string;
    styles: Array<ViewStyle | TextStyle>;
};

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON;
    isCustomQuery: boolean;
};

type SearchTypeMenuItem = {
    title: string;
    type: SearchDataTypes;
    icon: IconAsset;
    route?: Route;
};

function SearchTypeMenu({queryJSON, isCustomQuery}: SearchTypeMenuProps) {
    const {type, hash} = queryJSON;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();
    const [prevSavedSearchesLength, setPrevSavedSearchesLength] = useState(0);

    useEffect(() => {
        setPrevSavedSearchesLength(Object.keys(savedSearches ?? {}).length);
    }, [savedSearches]);

    const typeMenuItems: SearchTypeMenuItem[] = useMemo(
        () => [
            {
                title: translate('common.expenses'),
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                icon: Expensicons.Receipt,
                route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}),
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
        ],
        [translate],
    );

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number) => SearchUtils.getOverflowMenu(itemName, itemHash, queryJSON?.inputQuery ?? '', showDeleteModal),
        [queryJSON, showDeleteModal],
    );

    const createSavedSearchMenuItem = useCallback(
        (item: {name: string; query: string}, key: string, isNarrow: boolean) => {
            const baseMenuItem: SavedSearchMenuItem = {
                key: item.name,
                title: item.name,
                hash: key,
                shouldShowRightComponent: true,
                focused: Number(key) === hash,
                onPress: () => {
                    Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: item?.query ?? '', isCustomQuery: true}));
                },
                rightComponent: (
                    <ThreeDotsMenu
                        menuItems={getOverflowMenu(item.name, Number(key))}
                        anchorPosition={{horizontal: 0, vertical: 380}}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                    />
                ),
                styles: [styles.alignItemsCenter],
            };

            if (!isNarrow) {
                return {
                    ...baseMenuItem,
                    shouldRenderTooltip: Object.keys(savedSearches ?? {}).length === 1 && prevSavedSearchesLength === 0,
                    tooltipAnchorAlignment: {
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    },
                    tooltipShiftHorizontal: -32,
                    tooltipShiftVertical: 15,
                    tooltipWrapperStyle: [styles.bgPaleGreen, styles.mh4, styles.pv2],
                    renderTooltipContent: () => (
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Expensicons.Lightbulb
                                width={16}
                                height={16}
                                fill={styles.colorGreenSuccess.color}
                            />
                            <Text style={[styles.ml1, styles.textLabel]}>{translate('search.saveSearchTooltipText')}</Text>
                        </View>
                    ),
                };
            }

            return baseMenuItem;
        },
        [hash, savedSearches, styles, getOverflowMenu, prevSavedSearchesLength],
    );

    const savedSearchesMenuItems = useMemo(() => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item]) => createSavedSearchMenuItem(item, key, shouldUseNarrowLayout));
    }, [savedSearches, createSavedSearchMenuItem, shouldUseNarrowLayout]);

    const handleSavedSearches = useCallback(
        () => ({
            savedSearchesMenuItems,
            renderSavedSearchesSection: () => (
                <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                    <Text style={[styles.sectionTitle, styles.pb1]}>{translate('search.savedSearchesMenuItemTitle')}</Text>
                    <MenuItemList
                        menuItems={savedSearchesMenuItems}
                        wrapperStyle={styles.sectionMenuItem}
                        icon={Expensicons.Star}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        shouldUseSingleExecution
                        isPaneMenu
                    />
                </View>
            ),
        }),
        [savedSearchesMenuItems, styles, translate],
    );

    const activeItemIndex = typeMenuItems.findIndex((item) => item.type === type);

    if (shouldUseNarrowLayout) {
        const title = isCustomQuery ? SearchUtils.getSearchHeaderTitle(queryJSON) : undefined;

        return (
            <SearchTypeMenuNarrow
                typeMenuItems={typeMenuItems}
                activeItemIndex={activeItemIndex}
                title={title}
                handleSavedSearches={handleSavedSearches}
                queryJSON={queryJSON}
            />
        );
    }

    return (
        <>
            <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                {typeMenuItems.map((item, index) => {
                    const onPress = singleExecution(() => Navigation.navigate(item.route));

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
            {savedSearches && handleSavedSearches().renderSavedSearchesSection()}
            <DeleteConfirmModal />
        </>
    );
}

SearchTypeMenu.displayName = 'SearchTypeMenu';

export default SearchTypeMenu;
export type {SearchTypeMenuItem};
