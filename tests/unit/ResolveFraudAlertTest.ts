import {resolveFraudAlert} from '@userActions/Card';
import {WRITE_COMMANDS} from '@libs/API/types';

import * as API from '@src/libs/API';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from '../../__mocks__/react-native-onyx';

jest.mock('@src/libs/Log');

const MOCK_CARD_ID = 999001;
const MOCK_REPORT_ID = '12345';
const MOCK_REPORT_ACTION_ID = '9990011';

const mockWrite = jest.fn();

beforeEach(() => {
    Onyx.init({keys: ONYXKEYS});
    jest.clearAllMocks();
    jest.spyOn(API, 'write').mockImplementation(mockWrite);
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('resolveFraudAlert', () => {
    it('happy path: sends reportID and reportActionID with cardID and isFraud', () => {
        // Given valid card, fraud, report, and action identifiers

        // When resolveFraudAlert is called
        resolveFraudAlert(MOCK_CARD_ID, false, MOCK_REPORT_ID, MOCK_REPORT_ACTION_ID, null);

        // Then the API request includes reportID and reportActionID
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.RESOLVE_FRAUD_ALERT,
            expect.objectContaining({
                cardID: MOCK_CARD_ID,
                isFraud: false,
                reportID: MOCK_REPORT_ID,
                reportActionID: MOCK_REPORT_ACTION_ID,
            }),
            expect.anything(),
        );
    });

    it('null input: missing required parameters does not crash', () => {
        // Given undefined required parameters

        // When resolveFraudAlert is called with undefined cardID
        resolveFraudAlert(undefined, false, MOCK_REPORT_ID, MOCK_REPORT_ACTION_ID, null);

        // Then no API call is made and no crash occurs
        expect(mockWrite).not.toHaveBeenCalled();
    });

    it('empty input: empty strings for reportID are treated as missing and do not crash', () => {
        // Given empty string reportID (falsy, treated as missing)

        // When resolveFraudAlert is called with empty strings
        resolveFraudAlert(MOCK_CARD_ID, true, '', MOCK_REPORT_ACTION_ID, null);

        // Then no API call is made (empty strings are falsy and trigger early return) and no crash occurs
        expect(mockWrite).not.toHaveBeenCalled();
    });

    it('happy path with whitespace-only strings: treated as truthy and sent to API', () => {
        // Given whitespace-only reportID and reportActionID (truthy values)

        // When resolveFraudAlert is called with whitespace strings
        resolveFraudAlert(MOCK_CARD_ID, true, '   ', '   ', null);

        // Then the whitespace strings are passed through to the API
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.RESOLVE_FRAUD_ALERT,
            expect.objectContaining({
                cardID: MOCK_CARD_ID,
                isFraud: true,
                reportID: '   ',
                reportActionID: '   ',
            }),
            expect.anything(),
        );
    });

    it('negative: API error response does not crash', () => {
        // Given resolveFraudAlert is called

        // When resolveFraudAlert is called (API.write mock doesn't throw)
        resolveFraudAlert(MOCK_CARD_ID, false, MOCK_REPORT_ID, MOCK_REPORT_ACTION_ID, null);

        // Then no crash occurs
        expect(mockWrite).toHaveBeenCalled();
    });

    it('concurrency: multiple simultaneous resolveFraudAlert calls are handled', () => {
        // Given multiple concurrent calls

        // When both calls are made simultaneously
        resolveFraudAlert(MOCK_CARD_ID, false, MOCK_REPORT_ID, MOCK_REPORT_ACTION_ID, null);
        resolveFraudAlert(MOCK_CARD_ID + 1, true, MOCK_REPORT_ID, String(Number(MOCK_REPORT_ACTION_ID) + 1), null);

        // Then both API calls are made
        expect(mockWrite).toHaveBeenCalledTimes(2);
    });

    it('regression: reportID and reportActionID are included in API parameters (fix for #96341)', () => {
        // Given a fraud alert action that needs to be resolved
        // Before the fix, reportID and reportActionID were missing from the API parameters

        // When resolveFraudAlert is called
        resolveFraudAlert(MOCK_CARD_ID, false, MOCK_REPORT_ID, MOCK_REPORT_ACTION_ID, null);

        // Then both reportID and reportActionID are present in the API parameters
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.RESOLVE_FRAUD_ALERT,
            expect.objectContaining({
                reportID: MOCK_REPORT_ID,
                reportActionID: MOCK_REPORT_ACTION_ID,
            }),
            expect.anything(),
        );
    });
});
