import ActivityIndicator from '@components/ActivityIndicator';
import getWisePaymentSummaryRows, {getAmountsWithoutQuote, WISE_PAYMENT_SUMMARY_ROW_COUNT} from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import WisePaymentSummary from '..';

type WiseQuotePaymentSummaryProps = {
    reportID: string | undefined;

    /** The report as Search loaded it. Bulk pay can pay a report that only Search results hold, and the quote merges into Onyx on top of it */
    searchReport?: Report;

    /** True when the admin chose to pay only the expenses that are not on hold */
    isPayingUnheldOnly: boolean;

    /** False when Wise pays the report without a quote, so the card shows its amounts with no fees */
    isQuoteRequired?: boolean;

    /** False when a parent shows one loader for several summaries */
    shouldShowLoadingIndicator?: boolean;
};

/** The payment summary filled from the report's Wise quote. While the quote loads, a loader covers an empty card as tall as a loaded card without tax */
function WiseQuotePaymentSummary({reportID, searchReport, isPayingUnheldOnly, isQuoteRequired = true, shouldShowLoadingIndicator = true}: WiseQuotePaymentSummaryProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const [onyxReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    // The quote and its errors are read from Onyx only, since a refetch clears them there and the copy from Search would show the old ones under the loader
    const report = searchReport
        ? {...searchReport, ...onyxReport, wiseQuote: onyxReport?.wiseQuote, wiseQuoteError: onyxReport?.wiseQuoteError, errorFields: onyxReport?.errorFields}
        : onyxReport;

    if (!report) {
        return null;
    }

    const wiseQuoteError = isQuoteRequired ? report.wiseQuoteError : undefined;
    let wiseQuoteErrorMessage: string | undefined;
    if (wiseQuoteError) {
        const {code, limit, limitCurrency, paymentCurrency} = wiseQuoteError;
        let formattedLimit = '';
        if (limit !== undefined) {
            // A whole limit drops its decimals, like £1,000,000, while a limit like £0.01 keeps them so it doesn't read as £0
            formattedLimit = limit % 100 === 0 ? convertToShortDisplayString(limit, limitCurrency) : convertToDisplayString(limit, limitCurrency);
        }
        switch (code) {
            case CONST.WISE.QUOTE_ERROR_CODE.MAX_AMOUNT:
                wiseQuoteErrorMessage = translate('iou.wisePaymentSummary.amountAboveWiseMaximum', {limit: formattedLimit});
                break;
            case CONST.WISE.QUOTE_ERROR_CODE.MIN_AMOUNT:
                wiseQuoteErrorMessage =
                    limit === undefined ? translate('iou.wisePaymentSummary.amountTooSmallForWise') : translate('iou.wisePaymentSummary.amountBelowWiseMinimum', {limit: formattedLimit});
                break;
            case CONST.WISE.QUOTE_ERROR_CODE.UNAVAILABLE:
                wiseQuoteErrorMessage = translate('iou.wisePaymentSummary.paymentUnavailable', {currency: paymentCurrency});
                break;
            default:
                // A code added on the server after this version of the app keeps the generic error from errorFields
                break;
        }
    }
    const genericQuoteErrors = isQuoteRequired ? (report.errorFields?.wiseQuote ?? undefined) : undefined;
    const quoteErrors = wiseQuoteErrorMessage ? {wiseQuoteError: wiseQuoteErrorMessage} : genericQuoteErrors;
    const amounts = isQuoteRequired ? report.wiseQuote : getAmountsWithoutQuote({report, isPayingUnheldOnly});

    if (amounts || quoteErrors) {
        return (
            <WisePaymentSummary
                reportID={reportID}
                report={report}
                rows={amounts && !quoteErrors ? getWisePaymentSummaryRows({report, amounts, isPayingUnheldOnly, translate, convertToDisplayString}) : []}
                errors={quoteErrors}
            />
        );
    }

    return (
        <View>
            <View
                style={styles.opacity0}
                aria-hidden
            >
                <WisePaymentSummary
                    reportID={reportID}
                    report={report}
                    rows={[]}
                    placeholderRowCount={WISE_PAYMENT_SUMMARY_ROW_COUNT}
                />
            </View>
            {shouldShowLoadingIndicator && (
                <View style={[StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator />
                </View>
            )}
        </View>
    );
}

export default WiseQuotePaymentSummary;
