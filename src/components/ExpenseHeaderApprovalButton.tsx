import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import * as Expensicons from './Icon/Expensicons';
import type {LocaleContextProps} from './LocaleContextProvider';

type ExpenseHeaderApprovalButtonProps = {
    /** Whether any transaction is on hold */
    isAnyTransactionOnHold: boolean;

    /** Whether delegate access is restricted */
    isDelegateAccessRestricted: boolean;

    /** Whether the report has only held expenses */
    hasOnlyHeldExpenses: boolean;

    /** Whether there is a valid non-held amount */
    hasValidNonHeldAmount: boolean;

    /** The non-held amount string */
    nonHeldAmount: string | undefined;

    /** The full amount string */
    fullAmount: string;

    /** Callback when approval is confirmed */
    onApprove: (isFullApproval: boolean) => void;

    /** Callback for simple approval confirmation */
    onConfirmApproval: () => void;
};

type ApprovalOption = {
    value: string;
    text: string;
    icon: IconAsset;
    onSelected: () => void;
};

type ApprovalDropdownOptions = {
    options: ApprovalOption[];
};

type ApprovalDropdownOptionProps = {
    nonHeldAmount: string | undefined;
    fullAmount: string;
    hasValidNonHeldAmount: boolean;
    hasOnlyHeldExpenses: boolean;
    onPartialApprove: () => void;
    onFullApprove: () => void;
    translate: LocaleContextProps['translate'];
};

/**
 * Generates dropdown options for approve button when there are held expenses
 */
function getApprovalDropdownOptions({
    nonHeldAmount,
    fullAmount,
    hasValidNonHeldAmount,
    hasOnlyHeldExpenses,
    onPartialApprove,
    onFullApprove,
    translate,
}: ApprovalDropdownOptionProps): ApprovalDropdownOptions {
    const options: ApprovalOption[] = [];

    if (nonHeldAmount && hasValidNonHeldAmount && !hasOnlyHeldExpenses) {
        options.push({
            value: 'approve_partial',
            text: `${translate('iou.approveOnly')} ${nonHeldAmount}`,
            icon: Expensicons.ThumbsUp,
            onSelected: onPartialApprove,
        });
    }

    options.push({
        value: 'approve_full',
        text: `${translate('iou.approve')} ${fullAmount}`,
        icon: Expensicons.DocumentCheck,
        onSelected: onFullApprove,
    });

    return {
        options,
    };
}

function ExpenseHeaderApprovalButton({
    isAnyTransactionOnHold,
    isDelegateAccessRestricted,
    hasOnlyHeldExpenses,
    hasValidNonHeldAmount,
    nonHeldAmount,
    fullAmount,
    onApprove,
    onConfirmApproval,
}: ExpenseHeaderApprovalButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const shouldShowDropdown = isAnyTransactionOnHold && !isDelegateAccessRestricted;

    if (shouldShowDropdown) {
        const approvalOptions = getApprovalDropdownOptions({
            nonHeldAmount: !hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined,
            fullAmount,
            hasValidNonHeldAmount,
            hasOnlyHeldExpenses,
            onPartialApprove: () => onApprove(false),
            onFullApprove: () => onApprove(true),
            translate,
        });

        if (approvalOptions.options.length > 1) {
            return (
                <ButtonWithDropdownMenu
                    success
                    options={approvalOptions.options}
                    menuHeaderText={translate('iou.confirmApprovalWithHeldAmount')}
                    onPress={() => {}}
                    customText={translate('iou.approve')}
                    headerTextStyles={styles.lineHeightNormal}
                    shouldAlwaysShowDropdownMenu
                    isSplitButton={false}
                />
            );
        }
    }

    return (
        <Button
            success
            onPress={onConfirmApproval}
            text={translate('iou.approve')}
        />
    );
}

export default ExpenseHeaderApprovalButton;
export {getApprovalDropdownOptions};
