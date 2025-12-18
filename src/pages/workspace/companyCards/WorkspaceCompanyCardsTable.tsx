import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import TableRowSkeleton from '@components/Skeletons/TableRowSkeleton';
import Table from '@components/Table';
import type {ActiveSorting, CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyFeeds, getPlaidInstitutionIconUrl, getPlaidInstitutionId, isCustomFeed, isMaskedCardNumberEqual} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import WorkspaceCompanyCardsFeedAddedEmptyPage from './WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsTableHeaderButtons from './WorkspaceCompanyCardsTableHeaderButtons';
import WorkspaceCompanyCardTableItem from './WorkspaceCompanyCardsTableItem';
import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableItem';

type CompanyCardsTableColumnKey = 'member' | 'card' | 'customCardName';

type WorkspaceCompanyCardsTableProps = {
    /** Selected feed */
    selectedFeed: CompanyCardFeedWithDomainID;

    /** Current policy id */
    policyID: string;

    /** Domain or workspace account ID */
    domainOrWorkspaceAccountID: number;

    /** On assign card callback */
    onAssignCard: (cardID?: string) => void;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    /** Whether to show GB disclaimer */
    shouldShowGBDisclaimer?: boolean;
};

function WorkspaceCompanyCardsTable({selectedFeed, policyID, onAssignCard, isAssigningCardDisabled, shouldShowGBDisclaimer, domainOrWorkspaceAccountID}: WorkspaceCompanyCardsTableProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const [cardsList, cardsListMetadata] = useCardsList(selectedFeed);
    const isLoadingCardsList = !isOffline && isLoadingOnyxValue(cardsListMetadata);
    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const isLoadingPersonalDetails = !isOffline && isLoadingOnyxValue(personalDetailsMetadata);
    const isLoadingCardsTableData = isLoadingCardsList || isLoadingPersonalDetails;

    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const [failedCompanyCardAssignments] = useOnyx(`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}`, {canBeMissing: true});

    const {cardList, ...assignedCards} = cardsList ?? {};
    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const companyCardFeedData = companyFeeds[selectedFeed];

    const isPlaidCardFeed = !!companyCardFeedData?.accountList;
    const cards = isPlaidCardFeed ? (companyCardFeedData?.accountList ?? []) : Object.keys(cardList ?? {});

    // When we reach the medium screen width or the narrow layout is active,
    // we want to hide the table header and the middle column of the card rows, so that the content is not overlapping.
    const shouldShowNarrowLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const tableRef = useRef<TableHandle<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey>>(null);

    const data: WorkspaceCompanyCardTableItemData[] =
        cards?.map((cardName) => {
            const assignedCardPredicate = (card: Card) => (isPlaidCardFeed ? card.cardName === cardName : isMaskedCardNumberEqual(card.cardName, cardName));

            const assignedCard = Object.values(assignedCards ?? {}).find(assignedCardPredicate);

            const failedCompanyCardAssignment = failedCompanyCardAssignments?.[cardName];

            const cardholder = assignedCard?.accountID ? personalDetails?.[assignedCard.accountID] : undefined;

            const customCardName = assignedCard?.cardID ? customCardNames?.[assignedCard.cardID] : undefined;

            const isCardDeleted = assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            const isAssigned = !!assignedCard;

            // Calculate cardIdentifier for unassigned cards
            let cardIdentifier: string | undefined;
            if (!assignedCard) {
                const isPlaid = !!getPlaidInstitutionId(selectedFeed);
                const isCommercial = isCustomFeed(selectedFeed);

                if (isPlaid) {
                    cardIdentifier = cardName;
                } else if (isCommercial) {
                    const cardValue = cardList?.[cardName] ?? cardName;
                    const digitsOnly = cardValue.replaceAll(/\D/g, '');
                    if (digitsOnly.length >= 10) {
                        const first6 = digitsOnly.substring(0, 6);
                        const last4 = digitsOnly.substring(digitsOnly.length - 4);
                        cardIdentifier = `${first6}${last4}`;
                    } else {
                        cardIdentifier = cardValue;
                    }
                } else {
                    cardIdentifier = cardList?.[cardName] ?? cardName;
                }
            }

            return {cardName, customCardName, isCardDeleted, isAssigned, assignedCard, cardholder, cardIdentifier, failedCompanyCardAssignment};
        }) ?? [];

    const renderItem = ({item, index}: ListRenderItemInfo<WorkspaceCompanyCardTableItemData>) => (
        <WorkspaceCompanyCardTableItem
            key={`${item.cardName}_${index}`}
            item={item}
            policyID={policyID}
            domainOrWorkspaceAccountID={domainOrWorkspaceAccountID}
            selectedFeed={selectedFeed}
            plaidIconUrl={getPlaidInstitutionIconUrl(selectedFeed)}
            isPlaidCardFeed={isPlaidCardFeed}
            onAssignCard={() => onAssignCard(item.cardIdentifier)}
            isAssigningCardDisabled={isAssigningCardDisabled}
            shouldUseNarrowTableRowLayout={shouldShowNarrowLayout}
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
                labelStyles: [styles.textAlignRight, styles.pr7],
            },
        },
    ];

    const [activeSortingInWideLayout, setActiveSortingInWideLayout] = useState<ActiveSorting<CompanyCardsTableColumnKey> | undefined>(undefined);
    const isNarrowLayoutRef = useRef(shouldShowNarrowLayout);

    // When we switch from wide to narrow layout, we want to save the active sorting and set it to the member column.
    // When switching back to wide layout, we want to restore the previous sorting.
    useEffect(() => {
        if (shouldShowNarrowLayout) {
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
    }, [activeSortingInWideLayout, shouldShowNarrowLayout]);

    // Show empty state when there are no cards
    if (!data.length && !isLoadingCardsTableData) {
        return (
            <View>
                <WorkspaceCompanyCardsTableHeaderButtons
                    policyID={policyID}
                    selectedFeed={selectedFeed}
                />
                <WorkspaceCompanyCardsFeedAddedEmptyPage
                    shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                    handleAssignCard={() => onAssignCard()}
                    isAssigningCardDisabled={isAssigningCardDisabled}
                />
            </View>
        );
    }

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
            ListEmptyComponent={!isOffline && isLoadingCardsTableData ? <TableRowSkeleton fixedNumItems={5} /> : undefined}
        >
            <View style={shouldShowNarrowLayout && styles.mb5}>
                <WorkspaceCompanyCardsTableHeaderButtons
                    policyID={policyID}
                    selectedFeed={selectedFeed}
                    shouldDisplayTableComponents
                />
            </View>

            {!shouldShowNarrowLayout && <Table.Header />}

            <Table.Body />
        </Table>
    );
}

export default WorkspaceCompanyCardsTable;
