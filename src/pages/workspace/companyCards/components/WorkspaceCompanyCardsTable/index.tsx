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
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {filterCardsByPersonalDetails, getCardsByCardholderName, getCompanyCardFeedWithDomainID, sortCardsByCardholderName} from '@libs/CardUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import WorkspaceCompanyCardsFeedAddedEmptyPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsFeedAddedEmptyPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsTableRow from './WorkspaceCompanyCardTableRow';

type WorkspaceCompanyCardsTableProps = {
    /** Feed */
    feed: CompanyCardFeedWithDomainID;

    /** List of company cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;

    /** Current policy id */
    policyID: string;

    /** Handle assign card action */
    handleAssignCard: () => void;

    /** Whether to disable assign card button */
    isDisabledAssignCardButton?: boolean;

    /** Whether to show GB disclaimer */
    shouldShowGBDisclaimer?: boolean;
};

function WorkspaceCompanyCardsTable({feed, cardsList, policyID, handleAssignCard, isDisabledAssignCardButton, shouldShowGBDisclaimer}: WorkspaceCompanyCardsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const listRef = useRef<FlashListRef<string>>(null);

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const policy = usePolicy(policyID);

    // Get all cards sorted by cardholder name
    const allCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        return getCardsByCardholderName(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy?.employeeList]);

    const [cardFeeds] = useCardFeeds(policyID);

    const accountList = cardFeeds?.[feed].accountList;

    // Filter and sort cards based on search input
    const filterCard = useCallback((card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails), [personalDetails]);
    const sortCards = useCallback((cards: Card[]) => sortCardsByCardholderName(cards, personalDetails, localeCompare), [personalDetails, localeCompare]);
    const [inputValue, setInputValue, filteredSortedCards] = useSearchResults(allCards, filterCard, sortCards);

    const isSearchEmpty = filteredSortedCards.length === 0 && inputValue.length > 0;

    const renderItem = useCallback(
        ({item: accountName, index}: ListRenderItemInfo<string>) => {
            // const cardID = Object.keys(cardsList ?? {}).find((id) => cardsList?.[id].cardID === card.cardID);

            const card = cardsList?.[accountName];

            const isCardDeleted = card?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            const cardID = accountName;
            const customCardName = customCardNames?.[card?.cardID ?? 0];

            const isAssigned = cardsList?.[accountName]?.accountID;

            return (
                <OfflineWithFeedback
                    key={`${card?.nameValuePairs?.cardTitle}_${index}`}
                    errorRowStyles={styles.ph5}
                    errors={card?.errors}
                    pendingAction={card?.pendingAction}
                >
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]}
                        accessibilityLabel="row"
                        hoverStyle={styles.hoveredComponentBG}
                        disabled={isCardDeleted}
                        onPress={() => {
                            if (!cardID || !card?.accountID || !card?.fundID) {
                                return;
                            }

                            if (isAssigned) {
                                return Navigation.navigate(
                                    ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, getCompanyCardFeedWithDomainID(card?.bank as CompanyCardFeed, card?.fundID)),
                                );
                            }

                            handleAssignCard();
                        }}
                    >
                        {({hovered}) => (
                            <WorkspaceCompanyCardsTableRow
                                cardholder={personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID]}
                                cardNumber={accountName}
                                cardName={customCardName ?? ''}
                                isHovered={hovered}
                                onAssignCard={handleAssignCard}
                            />
                        )}
                    </PressableWithFeedback>
                </OfflineWithFeedback>
            );
        },
        [cardsList, customCardNames, handleAssignCard, personalDetails, policyID, styles.br3, styles.highlightBG, styles.hoveredComponentBG, styles.mb3, styles.mh5, styles.ph5],
    );

    const keyExtractor = useCallback((item: string, index: number) => `${item}_${index}`, []);

    const ListHeaderComponent = useMemo(
        () => (
            <>
                {(accountList?.length ?? 0) > CONST.SEARCH_ITEM_LIMIT && (
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
                                {translate('workspace.companyCards.cardNumber')}
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
        [accountList?.length, inputValue, isSearchEmpty, setInputValue, styles, translate],
    );

    // Show empty state when there are no cards
    if (!accountList?.length) {
        return (
            <WorkspaceCompanyCardsFeedAddedEmptyPage
                shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                handleAssignCard={handleAssignCard}
                isDisabledAssignCardButton={isDisabledAssignCardButton}
            />
        );
    }

    return (
        <View style={styles.flex1}>
            <FlashList
                ref={listRef}
                data={accountList}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeaderComponent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.flexGrow1}
            />
        </View>
    );
}

WorkspaceCompanyCardsTable.displayName = 'WorkspaceCompanyCardsTable';

export default WorkspaceCompanyCardsTable;
