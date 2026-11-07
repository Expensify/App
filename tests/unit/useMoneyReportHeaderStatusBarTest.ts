import {getUnsuppressibleBrokenConnectionTransactionID, shouldSuppressBrokenConnectionStatus} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import createMock from '../utils/createMock';

describe('shouldSuppressBrokenConnectionStatus', () => {
    const personalCardID = 1;
    const personalCardList = createMock<CardList>({[personalCardID]: createMock<Card>({fundID: '0'})});
    const personalBrokenConnection = createMock<TransactionViolation>({
        type: CONST.VIOLATION_TYPES.VIOLATION,
        name: CONST.VIOLATIONS.RTER,
        data: {
            rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            cardID: personalCardID,
        },
    });

    it('does not suppress a report with a temporary retry-later violation', () => {
        const temporaryBrokenConnection = createMock<TransactionViolation>({
            type: CONST.VIOLATION_TYPES.VIOLATION,
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_531,
            },
        });

        expect(shouldSuppressBrokenConnectionStatus([personalBrokenConnection, temporaryBrokenConnection], personalCardList)).toBe(false);
    });

    it('selects the temporary retry-later transaction instead of a preceding personal-card violation', () => {
        const personalTransaction = createMock<Transaction>({transactionID: '1'});
        const temporaryTransaction = createMock<Transaction>({transactionID: '2'});
        const temporaryBrokenConnection = createMock<TransactionViolation>({
            type: CONST.VIOLATION_TYPES.VIOLATION,
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_531,
            },
        });
        const transactionViolations: Record<string, TransactionViolations> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${personalTransaction.transactionID}`]: [personalBrokenConnection],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${temporaryTransaction.transactionID}`]: [temporaryBrokenConnection],
        };

        expect(getUnsuppressibleBrokenConnectionTransactionID([personalTransaction, temporaryTransaction], transactionViolations, personalCardList)).toBe(temporaryTransaction.transactionID);
    });

    it('skips an expense whose connection is past the dismiss threshold when picking the one to describe', () => {
        // Given a report with an expired 530 expense listed before a recently broken re-authentication expense
        const expiredCardID = 2;
        const recentCardID = 3;
        const companyCard = (cardID: number, daysAgo: number) =>
            createMock<Card>({
                cardID,
                fundID: '88801',
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                lastScrapeResult: 438,
                lastScrape: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
            });
        const cardList = createMock<CardList>({[expiredCardID]: companyCard(expiredCardID, 120), [recentCardID]: companyCard(recentCardID, 10)});
        const expiredTransaction = createMock<Transaction>({transactionID: '1'});
        const recentTransaction = createMock<Transaction>({transactionID: '2'});
        const violation = (cardID: number, rterType: ValueOf<typeof CONST.RTER_VIOLATION_TYPES>) =>
            createMock<TransactionViolation>({type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.RTER, data: {rterType, cardID}});
        const transactionViolations: Record<string, TransactionViolations> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${expiredTransaction.transactionID}`]: [violation(expiredCardID, CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530)],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${recentTransaction.transactionID}`]: [violation(recentCardID, CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_REAUTH)],
        };

        // When the report status picks the expense to describe
        // Then it must be the recent one, because the expired expense no longer describes its connection anywhere
        expect(getUnsuppressibleBrokenConnectionTransactionID([expiredTransaction, recentTransaction], transactionViolations, cardList)).toBe(recentTransaction.transactionID);
    });

    it('suppresses a report only when all broken-connection violations are on personal cards', () => {
        expect(shouldSuppressBrokenConnectionStatus([personalBrokenConnection], personalCardList)).toBe(true);
    });
});
