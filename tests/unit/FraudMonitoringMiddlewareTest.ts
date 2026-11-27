import {WRITE_COMMANDS} from '@libs/API/types';
import FraudProtection from '@libs/FraudProtection';
import FraudMonitoring from '@libs/Middleware/FraudMonitoring';

import CONST, {FRAUD_PROTECTION_EVENT} from '@src/CONST';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

jest.mock('@libs/FraudProtection', () => ({
    sendEvent: jest.fn(),
    setAttribute: jest.fn(),
}));

const mockSendEvent = jest.mocked(FraudProtection.sendEvent);
const mockSetAttribute = jest.mocked(FraudProtection.setAttribute);

describe('FraudMonitoring middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        {command: WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH, expectedEvent: FRAUD_PROTECTION_EVENT.DISABLE_TWO_FACTOR_AUTH},
        {command: WRITE_COMMANDS.DELETE_CONTACT_METHOD, expectedEvent: FRAUD_PROTECTION_EVENT.REMOVE_SECONDARY_LOGIN},
        {command: WRITE_COMMANDS.REVOKE_DEVICE, expectedEvent: FRAUD_PROTECTION_EVENT.REMOVE_DEVICE},
    ])('sends $expectedEvent when $command succeeds', async ({command, expectedEvent}) => {
        // Given a successful API response for a mapped command
        const responseData: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.SUCCESS};

        // When the FraudMonitoring middleware processes the response
        const result = await FraudMonitoring(Promise.resolve(responseData), {command}, false);

        // Then it sends the expected event, sets no extra attributes, and returns the original response object unchanged
        expect(mockSendEvent).toHaveBeenCalledTimes(1);
        expect(mockSendEvent).toHaveBeenCalledWith(expectedEvent);
        expect(mockSetAttribute).not.toHaveBeenCalled();
        expect(result).toBe(responseData);
    });

    it.each([WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH, WRITE_COMMANDS.DELETE_CONTACT_METHOD, WRITE_COMMANDS.REVOKE_DEVICE])('does not send a fraud event when %s fails', async (command) => {
        // Given a non-success API response for a mapped command
        const responseData: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.BAD_REQUEST};

        // When the FraudMonitoring middleware processes the failed response
        const result = await FraudMonitoring(Promise.resolve(responseData), {command}, false);

        // Then no fraud event is sent and the response passes through unchanged
        expect(mockSendEvent).not.toHaveBeenCalled();
        expect(mockSetAttribute).not.toHaveBeenCalled();
        expect(result).toBe(responseData);
    });
});
