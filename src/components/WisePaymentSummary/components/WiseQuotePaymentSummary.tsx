import getWisePaymentSummaryRows from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import WisePaymentSummary from '..';

type WiseQuotePaymentSummaryProps = {
    reportID: string | undefined;

    /** True when the admin chose to pay only the expenses that are not on hold */
    isPayingUnheldOnly: boolean;
};

/** The payment summary filled from the report's Wise quote */
function WiseQuotePaymentSummary({reportID, isPayingUnheldOnly}: WiseQuotePaymentSummaryProps) {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

    if (!report?.wiseQuote) {
        return null;
    }

    return (
        <WisePaymentSummary
            reportID={reportID}
            rows={getWisePaymentSummaryRows({report, amounts: report.wiseQuote, isPayingUnheldOnly, translate, convertToDisplayString})}
        />
    );
}

export default WiseQuotePaymentSummary;
