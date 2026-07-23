import useAttendees from '@hooks/useAttendees';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCompanyCardDescription} from '@libs/CardUtils';
import {getDecodedCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isExpenseReport, isSettled, shouldShowMarkAsDone} from '@libs/ReportUtils';
import {
    getAmount,
    getDescription,
    getExchangeRate,
    getMerchantName,
    getCreated as getTransactionCreated,
    hasMissingSmartscanFields,
    isAmountMissing,
    isMerchantMissing,
    shouldShowAttendees as shouldShowAttendeesUtils,
} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, ViewStyle} from 'react-native';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

import type {TransactionItemRowProps} from './types';

import TransactionItemRowNarrow from './TransactionItemRowNarrow';
import TransactionItemRowWide from './TransactionItemRowWide';

const EMPTY_ACTIVE_STYLE: StyleProp<ViewStyle> = [];

function TransactionItemRow({
    transactionItem,
    report,
    policy,
    policyCategories,
    policyTagLists,
    shouldUseNarrowLayout,
    isSelected,
    shouldShowTooltip,
    dateColumnSize,
    submittedColumnSize,
    approvedColumnSize,
    postedColumnSize,
    exportedColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    onCheckboxPress = () => {},
    shouldShowCheckbox = false,
    columns,
    onButtonPress = () => {},
    style,
    isReportItemChild = false,
    isActionLoading,
    isInSingleTransactionReport = false,
    shouldShowRadioButton = false,
    onRadioButtonPress = () => {},
    shouldStopRadioButtonMouseDownPropagation = false,
    radioButtonContainerStyle,
    radioButtonWrapperStyle,
    shouldShowErrors = true,
    shouldHighlightItemWhenSelected = true,
    isDisabled = false,
    shouldDisableActionPointerEvents = false,
    violations,
    shouldShowBottomBorder,
    onArrowRightPress,
    isHover = false,
    shouldShowArrowRightOnNarrowLayout,
    reportActions,
    transactionThreadReportID: transactionThreadReportIDProp,
    checkboxSentryLabel,
    nonPersonalAndWorkspaceCards = {},
    isAttendeesEnabledForMovingPolicy,
    isActionColumnWide: isActionColumnWideProp,
    shouldRemoveTotalColumnFlex,
    onEditDate,
    onEditMerchant,
    onEditDescription,
    onEditCategory,
    onEditAmount,
    onEditTag,
    canEditDate,
    canEditMerchant,
    canEditDescription,
    canEditCategory,
    canEditAmount,
    canEditTag,
}: TransactionItemRowProps) {
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
    });
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const createdAt = getTransactionCreated(transactionItem);
    const transactionThreadReportID =
        transactionThreadReportIDProp ?? (reportActions ? getIOUActionForTransactionID(reportActions, transactionItem.transactionID)?.childReportID : undefined);
    const transactionAttendees = useAttendees(transactionItem);

    const bgActiveStyles = isSelected && shouldHighlightItemWhenSelected ? styles.activeComponentBG : EMPTY_ACTIVE_STYLE;
    const merchant = getMerchantName(transactionItem, translate);

    const getMissingFieldError = () => {
        if (isSettled(report)) {
            return '';
        }

        const hasFieldErrors = hasMissingSmartscanFields(transactionItem, report);
        if (hasFieldErrors) {
            const amountMissing = isAmountMissing(transactionItem);
            const merchantMissing = isMerchantMissing(transactionItem);

            if (amountMissing && merchantMissing) {
                return translate('violations.reviewRequired');
            }
            if (amountMissing) {
                return translate('iou.missingAmount');
            }
            if (merchantMissing) {
                return translate('iou.missingMerchant');
            }
        }

        return '';
    };
    const missingFieldError = getMissingFieldError();

    if (shouldUseNarrowLayout) {
        const description = getDescription(transactionItem);
        const merchantOrDescription = merchant || description;
        const categoryForDisplay = isCategoryMissing(transactionItem?.category) ? '' : getDecodedCategoryName(transactionItem?.category ?? '');
        const shouldRenderChatBubbleCell = columns?.includes(CONST.SEARCH.TABLE_COLUMNS.COMMENTS) ?? false;

        // TransactionItemRowNarrow intentionally omits column sizing, hover, action button, and related table-only props that only the wide layout consumes.
        const narrowForwardedProps = {
            transactionItem,
            report,
            policy,
            isSelected,
            shouldShowTooltip,
            onCheckboxPress,
            shouldShowCheckbox,
            style,
            isInSingleTransactionReport,
            shouldShowRadioButton,
            onRadioButtonPress,
            shouldStopRadioButtonMouseDownPropagation,
            radioButtonContainerStyle,
            radioButtonWrapperStyle,
            shouldShowErrors,
            isDisabled,
            violations,
            shouldShowBottomBorder,
            onArrowRightPress,
            shouldShowArrowRightOnNarrowLayout,
            checkboxSentryLabel,
        };

        return (
            <TransactionItemRowNarrow
                {...narrowForwardedProps}
                bgActiveStyles={bgActiveStyles}
                merchant={merchant}
                merchantOrDescription={merchantOrDescription}
                missingFieldError={missingFieldError}
                categoryForDisplay={categoryForDisplay}
                createdAt={createdAt}
                transactionThreadReportID={transactionThreadReportID}
                shouldRenderChatBubbleCell={shouldRenderChatBubbleCell}
            />
        );
    }

    const wideForwardedProps = {
        transactionItem,
        report,
        policy,
        policyCategories,
        policyTagLists,
        isSelected,
        shouldShowTooltip,
        dateColumnSize,
        submittedColumnSize,
        approvedColumnSize,
        postedColumnSize,
        exportedColumnSize,
        amountColumnSize,
        taxAmountColumnSize,
        onCheckboxPress,
        columns,
        onButtonPress,
        style,
        isReportItemChild,
        isActionLoading,
        isInSingleTransactionReport,
        shouldShowRadioButton,
        onRadioButtonPress,
        shouldStopRadioButtonMouseDownPropagation,
        radioButtonContainerStyle,
        shouldShowErrors,
        shouldHighlightItemWhenSelected,
        isDisabled,
        shouldDisableActionPointerEvents,
        violations,
        shouldShowBottomBorder,
        onArrowRightPress,
        isHover,
        shouldShowArrowRightOnNarrowLayout,
        reportActions,
        checkboxSentryLabel,
        nonPersonalAndWorkspaceCards,
        isActionColumnWide: isActionColumnWideProp,
        shouldRemoveTotalColumnFlex,
        onEditDate,
        onEditMerchant,
        onEditDescription,
        onEditCategory,
        onEditAmount,
        onEditTag,
        canEditDate,
        canEditMerchant,
        canEditDescription,
        canEditCategory,
        canEditAmount,
        canEditTag,
    };

    const description = getDescription(transactionItem);
    const exchangeRateMessage = getExchangeRate(transactionItem, report?.currency ?? policy?.outputCurrency);
    const cardName = getCompanyCardDescription(translate, transactionItem?.cardName, transactionItem?.cardID, nonPersonalAndWorkspaceCards);
    const isUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const shouldShowAttendees = (isUnreported ? !!isAttendeesEnabledForMovingPolicy : shouldShowAttendeesUtils(CONST.IOU.TYPE.SUBMIT, policy)) && transactionAttendees.length > 0;

    const attendeesCount = transactionAttendees.length ?? 0;
    const totalAmount = getAmount(transactionItem, isExpenseReport(report));

    return (
        <TransactionItemRowWide
            {...wideForwardedProps}
            bgActiveStyles={bgActiveStyles}
            merchant={merchant}
            description={description}
            missingFieldError={missingFieldError}
            exchangeRateMessage={exchangeRateMessage}
            cardName={cardName}
            transactionAttendees={transactionAttendees}
            shouldShowAttendees={shouldShowAttendees}
            totalPerAttendee={!attendeesCount || totalAmount === undefined ? undefined : totalAmount / attendeesCount}
            createdAt={createdAt}
            transactionThreadReportID={transactionThreadReportID}
            isMarkAsDone={shouldUseMarkAsDoneCopy}
        />
    );
}

export default TransactionItemRow;
