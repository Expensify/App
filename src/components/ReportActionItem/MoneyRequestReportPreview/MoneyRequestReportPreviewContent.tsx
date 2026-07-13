import React from 'react';

import type {MoneyRequestReportPreviewContentProps} from './types';

import MoneyRequestReportPreviewBody from './MoneyRequestReportPreviewBody';
import MoneyRequestReportPreviewProvider from './MoneyRequestReportPreviewProvider';

/**
 * Entry point for the money request report preview. Sets up the context provider (which owns all state/derivations)
 * around the layout body, mirroring how `ReportActionCompose` wraps its layout in `ComposerProvider`. Keeps the same
 * prop contract so `index.tsx` and the storybook story are unaffected.
 */
function MoneyRequestReportPreviewContent({
    iouReportID,
    newTransactionIDs,
    chatReportID,
    action,
    containerStyles,
    isHovered = false,
    isWhisper = false,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    chatReport,
    invoiceReceiverPolicy,
    iouReport,
    transactions,
    allReportTransactions,
    policy,
    invoiceReceiverPersonalDetail,
    lastTransactionViolations,
    renderTransactionItem,
    onCarouselLayout,
    onWrapperLayout,
    currentWidth,
    reportPreviewStyles,
    shouldShowBorder = false,
    onPress,
    forwardedFSClass,
}: MoneyRequestReportPreviewContentProps) {
    return (
        <MoneyRequestReportPreviewProvider
            iouReportID={iouReportID}
            chatReportID={chatReportID}
            action={action}
            iouReport={iouReport}
            chatReport={chatReport}
            transactions={transactions}
            allReportTransactions={allReportTransactions}
            policy={policy}
            invoiceReceiverPolicy={invoiceReceiverPolicy}
            invoiceReceiverPersonalDetail={invoiceReceiverPersonalDetail}
            lastTransactionViolations={lastTransactionViolations}
            onPaymentOptionsShow={onPaymentOptionsShow}
            onPaymentOptionsHide={onPaymentOptionsHide}
            renderTransactionItem={renderTransactionItem}
            currentWidth={currentWidth}
            reportPreviewStyles={reportPreviewStyles}
            newTransactionIDs={newTransactionIDs}
        >
            <MoneyRequestReportPreviewBody
                onWrapperLayout={onWrapperLayout}
                onCarouselLayout={onCarouselLayout}
                containerStyles={containerStyles}
                onPress={onPress}
                isHovered={isHovered}
                isWhisper={isWhisper}
                shouldShowBorder={shouldShowBorder}
                forwardedFSClass={forwardedFSClass}
            />
        </MoneyRequestReportPreviewProvider>
    );
}

export default MoneyRequestReportPreviewContent;
