import React from 'react';
import type {ValueOf} from 'type-fest';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isProcessingReport} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Icon from './Icon';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';

type MoneyReportHeaderStatusBarSectionProps = {
    reportID: string | undefined;
    statusBarType: ValueOf<typeof CONST.REPORT.STATUS_BAR_TYPE> | undefined;
    iouTransactionID: string | undefined;
};

function MoneyReportHeaderStatusBarSection({reportID, statusBarType, iouTransactionID}: MoneyReportHeaderStatusBarSectionProps) {
    const {translate} = useLocalize();
    const theme = useTheme();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);

    const {transactions: reportTransactionsMap} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Box', 'Stopwatch', 'Flag', 'CreditCardHourglass', 'ReceiptScan']);

    if (!statusBarType) {
        return null;
    }

    const getStatusIcon = (src: IconAsset) => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.MARK_AS_RESOLVED) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.Hourglass)}
                description={translate('iou.reject.rejectedStatus')}
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.BOOKING_PENDING) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.Hourglass)}
                description={translate('iou.bookingPendingDescription')}
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.BOOKING_ARCHIVED) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.Box)}
                description={translate('iou.bookingArchivedDescription')}
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.ON_HOLD) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.Stopwatch)}
                description={translate(transactions.length > 1 ? 'iou.expensesOnHold' : 'iou.expenseOnHold')}
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.DUPLICATES) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.Flag)}
                description={translate('iou.duplicateTransaction', isProcessingReport(moneyRequestReport))}
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.BROKEN_CONNECTION) {
        if (!iouTransactionID) {
            return null;
        }
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.Hourglass)}
                description={
                    <BrokenConnectionDescription
                        transactionID={iouTransactionID}
                        report={moneyRequestReport}
                        policy={policy}
                    />
                }
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.PENDING_RTER) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.Hourglass)}
                description={translate('iou.pendingMatchWithCreditCardDescription')}
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.PENDING_TRANSACTIONS) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.CreditCardHourglass)}
                description={translate('iou.transactionPendingDescription')}
            />
        );
    }

    if (statusBarType === CONST.REPORT.STATUS_BAR_TYPE.SCANNING_RECEIPT) {
        return (
            <MoneyRequestHeaderStatusBar
                icon={getStatusIcon(expensifyIcons.ReceiptScan)}
                description={translate('iou.receiptScanInProgressDescription')}
            />
        );
    }

    return null;
}

MoneyReportHeaderStatusBarSection.displayName = 'MoneyReportHeaderStatusBarSection';

export default MoneyReportHeaderStatusBarSection;
