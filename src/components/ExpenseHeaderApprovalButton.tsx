import {useCurrencyListActions} from '@hooks/useCurrencyList';
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';

import type {LocaleContextProps} from './LocaleContextProvider';

import Button from './ButtonComposed';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';

type ExpenseHeaderApprovalButtonProps = WithSentryLabel & {
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

    /** The report's transactions, used to derive the held/unheld approval amounts */
    transactions: Transaction[];

    /** Whether to show the pay button */
    shouldShowPayButton: boolean;

    /** Whether to disable the approve button */
    isDisabled?: boolean;

    /** Whether to show the Mark as Done */
    shouldShowMarkAsDoneCopy?: boolean;

    /** Whether the button should show a loading spinner */
    isLoading?: boolean;

    /** The size of the button */
    size?: ValueOf<typeof CONST.BUTTON_SIZE>;

    /** Whether the dropdown button should use its compact inline form */
    shouldUseShortForm?: boolean;

    /** Whether the button is rendered inside another pressable, since nesting buttons isn't valid html */
    isNested?: boolean;

    /** Whether the button should stay visually normal even when disabled */
    stayNormalOnDisable?: boolean;

    /** Additional styles to add to the button */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to add to the dropdown button's wrapper */
    wrapperStyle?: StyleProp<ViewStyle>;
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
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
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
    convertToDisplayString,
}: ApprovalDropdownOptionProps): ApprovalOption[] {
    const APPROVE_PARTIAL = 'approve_partial';
    const APPROVE_FULL = 'approve_full';
    const options: ApprovalOption[] = [];
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton, transactions, convertToDisplayString);

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
    transactions,
    shouldShowPayButton,
    isDisabled,
    shouldShowMarkAsDoneCopy,
    isLoading,
    size,
    shouldUseShortForm,
    isNested,
    stayNormalOnDisable,
    style,
    wrapperStyle,
    sentryLabel = CONST.SENTRY_LABEL.REPORT_PREVIEW.APPROVE_BUTTON,
}: ExpenseHeaderApprovalButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyExpensifyIcons(['ThumbsUp', 'DocumentCheck']);
    const {convertToDisplayString} = useCurrencyListActions();

    const shouldShowDropdown = isAnyTransactionOnHold && !isDelegateAccessRestricted;

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
            convertToDisplayString,
        });

        return (
            <ButtonWithDropdownMenu
                options={approvalOptions}
                menuHeaderText={hasOnlyHeldExpenses ? translate('iou.confirmApprovalAllHoldAmount') : translate('iou.confirmApprovalWithHeldAmount')}
                onPress={() => {}}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                customText={translate('iou.approve')}
                headerTextStyles={styles.lineHeightNormal}
                shouldAlwaysShowDropdownMenu
                isSplitButton={false}
                anchorAlignment={anchorAlignment}
                // `anchorAlignment` only expresses the preferred side. Callers anchor away from whatever they sit next to
                // (the preview opens upward to clear the composer), which overflows when the button is near the opposite
                // edge — the menu would otherwise be clamped to the window edge and cover the header. Flip instead.
                shouldSwitchPositionIfOverflow
                isDisabled={isDisabled}
                isLoading={isLoading}
                size={size}
                shouldUseShortForm={shouldUseShortForm}
                stayNormalOnDisable={stayNormalOnDisable}
                style={style}
                wrapperStyle={wrapperStyle}
                sentryLabel={sentryLabel}
            />
        );
    }

    return (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => onApprove(true)}
            sentryLabel={sentryLabel}
            isDisabled={isDisabled}
            isLoading={isLoading}
            size={size}
            isNested={isNested}
            stayNormalOnDisable={stayNormalOnDisable}
            style={style}
        >
            <Button.Text>{shouldShowMarkAsDoneCopy ? translate('common.markAsDone') : translate('iou.approve')}</Button.Text>
        </Button>
    );
}

export default ExpenseHeaderApprovalButton;
export {getApprovalDropdownOptions};
