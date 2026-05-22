import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import variables from '@styles/variables';
import {createTransactionThreadReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

type DuplicateTransactionItemProps = {
    transaction: OnyxEntry<Transaction>;
    isLastItem: boolean;
    isSelected: boolean;
    onSelectTransaction: (transactionID: string) => void;
    onPreviewPressed: (reportID: string) => void;
};

function DuplicateTransactionItem({transaction, isLastItem, isSelected, onSelectTransaction, onPreviewPressed}: DuplicateTransactionItemProps) {
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const action = Object.values(reportActions ?? {})?.find((reportAction) => {
        const iouTransactionID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUTransactionID : CONST.DEFAULT_NUMBER_ID;
        return iouTransactionID === transaction?.transactionID;
    });

    const handlePreviewPress = () => {
        if (!action || !report) {
            return;
        }

        if (action.childReportID) {
            onPreviewPressed(action.childReportID);
            return;
        }

        const transactionThreadReport = createTransactionThreadReport({
            introSelected,
            currentUserLogin: currentUserPersonalDetails.login ?? '',
            currentUserAccountID: currentUserPersonalDetails.accountID,
            betas,
            iouReport: report,
            iouReportAction: action,
            transaction,
        });
        if (!transactionThreadReport?.reportID) {
            return;
        }

        onPreviewPressed(transactionThreadReport.reportID);
    };

    if (!action || !report || !transaction) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={transaction.pendingAction}>
            <PressableWithFeedback
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                onPress={handlePreviewPress}
                accessibilityLabel={transaction.comment?.comment ?? ''}
                role={getButtonRole(true)}
                isNested
                hoverStyle={styles.hoveredComponentBG}
                style={!isLastItem && styles.borderBottom}
            >
                <TransactionItemRow
                    transactionItem={transaction as TransactionListItemType}
                    report={report}
                    policy={policy}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                    shouldShowTooltip={false}
                    dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    shouldHighlightItemWhenSelected={false}
                    shouldShowErrors={false}
                    style={[styles.p4, styles.pr0]}
                    shouldShowRadioButton
                    radioButtonContainerStyle={styles.ml0}
                    radioButtonWrapperStyle={[styles.justifyContentCenter, styles.pr3half, {paddingLeft: 10, height: variables.w44}]}
                    onRadioButtonPress={() => onSelectTransaction(transaction.transactionID)}
                />
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default DuplicateTransactionItem;
