import {WRITE_COMMANDS} from '@libs/API/types';
import {trackExpenseApiError} from '@libs/telemetry/trackExpenseCreationError';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
    captureMessage: jest.fn(),
}));

const mockedCaptureMessage = jest.mocked(Sentry.captureMessage);

describe('trackExpenseApiError', () => {
    beforeEach(() => {
        mockedCaptureMessage.mockClear();
    });

    it('tags errorUUID and groups by command, jsonCode, and UUID', () => {
        // Given a RequestMoney rejection with a server error UUID.
        const errorUUID = '9FC073E8-D25E-4D06-A8DD-50829801ED9A';

        // When trackExpenseApiError records the API rejection.
        trackExpenseApiError({
            command: WRITE_COMMANDS.REQUEST_MONEY,
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            message: 'New expenses cannot be added to this report.',
            errorUUID,
        });

        // Then Sentry receives the UUID tag and a fingerprint that separates distinct rejection reasons.
        expect(mockedCaptureMessage).toHaveBeenCalledWith('Expense API Error: RequestMoney returned 666', {
            level: 'error',
            tags: {
                [CONST.TELEMETRY.TAGS.EXPENSE_ERROR_TYPE]: CONST.TELEMETRY.EXPENSE_ERROR_TYPE.API_ERROR,
                [CONST.TELEMETRY.TAGS.EXPENSE_ERROR_SOURCE]: CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.API_RESPONSE,
                [CONST.TELEMETRY.TAGS.EXPENSE_COMMAND]: WRITE_COMMANDS.REQUEST_MONEY,
                [CONST.TELEMETRY.TAGS.EXPENSE_JSON_CODE]: '666',
                [CONST.TELEMETRY.TAGS.EXPENSE_ERROR_UUID]: errorUUID,
            },
            extra: {
                command: WRITE_COMMANDS.REQUEST_MONEY,
                jsonCode: CONST.JSON_CODE.EXP_ERROR,
                message: 'New expenses cannot be added to this report.',
                errorUUID,
            },
            fingerprint: [CONST.TELEMETRY.EXPENSE_ERROR_TYPE.API_ERROR, WRITE_COMMANDS.REQUEST_MONEY, '666', errorUUID],
        });
    });

    it('falls back to message in the fingerprint when errorUUID is absent', () => {
        // Given a TrackExpense rejection without a server error UUID.
        trackExpenseApiError({
            command: WRITE_COMMANDS.TRACK_EXPENSE,
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
            message: 'New expenses cannot be added to this report.',
        });

        // Then Sentry fingerprints by the response message and omits the UUID tag.
        expect(mockedCaptureMessage).toHaveBeenCalledWith('Expense API Error: TrackExpense returned 666', {
            level: 'error',
            tags: {
                [CONST.TELEMETRY.TAGS.EXPENSE_ERROR_TYPE]: CONST.TELEMETRY.EXPENSE_ERROR_TYPE.API_ERROR,
                [CONST.TELEMETRY.TAGS.EXPENSE_ERROR_SOURCE]: CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.API_RESPONSE,
                [CONST.TELEMETRY.TAGS.EXPENSE_COMMAND]: WRITE_COMMANDS.TRACK_EXPENSE,
                [CONST.TELEMETRY.TAGS.EXPENSE_JSON_CODE]: '666',
            },
            extra: {
                command: WRITE_COMMANDS.TRACK_EXPENSE,
                jsonCode: CONST.JSON_CODE.EXP_ERROR,
                message: 'New expenses cannot be added to this report.',
            },
            fingerprint: [CONST.TELEMETRY.EXPENSE_ERROR_TYPE.API_ERROR, WRITE_COMMANDS.TRACK_EXPENSE, '666', 'New expenses cannot be added to this report.'],
        });
    });

    it('uses neutral expense thread wording for OpenReport failures with a transactionID', () => {
        // Given a failed OpenReport call for an expense thread.
        trackExpenseApiError({
            command: WRITE_COMMANDS.OPEN_REPORT,
            jsonCode: 404,
            message: 'Report not found',
            requestData: {transactionID: '12345'},
        });

        // Then Sentry records an expense thread failure without claiming a lost expense.
        expect(mockedCaptureMessage).toHaveBeenCalledWith(
            'OpenReport Failed: jsonCode 404 (expense thread)',
            expect.objectContaining({
                fingerprint: [CONST.TELEMETRY.EXPENSE_ERROR_TYPE.OPEN_REPORT_FAILED, WRITE_COMMANDS.OPEN_REPORT, '404', 'Report not found'],
            }),
        );
    });

    it('ignores unrelated commands and OpenReport calls without a transactionID', () => {
        // Given an OpenReport call without a transactionID and a non-expense command.
        trackExpenseApiError({
            command: WRITE_COMMANDS.OPEN_REPORT,
            jsonCode: 404,
            requestData: {},
        });
        trackExpenseApiError({
            command: WRITE_COMMANDS.ADD_COMMENT,
            jsonCode: CONST.JSON_CODE.EXP_ERROR,
        });

        // Then neither event is reported as an expense API error.
        expect(mockedCaptureMessage).not.toHaveBeenCalled();
    });
});
