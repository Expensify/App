import type {ReactElement, ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {
    hasPendingRTERViolation as hasPendingRTERViolationTransactionUtils,
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isScanning,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Icon from './Icon';
import Text from './Text';

type MoneyRequestHeaderStatusBarProps = {
    /** Transaction ID */
    transactionID: string | undefined;

    /** Report ID */
    reportID: string | undefined;

    /** Policy ID */
    policyID: string | undefined;

    /** Parent report */
    parentReport: Report | undefined;

    /** Email of the current user */
    email: string | undefined;

    /** Account ID of the current user */
    accountID: number | undefined;

    /** Whether we style flex grow */
    shouldStyleFlexGrow?: boolean;
};

function MoneyRequestHeaderStatusBar({transactionID, reportID, policyID, parentReport, email, accountID, shouldStyleFlexGrow = true}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCardHourglass', 'ReceiptScan', 'Stopwatch', 'Hourglass', 'Flag']);

    // Onyx subscriptions
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const transactionViolations = useTransactionViolations(transactionID);

    const getStatusIcon = (src: IconAsset): ReactNode => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    // Compute status based on transaction state
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isDuplicate = isDuplicateTransactionUtils(transaction, email ?? '', accountID ?? 0, report, policy, transactionViolations);
    const hasPendingRTERViolation = hasPendingRTERViolationTransactionUtils(transactionViolations);
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, transactionViolations);

    let statusIcon: ReactNode;
    let statusDescription: string | ReactElement | undefined;

    // Priority order: hold > rejected > duplicate > broken connection > pending RTER > scanning > pending
    if (isOnHold) {
        statusIcon = getStatusIcon(icons.Stopwatch);
        statusDescription = translate('iou.expenseOnHold');
    } else if (isMarkAsResolvedAction(parentReport, transactionViolations, policy)) {
        statusIcon = getStatusIcon(icons.Hourglass);
        statusDescription = translate('iou.reject.rejectedStatus');
    } else if (isDuplicate) {
        statusIcon = getStatusIcon(icons.Flag);
        statusDescription = translate('iou.expenseDuplicate');
    } else if (isExpensifyCardTransaction(transaction) && isPending(transaction)) {
        statusIcon = getStatusIcon(icons.CreditCardHourglass);
        statusDescription = translate('iou.transactionPendingDescription');
    } else if (!!transaction?.transactionID && !!transactionViolations.length && shouldShowBrokenConnectionViolation) {
        statusIcon = getStatusIcon(icons.Hourglass);
        statusDescription = (
            <BrokenConnectionDescription
                transactionID={transaction?.transactionID}
                report={parentReport}
                policy={policy}
            />
        );
    } else if (hasPendingRTERViolation) {
        statusIcon = getStatusIcon(icons.Hourglass);
        statusDescription = translate('iou.pendingMatchWithCreditCardDescription');
    } else if (isScanning(transaction)) {
        statusIcon = getStatusIcon(icons.ReceiptScan);
        statusDescription = translate('iou.receiptScanInProgressDescription');
    }

    if (!statusDescription) {
        return null;
    }

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, shouldStyleFlexGrow && styles.flexGrow1, styles.overflowHidden, styles.headerStatusBarContainer]}>
            <View style={styles.mr2}>{statusIcon}</View>
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{statusDescription}</Text>
            </View>
        </View>
    );
}

export default MoneyRequestHeaderStatusBar;

export type {MoneyRequestHeaderStatusBarProps};
