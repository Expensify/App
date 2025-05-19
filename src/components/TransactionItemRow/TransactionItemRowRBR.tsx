import React, {useCallback} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {DotIndicator} from '@components/Icon/Expensicons';
import Text from '@components/Text';
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
import type {ReceiptErrors} from '@src/types/onyx/Transaction';

function TransactionItemRowRBR({transaction, containerStyles}: {transaction: Transaction; containerStyles?: ViewStyle[]}) {
    const styles = useThemeStyles();
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const {translate} = useLocalize();
    const theme = useTheme();

    const {sortedAllReportActions: transactionActions} = usePaginatedReportActions(transaction.reportID);
    const transactionThreadId = transactionActions ? getIOUActionForTransactionID(transactionActions, transaction.transactionID)?.childReportID : undefined;
    const {sortedAllReportActions: transactionThreadActions} = usePaginatedReportActions(transactionThreadId);
    const getErrorMessages = useCallback(
        (errors: Errors | ReceiptErrors | undefined = {}, errorActions: ReportAction[] | undefined = []): string[] => {
            const uniqueMessages = new Set<string>();

            const addErrorMessages = (rawErrors: unknown) => {
                const errorValues = Object.values(rawErrors ?? {});
                for (const error of errorValues) {
                    const message = isReceiptError(error) ? translate('iou.error.receiptFailureMessageShort') : String(error);
                    uniqueMessages.add(message);
                }
            };
            addErrorMessages(errors);
            for (const action of errorActions) {
                addErrorMessages(action.errors);
            }

            return Array.from(uniqueMessages);
        },
        [translate],
    );

    const RBRMessages = [
        ...getErrorMessages(transaction?.errors, transactionThreadActions?.filter((e) => !!e.errors) ?? []),
        // Some violations end with a period already so lets make sure the connected messages have only single period between them
        // and end with a single dot.
        ...transactionViolations.map((violation) => {
            const message = ViolationsUtils.getViolationTranslation(violation, translate);
            return message.endsWith('.') || transactionViolations.length === 1 ? message : `${message}.`;
        }),
    ].join(' ');
    return (
        RBRMessages.length > 0 && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]}>
                <Icon
                    src={DotIndicator}
                    fill={theme.danger}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1, {color: theme.danger}]}
                >
                    {RBRMessages}
                </Text>
            </View>
        )
    );
}

export default TransactionItemRowRBR;
