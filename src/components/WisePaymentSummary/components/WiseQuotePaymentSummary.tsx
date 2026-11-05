import ActivityIndicator from '@components/ActivityIndicator';
import getWisePaymentSummaryRows, {getAmountsWithoutQuote, getWisePaymentSummaryRowCount} from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import WisePaymentSummary from '..';

type WiseQuotePaymentSummaryProps = {
    reportID: string | undefined;

    /** True when the admin chose to pay only the expenses that are not on hold */
    isPayingUnheldOnly: boolean;

    /** False when Wise pays the report without a quote, so the card shows its amounts with no fees */
    isQuoteRequired?: boolean;

    /** False when a parent shows one loader for several summaries */
    shouldShowLoadingIndicator?: boolean;
};

/**
 * The payment summary filled from the report's Wise quote. It always takes the space of a loaded card with a tax row,
 * so neither the loader nor a card without tax changes the modal's height.
 */
function WiseQuotePaymentSummary({reportID, isPayingUnheldOnly, isQuoteRequired = true, shouldShowLoadingIndicator = true}: WiseQuotePaymentSummaryProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

    if (!report) {
        return null;
    }

    const quoteErrors = isQuoteRequired ? (report.errorFields?.wiseQuote ?? undefined) : undefined;
    const amounts = isQuoteRequired ? report.wiseQuote : getAmountsWithoutQuote({report, isPayingUnheldOnly});
    const isLoading = !amounts && !quoteErrors;
    const rows = amounts && !quoteErrors ? getWisePaymentSummaryRows({report, amounts, isPayingUnheldOnly, translate, convertToDisplayString}) : [];

    return (
        <View>
            <View
                style={styles.opacity0}
                aria-hidden
            >
                <WisePaymentSummary
                    reportID={reportID}
                    rows={[]}
                    placeholderRowCount={getWisePaymentSummaryRowCount({report, isPayingUnheldOnly})}
                />
            </View>
            <View style={StyleSheet.absoluteFill}>
                {isLoading ? (
                    shouldShowLoadingIndicator && (
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <ActivityIndicator />
                        </View>
                    )
                ) : (
                    <WisePaymentSummary
                        reportID={reportID}
                        rows={rows}
                        errors={quoteErrors}
                    />
                )}
            </View>
        </View>
    );
}

export default WiseQuotePaymentSummary;
