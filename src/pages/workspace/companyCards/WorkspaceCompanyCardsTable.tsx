import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Table from '@components/Table';
import type {ActiveSorting, CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDefaultName} from '@libs/actions/Card';
import {getCompanyFeeds, getPlaidInstitutionIconUrl} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsFeedAddedEmptyPage from './WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardTableItem from './WorkspaceCompanyCardsTableItem';
import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableItem';

type CompanyCardsTableColumnKey = 'member' | 'card' | 'customCardName';

type WorkspaceCompanyCardsTableProps = {
    /** Selected feed */
    selectedFeed: CompanyCardFeedWithDomainID;

    /** List of company cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;

    /** Current policy id */
    policyID: string;

    /** On assign card callback */
    onAssignCard: () => void;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    /** Whether to show GB disclaimer */
    shouldShowGBDisclaimer?: boolean;

    /** Render prop for header buttons - receives SearchBar and FilterButtons as children */
    renderHeaderButtons?: (searchBar: React.ReactNode, filterButtons: React.ReactNode) => React.ReactNode;
};

function WorkspaceCompanyCardsTable({
    selectedFeed,
    cardsList,
    policyID,
    onAssignCard,
    isAssigningCardDisabled,
    shouldShowGBDisclaimer,
    renderHeaderButtons,
}: WorkspaceCompanyCardsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});

    const {cardList, ...assignedCards} = cardsList ?? {};
    const [cardFeeds] = useCardFeeds(policyID);

    const companyFeeds = getCompanyFeeds(cardFeeds);
    const cards = companyFeeds?.[selectedFeed]?.accountList;

    const plaidIconUrl = getPlaidInstitutionIconUrl(selectedFeed);

    // When we reach the medium screen width or the narrow layout is active,
    // we want to hide the table header and the middle column of the card rows, so that the content is not overlapping.
    const shouldUseNarrowTableRowLayout = isMediumScreenWidth || shouldUseNarrowLayout;

    const tableRef = useRef<TableHandle<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey>>(null);

    const data: WorkspaceCompanyCardTableItemData[] =
        cards?.map((cardName) => {
            const assignedCard = Object.values(assignedCards ?? {}).find((card) => card.cardName === cardName);

            const cardholder = personalDetails?.[assignedCard?.accountID ?? CONST.DEFAULT_NUMBER_ID];

            const customCardName = customCardNames?.[assignedCard?.cardID ?? CONST.DEFAULT_NUMBER_ID] ?? getCardDefaultName(cardholder?.displayName);

            const isCardDeleted = assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            const isAssigned = !!assignedCard;

            return {cardName, customCardName, isCardDeleted, isAssigned, assignedCard, cardholder};
        }) ?? [];

    const renderItem = ({item, index}: ListRenderItemInfo<WorkspaceCompanyCardTableItemData>) => (
        <WorkspaceCompanyCardTableItem
            key={`${item.cardName}_${index}`}
            item={item}
            policyID={policyID}
            selectedFeed={selectedFeed}
            plaidIconUrl={plaidIconUrl}
            onAssignCard={onAssignCard}
            isAssigningCardDisabled={isAssigningCardDisabled}
            shouldUseNarrowTableRowLayout={shouldUseNarrowTableRowLayout}
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

    const isItemInSearch: IsItemInSearchCallback<WorkspaceCompanyCardTableItemData> = useCallback((item, searchString) => {
        const searchLower = searchString.toLowerCase();
        return (
            item.cardName.toLowerCase().includes(searchLower) ||
            (item.customCardName?.toLowerCase().includes(searchLower) ?? false) ||
            (item.cardholder?.displayName?.toLowerCase().includes(searchLower) ?? false) ||
            (item.cardholder?.login?.toLowerCase().includes(searchLower) ?? false)
        );
    }, []);

    const isItemInFilter: IsItemInFilterCallback<WorkspaceCompanyCardTableItemData> = useCallback((item, filterValues) => {
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
    }, []);

    const filterConfig: FilterConfig = useMemo(
        () => ({
            status: {
                filterType: 'single-select',
                options: [
                    {label: translate('workspace.moreFeatures.companyCards.allCards'), value: 'all'},
                    {label: translate('workspace.moreFeatures.companyCards.assignedCards'), value: 'assigned'},
                    {label: translate('workspace.moreFeatures.companyCards.unassignedCards'), value: 'unassigned'},
                ],
                default: 'all',
            },
        }),
        [translate],
    );

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
    useEffect(() => {
        if (shouldUseNarrowLayout) {
            const activeSorting = tableRef.current?.getActiveSorting();
            setActiveSortingInWideLayout(activeSorting);
            tableRef.current?.updateSorting({columnKey: 'member'});
            return;
        }

        if (!activeSortingInWideLayout) {
            return;
        }

        tableRef.current?.updateSorting(activeSortingInWideLayout);
    }, [activeSortingInWideLayout, shouldUseNarrowLayout]);

    // Show empty state when there are no cards
    if (!data.length) {
        return (
            <WorkspaceCompanyCardsFeedAddedEmptyPage
                shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                handleAssignCard={onAssignCard}
                isAssigningCardDisabled={isAssigningCardDisabled}
            />
        );
    }

    return (
        <Table
            ref={tableRef}
            data={data}
            columns={columns}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            isItemInFilter={isItemInFilter}
            filters={filterConfig}
        >
            {renderHeaderButtons?.(<Table.SearchBar />, <Table.FilterButtons />)}
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default WorkspaceCompanyCardsTable;
