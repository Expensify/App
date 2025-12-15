import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import SearchBar from '@components/SearchBar';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    filterCardsByPersonalDetails,
    getCardFeedIcon,
    getCardsByCardholderName,
    getCompanyCardFeedWithDomainID,
    getCompanyFeeds,
    getPlaidInstitutionIconUrl,
    sortCardsByCardholderName,
} from '@libs/CardUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import WorkspaceCompanyCardsFeedAddedEmptyPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedAddedEmptyPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsTableRow from './WorkspaceCompanyCardTableRow';

type WorkspaceCompanyCardsTableProps = {
    /** Selected feed */
    selectedFeed: CompanyCardFeedWithDomainID;

    /** List of company cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;

    /** Current policy id */
    policyID: string;

    /** Handle assign card action */
    onAssignCard: () => void;

    /** Whether to disable assign card button */
    isAssigningCardDisabled?: boolean;

    shouldShowAssignCardButton?: boolean;

    /** Whether to show GB disclaimer */
    shouldShowGBDisclaimer?: boolean;
};

function WorkspaceCompanyCardsTable({
    selectedFeed,
    cardsList,
    policyID,
    onAssignCard,
    isAssigningCardDisabled,
    shouldShowGBDisclaimer,
    shouldShowAssignCardButton,
}: WorkspaceCompanyCardsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const listRef = useRef<FlashListRef<string>>(null);
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const policy = usePolicy(policyID);

    const {cardList, ...assignedCards} = cardsList ?? {};
    const [cardFeeds] = useCardFeeds(policyID);

    const companyFeeds = getCompanyFeeds(cardFeeds);
    const cards = companyFeeds?.[selectedFeed]?.accountList;

    const plaidUrl = getPlaidInstitutionIconUrl(selectedFeed);

    // Get all cards sorted by cardholder name
    const allCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        return getCardsByCardholderName(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy?.employeeList]);

    // Filter and sort cards based on search input
    const filterCard = useCallback((card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails), [personalDetails]);
    const sortCards = useCallback((cards: Card[]) => sortCardsByCardholderName(cards, personalDetails, localeCompare), [personalDetails, localeCompare]);
    const [inputValue, setInputValue, filteredSortedCards] = useSearchResults(allCards, filterCard, sortCards);

    const isSearchEmpty = filteredSortedCards.length === 0 && inputValue.length > 0;

    const renderItem = useCallback(
        ({item: cardName, index}: ListRenderItemInfo<string>) => {
            const assignedCard = Object.values(assignedCards ?? {}).find((card) => card.cardName === cardName);

            const customCardName = customCardNames?.[assignedCard?.cardID ?? CONST.DEFAULT_NUMBER_ID];

            const cardFeedIcon = getCardFeedIcon(selectedFeed as CompanyCardFeed, illustrations, companyCardFeedIcons);

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
                            if (assignedCard) {
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
                            }

                            onAssignCard();
                        }}
                    >
                        {({hovered}) => (
                            <WorkspaceCompanyCardsTableRow
                                cardholder={personalDetails?.[assignedCard?.accountID ?? CONST.DEFAULT_NUMBER_ID]}
                                cardName={cardName}
                                cardFeedIcon={cardFeedIcon}
                                plaidUrl={plaidUrl}
                                customCardName={customCardName}
                                isHovered={hovered}
                                isAssigned={!!assignedCard}
                                onAssignCard={onAssignCard}
                                isAssigningCardDisabled={isAssigningCardDisabled}
                                shouldShowAssignCardButton={shouldShowAssignCardButton}
                            />
                        )}
                    </PressableWithFeedback>
                </OfflineWithFeedback>
            );
        },
        [
            assignedCards,
            companyCardFeedIcons,
            customCardNames,
            illustrations,
            isAssigningCardDisabled,
            onAssignCard,
            personalDetails,
            plaidUrl,
            policyID,
            selectedFeed,
            styles.br3,
            styles.highlightBG,
            styles.hoveredComponentBG,
            styles.mb3,
            styles.mh5,
            styles.ph5,
        ],
    );

    const keyExtractor = useCallback((item: string, index: number) => `${item}_${index}`, []);

    const ListHeaderComponent = useMemo(
        () => (
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
        ),
        [cards?.length, inputValue, isSearchEmpty, setInputValue, styles, translate],
    );

    // Show empty state when there are no cards
    if (!cards?.length) {
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
                data={cards}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={isMediumScreenWidth || shouldUseNarrowLayout ? undefined : ListHeaderComponent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.flexGrow1}
            />
        </View>
    );
}

WorkspaceCompanyCardsTable.displayName = 'WorkspaceCompanyCardsTable';

export default WorkspaceCompanyCardsTable;
