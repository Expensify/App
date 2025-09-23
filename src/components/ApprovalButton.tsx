import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getApprovalDropdownOptions from '@libs/ApprovalUtils';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';

type ApprovalButtonProps = {
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

function ApprovalButton({
    isAnyTransactionOnHold,
    isDelegateAccessRestricted,
    hasOnlyHeldExpenses,
    hasValidNonHeldAmount,
    nonHeldAmount,
    fullAmount,
    onApprove,
    onConfirmApproval,
}: ApprovalButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const shouldShowDropdown = isAnyTransactionOnHold && !isDelegateAccessRestricted;

    if (shouldShowDropdown) {
        const approvalOptions = getApprovalDropdownOptions(
            !hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined,
            fullAmount,
            hasValidNonHeldAmount,
            hasOnlyHeldExpenses,
            () => onApprove(false),
            () => onApprove(true),
            translate,
        );

        if (approvalOptions.shouldShowDropdown) {
            return (
                <ButtonWithDropdownMenu
                    success
                    options={approvalOptions.options}
                    menuHeaderText={approvalOptions.menuHeaderText}
                    onPress={() => {}}
                    customText={translate('iou.approve')}
                    headerStyles={styles.lineHeightNormal}
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

export default ApprovalButton;
