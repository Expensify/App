import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {LocaleContextProps} from './LocaleContextProvider';

type ExpenseHeaderApprovalButtonProps = {
    /** Whether any transaction is on hold */
    isAnyTransactionOnHold: boolean;

    /** Whether delegate access is restricted */
    isDelegateAccessRestricted: boolean;

    /** Callback when approval is confirmed */
    onApprove: (isFullApproval: boolean) => void;

    /** The anchor alignment of the popover menu */
    anchorAlignment?: AnchorAlignment;

    /** The money request report */
    moneyRequestReport?: OnyxEntry<Report>;

    /** Whether to show the pay button */
    shouldShowPayButton: boolean;

    /** Whether to disable the approve button */
    isDisabled?: boolean;

    /** Whether to show the Mark as Done */
    shouldShowMarkAsDoneCopy?: boolean;
};

type ApprovalOption = {
    value: string;
    text: string;
    icon: IconAsset;
    onSelected: () => void;
    keyForList: string;
};

type ApprovalDropdownOptionProps = {
    moneyRequestReport: OnyxEntry<Report>;
    onPartialApprove: () => void;
    onFullApprove: () => void;
    translate: LocaleContextProps['translate'];
    illustrations: Record<'ThumbsUp' | 'DocumentCheck', IconAsset>;
    shouldShowPayButton: boolean;
    hasOnlyHeldExpenses: boolean;
    transactions: Transaction[];
};

/**
 * Generates dropdown options for approve button when there are held expenses
 */
function getApprovalDropdownOptions({
    onPartialApprove,
    onFullApprove,
    translate,
    illustrations,
    moneyRequestReport,
    shouldShowPayButton,
    hasOnlyHeldExpenses,
    transactions,
}: ApprovalDropdownOptionProps): ApprovalOption[] {
    const APPROVE_PARTIAL = 'approve_partial';
    const APPROVE_FULL = 'approve_full';
    const options: ApprovalOption[] = [];
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton, transactions);

    if (hasValidNonHeldAmount && !hasOnlyHeldExpenses) {
        options.push({
            value: APPROVE_PARTIAL,
            text: `${translate('iou.approveOnly')} ${nonHeldAmount}`,
            icon: illustrations.ThumbsUp,
            onSelected: onPartialApprove,
            keyForList: APPROVE_PARTIAL,
        });
    }

    options.push({
        value: APPROVE_FULL,
        text: `${translate('iou.approve')} ${fullAmount}`,
        icon: illustrations.DocumentCheck,
        onSelected: onFullApprove,
        keyForList: APPROVE_FULL,
    });

    return options;
}

function ExpenseHeaderApprovalButton({
    isAnyTransactionOnHold,
    isDelegateAccessRestricted,
    onApprove,
    anchorAlignment,
    moneyRequestReport,
    shouldShowPayButton,
    isDisabled,
    shouldShowMarkAsDoneCopy,
}: ExpenseHeaderApprovalButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyExpensifyIcons(['ThumbsUp', 'DocumentCheck']);

    const shouldShowDropdown = isAnyTransactionOnHold && !isDelegateAccessRestricted;

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);
    if (shouldShowDropdown) {
        const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(transactions);
        const approvalOptions = getApprovalDropdownOptions({
            onPartialApprove: () => onApprove(false),
            onFullApprove: () => onApprove(true),
            translate,
            illustrations,
            moneyRequestReport,
            shouldShowPayButton,
            hasOnlyHeldExpenses,
            transactions,
        });

        return (
            <ButtonWithDropdownMenu
                success
                options={approvalOptions}
                menuHeaderText={hasOnlyHeldExpenses ? translate('iou.confirmApprovalAllHoldAmount') : translate('iou.confirmApprovalWithHeldAmount')}
                onPress={() => {}}
                customText={translate('iou.approve')}
                headerTextStyles={styles.lineHeightNormal}
                shouldAlwaysShowDropdownMenu
                isSplitButton={false}
                anchorAlignment={anchorAlignment}
                isDisabled={isDisabled}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.APPROVE_BUTTON}
            />
        );
    }

    return (
        <Button
            success
            onPress={() => onApprove(true)}
            text={shouldShowMarkAsDoneCopy ? translate('common.markAsDone') : translate('iou.approve')}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.APPROVE_BUTTON}
            isDisabled={isDisabled}
        />
    );
}

export default ExpenseHeaderApprovalButton;
export {getApprovalDropdownOptions};
