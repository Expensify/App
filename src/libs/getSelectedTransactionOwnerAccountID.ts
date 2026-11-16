import type {SelectedTransactionInfo} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {getReportOrDraftReport} from './ReportUtils';

type OwnerLookupData = {
    cardList: OnyxEntry<CardList>;
    nonPersonalAndWorkspaceCards: OnyxEntry<CardList>;
    allReports: OnyxCollection<Report>;
    allTransactions?: OnyxCollection<Transaction>;
};

/**
 * Resolves who owns a selected Search expense: the selection's owner, then the cardholder for unreported card
 * expenses, then the report's owner. Unreported imported card expenses have no report and no money request action
 * in the snapshot, and the backend treats the cardholder as their owner.
 *
 * @returns The owner's accountID, or undefined when it cannot be resolved
 */
function getSelectedTransactionOwnerAccountID(
    transactionID: string,
    selection: Pick<SelectedTransactionInfo, 'ownerAccountID' | 'reportID' | 'transaction'> | undefined,
    {cardList, nonPersonalAndWorkspaceCards, allReports, allTransactions}: OwnerLookupData,
): number | undefined {
    if (!selection) {
        return undefined;
    }
    if (typeof selection.ownerAccountID === 'number') {
        return selection.ownerAccountID;
    }

    const isUnreported = !selection.reportID || selection.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    if (isUnreported) {
        const cardID = (selection.transaction ?? allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`])?.cardID;
        const cardholderAccountID = cardID ? (cardList?.[cardID]?.accountID ?? nonPersonalAndWorkspaceCards?.[cardID]?.accountID) : undefined;
        if (typeof cardholderAccountID === 'number') {
            return cardholderAccountID;
        }
    }

    return getReportOrDraftReport({reportID: selection.reportID, report: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selection.reportID}`]})?.ownerAccountID;
}

export default getSelectedTransactionOwnerAccountID;
