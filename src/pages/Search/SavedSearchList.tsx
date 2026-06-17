import {accountIDSelector, emailSelector} from '@selectors/Session';
import React, {useEffect} from 'react';
import MenuItemList from '@components/MenuItemList';
import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShareSavedSearch from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import {seedMyExpensesSearch, setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- "My expenses" seed is intentionally paid-policy-only: free Submit plans have no approval flow, so there is no dual-role use case to seed.
import {getAllTaxRates, isPaidGroupPolicy, isPolicyApprover, isPolicyUser} from '@libs/PolicyUtils';
import type {SavedSearchMenuItem} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, getOverflowMenu as getOverflowMenuUtil} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import useSavedSearchTitles from './hooks/useSavedSearchTitles';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';
import SearchTypeMenuItem from './SearchTypeMenuItem';

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
    itemStyle: SavedSearchMenuItem['style'];
    isCopied: boolean;
};

function buildSavedSearchMenuItem({item, key, index, hash, title, getOverflowMenu, itemStyle, isCopied}: SavedSearchMenuItemBuilderParams): SavedSearchMenuItem {
    const isItemFocused = Number(key) === hash;
    const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, title, isItemFocused);

    return {
        ...baseMenuItem,
        role: CONST.ROLE.TAB,
        sentryLabel: CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_MENU_ITEM,
        onPress: () => {
            setSearchContext(false);
            Navigation.navigate(
                ROUTES.SEARCH_ROOT.getRoute({
                    query: item?.query ?? '',
                    name: item?.name,
                }),
            );
        },
        rightComponent: (
            <SavedSearchItemThreeDotMenu
                menuItems={getOverflowMenu(title, Number(key), item.query)}
                isDisabledItem={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                isCopied={isCopied}
            />
        ),
        style: itemStyle,
    };
}

function SavedSearchList({hash}: SavedSearchListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [hasSeededMyExpensesSearch] = useOnyx(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {
        selector: accountIDSelector,
    });
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {
        selector: emailSelector,
    });
    const reportAttributes = useReportAttributes();

    const {showDeleteModal} = useDeleteSavedSearch();

    useEffect(() => {
        if (hasSeededMyExpensesSearch || currentUserAccountID === -1 || !currentUserEmail || savedSearches === undefined) {
            return;
        }

        let shouldShowSubmitSuggestion = false;
        let shouldShowApproveSuggestion = false;

        for (const policy of Object.values(allPolicies ?? {})) {
            if (!policy) {
                continue;
            }
            shouldShowSubmitSuggestion = shouldShowSubmitSuggestion || isPolicyUser(policy, currentUserEmail);

            const isPaidPolicy = isPaidGroupPolicy(policy);
            const isSubmittedTo = Object.values(policy.employeeList ?? {}).some((employee) => employee.submitsTo === currentUserEmail || employee.forwardsTo === currentUserEmail);
            const isUserApprover = isPolicyApprover(policy, currentUserEmail);
            const isApprovalEnabled = policy.approvalMode ? policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
            const isPolicyEligibleForApprove = isPaidPolicy && isApprovalEnabled && (isUserApprover || isSubmittedTo);
            shouldShowApproveSuggestion = shouldShowApproveSuggestion || isPolicyEligibleForApprove;
        }

        if (shouldShowSubmitSuggestion && shouldShowApproveSuggestion) {
            seedMyExpensesSearch(currentUserAccountID, translate('search.mySavedSearch'));
        }
    }, [hasSeededMyExpensesSearch, currentUserAccountID, currentUserEmail, allPolicies, savedSearches, translate]);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark', 'Pencil', 'Trashcan', 'LinkCopy', 'Checkmark']);
    const {copiedHash, handleShare} = useShareSavedSearch();

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

    const getOverflowMenu = (itemName: string, itemHash: number, itemQuery: string) =>
        getOverflowMenuUtil(expensifyIcons, itemName, itemHash, itemQuery, translate, showDeleteModal, false, undefined, {
            onShare: () => handleShare(itemHash, itemQuery),
            isCopied: copiedHash === itemHash,
        });

    const itemStyle = [styles.alignItemsCenter];

    const savedSearchesMenuItems = savedSearches
        ? Object.entries(savedSearches).map(([key, item], index) =>
              buildSavedSearchMenuItem({
                  item,
                  key,
                  index,
                  hash,
                  title: item.name === item.query ? (savedSearchTitles.get(item.query) ?? item.name) : item.name,
                  getOverflowMenu,
                  itemStyle,
                  isCopied: copiedHash === Number(key),
              }),
          )
        : [];

    if (isVisuallyCollapsed) {
        return savedSearchesMenuItems.map((item) => (
            <SearchTypeMenuItem
                key={item.key}
                title={item.title ?? ''}
                icon={expensifyIcons.Bookmark}
                focused={item.focused}
                onPress={(event) => {
                    if (item.disabled || !item.onPress || !event) {
                        return;
                    }
                    return item.onPress(event);
                }}
            />
        ));
    }

    return (
        <MenuItemList
            menuItems={savedSearchesMenuItems}
            wrapperStyle={[styles.sectionMenuItem(shouldUseNarrowLayout), styles.searchTypeMenuItemPadding]}
            icon={expensifyIcons.Bookmark}
            iconWidth={variables.iconSizeNormal}
            iconHeight={variables.iconSizeNormal}
            shouldUseSingleExecution
        />
    );
}

export default SavedSearchList;
