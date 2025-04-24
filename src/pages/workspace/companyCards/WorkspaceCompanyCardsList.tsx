import React, {useCallback, useMemo} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCardName, sortCardsByCardholderName} from '@libs/CardUtils';
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
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);

    const sortedCards = useMemo(() => sortCardsByCardholderName(cardsList, personalDetails), [cardsList, personalDetails]);

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

    if (sortedCards.length === 0) {
        return (
            <WorkspaceCompanyCardsFeedAddedEmptyPage
                handleAssignCard={handleAssignCard}
                isDisabledAssignCardButton={isDisabledAssignCardButton}
            />
        );
    }

    return (
        <FlatList
            contentContainerStyle={styles.flexGrow1}
            data={sortedCards}
            renderItem={renderItem}
            ListHeaderComponent={renderListHeader}
            stickyHeaderIndices={[0]}
        />
    );
}

export default WorkspaceCompanyCardsList;
