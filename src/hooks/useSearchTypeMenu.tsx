import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {SearchQueryJSON} from '@components/Search/types';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import {clearAllFilters} from '@libs/actions/Search';
import {getCardFeedNamesWithType} from '@libs/CardFeedUtils';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import type {SavedSearchMenuItem} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, createTypeMenuSections, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useDeleteSavedSearch from './useDeleteSavedSearch';
import useLocalize from './useLocalize';
import useSingleExecution from './useSingleExecution';
import useTheme from './useTheme';
import useThemeStyles from './useThemeStyles';
import useWindowDimensions from './useWindowDimensions';

export default function useSearchTypeMenu(queryJSON: SearchQueryJSON) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    const {hash} = queryJSON;
    const {showDeleteModal, DeleteConfirmModal} = useDeleteSavedSearch();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const personalDetails = usePersonalDetails();
    const [reports = {}] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const taxRates = getAllTaxRates();
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [processedMenuItems, setProcessedMenuItems] = useState<PopoverMenuItem[]>([]);

    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);

    const cardFeedNamesWithType = useMemo(() => getCardFeedNamesWithType({workspaceCardFeeds, translate}), [workspaceCardFeeds, translate]);

    const typeMenuSections = useMemo(() => createTypeMenuSections(session, allPolicies), [allPolicies, session]);

    // this is a performance fix, rendering popover menu takes a lot of time and we don't need this component initially, that's why we postpone rendering it until everything else is rendered
    const [delayPopoverMenuFirstRender, setDelayPopoverMenuFirstRender] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setDelayPopoverMenuFirstRender(false);
        }, 100);
    }, []);

    const closeMenu = useCallback(() => {
        setIsPopoverVisible(false);
    }, []);

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal, true, closeMenu),
        [showDeleteModal, closeMenu],
    );

    const {savedSearchesMenuItems, isSavedSearchActive} = useMemo(() => {
        let savedSearchFocused = false;

        if (!savedSearches) {
            return {
                isSavedSearchActive: false,
                savedSearchesMenuItems: [],
            };
        }

        const menuItems = Object.entries(savedSearches).map(([key, item], index) => {
            let savedSearchTitle = item.name;

            if (savedSearchTitle === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                savedSearchTitle = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies);
            }

            const isItemFocused = Number(key) === hash;
            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, savedSearchTitle, isItemFocused);

            savedSearchFocused ||= isItemFocused;

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
        });

        return {
            savedSearchesMenuItems: menuItems,
            isSavedSearchActive: savedSearchFocused,
        };
    }, [savedSearches, hash, getOverflowMenu, styles.textSupporting, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies]);

    const activeItemIndex = useMemo(() => {
        // If we have a suggested search, then none of the menu items are active
        if (isSavedSearchActive) {
            return -1;
        }

        const flattenedMenuItems = typeMenuSections.map((section) => section.menuItems).flat();
        return flattenedMenuItems.findIndex((item) => {
            const searchQueryJSON = buildSearchQueryJSON(item.getSearchQuery());
            return searchQueryJSON?.hash === hash;
        });
    }, [hash, isSavedSearchActive, typeMenuSections]);

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
    }, [typeMenuSections, translate, styles.textSupporting, activeItemIndex, theme.iconSuccessFill, theme.icon, theme.border, singleExecution]);

    const processSavedSearches = useCallback(() => {
        if (!savedSearches) {
            setProcessedMenuItems(popoverMenuItems);
            return;
        }

        const items = [];
        items.push(...popoverMenuItems);

        if (savedSearchesMenuItems.length > 0) {
            items.push({
                shouldShowBasicTitle: true,
                text: translate('search.savedSearchesMenuItemTitle'),
                styles: [styles.textSupporting],
                disabled: true,
            });

            items.push(...savedSearchesMenuItems);
        }

        setProcessedMenuItems(items as PopoverMenuItem[]);
    }, [savedSearches, popoverMenuItems, savedSearchesMenuItems, translate, styles.textSupporting]);

    const openMenu = useCallback(() => {
        setIsPopoverVisible(true);
        // Defer heavy processing until after interactions
        InteractionManager.runAfterInteractions(() => {
            processSavedSearches();
        });
    }, [processSavedSearches]);

    return {
        isPopoverVisible,
        delayPopoverMenuFirstRender,
        openMenu,
        closeMenu,
        allMenuItems: processedMenuItems,
        DeleteConfirmModal,
        theme,
        styles,
        windowHeight,
    };
}
