import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import SearchBar from '@components/SearchBar';
import Text from '@components/Text';
import TableRowSkeleton from '@components/Skeletons/TableRowSkeleton';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useNetwork from '@hooks/useNetwork';
import {
    filterCardsByPersonalDetails,
    getCardsByCardholderName,
    getCompanyCardFeedWithDomainID,
    getCompanyFeeds,
    getPlaidInstitutionIconUrl,
    sortCardsByCardholderName,
} from '@libs/CardUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsFeedAddedEmptyPage from './WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsListRow from './WorkspaceCompanyCardsListRow';

type WorkspaceCompanyCardsListProps = {
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

    /** Whether the cards list is loading */
    isLoadingCardsList?: boolean;
};

function WorkspaceCompanyCardsList({selectedFeed, cardsList, policyID, onAssignCard, isAssigningCardDisabled, shouldShowGBDisclaimer, isLoadingCardsList = false}: WorkspaceCompanyCardsListProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, localeCompare} = useLocalize();
    const listRef = useRef<FlashListRef<string>>(null);
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const [personalDetails, personalDetailsMetadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const isLoadingPersonalDetails = !isOffline && isLoadingOnyxValue(personalDetailsMetadata);
    const isLoadingCardsTableData = isLoadingCardsList || isLoadingPersonalDetails;
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

    const renderItem = useCallback(
        ({item: cardName, index}: ListRenderItemInfo<string>) => {
            const assignedCard = Object.values(assignedCards ?? {}).find((card) => card.cardName === cardName);

            const customCardName = customCardNames?.[assignedCard?.cardID ?? CONST.DEFAULT_NUMBER_ID];

            const isCardDeleted = assignedCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            return (
                <OfflineWithFeedback
                    key={`${cardName}_${index}`}
                    errorRowStyles={styles.ph5}
                    errors={assignedCard?.errors}
                    pendingAction={assignedCard?.pendingAction}
                >
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]}
                        accessibilityLabel="row"
                        hoverStyle={styles.hoveredComponentBG}
                        disabled={isCardDeleted}
                        onPress={() => {
                            if (!assignedCard) {
                                onAssignCard();
                                return;
                            }

                            if (!assignedCard?.accountID || !assignedCard?.fundID) {
                                return;
                            }

                            return Navigation.navigate(
                                ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(
                                    policyID,
                                    assignedCard.cardID.toString(),
                                    getCompanyCardFeedWithDomainID(assignedCard?.bank as CompanyCardFeed, assignedCard.fundID),
                                ),
                            );
                        }}
                    >
                        {({hovered}) => (
                            <WorkspaceCompanyCardsListRow
                                cardholder={personalDetails?.[assignedCard?.accountID ?? CONST.DEFAULT_NUMBER_ID]}
                                cardName={cardName}
                                selectedFeed={selectedFeed}
                                plaidIconUrl={plaidIconUrl}
                                customCardName={customCardName}
                                isHovered={hovered}
                                isAssigned={!!assignedCard}
                                onAssignCard={onAssignCard}
                                isAssigningCardDisabled={isAssigningCardDisabled}
                                shouldUseNarrowTableRowLayout={shouldUseNarrowTableRowLayout}
                            />
                        )}
                    </PressableWithFeedback>
                </OfflineWithFeedback>
            );
        },
        [
            assignedCards,
            customCardNames,
            isAssigningCardDisabled,
            onAssignCard,
            personalDetails,
            plaidIconUrl,
            policyID,
            selectedFeed,
            shouldUseNarrowTableRowLayout,
            styles.br3,
            styles.highlightBG,
            styles.hoveredComponentBG,
            styles.mb3,
            styles.mh5,
            styles.ph5,
        ],
    );

    const keyExtractor = useCallback((item: string, index: number) => `${item}_${index}`, []);

    const ListHeaderComponent = shouldUseNarrowTableRowLayout ? (
        <View style={styles.h7} />
    ) : (
        <>
            {(cards?.length ?? 0) > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.companyCards.findCard')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={isSearchEmpty}
                    style={[styles.mt5]}
                />
            )}
            {!isSearchEmpty && (
                <View style={[styles.flexRow, styles.appBG, styles.justifyContentBetween, styles.mh5, styles.gap5, styles.p4]}>
                    <View style={[styles.flex1]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.textMicroSupporting, styles.lh16]}
                        >
                            {translate('common.member')}
                        </Text>
                    </View>
                    <View style={[styles.flex1]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.textMicroSupporting, styles.lh16]}
                        >
                            {translate('workspace.companyCards.card')}
                        </Text>
                    </View>
                    <View style={[styles.flex1]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.textMicroSupporting, styles.textAlignRight, styles.lh16, styles.pr7]}
                        >
                            {translate('workspace.companyCards.cardName')}
                        </Text>
                    </View>
                </View>
            )}
        </>
    );

    // Show empty state when there are no cards (but not when loading)
    if (!cards?.length && !isLoadingCardsTableData) {
        return (
            <WorkspaceCompanyCardsFeedAddedEmptyPage
                shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                handleAssignCard={onAssignCard}
                isAssigningCardDisabled={isAssigningCardDisabled}
            />
        );
    }

    return (
        <View style={styles.flex1}>
            <FlashList
                ref={listRef}
                data={isLoadingCardsTableData ? [] : (cards ?? [])}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={!isOffline && isLoadingCardsTableData ? <TableRowSkeleton fixedNumItems={5} /> : undefined}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.flexGrow1}
            />
        </View>
    );
}

WorkspaceCompanyCardsList.displayName = 'WorkspaceCompanyCardsList';

export default WorkspaceCompanyCardsList;
