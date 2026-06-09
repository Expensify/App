import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isIndividualInvoiceRoom} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Returns a resolver for the chat report's actions that getPayMoneyRequestParams will use internally.
 *
 * getPayMoneyRequestParams resolves the chat report from `initialChatReport` but swaps to
 * `existingB2BInvoiceReport` when paying an individual invoice room as a business. `payAsBusiness`
 * is chosen at click time, so the hook subscribes to both candidates and exposes a callback that
 * picks the right slice once the user has chosen.
 */
function usePayChatReportActions(initialChatReport: OnyxEntry<Report>, existingB2BInvoiceReport: OnyxEntry<Report>): (payAsBusiness: boolean | undefined) => OnyxEntry<ReportActions> {
    const [initialChatReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(initialChatReport?.reportID)}`);
    const [b2bInvoiceReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(existingB2BInvoiceReport?.reportID)}`);

    return useCallback(
        (payAsBusiness: boolean | undefined) => {
            const shouldUseB2BInvoiceReport = !!payAsBusiness && !!existingB2BInvoiceReport && isIndividualInvoiceRoom(initialChatReport);
            return shouldUseB2BInvoiceReport ? b2bInvoiceReportActions : initialChatReportActions;
        },
        [initialChatReport, existingB2BInvoiceReport, initialChatReportActions, b2bInvoiceReportActions],
    );
}

export default usePayChatReportActions;
