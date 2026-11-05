import ActivityIndicator from '@components/ActivityIndicator';
import getWisePaymentSummaryRows, {getWisePaymentSummaryRowCount} from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

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

    /** False when a parent shows one loader for several summaries */
    shouldShowLoadingIndicator?: boolean;
};

/**
 * The payment summary filled from the report's Wise quote. It always takes the space of a loaded card with a tax row,
 * so neither the loader nor a card without tax changes the modal's height.
 */
function WiseQuotePaymentSummary({reportID, isPayingUnheldOnly, shouldShowLoadingIndicator = true}: WiseQuotePaymentSummaryProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

    if (!report) {
        return null;
    }

    const quoteErrors = report.errorFields?.wiseQuote ?? undefined;
    const isLoading = !report.wiseQuote && !quoteErrors;
    const rows = report.wiseQuote && !quoteErrors ? getWisePaymentSummaryRows({report, amounts: report.wiseQuote, isPayingUnheldOnly, translate, convertToDisplayString}) : [];

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
