import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {DotIndicator} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import type Transaction from '@src/types/onyx/Transaction';

type TransactionItemRowRBRProps = {
    /** Transaction item */
    transaction: Transaction;

    /** Styles for the RBR messages container */
    containerStyles?: ViewStyle[];

    /** Error message for missing required fields in the transaction */
    missingFieldError?: string;
};

function TransactionItemRowRBRWithOnyx({transaction, containerStyles, missingFieldError}: TransactionItemRowRBRProps) {
    const styles = useThemeStyles();
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const {translate} = useLocalize();
    const theme = useTheme();

    const {sortedAllReportActions: transactionActions} = usePaginatedReportActions(transaction.reportID);
    const transactionThreadId = transactionActions ? getIOUActionForTransactionID(transactionActions, transaction.transactionID)?.childReportID : undefined;
    const {sortedAllReportActions: transactionThreadActions} = usePaginatedReportActions(transactionThreadId);

    const RBRMessages = ViolationsUtils.getRBRMessages(transaction, transactionViolations, translate, missingFieldError, transactionThreadActions);

    return (
        RBRMessages.length > 0 && (
            <View
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]}
                testID="TransactionItemRowRBRWithOnyx"
            >
                <Icon
                    src={DotIndicator}
                    fill={theme.danger}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
                <View style={[styles.pre, styles.flexShrink1, {color: theme.danger}]}>
                    <RenderHTML html={`<rbr shouldShowEllipsis="1" issmall >${RBRMessages}</rbr>`} />
                </View>
            </View>
        )
    );
}

TransactionItemRowRBRWithOnyx.displayName = 'TransactionItemRowRBRWithOnyx';
export default TransactionItemRowRBRWithOnyx;
