import {useIsFocused} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import React from 'react';
import MenuItemList from '@components/MenuItemList';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import type {SavedSearchMenuItem} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import useSavedSearchTitles from './hooks/useSavedSearchTitles';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';

type SavedSearchListProps = {
    hash: number | undefined;
};

type SavedSearchMenuItemBuilderParams = {
    item: SaveSearchItem;
    key: string;
    index: number;
    hash: number | undefined;
    title: string;
    getOverflowMenu: (itemName: string, itemHash: number, itemQuery: string) => ReturnType<typeof getOverflowMenuUtil>;
    shouldShowSavedSearchTooltip: boolean;
    hideSavedSearchTooltip: (() => void) | undefined;
    renderSavedSearchTooltip: () => React.JSX.Element;
    itemStyle: SavedSearchMenuItem['style'];
    tooltipWrapperStyle: SavedSearchMenuItem['tooltipWrapperStyle'];
};

function buildSavedSearchMenuItem({
    item,
    key,
    index,
    hash,
    title,
    getOverflowMenu,
    shouldShowSavedSearchTooltip,
    hideSavedSearchTooltip,
    renderSavedSearchTooltip,
    itemStyle,
    tooltipWrapperStyle,
}: SavedSearchMenuItemBuilderParams): SavedSearchMenuItem {
    const isItemFocused = Number(key) === hash;
    const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, title, isItemFocused);

    return {
        ...baseMenuItem,
        role: CONST.ROLE.TAB,
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
        style: itemStyle,
        tooltipAnchorAlignment: {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        },
        tooltipShiftHorizontal: variables.savedSearchShiftHorizontal,
        tooltipShiftVertical: variables.savedSearchShiftVertical,
        tooltipWrapperStyle,
        renderTooltipContent: renderSavedSearchTooltip,
    };
}

function SavedSearchList({hash}: SavedSearchListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
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
    const reportAttributes = useReportAttributes();

    const {showDeleteModal} = useDeleteSavedSearch();
    const {
        shouldShowProductTrainingTooltip: shouldShowSavedSearchTooltip,
        renderProductTrainingTooltip: renderSavedSearchTooltip,
        hideProductTrainingTooltip: hideSavedSearchTooltip,
    } = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH, isFocused);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark', 'Pencil', 'Trashcan']);

    const taxRates = getAllTaxRates(allPolicies);
    const cardsForSavedSearchDisplay = mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList);

    const savedSearchTitles = useSavedSearchTitles({
        savedSearches,
        PersonalDetails: personalDetails,
        reports,
        taxRates,
        cardList: cardsForSavedSearchDisplay,
        cardFeeds: allFeeds,
        policies: allPolicies,
        currentUserAccountID,
        translate,
        feedKeysWithCards,
        reportAttributes,
    });

    const getOverflowMenu = (itemName: string, itemHash: number, itemQuery: string) => getOverflowMenuUtil(expensifyIcons, itemName, itemHash, itemQuery, translate, showDeleteModal);

    const itemStyle = [styles.alignItemsCenter];
    const tooltipWrapperStyle = [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper];

    const savedSearchesMenuItems = savedSearches
        ? Object.entries(savedSearches).map(([key, item], index) =>
              buildSavedSearchMenuItem({
                  item,
                  key,
                  index,
                  hash,
                  title: item.name === item.query ? (savedSearchTitles.get(item.query) ?? item.name) : item.name,
                  getOverflowMenu,
                  shouldShowSavedSearchTooltip,
                  hideSavedSearchTooltip,
                  renderSavedSearchTooltip,
                  itemStyle,
                  tooltipWrapperStyle,
              }),
          )
        : [];

    return (
        <MenuItemList
            menuItems={savedSearchesMenuItems}
            wrapperStyle={styles.sectionMenuItem(shouldUseNarrowLayout)}
            icon={expensifyIcons.Bookmark}
            iconWidth={variables.iconSizeNormal}
            iconHeight={variables.iconSizeNormal}
            shouldUseSingleExecution
        />
    );
}

export default SavedSearchList;
