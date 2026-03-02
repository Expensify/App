import {useIsFocused} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import React from 'react';
import MenuItemList from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import type {SearchQueryJSON} from '@components/Search/types';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import type {SavedSearchMenuItem} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';

type SavedSearchListProps = {
    hash: number | undefined;
};

function SavedSearchList({hash}: SavedSearchListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();

    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    const {showDeleteModal} = useDeleteSavedSearch();
    const {
        shouldShowProductTrainingTooltip: shouldShowSavedSearchTooltip,
        renderProductTrainingTooltip: renderSavedSearchTooltip,
        hideProductTrainingTooltip: hideSavedSearchTooltip,
    } = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH, isFocused);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark', 'Pencil'] as const);

    const taxRates = getAllTaxRates(allPolicies);
    const cardsForSavedSearchDisplay = mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList);

    const getOverflowMenu = (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(expensifyIcons, itemName, itemHash, itemQuery, translate, showDeleteModal);

    const createSavedSearchMenuItem = (item: SaveSearchItem, key: string, index: number) => {
        let title = item.name;
        if (title === item.query) {
            const jsonQuery = buildSearchQueryJSON(item.query) ?? ({} as SearchQueryJSON);
            title = buildUserReadableQueryString({
                queryJSON: jsonQuery,
                PersonalDetails: personalDetails,
                reports,
                taxRates,
                cardList: cardsForSavedSearchDisplay,
                cardFeeds: allFeeds,
                policies: allPolicies,
                currentUserAccountID,
                autoCompleteWithSpace: false,
                translate,
                feedKeysWithCards,
            });
        }

        const isItemFocused = Number(key) === hash;
        const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, title, isItemFocused);

        return {
            ...baseMenuItem,
            sentryLabel: CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_MENU_ITEM,
            onPress: () => {
                setSearchContext(false);
                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item?.query ?? '', name: item?.name}));
            },
            rightComponent: (
                <SavedSearchItemThreeDotMenu
                    menuItems={getOverflowMenu(title, Number(key), item.query)}
                    isDisabledItem={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    hideProductTrainingTooltip={index === 0 && shouldShowSavedSearchTooltip ? hideSavedSearchTooltip : undefined}
                    shouldRenderTooltip={index === 0 && shouldShowSavedSearchTooltip}
                    renderTooltipContent={renderSavedSearchTooltip}
                />
            ),
            style: [styles.alignItemsCenter],
            tooltipAnchorAlignment: {
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            },
            tooltipShiftHorizontal: variables.savedSearchShiftHorizontal,
            tooltipShiftVertical: variables.savedSearchShiftVertical,
            tooltipWrapperStyle: [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper],
            renderTooltipContent: renderSavedSearchTooltip,
        };
    };

    const savedSearchesMenuItems = savedSearches ? Object.entries(savedSearches).map(([key, item], index) => createSavedSearchMenuItem(item, key, index)) : [];

    return (
        <MenuItemList
            menuItems={savedSearchesMenuItems}
            wrapperStyle={styles.sectionMenuItem}
            icon={expensifyIcons.Bookmark}
            iconWidth={variables.iconSizeNormal}
            iconHeight={variables.iconSizeNormal}
            shouldUseSingleExecution
        />
    );
}

export default SavedSearchList;
