import {WRITE_COMMANDS} from '@libs/API/types';
import {trackExpenseApiError} from '@libs/telemetry/trackExpenseCreationError';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({captureMessage: jest.fn()}));

const captureMessage = jest.mocked(Sentry.captureMessage);

const SERVER_MESSAGE = 'Jane Doe cannot submit this';

function getCapturedExtra() {
    const context = captureMessage.mock.calls.at(0)?.at(1);
    return context && typeof context === 'object' && 'extra' in context ? context.extra : undefined;
}

describe('trackExpenseApiError', () => {
    beforeEach(() => {
        captureMessage.mockClear();
    });

    it('keeps the server message out of Sentry for an expense edit', () => {
        // Given an edit rejected with a server message that can name a person
        // When the failure is tracked
        trackExpenseApiError({command: WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE});

        // Then the event is still sent, but without the message, since nothing scrubs extra before it leaves the client
        expect(captureMessage).toHaveBeenCalledTimes(1);
        expect(getCapturedExtra()).toEqual({command: WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, jsonCode: CONST.JSON_CODE.EXP_ERROR});
    });

    it('still sends the server message for an expense create, as it did before edits were tracked', () => {
        // Given a RequestMoney rejected with a server message
        // When the failure is tracked
        trackExpenseApiError({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_MESSAGE});

        // Then the existing create events keep their message, so current dashboards are unchanged
        expect(getCapturedExtra()).toMatchObject({message: SERVER_MESSAGE});
    });
});
