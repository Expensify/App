import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import GenericTable from '@components/GenericTable';
import type {ColumnConfig} from '@components/GenericTable/types';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {filterCardsByPersonalDetails, getCardsByCardholderName, getCompanyCardFeedWithDomainID, getDefaultCardName, sortCardsByCardholderName} from '@libs/CardUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, WorkspaceCardsList} from '@src/types/onyx';
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

    /** Whether to show GB disclaimer */
    shouldShowGBDisclaimer?: boolean;
};

function WorkspaceCompanyCardsList({cardsList, policyID, handleAssignCard, isDisabledAssignCardButton, shouldShowGBDisclaimer}: WorkspaceCompanyCardsListProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const policy = usePolicy(policyID);

    const allCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        return getCardsByCardholderName(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy?.employeeList]);

    const columns: ColumnConfig[] = useMemo(
        () => [
            {
                columnName: 'name',
                translationKey: 'common.name',
            },
            {
                columnName: 'lastFour',
                translationKey: 'workspace.expensifyCard.lastFour',
            },
        ],
        [],
    );

    const filterCard = useCallback((card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails), [personalDetails]);
    const sortCards = useCallback((cards: Card[]) => sortCardsByCardholderName(cards, personalDetails, localeCompare), [personalDetails, localeCompare]);
    const keyExtractor = useCallback((item: Card, index: number) => `${item.cardID}_${index}`, []);

    const renderCardRow = useCallback(
        (item: Card, index: number): React.ReactElement | null => {
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
                            if (!cardID || !item?.accountID || !item.fundID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, getCompanyCardFeedWithDomainID(item.bank as CompanyCardFeed, item.fundID)));
                        }}
                    >
                        {({hovered}) => (
                            <WorkspaceCompanyCardsListRow
                                cardholder={personalDetails?.[item.accountID ?? CONST.DEFAULT_NUMBER_ID]}
                                cardNumber={item.lastFourPAN ?? ''}
                                name={customCardNames?.[item.cardID] ?? getDefaultCardName(personalDetails?.[item.accountID ?? CONST.DEFAULT_NUMBER_ID]?.firstName)}
                                isHovered={hovered}
                            />
                        )}
                    </PressableWithFeedback>
                </OfflineWithFeedback>
            );
        },
        [cardsList, customCardNames, personalDetails, policyID, styles],
    );

    if (allCards.length === 0) {
        return (
            <WorkspaceCompanyCardsFeedAddedEmptyPage
                shouldShowGBDisclaimer={shouldShowGBDisclaimer}
                handleAssignCard={handleAssignCard}
                isDisabledAssignCardButton={isDisabledAssignCardButton}
            />
        );
    }

    return (
        <GenericTable<Card>
            data={allCards}
            columns={columns}
            renderRow={renderCardRow}
            keyExtractor={keyExtractor}
            filterData={filterCard}
            sortData={sortCards}
            searchLabel={translate('workspace.companyCards.findCard')}
            contentContainerStyle={styles.flexGrow1}
        />
    );
}

export default WorkspaceCompanyCardsList;
