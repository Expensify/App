import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings} from '@src/types/onyx';
import WorkspaceCardsListLabel from './WorkspaceCardsListLabel';

type WorkspaceCardListLabelsProps = {
    /** ID of the current policy */
    policyID: string;

    /** Card settings */
    cardSettings: ExpensifyCardSettings | undefined;
};

function WorkspaceCardListLabels({policyID, cardSettings}: WorkspaceCardListLabelsProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();

    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const [cardManualBilling] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${workspaceAccountID}`, {canBeMissing: true});
    const shouldShowSettlementButtonOrDate = !!cardSettings?.isMonthlySettlementAllowed || cardManualBilling;

    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;
    if (!isLessThanMediumScreen) {
        return (
            <View style={[styles.flexRow, styles.mt5, styles.mh5, styles.pr4]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                />
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                />
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                />
            </View>
        );
    }
    return shouldShowSettlementButtonOrDate ? (
        <View style={[styles.flexColumn, styles.mt5, styles.mh5, styles.pr4]}>
            <WorkspaceCardsListLabel
                type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
            />
            <View style={[styles.flexRow, !isLessThanMediumScreen ? styles.flex2 : styles.mt5]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                />
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                />
            </View>
        </View>
    ) : (
        <View style={[styles.flexColumn, styles.mt5, styles.mh5, styles.pr4]}>
            <View style={[styles.flexRow, isLessThanMediumScreen && styles.mb5]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                />
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                />
            </View>
            <WorkspaceCardsListLabel
                type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
            />
        </View>
    );
}

WorkspaceCardListLabels.displayName = 'WorkspaceCardListLabels';
export default WorkspaceCardListLabels;
