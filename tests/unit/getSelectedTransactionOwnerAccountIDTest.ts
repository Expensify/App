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
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: OWN_CARD_ID});

        expect(getSelectedTransactionOwnerAccountID('tx1', {ownerAccountID: 99, reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData)).toBe(99);
    });

    it("uses the cardholder from the user's card list for an unreported card expense", () => {
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: OWN_CARD_ID});

        expect(getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData)).toBe(CARDHOLDER_ACCOUNT_ID);
    });

    it("uses the cardholder from a managed feed for another cardholder's unreported expense", () => {
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: FEED_CARD_ID});

        expect(getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData)).toBe(OTHER_CARDHOLDER_ACCOUNT_ID);
    });

    it('reads the transaction from the collection when the selection does not carry it', () => {
        const allTransactions = {[`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`]: makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: FEED_CARD_ID})};

        expect(getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, {...lookupData, allTransactions})).toBe(OTHER_CARDHOLDER_ACCOUNT_ID);
    });

    it('uses the report owner, not the cardholder, for a reported expense', () => {
        const transaction = makeTransaction('tx1', {reportID: REPORT_ID, cardID: OWN_CARD_ID});

        expect(getSelectedTransactionOwnerAccountID('tx1', {reportID: REPORT_ID, transaction}, lookupData)).toBe(REPORT_OWNER_ACCOUNT_ID);
    });

    it('returns undefined for an unreported expense on a card that cannot be found', () => {
        const transaction = makeTransaction('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, cardID: UNKNOWN_CARD_ID});

        expect(getSelectedTransactionOwnerAccountID('tx1', {reportID: CONST.REPORT.UNREPORTED_REPORT_ID, transaction}, lookupData)).toBeUndefined();
    });
});
