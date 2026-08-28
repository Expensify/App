import {shouldSuppressBrokenConnectionStatus} from '@hooks/useMoneyReportHeaderStatusBar';

import CONST from '@src/CONST';
import type {Card, CardList, TransactionViolation} from '@src/types/onyx';

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

    it('suppresses a report only when all broken-connection violations are on personal cards', () => {
        expect(shouldSuppressBrokenConnectionStatus([personalBrokenConnection], personalCardList)).toBe(true);
    });
});
