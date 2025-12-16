import type {FlashListRef} from '@shopify/flash-list';
import React, {useCallback, useMemo, useRef} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Table from '@components/Table';
import type {CompareItemsCallback, TableColumn} from '@components/Table';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardDefaultName} from '@libs/actions/Card';
import {filterCardsByPersonalDetails, getCardsByCardholderName, getCompanyFeeds, getPlaidInstitutionIconUrl, sortCardsByCardholderName} from '@libs/CardUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CompanyCardFeedWithDomainID, WorkspaceCardsList} from '@src/types/onyx';
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
};

function WorkspaceCompanyCardsTable({selectedFeed, cardsList, policyID, onAssignCard, isAssigningCardDisabled, shouldShowGBDisclaimer}: WorkspaceCompanyCardsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const listRef = useRef<FlashListRef<string>>(null);
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const policy = usePolicy(policyID);

    const {cardList, ...assignedCards} = cardsList ?? {};
    const [cardFeeds] = useCardFeeds(policyID);

    const companyFeeds = getCompanyFeeds(cardFeeds);
    const cards = companyFeeds?.[selectedFeed]?.accountList;

    const plaidIconUrl = getPlaidInstitutionIconUrl(selectedFeed);

    // Get all cards sorted by cardholder name
    const allCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        return getCardsByCardholderName(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy?.employeeList]);

    // Filter and sort cards based on search input
    const filterCard = useCallback((card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails), [personalDetails]);
    const sortCards = useCallback((cardsToSort: Card[]) => sortCardsByCardholderName(cardsToSort, personalDetails, localeCompare), [personalDetails, localeCompare]);
    const [inputValue, setInputValue, filteredSortedCards] = useSearchResults(allCards, filterCard, sortCards);

    const isSearchEmpty = filteredSortedCards.length === 0 && inputValue.length > 0;

    // When we reach the medium screen width or the narrow layout is active,
    // we want to hide the table header and the middle column of the card rows, so that the content is not overlapping.
    const shouldUseNarrowTableRowLayout = isMediumScreenWidth || shouldUseNarrowLayout;

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

    const keyExtractor = (item: string, index: number) => `${item}_${index}`;

    const compareItems: CompareItemsCallback<WorkspaceCompanyCardTableItemData, CompanyCardsTableColumnKey> = (a, b, sortColumn, order) => {
        const orderMultiplier = order === 'asc' ? 1 : -1;

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

        if (sortColumn === 'member') {
            const aMemberString = a.cardholder?.displayName ?? a.cardholder?.login ?? '';
            const bMemberString = b.cardholder?.displayName ?? b.cardholder?.login ?? '';

            return localeCompare(aMemberString, bMemberString) * orderMultiplier;
        }

        if (sortColumn === 'card') {
            return cardNameSortingResult;
        }

        if (sortColumn === 'customCardName') {
            return localeCompare(a.customCardName ?? '', b.customCardName ?? '') * orderMultiplier;
        }

        return 0;
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

    // TODO: Implement search bar
    // const ListHeaderComponent = shouldUseNarrowTableRowLayout ? (
    //     <View style={styles.h7} />
    // ) : (
    //     <>
    //         {(cards?.length ?? 0) > CONST.SEARCH_ITEM_LIMIT && (
    //             <SearchBar
    //                 label={translate('workspace.companyCards.findCard')}
    //                 inputValue={inputValue}
    //                 onChangeText={setInputValue}
    //                 shouldShowEmptyState={isSearchEmpty}
    //                 style={[styles.mt5]}
    //             />
    //         )}
    //     </>
    // );

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
            data={data}
            columns={columns}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            compareItems={compareItems}
            // isItemInFilter={isItemInFilter}
            // isItemInSearch={isItemInSearch}
        >
            {/* <Table.SearchBar /> */}
            {/* <Table.FilterButtons /> */}
            {/* <Table.SortButtons /> */}
            <Table.Header />
            <Table.Body />
        </Table>
    );

    // return (
    //     <View style={styles.flex1}>
    //         <FlashList
    //             ref={listRef}
    //             data={cards}
    //             renderItem={renderItem}
    //             keyExtractor={keyExtractor}
    //             ListHeaderComponent={ListHeaderComponent}
    //             showsVerticalScrollIndicator={false}
    //             keyboardShouldPersistTaps="handled"
    //             contentContainerStyle={styles.flexGrow1}
    //         />
    //     </View>
    // );
}

export default WorkspaceCompanyCardsTable;
