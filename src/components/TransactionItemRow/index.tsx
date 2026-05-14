import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyCardDescription} from '@libs/CardUtils';
import {getDecodedCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isExpenseReport, isSettled} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {
    getAmount,
    getAttendees,
    getDescription,
    getExchangeRate,
    getMerchant,
    getCreated as getTransactionCreated,
    hasMissingSmartscanFields,
    isAmountMissing,
    isMerchantMissing,
    isScanning,
    shouldShowAttendees as shouldShowAttendeesUtils,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import TransactionItemRowNarrow from './TransactionItemRowNarrow';
import TransactionItemRowWide from './TransactionItemRowWide';
import type {TransactionItemRowProps, TransactionWithOptionalSearchFields} from './types';

const EMPTY_ACTIVE_STYLE: StyleProp<ViewStyle> = [];

function getMerchantName(transactionItem: TransactionWithOptionalSearchFields, translate: (key: TranslationPaths) => string): string {
    const shouldShowMerchant = transactionItem.shouldShowMerchant ?? true;

    let merchant = transactionItem?.formattedMerchant ?? getMerchant(transactionItem);

    if (isScanning(transactionItem) && shouldShowMerchant) {
        merchant = translate('iou.receiptStatusTitle');
    }

    const merchantName = StringUtils.getFirstLine(merchant);
    return merchantName !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchantName !== CONST.TRANSACTION.DEFAULT_MERCHANT ? (merchantName ?? '') : '';
}

function TransactionItemRow({
    transactionItem,
    report,
    policy,
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
    shouldShowErrors = true,
    shouldHighlightItemWhenSelected = true,
    isDisabled = false,
    violations,
    shouldShowBottomBorder,
    onArrowRightPress,
    isHover = false,
    shouldShowArrowRightOnNarrowLayout,
    reportActions,
    checkboxSentryLabel,
    nonPersonalAndWorkspaceCards = {},
    policyForMovingExpenses,
    isActionColumnWide: isActionColumnWideProp,
    shouldRemoveTotalColumnFlex,
}: TransactionItemRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const createdAt = getTransactionCreated(transactionItem);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const transactionThreadReportID = reportActions ? getIOUActionForTransactionID(reportActions, transactionItem.transactionID)?.childReportID : undefined;

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

        // TransactionItemRowNarrow intentionally omits column sizing, hover, action button, and related table-only props that only the wide layout consumes
        const narrowForwardedProps = {
            transactionItem,
            report,
            isSelected,
            shouldShowTooltip,
            onCheckboxPress,
            shouldShowCheckbox,
            style,
            isInSingleTransactionReport,
            shouldShowRadioButton,
            onRadioButtonPress,
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
                // eslint-disable-next-line react/jsx-props-no-spreading
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
        shouldShowErrors,
        shouldHighlightItemWhenSelected,
        isDisabled,
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
    };

    const description = getDescription(transactionItem);
    const exchangeRateMessage = getExchangeRate(transactionItem, report?.currency ?? policy?.outputCurrency);
    const cardName = getCompanyCardDescription(translate, transactionItem?.cardName, transactionItem?.cardID, nonPersonalAndWorkspaceCards);
    const transactionAttendees = getAttendees(transactionItem, currentUserPersonalDetails);
    const isUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const shouldShowAttendees = shouldShowAttendeesUtils(CONST.IOU.TYPE.SUBMIT, isUnreported ? policyForMovingExpenses : policy) && transactionAttendees.length > 0;

    const attendeesCount = transactionAttendees.length ?? 0;
    const totalAmount = getAmount(transactionItem, isExpenseReport(report));

    return (
        <TransactionItemRowWide
            // eslint-disable-next-line react/jsx-props-no-spreading
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
        />
    );
}

export default TransactionItemRow;
