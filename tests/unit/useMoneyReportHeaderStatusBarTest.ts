import {getUnsuppressibleBrokenConnectionTransactionID, shouldSuppressBrokenConnectionStatus} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

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

    it('suppresses a report only when all broken-connection violations are on personal cards', () => {
        expect(shouldSuppressBrokenConnectionStatus([personalBrokenConnection], personalCardList)).toBe(true);
    });
});
