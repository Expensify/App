import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import CardFeedIcon from '@components/CardFeedIcon';
import TableRowSkeleton from '@components/Skeletons/TableRowSkeleton';
import Table from '@components/Table';
import type {ActiveSorting, CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import useCompanyCards from '@hooks/useCompanyCards';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDomainOrWorkspaceAccountID, isMaskedCardNumberEqual} from '@libs/CardUtils';
import WorkspaceCompanyCardPageEmptyState from '@pages/workspace/companyCards/WorkspaceCompanyCardPageEmptyState';
import WorkspaceCompanyCardsFeedAddedEmptyPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsFeedPendingPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedPendingPage';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import WorkspaceCompanyCardsTableHeaderButtons from './WorkspaceCompanyCardsTableHeaderButtons';
import WorkspaceCompanyCardTableItem from './WorkspaceCompanyCardsTableItem';
import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableItem';

type CompanyCardsTableColumnKey = 'member' | 'card' | 'customCardName';

type WorkspaceCompanyCardsTableProps = {
    /** Current policy */
    policy: Policy | undefined;

    /** On assign card callback */
    onAssignCard: (cardID: string) => void;

    /** Whether to disable assign card button */
    isAssigningCardDisabled: boolean;
};

function WorkspaceCompanyCardsTable({policy, onAssignCard, isAssigningCardDisabled}: WorkspaceCompanyCardsTableProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();

    const {
        allCardFeeds,
        feedName,
        cardList,
        assignedCards,
        cardNames,
        cardFeedType,
        selectedFeed,
        onyxMetadata: {cardListMetadata, allCardFeedsMetadata},
    } = useCompanyCards(policy?.id);

    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});

    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed);

    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const [failedCompanyCardAssignments] = useOnyx(`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}`, {canBeMissing: true});

    const hasNoAssignedCard = Object.keys(assignedCards ?? {}).length === 0;
    const isInitiallyLoadingFeeds = isEmptyObject(allCardFeeds);
    const isNoFeed = !selectedFeed && !isInitiallyLoadingFeeds;
    const isFeedPending = !!selectedFeed?.pending;
    const isFeedAdded = !isInitiallyLoadingFeeds && !isFeedPending && !isNoFeed;

    const isGB = countryByIp === CONST.COUNTRY.GB;
    const shouldShowGBDisclaimer = isGB && isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) && (isNoFeed || hasNoAssignedCard);

    const cardFeedIcon = (
        <CardFeedIcon
            key={feedName}
            iconProps={{
                height: variables.cardIconHeight,
                width: variables.cardIconWidth,
                additionalStyles: styles.cardIcon,
            }}
            selectedFeed={feedName}
        />
    );

    const isLoadingFeed = !feedName || policy?.id === undefined;

    const isDirectCardFeed = cardFeedType === 'directFeed';
    const isLoadingDirectCardFeed = isDirectCardFeed && selectedFeed?.accountList === undefined;
    const isLoadingCommercialCardFeed = !isDirectCardFeed && (isLoadingOnyxValue(cardListMetadata) || cardList === undefined);
    const isLoadingCards = isLoadingOnyxValue(allCardFeedsMetadata) && (isLoadingDirectCardFeed || isLoadingCommercialCardFeed);
    const isLoadingPersonalDetails = isLoadingOnyxValue(personalDetailsMetadata);
    const isLoadingCardsTableData = isLoadingFeed || (!isOffline && isLoadingCards) || isLoadingPersonalDetails;

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

    const showCards = !isFeedPending && !isNoFeed && isFeedAdded;
    const data: WorkspaceCompanyCardTableItemData[] = showCards
        ? (cardNames?.map((cardName) => {
              const assignedCardPredicate = (card: Card) => (isDirectCardFeed ? card.cardName === cardName : isMaskedCardNumberEqual(card.cardName, cardName));

              const assignedCard = Object.values(assignedCards ?? {}).find(assignedCardPredicate);

              const failedCompanyCardAssignment = failedCompanyCardAssignments?.[cardName];

              const cardholder = assignedCard?.accountID ? personalDetails?.[assignedCard.accountID] : undefined;

              const customCardName = assignedCard?.cardID ? customCardNames?.[assignedCard.cardID] : undefined;

              const isCardDeleted = assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

              const isAssigned = !!assignedCard;

              return {cardName, customCardName, isCardDeleted, isAssigned, assignedCard, cardholder, failedCompanyCardAssignment};
          }) ?? [])
        : [];

    const renderItem = ({item, index}: ListRenderItemInfo<WorkspaceCompanyCardTableItemData>) => (
        <WorkspaceCompanyCardTableItem
            key={`${item.cardName}_${index}`}
            item={item}
            policyID={policy?.id ?? String(CONST.DEFAULT_NUMBER_ID)}
            domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
            CardFeedIcon={cardFeedIcon}
            isPlaidCardFeed={isDirectCardFeed}
            onAssignCard={onAssignCard}
            isAssigningCardDisabled={isAssigningCardDisabled}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            columnCount={columns.length}
        />
    );

    const keyExtractor = (item: WorkspaceCompanyCardTableItemData, index: number) => `${item.cardName}_${index}`;

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

        const isMatch =
            item.cardName.toLowerCase().includes(searchLower) ||
            (item.customCardName?.toLowerCase().includes(searchLower) ?? false) ||
            (item.cardholder?.displayName?.toLowerCase().includes(searchLower) ?? false) ||
            (item.cardholder?.login?.toLowerCase().includes(searchLower) ?? false);

        return isMatch || isAssignedCardMatch || isUnassignedCardMatch;
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

    const [activeSortingInWideLayout, setActiveSortingInWideLayout] = useState<ActiveSorting<CompanyCardsTableColumnKey> | undefined>(undefined);
    const isNarrowLayoutRef = useRef(shouldUseNarrowTableLayout);

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

    const showTableControls = !(isFeedPending && !!selectedFeed);

    const ListEmptyComponent = showCards ? <TableRowSkeleton fixedNumItems={5} /> : <WorkspaceCompanyCardsFeedAddedEmptyPage shouldShowGBDisclaimer={shouldShowGBDisclaimer} />;

    return (
        <Table
            ref={tableRef}
            data={isLoadingCardsTableData ? [] : data}
            columns={columns}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            isItemInFilter={isItemInFilter}
            filters={filterConfig}
            ListEmptyComponent={ListEmptyComponent}
        >
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

            {showCards && (
                <>
                    <View style={shouldUseNarrowTableLayout && styles.mb5}>
                        <WorkspaceCompanyCardsTableHeaderButtons
                            isLoadingFeed={isLoadingFeed}
                            policyID={policy?.id}
                            feedName={feedName}
                            showTableControls={showTableControls}
                            CardFeedIcon={cardFeedIcon}
                        />
                    </View>
                    {!shouldUseNarrowTableLayout && !isLoadingFeed && <Table.Header />}
                    <Table.Body />
                </>
            )}
        </Table>
    );
}

export default WorkspaceCompanyCardsTable;
