import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TextStyle, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import type {MenuItemWithLink} from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import type {SearchQueryJSON} from '@components/Search/types';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useLocalize from '@hooks/useLocalize';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {clearAllFilters} from '@libs/actions/Search';
import {getCardFeedNamesWithType} from '@libs/CardFeedUtils';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import {createBaseSavedSearchMenuItem, createTypeMenuSections, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const {hash} = queryJSON;
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [reports = {}] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const taxRates = getAllTaxRates();
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const {unmodifiedPaddings} = useSafeAreaPaddings();

    const cardFeedNamesWithType = useMemo(() => {
        return getCardFeedNamesWithType({workspaceCardFeeds, translate});
    }, [translate, workspaceCardFeeds]);

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const openMenu = useCallback(() => {
        setIsPopoverVisible(true);
    }, []);
    const closeMenu = useCallback(() => setIsPopoverVisible(false), []);

    // this is a performance fix, rendering popover menu takes a lot of time and we don't need this component initially, that's why we postpone rendering it until everything else is rendered
    const [delayPopoverMenuFirstRender, setDelayPopoverMenuFirstRender] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setDelayPopoverMenuFirstRender(false);
        }, 100);
    }, []);

    const typeMenuSections = useMemo(() => createTypeMenuSections(session, allPolicies), [allPolicies, session]);

    const activeItemIndex = useMemo(() => {
        const flattenedMenuItems = typeMenuSections.map((section) => section.menuItems).flat();
        return flattenedMenuItems.findIndex((item) => {
            const searchQueryJSON = buildSearchQueryJSON(item.getSearchQuery());
            return searchQueryJSON?.hash === hash;
        });
    }, [hash, typeMenuSections]);

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal, true, closeMenu),
        [closeMenu, showDeleteModal],
    );
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const createSavedSearchMenuItem = useCallback(
        (item: SaveSearchItem, key: string, index: number) => {
            let savedSearchTitle = item.name;
            if (savedSearchTitle === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                savedSearchTitle = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies);
            }
            const isItemFocused = Number(key) === hash;
            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, savedSearchTitle, isItemFocused);

            return {
                ...baseMenuItem,
                onSelected: () => {
                    clearAllFilters();
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item?.query ?? '', name: item?.name}));
                },
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
                icon: Expensicons.Bookmark,
                iconWidth: variables.iconSizeNormal,
                iconHeight: variables.iconSizeNormal,
                shouldIconUseAutoWidthStyle: false,
            };
        },
        [hash, getOverflowMenu, styles.textSupporting, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies],
    );

    const savedSearchItems = useMemo(() => {
        if (!savedSearches) {
            return [];
        }
        return Object.entries(savedSearches).map(([key, item], index) => createSavedSearchMenuItem(item, key, index));
    }, [createSavedSearchMenuItem, savedSearches]);

    const popoverMenuItems = useMemo(() => {
        return typeMenuSections
            .map((section, sectionIndex) => {
                const sectionItems: PopoverMenuItem[] = [
                    {
                        shouldShowBasicTitle: true,
                        text: translate(section.translationPath),
                        style: [styles.textSupporting],
                        disabled: true,
                    },
                ];

                section.menuItems.forEach((item, itemIndex) => {
                    const previousItemCount = typeMenuSections.slice(0, sectionIndex).reduce((acc, sec) => acc + sec.menuItems.length, 0);
                    const flattenedIndex = previousItemCount + itemIndex;
                    const isSelected = flattenedIndex === activeItemIndex;

                    sectionItems.push({
                        text: translate(item.translationPath),
                        isSelected,
                        icon: item.icon,
                        iconFill: isSelected ? theme.iconSuccessFill : theme.icon,
                        iconRight: Expensicons.Checkmark,
                        shouldShowRightIcon: isSelected,
                        success: isSelected,
                        containerStyle: isSelected ? [{backgroundColor: theme.border}] : undefined,
                        shouldCallAfterModalHide: true,
                        onSelected: singleExecution(() => {
                            clearAllFilters();
                            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item.getSearchQuery()}));
                        }),
                    });
                });

                return sectionItems;
            })
            .flat();
    }, [typeMenuSections, translate, styles.textSupporting, singleExecution, theme.iconSuccessFill, theme.icon, theme.border, activeItemIndex]);

    const allMenuItems = useMemo(() => {
        const items = [];
        items.push(...popoverMenuItems);

        if (savedSearchItems.length > 0) {
            items.push({
                text: translate('search.savedSearchesMenuItemTitle'),
                styles: [styles.textSupporting, styles.textLabel],
                disabled: true,
            });
            items.push(...savedSearchItems);
        }
        return items;
    }, [popoverMenuItems, savedSearchItems, styles.textLabel, styles.textSupporting, translate]);

    return (
        <>
            <Button
                innerStyles={[{backgroundColor: theme.sidebarHover}]}
                icon={Expensicons.Bookmark}
                onPress={openMenu}
            />
            {!delayPopoverMenuFirstRender && (
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
                    shouldAvoidSafariException
                />
            )}
            <DeleteConfirmModal />
        </>
    );
}

SearchTypeMenuPopover.displayName = 'SearchTypeMenuPopover';

export default SearchTypeMenuPopover;
