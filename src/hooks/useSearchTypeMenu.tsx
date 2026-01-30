import {accountIDSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
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
import type {Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useDeleteSavedSearch from './useDeleteSavedSearch';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useSearchTypeMenuSections from './useSearchTypeMenuSections';
import useSingleExecution from './useSingleExecution';
import useSuggestedSearchDefaultNavigation from './useSuggestedSearchDefaultNavigation';
import useTheme from './useTheme';
import useThemeStyles from './useThemeStyles';
import useWindowDimensions from './useWindowDimensions';

export default function useSearchTypeMenu(queryJSON: SearchQueryJSON) {
    const {hash, similarSearchHash} = queryJSON;
    const shouldSkipSuggestedSearchNavigation = useMemo(() => shouldSkipSuggestedSearchNavigationForQuery(queryJSON), [queryJSON]);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    const {typeMenuSections, shouldShowSuggestedSearchSkeleton} = useSearchTypeMenuSections();
    const {clearSelectedTransactions} = useSearchContext();
    const {showDeleteModal} = useDeleteSavedSearch();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [reports = getEmptyObject<NonNullable<OnyxCollection<Report>>>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const taxRates = getAllTaxRates(allPolicies);
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {canBeMissing: true});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: false});
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Basket',
        'Bookmark',
        'Checkmark',
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

    const [isPopoverVisible, setIsPopoverVisible] = useState(false);

    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const flattenedMenuItems = useMemo(() => typeMenuSections.flatMap((section) => section.menuItems), [typeMenuSections]);

    useSuggestedSearchDefaultNavigation({
        shouldShowSkeleton: shouldShowSuggestedSearchSkeleton,
        flattenedMenuItems,
        similarSearchHash,
        clearSelectedTransactions,
        shouldSkipNavigation: shouldSkipSuggestedSearchNavigation,
    });

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
        (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(expensifyIcons, itemName, itemHash, itemQuery, translate, showDeleteModal, true, closeMenu),
        [translate, showDeleteModal, closeMenu, expensifyIcons],
    );

    const {savedSearchesMenuItems, isSavedSearchActive} = useMemo(() => {
        let savedSearchFocused = false;

        if (!savedSearches) {
            return {
                isSavedSearchActive: false,
                savedSearchesMenuItems: [],
            };
        }

        const menuItems: PopoverMenuItem[] = Object.entries(savedSearches).map(([key, item], index) => {
            let savedSearchTitle = item.name;

            if (savedSearchTitle === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                savedSearchTitle = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, nonPersonalAndWorkspaceCards, allFeeds, allPolicies, currentUserAccountID);
            }

            const isItemFocused = Number(key) === hash;
            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, savedSearchTitle, isItemFocused);

            savedSearchFocused ||= isItemFocused;

            return {
                ...baseMenuItem,
                onSelected: () => {
                    setSearchContext(false);
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
                isSelected: false,
                shouldCallAfterModalHide: true,
                icon: expensifyIcons.Bookmark,
                iconWidth: variables.iconSizeNormal,
                iconHeight: variables.iconSizeNormal,
                shouldIconUseAutoWidthStyle: false,
                text: baseMenuItem.title ?? '',
            };
        });

        return {
            savedSearchesMenuItems: menuItems,
            isSavedSearchActive: savedSearchFocused,
        };
    }, [savedSearches, hash, getOverflowMenu, expensifyIcons.Bookmark, personalDetails, reports, taxRates, nonPersonalAndWorkspaceCards, allFeeds, allPolicies, currentUserAccountID]);

    const activeItemIndex = useMemo(() => {
        // If we have a suggested search, then none of the menu items are active
        if (isSavedSearchActive) {
            return -1;
        }

        return flattenedMenuItems.findIndex((item) => item.similarSearchHash === similarSearchHash);
    }, [similarSearchHash, isSavedSearchActive, flattenedMenuItems]);

    const popoverMenuItems = useMemo(() => {
        return typeMenuSections
            .map((section, sectionIndex) => {
                const sectionItems: PopoverMenuItem[] = [
                    {
                        shouldShowBasicTitle: true,
                        text: translate(section.translationPath),
                        style: [styles.textSupporting],
                        disabled: true,
                        interactive: false,
                        shouldUseDefaultCursorWhenDisabled: true,
                    },
                ];

                if (section.translationPath === 'search.savedSearchesMenuItemTitle') {
                    sectionItems.push(...savedSearchesMenuItems);
                } else {
                    for (const [itemIndex, item] of section.menuItems.entries()) {
                        const previousItemCount = typeMenuSections.slice(0, sectionIndex).reduce((acc, sec) => acc + sec.menuItems.length, 0);
                        const flattenedIndex = previousItemCount + itemIndex;
                        const isSelected = flattenedIndex === activeItemIndex;
                        const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon] : item.icon;

                        sectionItems.push({
                            badgeText: item.badgeText,
                            text: translate(item.translationPath),
                            isSelected,
                            icon,
                            success: isSelected,
                            containerStyle: isSelected ? [{backgroundColor: theme.border}] : undefined,
                            shouldCallAfterModalHide: true,
                            onSelected: singleExecution(() => {
                                setSearchContext(false);
                                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item.searchQuery}));
                            }),
                        });
                    }
                }

                return sectionItems;
            })
            .flat();
    }, [typeMenuSections, translate, styles.textSupporting, savedSearchesMenuItems, activeItemIndex, theme.border, expensifyIcons, singleExecution]);

    const openMenu = useCallback(() => {
        setIsPopoverVisible(true);
    }, []);

    return {
        isPopoverVisible,
        delayPopoverMenuFirstRender,
        openMenu,
        closeMenu,
        allMenuItems: popoverMenuItems,
        theme,
        styles,
        windowHeight,
    };
}
