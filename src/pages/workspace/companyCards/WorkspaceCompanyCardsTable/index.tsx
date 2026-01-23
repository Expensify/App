import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import CardFeedIcon from '@components/CardFeedIcon';
import ScrollView from '@components/ScrollView';
import TableRowSkeleton from '@components/Skeletons/TableRowSkeleton';
import Table from '@components/Table';
import type {ActiveSorting, CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useCompanyCards from '@hooks/useCompanyCards';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCardName, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import WorkspaceCompanyCardPageEmptyState from '@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedAddedEmptyPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsFeedPendingPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedPendingPage';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import WorkspaceCompanyCardsTableHeaderButtons from './WorkspaceCompanyCardsTableHeaderButtons';
import WorkspaceCompanyCardTableItem from './WorkspaceCompanyCardsTableItem';
import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableItem';

type CompanyCardsTableColumnKey = 'member' | 'card' | 'customCardName';

type WorkspaceCompanyCardsTableProps = {
    /** Current policy */
    policy: Policy | undefined;

    /** On assign card callback */
    onAssignCard: (cardID: string, encryptedCardNumber: string) => void;

    /** Whether to disable assign card button */
    isAssigningCardDisabled: boolean;
};

function WorkspaceCompanyCardsTable({policy, onAssignCard, isAssigningCardDisabled}: WorkspaceCompanyCardsTableProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const {
        feedName,
        cardList,
        assignedCards,
        cardNames,
        cardFeedType,
        selectedFeed,
        onyxMetadata: {cardListMetadata, lastSelectedFeedMetadata, allCardFeedsMetadata},
    } = useCompanyCards({policyID: policy?.id});
    const isDirectCardFeed = cardFeedType === 'directFeed';

    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed);

    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});

    const hasNoAssignedCard = Object.keys(assignedCards ?? {}).length === 0;
    const [failedCompanyCardAssignments] = useOnyx(`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}_${feedName ?? ''}`, {canBeMissing: true});
    const isInitiallyLoadingFeeds = isLoadingOnyxValue(allCardFeedsMetadata);

    const isNoFeed = !selectedFeed && !isInitiallyLoadingFeeds;
    const isFeedPending = !!selectedFeed?.pending;
    const isLoadingFeed = (!feedName && isInitiallyLoadingFeeds) || policy?.id === undefined || isLoadingOnyxValue(lastSelectedFeedMetadata);

    const isLoadingCards = cardFeedType === 'directFeed' ? selectedFeed?.accountList === undefined : isLoadingOnyxValue(cardListMetadata) || cardList === undefined;
    const isLoadingPage = !isOffline && (isLoadingFeed || isLoadingOnyxValue(personalDetailsMetadata));

    const showCards = !isInitiallyLoadingFeeds && !isFeedPending && !isNoFeed && !isLoadingFeed;
    const showTableControls = showCards && !!selectedFeed && !isLoadingCards;

    const isGB = countryByIp === CONST.COUNTRY.GB;
    const shouldShowGBDisclaimer = isGB && (isNoFeed || hasNoAssignedCard);

    // When we reach the medium screen width or the narrow layout is active,
    // we want to hide the table header and the middle column of the card rows, so that the content is not overlapping.
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const tableRef = useRef<TableHandle<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey>>(null);

    const columns: Array<TableColumn<CompanyCardsTableColumnKey>> = [
        {
            key: 'member',
            label: translate('common.member'),
        },
        {
            key: 'card',
            label: translate('workspace.companyCards.card'),
        },
        {
            key: 'customCardName',
            label: translate('workspace.companyCards.cardName'),
            styling: {
                containerStyles: [styles.justifyContentEnd, styles.pr3],
            },
        },
    ];

    const cardsData: WorkspaceCompanyCardTableItemData[] = isLoadingCards
        ? []
        : (cardNames?.map((cardName) => {
              // For direct feeds cardID equals cardName, for commercial feeds it's looked up from cardList
              const cardID = isDirectCardFeed ? cardName : (cardList?.[cardName] ?? '');
              const failedCompanyCardAssignment = failedCompanyCardAssignments?.[cardID];

              if (failedCompanyCardAssignment) {
                  return failedCompanyCardAssignment;
              }
              const assignedCard = Object.values(assignedCards ?? {}).find((card: Card) => card.encryptedCardNumber === cardID || card.cardName === cardName);
              const cardholder = assignedCard?.accountID ? personalDetails?.[assignedCard.accountID] : undefined;

              return {
                  cardName,
                  encryptedCardNumber: cardID,
                  customCardName: assignedCard?.cardID && customCardNames?.[assignedCard.cardID] ? customCardNames?.[assignedCard.cardID] : getDefaultCardName(cardholder?.displayName ?? ''),
                  isCardDeleted: assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                  isAssigned: !!assignedCard,
                  hasFailedCardAssignment: false,
                  assignedCard,
                  cardholder,
                  errors: assignedCard?.errors,
                  pendingAction: assignedCard?.pendingAction,
              };
          }) ?? []);

    const keyExtractor = (item: WorkspaceCompanyCardTableItemData, index: number) => `${item.cardName}_${index}`;

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
    });

    const compareItems: CompareItemsCallback<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (a.isAssigned && !b.isAssigned) {
            return 1 * orderMultiplier;
        }

        if (!a.isAssigned && b.isAssigned) {
            return -1 * orderMultiplier;
        }

        const cardNameSortingResult = localeCompare(a.cardName, b.cardName) * orderMultiplier;

        if (!a.isAssigned && !b.isAssigned) {
            return cardNameSortingResult;
        }

        if (activeSorting.columnKey === 'member') {
            const aMemberString = a.cardholder?.displayName ?? a.cardholder?.login ?? '';
            const bMemberString = b.cardholder?.displayName ?? b.cardholder?.login ?? '';

            return localeCompare(aMemberString, bMemberString) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'card') {
            return cardNameSortingResult;
        }

        if (activeSorting.columnKey === 'customCardName') {
            return localeCompare(a.customCardName ?? '', b.customCardName ?? '') * orderMultiplier;
        }

        return 0;
    };

    const assignedKeyword = translate('workspace.moreFeatures.companyCards.assignedCards').toLowerCase();
    const unassignedKeyword = translate('workspace.moreFeatures.companyCards.unassignedCards').toLowerCase();

    const isItemInSearch: IsItemInSearchCallback<WorkspaceCompanyCardTableItemData> = (item, searchString) => {
        const searchLower = searchString.toLowerCase();

        // Include assigned/unassigned cards if the user is typing "Unassigned" or "Assigned" (localized)
        const isAssignedCardMatch = assignedKeyword.startsWith(searchLower) && item.isAssigned;
        const isUnassignedCardMatch = unassignedKeyword.startsWith(searchLower) && !item.isAssigned;

        const searchTokens = [item.cardName, item.customCardName ?? '', item.cardholder?.displayName ?? '', item.cardholder?.login ?? ''];

        const matchingItems = tokenizedSearch([item], searchString, () => searchTokens);
        return matchingItems.length > 0 || isAssignedCardMatch || isUnassignedCardMatch;
    };

    const isItemInFilter: IsItemInFilterCallback<WorkspaceCompanyCardTableItemData> = (item, filterValues) => {
        if (!filterValues || filterValues.length === 0) {
            return true;
        }
        if (filterValues.includes('all')) {
            return true;
        }
        if (filterValues.includes('assigned') && item.isAssigned) {
            return true;
        }
        if (filterValues.includes('unassigned') && !item.isAssigned) {
            return true;
        }
        return false;
    };

    const filterConfig: FilterConfig = {
        status: {
            filterType: 'single-select',
            options: [
                {label: translate('workspace.moreFeatures.companyCards.allCards'), value: 'all'},
                {label: translate('workspace.moreFeatures.companyCards.assignedCards'), value: 'assigned'},
                {label: translate('workspace.moreFeatures.companyCards.unassignedCards'), value: 'unassigned'},
            ],
            default: 'all',
        },
    };

    const cardFeedIcon = (
        <CardFeedIcon
            key={feedName}
            iconProps={{
                height: variables.cardIconHeight,
                width: variables.cardIconWidth,
                additionalStyles: styles.cardIcon,
            }}
            selectedFeed={feedName}
            useSkeletonLoader
        />
    );

    const renderItem = ({item, index}: ListRenderItemInfo<WorkspaceCompanyCardTableItemData>) => (
        <WorkspaceCompanyCardTableItem
            key={`${item.cardName}_${index}`}
            item={item}
            policyID={policy?.id ?? String(CONST.DEFAULT_NUMBER_ID)}
            feed={feedName}
            domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
            CardFeedIcon={cardFeedIcon}
            isPlaidCardFeed={isDirectCardFeed}
            onAssignCard={onAssignCard}
            isAssigningCardDisabled={isAssigningCardDisabled}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            columnCount={columns.length}
        />
    );

    const [activeSortingInWideLayout, setActiveSortingInWideLayout] = useState<ActiveSorting<CompanyCardsTableColumnKey> | undefined>(undefined);
    const isNarrowLayoutRef = useRef(shouldUseNarrowTableLayout);
    const shouldRenderHeaderAsChild = !shouldUseNarrowLayout || ((isFeedPending || isLoadingPage) && !showCards);
    // When we switch from wide to narrow layout, we want to save the active sorting and set it to the member column.
    // When switching back to wide layout, we want to restore the previous sorting.
    useEffect(() => {
        if (shouldUseNarrowTableLayout) {
            if (isNarrowLayoutRef.current) {
                return;
            }

            isNarrowLayoutRef.current = true;
            const activeSorting = tableRef.current?.getActiveSorting();
            setActiveSortingInWideLayout(activeSorting);
            tableRef.current?.updateSorting({columnKey: 'member', order: 'asc'});
            return;
        }

        if (!activeSortingInWideLayout || !isNarrowLayoutRef.current) {
            return;
        }

        isNarrowLayoutRef.current = false;
        tableRef.current?.updateSorting(activeSortingInWideLayout);
    }, [activeSortingInWideLayout, shouldUseNarrowTableLayout]);

    const headerButtonsComponent =
        showCards || isLoadingPage || isFeedPending ? (
            <View style={shouldUseNarrowLayout && styles.mb5}>
                <WorkspaceCompanyCardsTableHeaderButtons
                    isLoading={isLoadingPage}
                    policyID={policy?.id}
                    feedName={feedName}
                    showTableControls={showTableControls}
                    CardFeedIcon={cardFeedIcon}
                />
            </View>
        ) : undefined;

    return (
        <Table
            ref={tableRef}
            data={cardsData}
            columns={columns}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            isItemInFilter={isItemInFilter}
            filters={filterConfig}
            ListEmptyComponent={isLoadingCards ? <TableRowSkeleton fixedNumItems={5} /> : <WorkspaceCompanyCardsFeedAddedEmptyPage shouldShowGBDisclaimer={shouldShowGBDisclaimer} />}
            ListHeaderComponent={shouldUseNarrowLayout ? headerButtonsComponent : undefined}
        >
            {shouldRenderHeaderAsChild && headerButtonsComponent}

            {(isLoadingPage || isFeedPending || isNoFeed) && (
                <ScrollView>
                    {isLoadingPage && <TableRowSkeleton fixedNumItems={5} />}

                    {isFeedPending && (
                        <View style={styles.flex1}>
                            <WorkspaceCompanyCardsFeedPendingPage />
                        </View>
                    )}

                    {isNoFeed && (
                        <View style={styles.flex1}>
                            <WorkspaceCompanyCardPageEmptyState
                                policy={policy}
                                shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                            />
                        </View>
                    )}
                </ScrollView>
            )}

            {showCards && (
                <>
                    {!shouldUseNarrowTableLayout && !isLoadingFeed && <Table.Header />}
                    <Table.Body contentContainerStyle={tableBodyContentContainerStyle} />
                </>
            )}
        </Table>
    );
}

export default WorkspaceCompanyCardsTable;
