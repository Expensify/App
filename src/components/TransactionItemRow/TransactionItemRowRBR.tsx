import React, {useCallback} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {DotIndicator} from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {isReceiptError} from '@libs/ErrorUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type ReportAction from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {ReceiptError, ReceiptErrors} from '@src/types/onyx/Transaction';

type TransactionItemRowRBRProps = {
    /** Transaction item */
    transaction: Transaction;

    /** Styles for the RBR messages container */
    containerStyles?: ViewStyle[];
};

/**
 * Extracts unique error messages from errors and actions
 */
const extractErrorMessages = (errors: Errors | ReceiptErrors, errorActions: ReportAction[], translate: LocaleContextProps['translate']): string[] => {
    const uniqueMessages = new Set<string>();

    // Combine transaction and action errors
    let allErrors: Record<string, string | Errors | ReceiptError | null | undefined> = {...errors};
    errorActions.forEach((action) => {
        if (!action.errors) {
            return;
        }
        allErrors = {...allErrors, ...action.errors};
    });

    // Extract error messages
    Object.values(allErrors).forEach((errorValue) => {
        if (!errorValue) {
            return;
        }
        if (typeof errorValue === 'string') {
            uniqueMessages.add(errorValue);
        } else if (isReceiptError(errorValue)) {
            uniqueMessages.add(translate('iou.error.receiptFailureMessageShort'));
        } else {
            Object.values(errorValue).forEach((nestedErrorValue) => {
                if (!nestedErrorValue) {
                    return;
                }
                uniqueMessages.add(nestedErrorValue);
            });
        }
    });

    return Array.from(uniqueMessages);
};

function TransactionItemRowRBR({transaction, containerStyles}: TransactionItemRowRBRProps) {
    const styles = useThemeStyles();
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const {translate} = useLocalize();
    const theme = useTheme();

    const {sortedAllReportActions: transactionActions} = usePaginatedReportActions(transaction.reportID);
    const transactionThreadId = transactionActions ? getIOUActionForTransactionID(transactionActions, transaction.transactionID)?.childReportID : undefined;
    const {sortedAllReportActions: transactionThreadActions} = usePaginatedReportActions(transactionThreadId);
    const getErrorMessages = useCallback(
        (errors: Errors | ReceiptErrors | undefined = {}, errorActions: ReportAction[] | undefined = []) => extractErrorMessages(errors, errorActions, translate),
        [translate],
    );

    const RBRMessages = [
        ...getErrorMessages(
            transaction?.errors,
            transactionThreadActions?.filter((e) => !!e.errors),
        ),
        // Some violations end with a period already so lets make sure the connected messages have only single period between them
        // and end with a single dot.
        ...transactionViolations.map((violation) => {
            const message = ViolationsUtils.getViolationTranslation(violation, translate);
            return message.endsWith('.') || transactionViolations.length === 1 ? message : `${message}.`;
        }),
    ].join(' ');
    return (
        RBRMessages.length > 0 && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles, styles.w100]}>
                <Icon
                    src={DotIndicator}
                    fill={theme.danger}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
                <View style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1, {color: theme.danger}]}>
                    <RenderHTML html={`<rbr shouldShowEllipsis="1">${RBRMessages}</rbr>`} />
                </View>
            </View>
        )
    );
}

export default TransactionItemRowRBR;
