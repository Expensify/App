import ActivityIndicator from '@components/ActivityIndicator';
import getWisePaymentSummaryRows, {getAmountsWithoutQuote, getWisePaymentSummaryRowCount} from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

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
    const report = searchReport ? {...searchReport, ...onyxReport} : onyxReport;

    if (!report) {
        return null;
    }

    const quoteErrors = isQuoteRequired ? (report.errorFields?.wiseQuote ?? undefined) : undefined;
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
                    placeholderRowCount={getWisePaymentSummaryRowCount({report, isPayingUnheldOnly})}
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
