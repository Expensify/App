import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isGroupPolicy} from '@libs/PolicyUtils';
import {isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import useMoneyReportHeaderStatusBar from './useMoneyReportHeaderStatusBar';
import useOnyx from './useOnyx';

type MoneyReportHeaderMoreContentVisibility = {
    /** Which status bar to render below the header, if any */
    statusBarType: ValueOf<typeof CONST.REPORT.STATUS_BAR_TYPE> | undefined;

    /** Whether the next step bar should be rendered below the header */
    shouldShowNextStep: boolean;

    /** Whether the more-content row has anything to show on its own */
    hasStatusOrNextStep: boolean;
};

/**
 * Resolves what the money report header's more-content row (status bar / next step) will display.
 *
 * The header needs this before it renders, because it decides where the report actions go: they normally sit at
 * the end of the more-content row so they line up with its text, but when that row has nothing to show they
 * would be stranded alone under the title, and belong in the header row instead.
 */
function useMoneyReportHeaderMoreContentVisibility(reportID: string | undefined): MoneyReportHeaderMoreContentVisibility {
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const {shouldShowStatusBar, statusBarType} = useMoneyReportHeaderStatusBar(reportID, moneyRequestReport?.chatReportID);

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const shouldShowNextStep = isGroupPolicy(policy) && !isInvoiceReport && !shouldShowStatusBar;

    return {
        statusBarType,
        shouldShowNextStep,
        hasStatusOrNextStep: shouldShowNextStep || !!statusBarType,
    };
}

export default useMoneyReportHeaderMoreContentVisibility;
