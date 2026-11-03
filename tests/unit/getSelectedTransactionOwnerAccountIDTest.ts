import getSelectedTransactionOwnerAccountID from '@libs/getSelectedTransactionOwnerAccountID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, Report, Transaction} from '@src/types/onyx';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

const CARDHOLDER_ACCOUNT_ID = 10;
const OTHER_CARDHOLDER_ACCOUNT_ID = 20;
const REPORT_OWNER_ACCOUNT_ID = 30;
const OWN_CARD_ID = 101;
const FEED_CARD_ID = 202;
const UNKNOWN_CARD_ID = 999;
const REPORT_ID = '500';

function makeTransaction(transactionID: string, overrides: Partial<Transaction>): Transaction {
    return {...createRandomTransaction(1), transactionID, ...overrides};
}

describe('getSelectedTransactionOwnerAccountID', () => {
    const cardList: CardList = {[OWN_CARD_ID]: createMock<Card>({cardID: OWN_CARD_ID, accountID: CARDHOLDER_ACCOUNT_ID})};
    const nonPersonalAndWorkspaceCards: CardList = {[FEED_CARD_ID]: createMock<Card>({cardID: FEED_CARD_ID, accountID: OTHER_CARDHOLDER_ACCOUNT_ID})};
    const allReports = {[`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: createMock<Report>({reportID: REPORT_ID, ownerAccountID: REPORT_OWNER_ACCOUNT_ID})};
    const lookupData = {cardList, nonPersonalAndWorkspaceCards, allReports};

    it('prefers the owner attached to the selection', () => {
        // Given a selection that already carries its owner from the search results, which is the most reliable source
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: OWN_CARD_ID});

        // When resolving the owner of that selected expense
        const ownerAccountID = getSelectedTransactionOwnerAccountID('tx1', {ownerAccountID: 99, reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData);

        // Then the attached owner wins over the cardholder, so we never second-guess data the server already gave us
        expect(ownerAccountID).toBe(99);
    });

    it("uses the cardholder from the user's card list for an unreported card expense", () => {
        // Given an unreported card expense with no owner on the selection and no report to read an owner from
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: OWN_CARD_ID});

        // When resolving the owner of that selected expense
        const ownerAccountID = getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData);

        // Then the cardholder is used, because whoever holds the card owns an unreported card expense
        expect(ownerAccountID).toBe(CARDHOLDER_ACCOUNT_ID);
    });

    it("uses the cardholder from a managed feed for another cardholder's unreported expense", () => {
        // Given an admin viewing another cardholder's unreported expense, whose card only exists in the workspace feed cards
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: FEED_CARD_ID});

        // When resolving the owner of that selected expense
        const ownerAccountID = getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData);

        // Then the feed card's holder is used, so admins can bulk move expenses for cards they manage but don't hold
        expect(ownerAccountID).toBe(OTHER_CARDHOLDER_ACCOUNT_ID);
    });

    it('reads the transaction from the collection when the selection does not carry it', () => {
        // Given a selection that does not carry its transaction, so the card can only be found through the transactions collection
        const allTransactions = {[`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`]: makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: FEED_CARD_ID})};

        // When resolving the owner of that selected expense
        const ownerAccountID = getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, {...lookupData, allTransactions});

        // Then the cardholder is still resolved, so the owner check does not depend on how the selection was built
        expect(ownerAccountID).toBe(OTHER_CARDHOLDER_ACCOUNT_ID);
    });

    it('uses the report owner, not the cardholder, for a reported expense', () => {
        // Given a card expense that has been added to a report, which can be owned by someone other than the cardholder
        const transaction = makeTransaction('tx1', {reportID: REPORT_ID, cardID: OWN_CARD_ID});

        // When resolving the owner of that selected expense
        const ownerAccountID = getSelectedTransactionOwnerAccountID('tx1', {reportID: REPORT_ID, transaction}, lookupData);

        // Then the report owner is used, because once reported the report decides who owns the expense
        expect(ownerAccountID).toBe(REPORT_OWNER_ACCOUNT_ID);
    });

    it('returns undefined for an unreported expense on a card that cannot be found', () => {
        // Given an unreported expense on a card that isn't loaded in either card list
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: UNKNOWN_CARD_ID});

        // When resolving the owner of that selected expense
        const ownerAccountID = getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData);

        // Then no owner is returned, so callers treat it as unknown rather than guessing and moving the expense to the wrong submitter
        expect(ownerAccountID).toBeUndefined();
    });
});
