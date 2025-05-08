import React, {useCallback, useMemo} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import SearchBar from '@components/SearchBar';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {filterCardsByPersonalDetails, getCardsByCardholderName, getDefaultCardName, sortCardsByCardholderName} from '@libs/CardUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsFeedAddedEmptyPage from './WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsListRow from './WorkspaceCompanyCardsListRow';

type WorkspaceCompanyCardsListProps = {
    /** List of company cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;

    /** Current policy id */
    policyID: string;

    /** Handle assign card action */
    handleAssignCard: () => void;

    /** Whether to disable assign card button */
    isDisabledAssignCardButton?: boolean;
};

function WorkspaceCompanyCardsList({cardsList, policyID, handleAssignCard, isDisabledAssignCardButton}: WorkspaceCompanyCardsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const policy = usePolicy(policyID);

    const allCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        return getCardsByCardholderName(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy?.employeeList]);

    const filterCard = useCallback((card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails), [personalDetails]);
    const sortCards = useCallback((cards: Card[]) => sortCardsByCardholderName(cards, personalDetails), [personalDetails]);
    const [inputValue, setInputValue, filteredSortedCards] = useSearchResults(allCards, filterCard, sortCards);

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<Card>) => {
            const cardID = Object.keys(cardsList ?? {}).find((id) => cardsList?.[id].cardID === item.cardID);
            const isCardDeleted = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            return (
                <OfflineWithFeedback
                    key={`${item.nameValuePairs?.cardTitle}_${index}`}
                    errorRowStyles={styles.ph5}
                    errors={item.errors}
                    pendingAction={item.pendingAction}
                >
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]}
                        accessibilityLabel="row"
                        hoverStyle={styles.hoveredComponentBG}
                        disabled={isCardDeleted}
                        onPress={() => {
                            if (!cardID || !item?.accountID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, item.bank));
                        }}
                    >
                        <WorkspaceCompanyCardsListRow
                            cardholder={personalDetails?.[item.accountID ?? CONST.DEFAULT_NUMBER_ID]}
                            cardNumber={item.lastFourPAN ?? ''}
                            name={customCardNames?.[item.cardID] ?? getDefaultCardName(personalDetails?.[item.accountID ?? CONST.DEFAULT_NUMBER_ID]?.firstName)}
                        />
                    </PressableWithFeedback>
                </OfflineWithFeedback>
            );
        },
        [cardsList, customCardNames, personalDetails, policyID, styles],
    );

    const renderListHeader = useCallback(
        () => (
            <View style={[styles.flexRow, styles.appBG, styles.justifyContentBetween, styles.mh5, styles.gap5, styles.p4]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroSupporting, styles.lh16]}
                >
                    {translate('common.name')}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroSupporting, styles.lh16]}
                >
                    {translate('workspace.expensifyCard.lastFour')}
                </Text>
            </View>
        ),
        [styles, translate],
    );

    if (allCards.length === 0) {
        return (
            <WorkspaceCompanyCardsFeedAddedEmptyPage
                handleAssignCard={handleAssignCard}
                isDisabledAssignCardButton={isDisabledAssignCardButton}
            />
        );
    }

    const isSearchEmpty = filteredSortedCards.length === 0 && inputValue.length > 0;

    return (
        <>
            {allCards.length > 0 && (
                <SearchBar
                    label={translate('workspace.companyCards.findCard')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={isSearchEmpty}
                    style={[styles.mt5]}
                />
            )}
            <FlatList
                contentContainerStyle={styles.flexGrow1}
                data={filteredSortedCards}
                renderItem={renderItem}
                ListHeaderComponent={!isSearchEmpty ? renderListHeader : null}
                stickyHeaderIndices={[0]}
            />
        </>
    );
}

export default WorkspaceCompanyCardsList;
