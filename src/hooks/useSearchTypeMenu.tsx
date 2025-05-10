import {useCallback, useEffect, useMemo, useState} from 'react';
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
import {buildSearchQueryJSON, buildUserReadableQueryString, isCannedSearchQuery} from '@libs/SearchQueryUtils';
import type {SavedSearchMenuItem} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, createTypeMenuItems, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
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

export default function useSearchTypeMenu(queryJSON: SearchQueryJSON, searchName?: string) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    const {hash, groupBy} = queryJSON;
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

    const typeMenuItems = useMemo(() => createTypeMenuItems(allPolicies, session?.email), [allPolicies, session?.email]);

    const isCannedQuery = isCannedSearchQuery(queryJSON);
    const shouldGroupByReports = groupBy === CONST.SEARCH.GROUP_BY.REPORTS;
    const [delayPopoverMenuFirstRender, setDelayPopoverMenuFirstRender] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setDelayPopoverMenuFirstRender(false);
        }, 100);
    }, []);

    const title = searchName ?? (isCannedQuery ? undefined : buildUserReadableQueryString(queryJSON, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies));
    const activeItemIndex = isCannedQuery ? typeMenuItems.findIndex((item) => item.type === queryJSON.type) : -1;

    const closeMenu = useCallback(() => {
        setIsPopoverVisible(false);
    }, []);

    const getOverflowMenu = useCallback(
        (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(itemName, itemHash, itemQuery, showDeleteModal, true, closeMenu),
        [showDeleteModal, closeMenu],
    );

    const currentSavedSearch = useMemo(() => {
        if (!savedSearches) {
            return undefined;
        }
        return Object.entries(savedSearches).find(([key]) => Number(key) === hash)?.[1];
    }, [savedSearches, hash]);

    const popoverMenuItems = useMemo(() => {
        const items = typeMenuItems.map((item, index) => {
            let isSelected = false;
            if (!title) {
                if (shouldGroupByReports) {
                    isSelected = item.translationPath === 'common.expenseReports';
                } else {
                    isSelected = index === activeItemIndex;
                }
            }

            return {
                text: translate(item.translationPath),
                onSelected: singleExecution(() => {
                    clearAllFilters();
                    Navigation.navigate(item.getRoute(item.getRoute()));
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
    }, [typeMenuItems, title, currentSavedSearch, activeItemIndex, translate, singleExecution, theme, closeMenu, shouldGroupByReports]);

    const processSavedSearches = useCallback(() => {
        if (!savedSearches) {
            setProcessedMenuItems(popoverMenuItems);
            return;
        }

        const items: PopoverMenuItem[] = [];
        items.push(...popoverMenuItems);

        const savedSearchItems = Object.entries(savedSearches).map(([key, item], index) => {
            let savedSearchTitle = item.name;

            if (savedSearchTitle === item.query) {
                const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
                savedSearchTitle = buildUserReadableQueryString(jsonQuery, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies);
            }

            const isItemFocused = Number(key) === hash;
            const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, savedSearchTitle, isItemFocused);

            return {
                text: savedSearchTitle,
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
                style: [styles.textSupporting],
                isSelected: false,
                shouldCallAfterModalHide: true,
                icon: Expensicons.Bookmark,
                iconWidth: variables.iconSizeNormal,
                iconHeight: variables.iconSizeNormal,
                shouldIconUseAutoWidthStyle: false,
                hash: key,
            };
        });

        if (savedSearchItems.length > 0) {
            items.push({
                text: translate('search.savedSearchesMenuItemTitle'),
                style: [styles.textSupporting],
                disabled: true,
            });
            items.push(...savedSearchItems);
        }

        setProcessedMenuItems(items);
    }, [savedSearches, popoverMenuItems, hash, getOverflowMenu, styles.textSupporting, personalDetails, reports, taxRates, allCards, cardFeedNamesWithType, allPolicies, translate]);

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
