import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TextStyle, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import type {MenuItemWithLink} from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {SearchQueryJSON} from '@components/Search/types';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {clearAllFilters} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString, isCannedSearchQuery} from '@libs/SearchQueryUtils';
import {createBaseSavedSearchMenuItem, createTypeMenuItems, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';

type SavedSearchMenuItem = MenuItemWithLink & {
    key: string;
    hash: string;
    query: string;
    styles?: Array<ViewStyle | TextStyle>;
};

type SearchTypeMenuNarrowProps = {
    queryJSON: SearchQueryJSON;
};

function SearchTypeMenuPopover({queryJSON}: SearchTypeMenuNarrowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    const {hash, policyID} = queryJSON;
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const personalDetails = usePersonalDetails();
    const [reports = {}] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const [userCardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardFeeds = {}] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds, userCardList), [userCardList, workspaceCardFeeds]);
    const {unmodifiedPaddings} = useStyledSafeAreaInsets();

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const openMenu = useCallback(() => {
        setIsPopoverVisible(true);
    }, []);
    const closeMenu = useCallback(() => setIsPopoverVisible(false), []);

    const typeMenuItems = useMemo(() => createTypeMenuItems(allPolicies, session?.email), [allPolicies, session?.email]);
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const searchParams = activeCentralPaneRoute?.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
    const isSearchNameModified = searchParams?.name === searchParams?.q;
    const searchName = isSearchNameModified ? undefined : searchParams?.name;
    const isCannedQuery = isCannedSearchQuery(queryJSON);
    const title = searchName ?? (isCannedQuery ? undefined : buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates, allCards));
    const activeItemIndex = isCannedQuery ? typeMenuItems.findIndex((item) => item.type === queryJSON.type) : -1;

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal, true, closeMenu),
        [closeMenu, showDeleteModal],
    );
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, index: number) => {
            let savedSearchTitle = item.name;
            if (savedSearchTitle === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                savedSearchTitle = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards);
            }

            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, savedSearchTitle, hash);

            return {
                ...baseMenuItem,
                onSelected: baseMenuItem.onPress,
                rightComponent: (
                    <ThreeDotsMenu
                        menuItems={getOverflowMenu(baseMenuItem.title ?? '', Number(baseMenuItem.hash ?? ''), item.query ?? '')}
                        anchorPosition={{horizontal: 0, vertical: 380}}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        disabled={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    />
                ),
                styles: [styles.textSupporting],
                isSelected: false,
                shouldCallAfterModalHide: true,
            };
        },
        [hash, getOverflowMenu, styles.textSupporting, personalDetails, reports, taxRates, allCards],
    );

    const savedSearchItems = useMemo(() => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item], index) => createSavedSearchMenuItem(item, key, index));
    }, [createSavedSearchMenuItem, savedSearches]);

    const currentSavedSearch = savedSearchItems.find((item) => Number(item.hash) === hash);

    const popoverMenuItems = useMemo(() => {
        const items = typeMenuItems.map((item, index) => {
            const isSelected = title ? false : index === activeItemIndex;

            return {
                text: translate(item.translationPath),
                onSelected: singleExecution(() => {
                    clearAllFilters();
                    Navigation.navigate(item.getRoute(policyID));
                }),
                isSelected,
                icon: item.icon,
                iconFill: isSelected ? theme.iconSuccessFill : theme.icon,
                iconRight: Expensicons.Checkmark,
                shouldShowRightIcon: isSelected,
                success: isSelected,
                containerStyle: isSelected ? [{backgroundColor: theme.border}] : undefined,
                shouldCallAfterModalHide: true,
            };
        });

        if (title && !currentSavedSearch) {
            items.push({
                text: title,
                onSelected: closeMenu,
                isSelected: !currentSavedSearch,
                icon: Expensicons.Filters,
                iconFill: theme.iconSuccessFill,
                success: true,
                containerStyle: undefined,
                iconRight: Expensicons.Checkmark,
                shouldShowRightIcon: false,
                shouldCallAfterModalHide: true,
            });
        }

        return items;
    }, [typeMenuItems, title, currentSavedSearch, activeItemIndex, translate, singleExecution, theme.iconSuccessFill, theme.icon, theme.border, policyID, closeMenu]);

    const allMenuItems = useMemo(() => {
        const items = [];
        items.push(...popoverMenuItems);

        if (savedSearchItems.length > 0) {
            items.push({
                text: translate('search.savedSearchesMenuItemTitle'),
                styles: [styles.textSupporting],
                disabled: true,
            });
            items.push(...savedSearchItems);
        }
        return items;
    }, [popoverMenuItems, savedSearchItems, styles.textSupporting, translate]);

    return (
        <>
            <Button
                innerStyles={[styles.searchRouterInputResults, styles.borderNone]}
                icon={Expensicons.Bookmark}
                onPress={openMenu}
            />
            <PopoverMenu
                menuItems={allMenuItems as PopoverMenuItem[]}
                isVisible={isPopoverVisible}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onClose={closeMenu}
                onItemSelected={closeMenu}
                anchorRef={buttonRef}
                shouldUseScrollView
                shouldUseModalPaddingStyle={false}
                innerContainerStyle={{paddingBottom: unmodifiedPaddings.bottom}}
            />
            <DeleteConfirmModal />
        </>
    );
}

SearchTypeMenuPopover.displayName = 'SearchTypeMenuPopover';

export default SearchTypeMenuPopover;
