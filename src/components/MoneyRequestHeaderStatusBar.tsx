import type {ReactElement, ReactNode} from 'react';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isScanning,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from '@libs/TransactionUtils';
import {hasPendingRTERViolation as hasPendingRTERViolationTransactionUtils} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Icon from './Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from './Icon/Expensicons';
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

    /** Number of transactions (for multi-transaction scenarios) */
    transactionCount?: number;

    /** Whether we style flex grow */
    shouldStyleFlexGrow?: boolean;
};

function MoneyRequestHeaderStatusBar({
    transactionID,
    reportID,
    policyID,
    parentReport,
    email,
    accountID,
    transactionCount = 1,
    shouldStyleFlexGrow = true,
}: MoneyRequestHeaderStatusBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCardHourglass', 'ReceiptScan']);

    // Onyx subscriptions
    const [transaction] = useOnyx<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [report] = useOnyx<Report>(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx<Policy>(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
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
    const statusProps = useMemo((): {icon: ReactNode; description: string | ReactElement} | undefined => {
        const isOnHold = isOnHoldTransactionUtils(transaction);
        const isDuplicate = isDuplicateTransactionUtils(transaction, email ?? '', accountID ?? 0, report, policy, transactionViolations);
        const hasPendingRTERViolation = hasPendingRTERViolationTransactionUtils(transactionViolations);
        const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, transactionViolations);

        // Priority order: hold > rejected > duplicate > broken connection > pending RTER > scanning > pending
        if (isOnHold) {
            return {icon: getStatusIcon(Expensicons.Stopwatch), description: translate('iou.expenseOnHold')};
        }
        if (isMarkAsResolvedAction(parentReport, transactionViolations, policy)) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.reject.rejectedStatus')};
        }

        if (isDuplicate) {
            return {icon: getStatusIcon(Expensicons.Flag), description: translate('iou.expenseDuplicate')};
        }

        if (isExpensifyCardTransaction(transaction) && isPending(transaction)) {
            return {icon: getStatusIcon(icons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (!!transaction?.transactionID && !!transactionViolations.length && shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(Expensicons.Hourglass),
                description: (
                    <BrokenConnectionDescription
                        transactionID={transaction?.transactionID}
                        report={parentReport}
                        policy={policy}
                    />
                ),
            };
        }
        if (hasPendingRTERViolation) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (isScanning(transaction)) {
            return {icon: getStatusIcon(icons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }

        return undefined;
    }, [transaction, transactionViolations, parentReport, policy, report, email, accountID, icons, translate, theme.icon]);

    if (!statusProps) {
        return null;
    }

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, shouldStyleFlexGrow && styles.flexGrow1, styles.overflowHidden, styles.headerStatusBarContainer]}>
            <View style={styles.mr2}>{statusProps.icon}</View>
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{statusProps.description}</Text>
            </View>
        </View>
    );
}

export default MoneyRequestHeaderStatusBar;

export type {MoneyRequestHeaderStatusBarProps};
